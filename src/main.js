import { discoverClue, findInspectableInRange, getDiscoveredClues } from './clue-journal.js';
import { clamp, evaluateTrueNameAttempt, getRibbonDrop } from './semantic-rules.js';

const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');

const keys = new Set();

const inspectables = [
  {
    id: 'receipt',
    title: 'Rain-blurred receipt',
    journal: 'Receipt: coal-black ink circles the name MALLORY VALE.',
    message: 'You inspect the receipt. Ink blooms into a True Name: MALLORY VALE.',
    x: 396,
    y: 332,
    range: 54,
    revealsTrueName: true
  },
  {
    id: 'typewriter',
    title: 'Haunted typewriter',
    journal: 'Typewriter: the E key sticks, as if begging to examine the room.',
    message: 'The typewriter chatters: clues must be read, not bumped into.',
    x: 146,
    y: 350,
    range: 62
  },
  {
    id: 'door',
    title: 'Locked alley door',
    journal: 'Door: wet scratches spell OPEN beneath the handle.',
    message: 'The locked door shivers. A command word hides in the wood: OPEN.',
    x: 858,
    y: 330,
    range: 64
  }
];

const commands = {
  BURN: 'The ghost flares like wet newspaper in a furnace.',
  BIND: 'Invisible string cinches the ghost into a ledger.',
  LIE: 'A false obituary peels away from the page and draws its eyes.',
  OPEN: 'The locked alley door remembers it was never closed.',
  FORGET: 'A witness loses a minute. The rain keeps the secret.'
};

const initialState = () => ({
  player: { x: 140, y: 340, speed: 2.2 },
  typed: '',
  message: 'Find the True Name. Paper, ink, and wood will talk.',
  ribbon: 100,
  hardboiled: false,
  clueFound: false,
  discoveredClueIds: [],
  doorOpen: false,
  ghost: {
    x: 690,
    y: 285,
    name: 'MALLORY VALE',
    active: true,
    angry: false,
    mutated: false,
    mutationLevel: 0
  },
  screenShake: {
    offset: { x: 0, y: 0 },
    vector: { x: 0, y: 0 },
    magnitude: 0,
    duration: 0,
    elapsed: 0
  },
  particles: []
});

let state = initialState();

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function triggerScreenShake(magnitude = 8, duration = 240) {
  const angle = Math.random() * Math.PI * 2;
  const shake = state.screenShake;
  shake.vector.x = Math.cos(angle);
  shake.vector.y = Math.sin(angle);
  shake.magnitude = Math.max(shake.magnitude, magnitude);
  shake.duration = Math.max(shake.duration, duration);
  shake.elapsed = 0;
}

function updateScreenShake(deltaTime) {
  const shake = state.screenShake;

  if (shake.elapsed >= shake.duration || shake.magnitude <= 0) {
    shake.offset.x = 0;
    shake.offset.y = 0;
    return;
  }

  shake.elapsed = Math.min(shake.elapsed + deltaTime, shake.duration);
  const linearDecay = 1 - (shake.elapsed / shake.duration);
  const snap = Math.sin(shake.elapsed * 0.09) >= 0 ? 1 : -1;
  shake.offset.x = shake.vector.x * shake.magnitude * linearDecay * snap;
  shake.offset.y = shake.vector.y * shake.magnitude * linearDecay * -snap;

  if (shake.elapsed >= shake.duration) {
    shake.offset.x = 0;
    shake.offset.y = 0;
    shake.magnitude = 0;
  }
}

function dropRibbon(amount, shakeMagnitude = 4 + amount * 0.45) {
  const result = getRibbonDrop(state.ribbon, amount);

  if (result.dropped) {
    state.ribbon = result.ribbon;
    triggerScreenShake(shakeMagnitude, 180 + Math.min(amount * 12, 180));
  }
}

function mutateGhost() {
  const g = state.ghost;
  g.angry = true;
  g.mutated = true;
  g.mutationLevel = clamp(g.mutationLevel + 1, 1, 3);
  dropRibbon(12 + g.mutationLevel * 4, 10 + g.mutationLevel * 3);
  state.message = 'The botched True Name curdles. The ghost mutates and bears down.';
  burst(g.x, g.y, 14 + g.mutationLevel * 8);
}

