import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { createReadStream, existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { extname, join, normalize } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { Socket } from 'node:net';

const knownBrowsers = [
  'chromium',
  'chromium-browser',
  'google-chrome',
  'msedge',
  '/c/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'firefox'
];
const chromeBrowsers = new Set([
  'chromium',
  'chromium-browser',
  'google-chrome',
  'msedge',
  '/c/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
]);
const root = process.cwd();
const screenshotPath = join(root, 'artifacts', 'browser-smoke.png');

const types = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8']
]);

function findExecutable(name) {
  if (name.startsWith('/c/')) return '';
  if (existsSync(name)) return name;
  const result = spawnSync('sh', ['-c', `command -v "${name.replaceAll('"', '\\"')}"`], { encoding: 'utf8' });
  return result.status === 0 ? result.stdout.trim() : '';
}

function skip(message) {
  console.log(`Browser smoke skipped: ${message}`);
  process.exit(0);
}

const foundBrowsers = knownBrowsers
  .map((name) => ({ name, path: findExecutable(name) }))
  .filter((browser) => browser.path);
const browser = foundBrowsers.find(({ name }) => chromeBrowsers.has(name));

if (!foundBrowsers.length) {
  skip(`no system browser found; looked for ${knownBrowsers.join(', ')}.`);
}

if (!browser) {
  skip(`found ${foundBrowsers.map(({ name }) => name).join(', ')}, but this dependency-free check needs a Chromium-family browser for DevTools automation.`);
}

function createStaticServer() {
  return createServer((request, response) => {
    const url = new URL(request.url || '/', 'http://127.0.0.1');
    const safePath = normalize(url.pathname).replace(/^([.][.][/\\])+/, '');
    const filePath = join(root, safePath === '/' ? 'index.html' : safePath);

    if (!filePath.startsWith(root) || !existsSync(filePath)) {
      response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      response.end('Not found');
      return;
    }

    response.writeHead(200, { 'content-type': types.get(extname(filePath)) || 'application/octet-stream' });
    createReadStream(filePath).pipe(response);
  });
}

function listen(server, port = 0) {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => resolve(server.address().port));
  });
}

async function getFreePort() {
  const server = createServer();
  const port = await listen(server);
  await new Promise((resolve) => server.close(resolve));
  return port;
}

async function waitForJson(url, timeoutMs = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return await response.json();
    } catch {
      // Browser is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out waiting for ${url}`);
}


function isChromiumBootstrapError(error) {
  const message = error?.message || '';
  return (
    message.startsWith('Timed out waiting for http://127.0.0.1:')
    || message === 'Browser did not expose a debuggable page target.'
    || message.includes('fetch failed')
    || message.includes('ECONNREFUSED')
    || message.includes('ECONNRESET')
    || message.includes('WebSocket upgrade failed')
    || message.includes('WebSocket upgrade returned an unexpected accept key.')
  );
}

function encodeFrame(text) {
  const payload = Buffer.from(text);
  const length = payload.length;
  let header;

  if (length < 126) {
    header = Buffer.alloc(2);
    header[1] = 0x80 | length;
  } else if (length < 65536) {
    header = Buffer.alloc(4);
    header[1] = 0x80 | 126;
    header.writeUInt16BE(length, 2);
  } else {
    header = Buffer.alloc(10);
    header[1] = 0x80 | 127;
    header.writeBigUInt64BE(BigInt(length), 2);
  }

  header[0] = 0x81;
  const mask = Buffer.from([0x12, 0x34, 0x56, 0x78]);
  const masked = Buffer.alloc(length);
  for (let i = 0; i < length; i += 1) masked[i] = payload[i] ^ mask[i % 4];
  return Buffer.concat([header, mask, masked]);
}

