import { rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const node = process.execPath;
const git = process.platform === 'win32' ? 'C:\\Program Files\\Git\\cmd\\git.exe' : 'git';

const checks = [
  [node, ['scripts/test.mjs']],
  [node, ['scripts/smoke-test.mjs']],
  [node, ['--check', 'src/main.js']],
  [node, ['--check', 'src/audio-engine.js']],
  [node, ['--check', 'scripts/browser-smoke.mjs']],
  [node, ['scripts/browser-smoke.mjs']]
];

const gitChecks = [
  [git, ['diff', '--check']],
  [git, ['status', '--short']]
];

async function cleanArtifacts() {
  await rm('artifacts', { recursive: true, force: true });
}

function run(command, args) {
  console.log(`$ ${[command, ...args].join(' ')}`);
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }
  if (result.status !== 0) process.exit(result.status ?? 1);
}

await cleanArtifacts();
for (const [command, args] of checks) run(command, args);
await cleanArtifacts();
for (const [command, args] of gitChecks) run(command, args);