function getNearbyInspectable() {
  return findInspectableInRange(state.player, inspectables);
}

function inspectNearby() {
  const inspectable = getNearbyInspectable();

  if (!inspectable) {
    state.message = 'Nothing nearby answers the ribbon. Step closer to paper, ink, or wood.';
    return false;
  }

  const alreadyDiscovered = state.discoveredClueIds.includes(inspectable.id);
  state.discoveredClueIds = discoverClue(state.discoveredClueIds, inspectable.id);
  if (inspectable.revealsTrueName) state.clueFound = true;
  state.message = alreadyDiscovered
    ? `${inspectable.title}: already copied into the journal.`
    : inspectable.message;
  triggerScreenShake(alreadyDiscovered ? 2 : 4, 120);
  return true;
}

function commitWord() {
  const word = state.typed.trim().toUpperCase();
  state.typed = '';

  if (!word) return;

  if (evaluateTrueNameAttempt(word, state.ghost.name) === 'exact' && state.ghost.active) {
    state.ghost.active = false;
    state.message = 'True Name accepted. The dead thing folds into punctuation.';
    burst(state.ghost.x, state.ghost.y, 42);
    return;
  }

  if (state.ghost.active && evaluateTrueNameAttempt(word, state.ghost.name) === 'misspelled') {
    mutateGhost();
    return;
  }

  if (commands[word]) {
    state.message = commands[word];
    triggerScreenShake(7, 220);
    if (word === 'OPEN') state.doorOpen = true;
    if (state.ghost.active && ['BURN', 'BIND', 'LIE'].includes(word)) {
      dropRibbon(6, 8);
      state.ghost.angry = word === 'BURN';
      burst(state.ghost.x, state.ghost.y, 18);
    }
    return;
  }

  dropRibbon(10, 8);
  state.message = 'Wrong letters snag the ribbon. The typebars twitch in pain.';
}

function burst(x, y, count) {
  for (let i = 0; i < count; i += 1) {
    state.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      life: 40 + Math.random() * 20
    });
  }
}

function update(deltaTime) {
  updateScreenShake(deltaTime);

  const p = state.player;
  const dx = Number(keys.has('ArrowRight') || keys.has('d')) - Number(keys.has('ArrowLeft') || keys.has('a'));
  const dy = Number(keys.has('ArrowDown') || keys.has('s')) - Number(keys.has('ArrowUp') || keys.has('w'));
  p.x = clamp(p.x + dx * p.speed, 42, canvas.width - 42);
  p.y = clamp(p.y + dy * p.speed, 210, canvas.height - 92);

  if (state.ghost.active) {
    const g = state.ghost;
    if (g.mutated) {
      const ghostPressure = 0.38 + g.mutationLevel * 0.12;
      const ghostDistance = Math.max(distance(g, p), 1);
      g.x = clamp(g.x + ((p.x - g.x) / ghostDistance) * ghostPressure, 42, canvas.width - 42);
      g.y = clamp(g.y + ((p.y - g.y) / ghostDistance) * ghostPressure, 210, canvas.height - 92);
    }

    if (distance(p, g) < 120) {
      const drainRate = g.mutated ? 0.11 + g.mutationLevel * 0.045 : (g.angry ? 0.08 : 0.035);
      dropRibbon(drainRate, g.mutated ? 3.5 : 2);
    }
  }

  state.particles = state.particles
    .map((spark) => ({ ...spark, x: spark.x + spark.vx, y: spark.y + spark.vy, life: spark.life - 1 }))
    .filter((spark) => spark.life > 0);
}

function drawPixelText(text, x, y, size = 16, color = '#d7c7a1') {
  ctx.fillStyle = color;
  ctx.font = `${size}px Georgia, serif`;
  ctx.fillText(text, x, y);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(state.screenShake.offset.x, state.screenShake.offset.y);
  drawCity();
  drawSceneObjects();
  drawPlayer();
  drawGhost();
  drawParticles();
  drawHud();

  if (state.ribbon <= 0) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawPixelText('THE RIBBON SNAPS', 348, 260, 34, '#f2b35f');
    drawPixelText('Press R to rethread the night.', 354, 296, 18, '#d7c7a1');
  }
  ctx.restore();
}