function parseFrames(buffer) {
  const messages = [];
  let offset = 0;

  while (buffer.length - offset >= 2) {
    const first = buffer[offset];
    const second = buffer[offset + 1];
    const opcode = first & 0x0f;
    const masked = (second & 0x80) !== 0;
    let length = second & 0x7f;
    let headerLength = 2;

    if (length === 126) {
      if (buffer.length - offset < 4) break;
      length = buffer.readUInt16BE(offset + 2);
      headerLength = 4;
    } else if (length === 127) {
      if (buffer.length - offset < 10) break;
      length = Number(buffer.readBigUInt64BE(offset + 2));
      headerLength = 10;
    }

    const maskLength = masked ? 4 : 0;
    const frameLength = headerLength + maskLength + length;
    if (buffer.length - offset < frameLength) break;

    let payload = buffer.subarray(offset + headerLength + maskLength, offset + frameLength);
    if (masked) {
      const mask = buffer.subarray(offset + headerLength, offset + headerLength + 4);
      payload = Buffer.from(payload.map((byte, index) => byte ^ mask[index % 4]));
    }

    if (opcode === 1) messages.push(payload.toString('utf8'));
    offset += frameLength;
  }

  return { messages, rest: buffer.subarray(offset) };
}

function connectWebSocket(webSocketUrl) {
  const url = new URL(webSocketUrl);

  return new Promise((resolve, reject) => {
    const socket = new Socket();
    const key = Buffer.from(Math.random().toString()).toString('base64');
    let buffer = Buffer.alloc(0);
    let opened = false;
    let nextId = 1;
    const pending = new Map();
    const events = [];

    const fail = (error) => {
      for (const { reject: rejectPending } of pending.values()) rejectPending(error);
      pending.clear();
      reject(error);
    };

    socket.on('data', (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);

      if (!opened) {
        const splitAt = buffer.indexOf('\r\n\r\n');
        if (splitAt === -1) return;
        const head = buffer.subarray(0, splitAt).toString('utf8');
        if (!head.includes(' 101 ')) {
          fail(new Error(`WebSocket upgrade failed: ${head.split('\r\n')[0]}`));
          return;
        }
        const accept = createHash('sha1').update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`).digest('base64');
        if (!head.includes(accept)) {
          fail(new Error('WebSocket upgrade returned an unexpected accept key.'));
          return;
        }
        opened = true;
        buffer = buffer.subarray(splitAt + 4);
        resolve(client);
      }

      const parsed = parseFrames(buffer);
      buffer = parsed.rest;
      for (const message of parsed.messages) {
        const data = JSON.parse(message);
        if (data.id && pending.has(data.id)) {
          const { resolve: resolvePending, reject: rejectPending } = pending.get(data.id);
          pending.delete(data.id);
          if (data.error) rejectPending(new Error(data.error.message));
          else resolvePending(data.result || {});
        } else if (data.method) {
          events.push(data);
        }
      }
    });

    socket.on('error', fail);
    socket.connect(Number(url.port), url.hostname, () => {
      socket.write([
        `GET ${url.pathname}${url.search} HTTP/1.1`,
        `Host: ${url.host}`,
        'Upgrade: websocket',
        'Connection: Upgrade',
        `Sec-WebSocket-Key: ${key}`,
        'Sec-WebSocket-Version: 13',
        '',
        ''
      ].join('\r\n'));
    });

    const client = {
      events,
      send(method, params = {}) {
        const id = nextId;
        nextId += 1;
        socket.write(encodeFrame(JSON.stringify({ id, method, params })));
        return new Promise((resolvePending, rejectPending) => {
          pending.set(id, { resolve: resolvePending, reject: rejectPending });
        });
      },
      close() {
        socket.end();
      }
    };
  });
}

function getRuntimeProblems(client) {
  return client.events.filter(({ method, params }) => {
    if (method === 'Runtime.exceptionThrown') return true;
    if (method !== 'Log.entryAdded' || !['error', 'warning'].includes(params?.entry?.level)) return false;
    if (params?.entry?.url?.endsWith('/favicon.ico')) return false;
    return true;
  });
}

async function evaluate(client, expression) {
  const result = await client.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true
  });

  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || 'Runtime evaluation failed.');
  }

  return result.result?.value;
}

let server;
let browserProcess;
let profileDir;
let client;
let cdpConnected = false;

try {
  server = createStaticServer();
  const appPort = await listen(server);
  const debugPort = await getFreePort();
  const appUrl = `http://127.0.0.1:${appPort}/index.html`;
  profileDir = mkdtempSync(join(tmpdir(), 'ghost-writer-browser-smoke-'));

  browserProcess = spawn(browser.path, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profileDir}`,
    '--window-size=960,720',
    'about:blank'
  ], { stdio: ['ignore', 'ignore', 'pipe'] });

  const targets = await waitForJson(`http://127.0.0.1:${debugPort}/json/list`);
  const target = targets.find((entry) => entry.type === 'page');
  if (!target?.webSocketDebuggerUrl) throw new Error('Browser did not expose a debuggable page target.');

  client = await connectWebSocket(target.webSocketDebuggerUrl);
  cdpConnected = true;
  await client.send('Runtime.enable');
  await client.send('Log.enable');
  await client.send('Page.enable');
  await client.send('Page.navigate', { url: appUrl });
  const navigationStart = Date.now();
  while (await evaluate(client, 'document.readyState') !== 'complete') {
    if (Date.now() - navigationStart > 5000) throw new Error('Timed out waiting for index.html to load.');
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  await evaluate(client, 'document.fonts ? document.fonts.ready.then(() => true) : true');
  await evaluate(client, 'new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))');

  const canvasDetails = await evaluate(client, `(() => {
    const canvas = document.querySelector('#game');
    return {
      isCanvas: canvas instanceof HTMLCanvasElement,
      width: canvas?.width,
      height: canvas?.height,
      hasContext: Boolean(canvas?.getContext('2d')),
      status: document.querySelector('#game-status')?.textContent || ''
    };
  })()`);

  if (!canvasDetails.isCanvas || !canvasDetails.hasContext || canvasDetails.width !== 960 || canvasDetails.height !== 540) {
    throw new Error(`Canvas verification failed: ${JSON.stringify(canvasDetails)}`);
  }

  const problemsBeforeInput = getRuntimeProblems(client);
  if (problemsBeforeInput.length) {
    throw new Error(`Browser reported runtime problems before input: ${JSON.stringify(problemsBeforeInput)}`);
  }

  await evaluate(client, "document.querySelector('#game').focus()");
  await client.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'a', code: 'KeyA', text: 'a', windowsVirtualKeyCode: 65, nativeVirtualKeyCode: 65 });
  await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'a', code: 'KeyA', windowsVirtualKeyCode: 65, nativeVirtualKeyCode: 65 });
  await evaluate(client, 'new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))');

  const interactionDetails = await evaluate(client, `(() => ({
    activeElementId: document.activeElement?.id || '',
    status: document.querySelector('#game-status')?.textContent || ''
  }))()`);

  const problemsAfterInput = getRuntimeProblems(client);
  if (problemsAfterInput.length) {
    throw new Error(`Browser reported runtime problems after input: ${JSON.stringify(problemsAfterInput)}`);
  }

  if (!interactionDetails.status.includes('Typed A.')) {
    throw new Error(`Keyboard interaction did not update the status panel: ${JSON.stringify(interactionDetails)}`);
  }

  const screenshot = await client.send('Page.captureScreenshot', { format: 'png', fromSurface: true });
  mkdirSync(join(root, 'artifacts'), { recursive: true });
  writeFileSync(screenshotPath, Buffer.from(screenshot.data, 'base64'));

  console.log(`Browser smoke passed with ${browser.name}; screenshot saved to ${screenshotPath}.`);
} catch (error) {
  if (!cdpConnected) {
    if (browserProcess?.exitCode !== null && browserProcess?.exitCode !== 0) {
      skip(`${browser.name} was found but could not stay running in this environment.`);
    }

    if (isChromiumBootstrapError(error)) {
      skip('chromium was found but DevTools endpoint did not become available in this environment.');
    }
  }

  console.error(`Browser smoke failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  client?.close();
  browserProcess?.kill();
  if (browserProcess) await new Promise((resolve) => browserProcess.once('exit', resolve));
  if (server) await new Promise((resolve) => server.close(resolve));
  if (profileDir) rmSync(profileDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
}
