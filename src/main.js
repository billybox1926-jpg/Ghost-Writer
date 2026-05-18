const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');

const keys = new Set();
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
  particles: []
});

let state = initialState();

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function normalizeName(value) {
  return value.trim().toUpperCase().replace(/\s+/g, ' ');
}

function nameMatchRatio(attempt, trueName) {
  const typed = normalizeName(attempt);
  const target = normalizeName(trueName);
  const longest = Math.max(typed.length, target.length);

  if (!longest) return 1;

  const previous = Array.from({ length: target.length + 1 }, (_, index) => index);
  const current = Array.from({ length: target.length + 1 }, () => 0);

  for (let typedIndex = 1; typedIndex <= typed.length; typedIndex += 1) {
    current[0] = typedIndex;

    for (let targetIndex = 1; targetIndex <= target.length; targetIndex += 1) {
      const substitutionCost = typed[typedIndex - 1] === target[targetIndex - 1] ? 0 : 1;
      current[targetIndex] = Math.min(
        previous[targetIndex] + 1,
        current[targetIndex - 1] + 1,
        previous[targetIndex - 1] + substitutionCost
      );
    }

    previous.splice(0, previous.length, ...current);
  }

  return (longest - previous[target.length]) / longest;
}

function hasIncorrectCharacterSequence(attempt, trueName) {
  const sharedLength = Math.min(attempt.length, trueName.length);

  for (let index = 0; index < sharedLength; index += 1) {
    if (attempt[index] !== trueName[index]) return true;
  }

  return attempt.length > trueName.length;
}

function isMisspelledTrueName(attempt, trueName) {
  const typed = normalizeName(attempt);
  const target = normalizeName(trueName);

  return (
    typed !== target
    && typed.length >= Math.ceil(target.length * 0.7)
    && hasIncorrectCharacterSequence(typed, target)
    && nameMatchRatio(typed, target) >= 0.7
  );
}

function mutateGhost() {
  const g = state.ghost;
  g.angry = true;
  g.mutated = true;
  g.mutationLevel = clamp(g.mutationLevel + 1, 1, 3);
  state.ribbon = clamp(state.ribbon - (12 + g.mutationLevel * 4), 0, 100);
  state.message = 'The botched True Name curdles. The ghost mutates and bears down.';
  burst(g.x, g.y, 14 + g.mutationLevel * 8);
}

function commitWord() {
  const word = state.typed.trim().toUpperCase();
  state.typed = '';

  if (!word) return;

  if (word === state.ghost.name && state.ghost.active) {
    state.ghost.active = false;
    state.message = 'True Name accepted. The dead thing folds into punctuation.';
    burst(state.ghost.x, state.ghost.y, 42);
    return;
  }

  if (state.ghost.active && isMisspelledTrueName(word, state.ghost.name)) {
    mutateGhost();
    return;
  }

  if (commands[word]) {
    state.message = commands[word];
    if (word === 'OPEN') state.doorOpen = true;
    if (state.ghost.active && ['BURN', 'BIND', 'LIE'].includes(word)) {
      state.ribbon = clamp(state.ribbon - 6, 0, 100);
      state.ghost.angry = word === 'BURN';
      burst(state.ghost.x, state.ghost.y, 18);
    }
    return;
  }

  state.ribbon = clamp(state.ribbon - 10, 0, 100);
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

function update() {
  const p = state.player;
  const dx = Number(keys.has('ArrowRight') || keys.has('d')) - Number(keys.has('ArrowLeft') || keys.has('a'));
  const dy = Number(keys.has('ArrowDown') || keys.has('s')) - Number(keys.has('ArrowUp') || keys.has('w'));
  p.x = clamp(p.x + dx * p.speed, 42, canvas.width - 42);
  p.y = clamp(p.y + dy * p.speed, 210, canvas.height - 92);

  const clue = { x: 392, y: 332 };
  if (!state.clueFound && distance(p, clue) < 48) {
    state.clueFound = true;
    state.message = 'Ink blooms on a receipt: MALLORY VALE. A True Name?';
  }

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
      state.ribbon = clamp(state.ribbon - drainRate, 0, 100);
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
  ctx.fillRect(18, 18, canvas.width - 36, 124);
  ctx.strokeStyle = 'rgba(215, 199, 161, 0.25)';
  ctx.strokeRect(18, 18, canvas.width - 36, 124);

  drawPixelText(`Ribbon: ${Math.ceil(state.ribbon)}%`, 36, 52, 20, state.ribbon < 25 ? '#9d2832' : '#f2b35f');
  drawPixelText(`Hardboiled Mode: ${state.hardboiled ? 'ON' : 'OFF'}`, 220, 52, 20, '#d7c7a1');
  drawPixelText(`Typed: ${state.typed || '_'}`, 36, 88, 22, '#8cffc1');
  drawPixelText(state.message, 36, 120, 18, '#d7c7a1');
}

function frame() {
  if (state.ribbon > 0) update();
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
    commitWord();
    return;
  }

  if (key === 'Backspace') {
    if (!state.hardboiled) state.typed = state.typed.slice(0, -1);
    else {
      state.ribbon = clamp(state.ribbon - 3, 0, 100);
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