function drawCity() {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#111a15');
  gradient.addColorStop(1, '#050607');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#0b0f0d';
  for (let x = 0; x < canvas.width; x += 96) {
    const h = 120 + ((x * 13) % 160);
    ctx.fillRect(x, 190 - h * 0.35, 72, h);
  }

  ctx.strokeStyle = 'rgba(242, 179, 95, 0.18)';
  for (let y = 0; y < canvas.height; y += 22) {
    ctx.beginPath();
    ctx.moveTo(0, y + (performance.now() / 80) % 22);
    ctx.lineTo(canvas.width, y - 46);
    ctx.stroke();
  }

  ctx.fillStyle = '#111';
  ctx.fillRect(0, 384, canvas.width, 156);
  ctx.fillStyle = '#1d1811';
  ctx.fillRect(0, 388, canvas.width, 12);
}

function drawSceneObjects() {
  const nearbyInspectable = getNearbyInspectable();

  ctx.fillStyle = state.doorOpen ? '#15271d' : '#21170f';
  ctx.fillRect(830, 254, 56, 130);
  drawPixelText(state.doorOpen ? 'OPEN' : 'LOCKED', 820, 242, 14, '#f2b35f');

  ctx.fillStyle = '#5b3f24';
  ctx.fillRect(346, 334, 96, 14);
  ctx.fillStyle = '#d7c7a1';
  ctx.fillRect(374, 306, 44, 28);
  drawPixelText('receipt', 369, 298, 13, '#8cffc1');

  ctx.fillStyle = '#2a1b15';
  ctx.fillRect(90, 350, 112, 34);
  ctx.fillStyle = '#101010';
  ctx.fillRect(116, 323, 58, 28);
  drawPixelText('TYPEWRITER', 81, 314, 13, '#f2b35f');

  for (const inspectable of inspectables) {
    const discovered = state.discoveredClueIds.includes(inspectable.id);
    const isNearby = nearbyInspectable?.id === inspectable.id;
    ctx.strokeStyle = isNearby ? '#8cffc1' : (discovered ? 'rgba(242, 179, 95, 0.55)' : 'rgba(215, 199, 161, 0.2)');
    ctx.lineWidth = isNearby ? 2 : 1;
    ctx.beginPath();
    ctx.arc(inspectable.x, inspectable.y, isNearby ? 18 : 12, 0, Math.PI * 2);
    ctx.stroke();

    if (isNearby) {
      drawPixelText('E / Enter: inspect', inspectable.x - 54, inspectable.y - 28, 14, '#8cffc1');
    }
  }
  ctx.lineWidth = 1;
}

function drawPlayer() {
  const { x, y } = state.player;
  ctx.fillStyle = '#17110d';
  ctx.fillRect(x - 17, y - 44, 34, 44);
  ctx.fillStyle = '#2d2419';
  ctx.fillRect(x - 25, y - 25, 50, 25);
  ctx.fillStyle = '#141414';
  ctx.fillRect(x - 20, y - 62, 40, 12);
  ctx.fillRect(x - 12, y - 72, 24, 12);
  ctx.fillStyle = '#8cffc1';
  ctx.fillRect(x + 15, y - 42, 12, 8);
}

function drawGhost() {
  if (!state.ghost.active) return;
  const g = state.ghost;
  const pulse = Math.sin(performance.now() / 180) * 7;
  const mutationPulse = g.mutated ? Math.sin(performance.now() / 55) * (3 + g.mutationLevel) : 0;
  ctx.fillStyle = g.mutated ? 'rgba(199, 27, 61, 0.78)' : (g.angry ? 'rgba(157, 40, 50, 0.72)' : 'rgba(140, 255, 193, 0.42)');
  ctx.beginPath();
  ctx.ellipse(
    g.x + mutationPulse,
    g.y + pulse,
    g.mutated ? 42 + g.mutationLevel * 8 : (g.angry ? 48 : 34),
    g.mutated ? 64 + g.mutationLevel * 10 : (g.angry ? 70 : 54),
    g.mutated ? Math.sin(performance.now() / 120) * 0.18 : 0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  if (g.mutated) {
    ctx.strokeStyle = 'rgba(140, 255, 193, 0.68)';
    ctx.lineWidth = 2;
    for (let spike = 0; spike < 9; spike += 1) {
      const angle = (Math.PI * 2 * spike) / 9 + performance.now() / 360;
      const inner = 34 + g.mutationLevel * 7;
      const outer = inner + 13 + ((spike * 5) % 11);
      ctx.beginPath();
      ctx.moveTo(g.x + Math.cos(angle) * inner, g.y + pulse + Math.sin(angle) * inner);
      ctx.lineTo(g.x + Math.cos(angle) * outer, g.y + pulse + Math.sin(angle) * outer);
      ctx.stroke();
    }
    ctx.lineWidth = 1;
    drawPixelText('MISSPELLED NAME', g.x - 66, g.y + 86, 14, '#c71b3d');
  }

  ctx.fillStyle = '#050607';
  ctx.fillRect(g.x - 12 + mutationPulse, g.y - 4 + pulse, 7, 7);
  ctx.fillRect(g.x + 8 + mutationPulse, g.y - 4 + pulse, 7, 7);
  drawPixelText(state.clueFound ? 'M _ _ _ _ _ Y  V _ _ E' : 'UNKNOWN NAME', g.x - 58, g.y - 76, 15, g.mutated ? '#f2b35f' : '#d7c7a1');
}

function drawParticles() {
  ctx.fillStyle = '#8cffc1';
  for (const spark of state.particles) {
    ctx.globalAlpha = clamp(spark.life / 50, 0, 1);
    ctx.fillRect(spark.x, spark.y, 3, 3);
  }
  ctx.globalAlpha = 1;
}

function drawHud() {
  ctx.fillStyle = 'rgba(5, 6, 7, 0.82)';
  ctx.fillRect(18, 18, canvas.width - 36, 188);
  ctx.strokeStyle = 'rgba(215, 199, 161, 0.25)';
  ctx.strokeRect(18, 18, canvas.width - 36, 188);

  drawPixelText(`Ribbon: ${Math.ceil(state.ribbon)}%`, 36, 52, 20, state.ribbon < 25 ? '#9d2832' : '#f2b35f');
  drawPixelText(`Hardboiled Mode: ${state.hardboiled ? 'ON' : 'OFF'}`, 220, 52, 20, '#d7c7a1');
  drawPixelText(`Typed: ${state.typed || '_'}`, 36, 88, 22, '#8cffc1');
  drawPixelText(state.message, 36, 120, 18, '#d7c7a1');

  const discoveredClues = getDiscoveredClues(inspectables, state.discoveredClueIds);
  drawPixelText('Journal:', 36, 150, 16, '#f2b35f');
  if (!discoveredClues.length) {
    drawPixelText('No clues copied yet', 112, 150, 16, '#d7c7a1');
    return;
  }

  discoveredClues.slice(-3).forEach((clue, index) => {
    drawPixelText(`• ${clue.journal}`, 112, 150 + index * 18, 15, '#d7c7a1');
  });
}

let previousFrameTime = performance.now();

function frame(now = performance.now()) {
  const deltaTime = now - previousFrameTime;
  previousFrameTime = now;

  if (state.ribbon > 0) update(deltaTime);
  else updateScreenShake(deltaTime);
  draw();
  requestAnimationFrame(frame);
}

window.addEventListener('keydown', (event) => {
  const key = event.key;
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(key)) event.preventDefault();

  if (key === 'r' || key === 'R') {
    state = initialState();
    return;
  }

  if (key === 'h' || key === 'H') {
    state.hardboiled = !state.hardboiled;
    state.message = state.hardboiled ? 'No backspace. No mercy.' : 'Backspace restored. The night softens by one notch.';
    return;
  }

  if (key === 'Enter') {
    if (!state.typed.trim() && inspectNearby()) return;
    commitWord();
    return;
  }

  if ((key === 'e' || key === 'E') && !state.typed) {
    if (inspectNearby()) return;
  }

  if (key === 'Backspace') {
    if (!state.hardboiled) state.typed = state.typed.slice(0, -1);
    else {
      dropRibbon(3, 5);
      state.message = 'Hardboiled Mode has no backspace key.';
    }
    return;
  }

  if (/^[a-zA-Z ]$/.test(key) && state.typed.length < 24) {
    state.typed += key.toUpperCase();
    return;
  }

  keys.add(key);
});

window.addEventListener('keyup', (event) => {
  keys.delete(event.key);
});

frame();
