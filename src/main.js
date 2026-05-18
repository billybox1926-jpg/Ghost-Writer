import { firstCasePhases, getFirstCaseObjective, getFirstCasePhase } from './case-flow.js';
import { discoverClue, findInspectableInRange, getDiscoveredClues } from './clue-journal.js';
import { createScreenShakeState, triggerScreenShakeState, updateScreenShakeState } from './screen-shake.js';
import { appendTypedCharacter, getMovementAxis, getTypeableCharacter, isEmptyLineShortcutEligible, isModifiedShortcutEvent, isMovementCode, normalizeCommittedWord } from './input-rules.js';
import { clamp, evaluateTrueNameAttempt, getGhostCommandResult, getProximityPressure, getRibbonDrop, getWitnessCommandResult, ribbonLoss } from './semantic-rules.js';
import { createAudioEngine, getPressureIntensity } from './audio-engine.js';

const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const audio = createAudioEngine();

const activeMovementCodes = new Set();
const statusPanel = document.querySelector('#game-status');
let previousStatusText = statusPanel?.textContent.trim() ?? '';

const noirPalette = {
  ink: '#050607',
  deepInk: '#020303',
  amber: '#f2b35f',
  paper: '#d7c7a1',
  ghost: '#8cffc1',
  wetBrick: '#21170f'
};

const rainStreaks = Array.from({ length: 72 }, (_, index) => ({
  x: (index * 73) % 960,
  y: (index * 41) % 540,
  length: 18 + (index % 5) * 5,
  speed: 1.8 + (index % 4) * 0.45,
  alpha: 0.12 + (index % 6) * 0.018
}));

const skylineBlocks = Array.from({ length: 10 }, (_, index) => ({
  x: index * 96,
  y: 190 - (120 + ((index * 96 * 13) % 160)) * 0.35,
  width: 72,
  height: 120 + ((index * 96 * 13) % 160),
  windows: Array.from({ length: 4 }, (__, windowIndex) => ({
    x: 12 + (windowIndex % 2) * 30,
    y: 22 + Math.floor(windowIndex / 2) * 42,
    lit: (index + windowIndex) % 3 !== 0
  }))
}));

const inspectables = [
  {
    id: 'receipt',
    title: 'Rain-blurred receipt',
    journal: 'Receipt: Eddie Pike paid for one midnight fare to Mallory Vale and the locked alley door.',
    message: "The receipt is Eddie Pike's fare slip. Ink blooms: Mallory Vale rode to the locked alley door.",
    x: 396,
    y: 332,
    range: 54,
    revealsTrueName: true
  },
  {
    id: 'typewriter',
    title: 'Haunted typewriter',
    journal: 'Typewriter: the E key sticks, as if begging to examine the room.',
    message: 'The typewriter chatters: arrows move only on an empty line; letters and spaces become commands.',
    x: 146,
    y: 350,
    range: 62
  },
  {
    id: 'door',
    title: 'Locked alley door',
    journal: "Door: fresh scratches match Mallory's nails; the wood is waiting for OPEN.",
    message: 'The locked door will not open until Eddie is cornered. Inspect him, make him remember, then ACCUSE.',
    x: 858,
    y: 330,
    range: 64
  },
  {
    id: 'witness',
    title: 'Raincoat witness',
    journal: "Witness: Eddie Pike carried Mallory's receipt and flinches at FORGET, REMEMBER, and ACCUSE.",
    message: "Eddie Pike hides under his raincoat. Stand close; type REMEMBER, Enter, then ACCUSE when he cracks.",
    x: 562,
    y: 348,
    range: 68
  }
];

const caseJournalEntries = [
  {
    id: 'door-open',
    journal: "Door opened: Eddie's hidden word exposes the room where Mallory Vale died."
  },
  {
    id: 'ending-lead',
    journal: "Lead: Mallory leaves a printer's devil mark from the Black Ribbon Press."
  }
];

const journalItems = [...inspectables, ...caseJournalEntries];

const commands = {
  OPEN: "The locked alley door remembers Eddie's fare slip and swings onto Mallory Vale's last room.",
  FORGET: 'A witness loses a minute. The rain keeps the secret.'
};

const initialState = () => ({
  player: { x: 140, y: 340, speed: 2.2 },
  typed: '',
  message: 'Case one: arrows move on an empty line. Empty Enter inspects; letters type commands.',
  ribbon: 100,
  hardboiled: false,
  clueFound: false,
  discoveredClueIds: [],
  doorOpen: false,
  casePhase: firstCasePhases.BEGINNING,
  witness: {
    x: 562,
    y: 348,
    name: 'EDDIE PIKE',
    memoryState: 'guarded',
    memoryLabel: 'GUARDED',
    edited: false
  },
  ghost: {
    x: 690,
    y: 285,
    name: 'MALLORY VALE',
    active: true,
    angry: false,
    mutated: false,
    mutationLevel: 0,
    boundUntil: 0,
    luredUntil: 0,
    lure: { x: 690, y: 285 }
  },
  screenShake: createScreenShakeState(),
  particles: []
});

let state = initialState();
let lastRibbonDamageCueTime = 0;

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function triggerScreenShake(magnitude = 8, duration = 240) {
  triggerScreenShakeState(state.screenShake, magnitude, duration);
}

function updateScreenShake(deltaTime) {
  updateScreenShakeState(state.screenShake, deltaTime);
}

function dropRibbon(amount, shakeMagnitude = 4 + amount * 0.45) {
  const result = getRibbonDrop(state.ribbon, amount);

  if (result.dropped) {
    state.ribbon = result.ribbon;
    triggerScreenShake(shakeMagnitude, 180 + Math.min(amount * 12, 180));
    const now = performance.now();
    if (amount >= 1 || now - lastRibbonDamageCueTime > 450) {
      audio.playCue('ribbonDamage');
      lastRibbonDamageCueTime = now;
    }
  }
}

function mutateGhost() {
  const g = state.ghost;
  g.angry = true;
  g.mutated = true;
  g.boundUntil = 0;
  g.luredUntil = 0;
  g.mutationLevel = clamp(g.mutationLevel + 1, 1, 3);
  const loss = ribbonLoss.trueNameMissBase + g.mutationLevel * ribbonLoss.trueNameMissPerMutation;
  dropRibbon(loss, 9 + g.mutationLevel * 2);
  state.message = 'Dangerously close True Name rejected: the spelling curdles. Mallory mutates and bears down.';
  audio.playCue('ghostMutation');
  burst(g.x, g.y, 14 + g.mutationLevel * 8);
}

function getNearbyInspectable() {
  return findInspectableInRange(state.player, inspectables);
}

function isNearWitness() {
  return distance(state.player, state.witness) <= 92;
}

function updateCasePhase() {
  state.casePhase = getFirstCasePhase({
    discoveredClueIds: state.discoveredClueIds,
    witnessMemoryState: state.witness.memoryState,
    doorOpen: state.doorOpen,
    ghostActive: state.ghost.active
  });
}

function applyWitnessCommand(word) {
  const result = getWitnessCommandResult(state.witness.memoryState, word, isNearWitness());

  if (result.kind === 'none') return false;

  state.message = result.message;

  if (result.kind === 'out-of-range') {
    audio.playCue('blocked');
    dropRibbon(result.loss, 5);
    return true;
  }

  state.witness.memoryState = result.memoryState;
  state.witness.memoryLabel = result.label;
  state.witness.edited = true;
  state.witness.lastJournal = result.journal;

  if (result.kind === 'changed') {
    audio.playCue('accept');
    state.discoveredClueIds = discoverClue(state.discoveredClueIds, 'witness');
    if (result.memoryState === 'truthful') state.clueFound = true;
    triggerScreenShake(6, 180);
    burst(state.witness.x, state.witness.y - 36, 18);
  } else {
    audio.playCue('accept');
    triggerScreenShake(3, 120);
  }

  updateCasePhase();
  return true;
}

function inspectNearby() {
  const inspectable = getNearbyInspectable();

  if (!inspectable) {
    state.message = 'Nothing nearby answers. Leave the typed line empty, step closer with arrows, then press Enter.';
    audio.playCue('blocked');
    return false;
  }

  const alreadyDiscovered = state.discoveredClueIds.includes(inspectable.id);
  state.discoveredClueIds = discoverClue(state.discoveredClueIds, inspectable.id);
  if (inspectable.revealsTrueName) state.clueFound = true;
  state.message = alreadyDiscovered
    ? `${inspectable.title}: already copied into the journal.`
    : inspectable.message;
  audio.playCue(alreadyDiscovered ? 'commit' : 'accept');
  triggerScreenShake(alreadyDiscovered ? 2 : 4, 120);
  updateCasePhase();
  return true;
}

function applyGhostCommand(word) {
  const result = getGhostCommandResult(word, {
    ghostActive: state.ghost.active,
    doorOpen: state.doorOpen
  });

  if (result.kind === 'none') return false;

  state.message = result.message;

  if (result.kind === 'blocked') {
    audio.playCue('blocked');
    dropRibbon(result.loss, 4);
    return true;
  }

  if (result.kind === 'out-of-context') {
    audio.playCue('blocked');
    triggerScreenShake(2, 100);
    return true;
  }

  const g = state.ghost;
  dropRibbon(result.loss, result.command === 'BURN' ? 8 : 5);
  audio.playCue(result.command.toLowerCase());
  triggerScreenShake(result.command === 'BURN' ? 7 : 4, 180);

  if (result.command === 'BURN') {
    g.angry = true;
    g.boundUntil = 0;
    g.luredUntil = 0;
    const pushDistance = 42;
    const ghostDistance = Math.max(distance(g, state.player), 1);
    g.x = clamp(g.x + ((g.x - state.player.x) / ghostDistance) * pushDistance, 42, canvas.width - 42);
    g.y = clamp(g.y + ((g.y - state.player.y) / ghostDistance) * pushDistance, 210, canvas.height - 92);
    burst(g.x, g.y, 26);
  }

  if (result.command === 'BIND') {
    g.angry = false;
    audio.stopPressure();
    g.boundUntil = performance.now() + result.duration;
    burst(g.x, g.y, 16);
  }

  if (result.command === 'LIE') {
    g.angry = false;
    audio.stopPressure();
    g.luredUntil = performance.now() + result.duration;
    g.lure = {
      x: clamp(state.player.x + (state.player.x < canvas.width / 2 ? 170 : -170), 42, canvas.width - 42),
      y: clamp(state.player.y + (state.player.y < 330 ? 72 : -72), 210, canvas.height - 92)
    };
    burst(g.lure.x, g.lure.y, 20);
  }

  return true;
}

function commitWord() {
  const word = normalizeCommittedWord(state.typed);
  state.typed = '';

  if (!word) return;
  audio.playCue('commit');

  const trueNameAttempt = evaluateTrueNameAttempt(word, state.ghost.name);

  if (trueNameAttempt === 'exact' && state.ghost.active) {
    if (!state.doorOpen) {
      state.message = 'True Name blocked: Mallory hears it, but the door is sealed. ACCUSE Eddie, then type OPEN.';
      audio.playCue('blocked');
      dropRibbon(ribbonLoss.gatedWord, 4);
      return;
    }

    state.ghost.active = false;
    audio.playCue('trueNameBanish');
    audio.stopPressure();
    state.discoveredClueIds = discoverClue(state.discoveredClueIds, 'ending-lead');
    state.message = 'True Name accepted. Mallory Vale points through the open door: Black Ribbon Press hired the killer.';
    updateCasePhase();
    burst(state.ghost.x, state.ghost.y, 42);
    return;
  }

  if (state.ghost.active && trueNameAttempt === 'misspelled') {
    mutateGhost();
    return;
  }

  if (applyWitnessCommand(word)) {
    return;
  }

  if (applyGhostCommand(word)) {
    return;
  }

  if (commands[word]) {
    if (word === 'OPEN' && state.witness.memoryState !== 'cornered') {
      state.message = 'OPEN is blocked: Eddie still owns the missing confession. Stand by him and type ACCUSE first.';
      audio.playCue('blocked');
      dropRibbon(ribbonLoss.gatedWord, 4);
      return;
    }

    state.message = `${word} is accepted. ${commands[word]}`;
    audio.playCue('accept');
    triggerScreenShake(7, 220);
    if (word === 'OPEN') {
      state.doorOpen = true;
      audio.playCue('doorOpen');
      state.discoveredClueIds = discoverClue(state.discoveredClueIds, 'door-open');
      updateCasePhase();
    }
    return;
  }

  audio.playCue('reject');
  dropRibbon(ribbonLoss.wrongWord, 7);
  state.message = `${word} is rejected. Use clue words: REMEMBER, ACCUSE, OPEN, then MALLORY VALE.`;
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
  const { dx, dy } = getMovementAxis(activeMovementCodes);
  p.x = clamp(p.x + dx * p.speed, 42, canvas.width - 42);
  p.y = clamp(p.y + dy * p.speed, 210, canvas.height - 92);

  if (state.ghost.active) {
    const g = state.ghost;
    const now = performance.now();
    const isBound = g.boundUntil > now;
    const isLured = g.luredUntil > now;
    const target = isLured ? g.lure : p;
    const shouldAdvance = (g.mutated || g.angry || isLured) && !isBound;

    if (shouldAdvance) {
      const ghostPressure = isLured ? 0.72 : (g.mutated ? 0.34 + g.mutationLevel * 0.1 : 0.44);
      const ghostDistance = Math.max(distance(g, target), 1);
      g.x = clamp(g.x + ((target.x - g.x) / ghostDistance) * ghostPressure, 42, canvas.width - 42);
      g.y = clamp(g.y + ((target.y - g.y) / ghostDistance) * ghostPressure, 210, canvas.height - 92);
    }

    const pressure = getProximityPressure(distance(p, g), g);
    const pressureIntensity = getPressureIntensity(pressure.level, {
      active: g.active,
      angry: g.angry,
      bound: isBound,
      lured: isLured,
      muted: audio.isMuted(),
      mutated: g.mutated,
      mutationLevel: g.mutationLevel
    });
    audio.setPressureIntensity(pressureIntensity);
    if (!isBound && !isLured && pressure.drainRate > 0) {
      dropRibbon(pressure.drainRate, g.mutated ? 3.5 : 2);
    }
  } else {
    audio.stopPressure();
  }

  for (let i = state.particles.length - 1; i >= 0; i -= 1) {
    const spark = state.particles[i];
    spark.x += spark.vx;
    spark.y += spark.vy;
    spark.life -= 1;
    if (spark.life <= 0) state.particles.splice(i, 1);
  }
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
  drawBackAtmosphere();
  drawSceneObjects();
  drawWitness();
  drawPlayer();
  drawGhost();
  drawParticles();
  drawFrontAtmosphere();
  drawHud();

  if (state.ribbon <= 0) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawPixelText('THE RIBBON SNAPS', 348, 260, 34, noirPalette.amber);
    drawPixelText('Press R to rethread the night.', 354, 296, 18, noirPalette.paper);
  }
  ctx.restore();
}

function drawCity() {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#15201b');
  gradient.addColorStop(0.48, '#080b0a');
  gradient.addColorStop(1, noirPalette.deepInk);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#080b0a';
  for (const block of skylineBlocks) {
    ctx.fillRect(block.x, block.y, block.width, block.height);
    for (const windowLight of block.windows) {
      if (!windowLight.lit) continue;
      ctx.fillStyle = 'rgba(242, 179, 95, 0.16)';
      ctx.fillRect(block.x + windowLight.x, block.y + windowLight.y, 10, 18);
      ctx.fillStyle = '#080b0a';
    }
  }

  drawLamplight(706, 168, 210, 260, 'rgba(242, 179, 95, 0.16)');
  drawMoonSliver(777, 70);

  ctx.fillStyle = '#0d0c0b';
  ctx.fillRect(0, 384, canvas.width, 156);
  ctx.fillStyle = '#241b12';
  ctx.fillRect(0, 388, canvas.width, 12);
  ctx.fillStyle = 'rgba(215, 199, 161, 0.08)';
  for (let x = -40; x < canvas.width; x += 120) {
    ctx.fillRect(x, 430, 86, 2);
  }
}

function drawBackAtmosphere() {
  const now = performance.now();
  drawRain(now, false);

  ctx.strokeStyle = 'rgba(242, 179, 95, 0.1)';
  ctx.lineWidth = 1;
  for (let y = 18; y < canvas.height; y += 28) {
    const offset = (now / 110 + y * 0.17) % 28;
    ctx.beginPath();
    ctx.moveTo(0, y + offset);
    ctx.lineTo(canvas.width, y - 58 + offset);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(5, 6, 7, 0.34)';
  ctx.beginPath();
  ctx.moveTo(0, 392);
  ctx.lineTo(500, 206);
  ctx.lineTo(960, 392);
  ctx.closePath();
  ctx.fill();
}

function drawFrontAtmosphere() {
  drawRain(performance.now(), true);
  drawVignette();
}

function drawRain(now, foreground) {
  ctx.strokeStyle = foreground ? 'rgba(215, 199, 161, 0.2)' : 'rgba(140, 255, 193, 0.1)';
  ctx.lineWidth = foreground ? 1.2 : 1;
  for (const streak of rainStreaks) {
    if (foreground !== (streak.length > 28)) continue;
    const y = (streak.y + now * streak.speed * 0.07) % (canvas.height + 80) - 40;
    const x = (streak.x + now * 0.018) % (canvas.width + 50) - 25;
    ctx.globalAlpha = streak.alpha;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 18, y + streak.length);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawVignette() {
  const vignette = ctx.createRadialGradient(480, 288, 180, 480, 288, 560);
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(0.58, 'rgba(0, 0, 0, 0.2)');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.78)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawLamplight(x, y, radiusX, radiusY, color) {
  const glow = ctx.createRadialGradient(x, y, 8, x, y, Math.max(radiusX, radiusY));
  glow.addColorStop(0, color);
  glow.addColorStop(1, 'rgba(242, 179, 95, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.ellipse(x, y + 90, radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawMoonSliver(x, y) {
  ctx.fillStyle = 'rgba(215, 199, 161, 0.2)';
  ctx.beginPath();
  ctx.arc(x, y, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#15201b';
  ctx.beginPath();
  ctx.arc(x + 13, y - 4, 34, 0, Math.PI * 2);
  ctx.fill();
}

function drawGroundShadow(x, y, width, alpha = 0.48) {
  ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
  ctx.beginPath();
  ctx.ellipse(x, y, width, 11, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawPaperScratches(x, y, width, height, tint = 'rgba(5, 6, 7, 0.28)') {
  ctx.strokeStyle = tint;
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i += 1) {
    const lineY = y + 6 + i * Math.max(4, height / 7);
    ctx.beginPath();
    ctx.moveTo(x + 5, lineY);
    ctx.lineTo(x + width - 7 - (i % 2) * 9, lineY + (i % 2));
    ctx.stroke();
  }
}

function drawSceneObjects() {
  const nearbyInspectable = getNearbyInspectable();

  drawAlleyDoor(nearbyInspectable?.id === 'door');
  drawReceipt(nearbyInspectable?.id === 'receipt');
  drawTypewriter(nearbyInspectable?.id === 'typewriter');
  drawWitnessMarker(nearbyInspectable?.id === 'witness');

  for (const inspectable of inspectables) {
    const discovered = state.discoveredClueIds.includes(inspectable.id);
    const isNearby = nearbyInspectable?.id === inspectable.id;
    ctx.strokeStyle = isNearby ? noirPalette.ghost : (discovered ? 'rgba(242, 179, 95, 0.55)' : 'rgba(215, 199, 161, 0.2)');
    ctx.lineWidth = isNearby ? 2 : 1;
    ctx.beginPath();
    ctx.arc(inspectable.x, inspectable.y, isNearby ? 18 : 12, 0, Math.PI * 2);
    ctx.stroke();

    if (isNearby) {
      drawPixelText('Empty Enter: inspect', inspectable.x - 62, inspectable.y - 28, 14, noirPalette.ghost);
    }
  }
  ctx.lineWidth = 1;
}

function drawAlleyDoor(isNearby) {
  drawGroundShadow(858, 388, 58, 0.58);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(820, 244, 76, 146);
  ctx.fillStyle = state.doorOpen ? '#12291d' : noirPalette.wetBrick;
  ctx.fillRect(830, 254, 56, 130);
  ctx.strokeStyle = state.doorOpen ? 'rgba(140, 255, 193, 0.62)' : 'rgba(242, 179, 95, 0.42)';
  ctx.lineWidth = 3;
  ctx.strokeRect(830, 254, 56, 130);
  ctx.lineWidth = 1;

  ctx.fillStyle = state.doorOpen ? 'rgba(140, 255, 193, 0.18)' : 'rgba(0, 0, 0, 0.35)';
  ctx.fillRect(839, 266, 38, 48);
  ctx.strokeStyle = 'rgba(215, 199, 161, 0.22)';
  for (let scratch = 0; scratch < 5; scratch += 1) {
    ctx.beginPath();
    ctx.moveTo(846 + scratch * 6, 325);
    ctx.lineTo(856 + scratch * 4, 354);
    ctx.stroke();
  }
  ctx.fillStyle = noirPalette.amber;
  ctx.beginPath();
  ctx.arc(876, 330, 4, 0, Math.PI * 2);
  ctx.fill();
  if (!state.doorOpen) {
    ctx.strokeStyle = 'rgba(215, 199, 161, 0.52)';
    ctx.strokeRect(849, 300, 18, 16);
  }
  drawPixelText(state.doorOpen ? 'OPEN ROOM' : 'LOCKED ALLEY', 796, 242, 14, isNearby ? noirPalette.ghost : noirPalette.amber);
}

function drawReceipt(isNearby) {
  drawGroundShadow(396, 353, 56, 0.42);
  ctx.fillStyle = '#5b3f24';
  ctx.fillRect(346, 334, 96, 14);
  ctx.fillStyle = 'rgba(242, 179, 95, 0.12)';
  ctx.fillRect(356, 317, 72, 20);
  ctx.save();
  ctx.translate(396, 319);
  ctx.rotate(-0.08);
  ctx.fillStyle = noirPalette.paper;
  ctx.fillRect(-24, -18, 48, 34);
  ctx.fillStyle = 'rgba(157, 40, 50, 0.25)';
  ctx.fillRect(-20, -14, 12, 8);
  drawPaperScratches(-18, -10, 36, 24);
  ctx.restore();
  drawPixelText('fare receipt', 356, 298, 13, isNearby ? noirPalette.ghost : noirPalette.paper);
}

function drawTypewriter(isNearby) {
  drawGroundShadow(146, 386, 72, 0.54);
  ctx.fillStyle = '#2a1b15';
  ctx.fillRect(90, 350, 112, 34);
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(102, 340, 88, 18);
  ctx.fillStyle = '#101010';
  ctx.fillRect(116, 323, 58, 28);
  ctx.fillStyle = 'rgba(215, 199, 161, 0.86)';
  ctx.fillRect(124, 315, 44, 18);
  drawPaperScratches(128, 319, 36, 12, 'rgba(5, 6, 7, 0.45)');
  ctx.fillStyle = noirPalette.ink;
  for (let key = 0; key < 8; key += 1) {
    ctx.beginPath();
    ctx.arc(111 + key * 10, 366 + (key % 2) * 6, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = 'rgba(140, 255, 193, 0.32)';
  ctx.beginPath();
  ctx.moveTo(146, 323);
  ctx.lineTo(146, 294);
  ctx.stroke();
  drawPixelText('HAUNTED TYPEWRITER', 68, 304, 13, isNearby ? noirPalette.ghost : noirPalette.amber);
}

function drawWitnessMarker(isNearby) {
  const color = isNearby ? 'rgba(140, 255, 193, 0.18)' : 'rgba(140, 255, 193, 0.08)';
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(562, 344, 58, 26, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawPlayer() {
  const { x, y } = state.player;
  drawGroundShadow(x, y + 2, 35, 0.58);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.beginPath();
  ctx.moveTo(x - 7, y - 36);
  ctx.lineTo(x + 84, y + 7);
  ctx.lineTo(x + 20, y + 10);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#0d0b09';
  ctx.fillRect(x - 16, y - 48, 32, 48);
  ctx.fillStyle = '#2d2419';
  ctx.beginPath();
  ctx.moveTo(x - 30, y - 28);
  ctx.lineTo(x + 30, y - 28);
  ctx.lineTo(x + 18, y);
  ctx.lineTo(x - 18, y);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#0b0b0b';
  ctx.fillRect(x - 23, y - 62, 46, 11);
  ctx.fillRect(x - 13, y - 74, 26, 14);
  ctx.fillStyle = 'rgba(215, 199, 161, 0.72)';
  ctx.fillRect(x - 8, y - 50, 16, 13);
  ctx.fillStyle = noirPalette.ghost;
  ctx.fillRect(x + 14, y - 44, 14, 9);
  ctx.strokeStyle = 'rgba(140, 255, 193, 0.42)';
  ctx.beginPath();
  ctx.moveTo(x + 28, y - 40);
  ctx.lineTo(x + 54, y - 51);
  ctx.stroke();
}

function drawWitness() {
  const w = state.witness;
  const auraColor = w.edited ? 'rgba(242, 179, 95, 0.24)' : 'rgba(140, 255, 193, 0.14)';
  const coatColor = w.memoryState === 'cornered' ? '#3a1717' : (w.memoryState === 'forgotten' ? '#1a1d20' : '#1f271f');

  drawGroundShadow(w.x, w.y + 2, 34, 0.5);
  ctx.fillStyle = auraColor;
  ctx.beginPath();
  ctx.ellipse(w.x, w.y - 24, 38, 56, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
  ctx.beginPath();
  ctx.moveTo(w.x - 10, w.y - 42);
  ctx.lineTo(w.x + 76, w.y + 6);
  ctx.lineTo(w.x + 20, w.y + 10);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = coatColor;
  ctx.beginPath();
  ctx.moveTo(w.x - 18, w.y - 52);
  ctx.lineTo(w.x + 18, w.y - 52);
  ctx.lineTo(w.x + 28, w.y);
  ctx.lineTo(w.x - 28, w.y);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#101010';
  ctx.fillRect(w.x - 24, w.y - 62, 48, 10);
  ctx.fillRect(w.x - 12, w.y - 72, 24, 12);
  ctx.fillStyle = noirPalette.paper;
  ctx.fillRect(w.x - 8, w.y - 48, 16, 12);
  ctx.fillStyle = noirPalette.amber;
  ctx.fillRect(w.x + 18, w.y - 32, 22, 3);
  ctx.strokeStyle = 'rgba(215, 199, 161, 0.24)';
  ctx.beginPath();
  ctx.moveTo(w.x, w.y - 47);
  ctx.lineTo(w.x - 6, w.y - 2);
  ctx.moveTo(w.x, w.y - 47);
  ctx.lineTo(w.x + 8, w.y - 2);
  ctx.stroke();
  drawPixelText(`EDDIE: ${w.memoryLabel}`, w.x - 54, w.y + 22, 13, w.edited ? noirPalette.amber : noirPalette.paper);

  if (isNearWitness()) {
    drawPixelText('type FORGET / REMEMBER / ACCUSE', w.x - 106, w.y - 76, 13, noirPalette.ghost);
  }
}

function drawGhost() {
  if (!state.ghost.active) return;
  const g = state.ghost;
  const now = performance.now();
  const isBound = g.boundUntil > now;
  const isLured = g.luredUntil > now;
  const pulse = Math.sin(now / 180) * 7;
  const mutationPulse = g.mutated ? Math.sin(now / 55) * (3 + g.mutationLevel) : 0;
  const ghostX = g.x + mutationPulse;
  const ghostY = g.y + pulse;
  const bodyColor = g.mutated ? 'rgba(199, 27, 61, 0.78)' : (g.angry ? 'rgba(157, 40, 50, 0.72)' : 'rgba(140, 255, 193, 0.42)');

  drawGroundShadow(g.x, g.y + 62, g.mutated ? 52 : 38, 0.38);
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(
    ghostX,
    ghostY,
    g.mutated ? 42 + g.mutationLevel * 8 : (g.angry ? 48 : 34),
    g.mutated ? 64 + g.mutationLevel * 10 : (g.angry ? 70 : 54),
    g.mutated ? Math.sin(now / 120) * 0.18 : 0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.fillStyle = g.mutated ? 'rgba(5, 6, 7, 0.45)' : 'rgba(215, 199, 161, 0.16)';
  ctx.beginPath();
  ctx.moveTo(ghostX - 19, ghostY - 18);
  ctx.lineTo(ghostX + 3, ghostY - 34);
  ctx.lineTo(ghostX + 23, ghostY - 15);
  ctx.lineTo(ghostX + 16, ghostY + 8);
  ctx.lineTo(ghostX - 8, ghostY + 4);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = g.mutated ? 'rgba(242, 179, 95, 0.42)' : 'rgba(140, 255, 193, 0.58)';
  ctx.beginPath();
  ctx.moveTo(ghostX - 28, ghostY + 18);
  ctx.lineTo(ghostX - 62, ghostY + 45);
  ctx.moveTo(ghostX + 28, ghostY + 16);
  ctx.lineTo(ghostX + 63, ghostY + 38);
  ctx.stroke();

  if (isLured) {
    ctx.strokeStyle = 'rgba(242, 179, 95, 0.45)';
    ctx.setLineDash([6, 8]);
    ctx.beginPath();
    ctx.moveTo(g.x, ghostY);
    ctx.lineTo(g.lure.x, g.lure.y);
    ctx.stroke();
    ctx.setLineDash([]);
    drawPixelText('FALSE LEAD', g.lure.x - 44, g.lure.y - 16, 13, noirPalette.amber);
  }

  if (isBound) {
    ctx.strokeStyle = 'rgba(140, 255, 193, 0.72)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(g.x, ghostY, 54, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 1;
    drawPixelText('BOUND', g.x - 28, g.y + 88, 14, noirPalette.ghost);
  }

  if (g.mutated) {
    ctx.strokeStyle = 'rgba(140, 255, 193, 0.68)';
    ctx.lineWidth = 2;
    for (let spike = 0; spike < 9; spike += 1) {
      const angle = (Math.PI * 2 * spike) / 9 + now / 360;
      const inner = 34 + g.mutationLevel * 7;
      const outer = inner + 13 + ((spike * 5) % 11);
      ctx.beginPath();
      ctx.moveTo(g.x + Math.cos(angle) * inner, ghostY + Math.sin(angle) * inner);
      ctx.lineTo(g.x + Math.cos(angle) * outer, ghostY + Math.sin(angle) * outer);
      ctx.stroke();
    }
    ctx.lineWidth = 1;
    drawPixelText('MISSPELLED NAME', g.x - 66, g.y + 86, 14, '#c71b3d');
  }

  ctx.fillStyle = noirPalette.deepInk;
  ctx.fillRect(ghostX - 12, ghostY - 4, 7, 7);
  ctx.fillRect(ghostX + 8, ghostY - 4, 7, 7);
  ctx.fillStyle = 'rgba(140, 255, 193, 0.7)';
  ctx.fillRect(ghostX - 9, ghostY - 1, 3, 2);
  ctx.fillRect(ghostX + 11, ghostY - 1, 3, 2);
  drawPixelText(state.clueFound ? 'M _ _ _ _ _ Y  V _ _ E' : 'UNKNOWN NAME', g.x - 58, g.y - 76, 15, g.mutated ? noirPalette.amber : noirPalette.paper);
}

function drawParticles() {
  for (const spark of state.particles) {
    ctx.globalAlpha = clamp(spark.life / 50, 0, 1);
    ctx.fillStyle = spark.life > 45 ? noirPalette.paper : noirPalette.ghost;
    ctx.fillRect(spark.x, spark.y, 3, 3);
  }
  ctx.globalAlpha = 1;
}

function drawHud() {
  ctx.fillStyle = 'rgba(5, 6, 7, 0.82)';
  ctx.fillRect(18, 18, canvas.width - 36, 188);
  ctx.strokeStyle = 'rgba(215, 199, 161, 0.25)';
  ctx.strokeRect(18, 18, canvas.width - 36, 188);

  const pressure = getProximityPressure(distance(state.player, state.ghost), state.ghost);
  const pressureColor = pressure.level === 'danger' ? '#9d2832' : (pressure.level === 'warning' ? '#f2b35f' : '#d7c7a1');
  drawPixelText(`Ribbon: ${Math.ceil(state.ribbon)}%`, 36, 52, 20, state.ribbon < 25 ? '#9d2832' : '#f2b35f');
  drawPixelText(`Pressure: ${pressure.label}`, 220, 52, 20, pressureColor);
  drawPixelText(`Witness: ${state.witness.memoryLabel}`, 520, 52, 20, state.witness.edited ? '#f2b35f' : '#d7c7a1');
  drawPixelText(`Typed: ${state.typed || '_'}`, 36, 88, 22, '#8cffc1');
  drawPixelText(state.message, 36, 120, 18, '#d7c7a1');
  drawPixelText(getFirstCaseObjective(state.casePhase), 36, 146, 15, '#8cffc1');
  drawPixelText(`F2 Hardboiled: ${state.hardboiled ? 'ON' : 'OFF'}`, 720, 146, 15, '#d7c7a1');

  const discoveredClues = getDiscoveredClues(journalItems, state.discoveredClueIds);
  drawPixelText('Journal:', 36, 172, 16, '#f2b35f');
  if (!discoveredClues.length) {
    drawPixelText('No clues copied yet', 112, 172, 16, '#d7c7a1');
    return;
  }

  discoveredClues.slice(-2).forEach((clue, index) => {
    drawPixelText(`• ${clue.journal}`, 112, 172 + index * 18, 15, '#d7c7a1');
  });
}


function updateStatusPanel() {
  if (!statusPanel) return;

  const discoveredClues = getDiscoveredClues(journalItems, state.discoveredClueIds);
  const journalSummary = discoveredClues.length
    ? discoveredClues.slice(-3).map((clue) => clue.journal).join(' ')
    : 'No clues copied yet.';
  const typedSummary = state.typed ? `Typed ${state.typed}. Enter commits typed words; Escape clears this typed line first.` : 'No letters typed. Arrow keys move; Enter inspects nearby clues; Escape restarts; F2 toggles Hardboiled Mode.';

  const nextStatusText = [
    `Ribbon ${Math.ceil(state.ribbon)} percent.`,
    `Hardboiled Mode ${state.hardboiled ? 'on' : 'off'}.`,
    `Ghost pressure ${getProximityPressure(distance(state.player, state.ghost), state.ghost).label}.`,
    `Witness ${state.witness.memoryLabel}.`,
    getFirstCaseObjective(state.casePhase),
    typedSummary,
    state.message,
    journalSummary
  ].join(' ');

  if (nextStatusText !== previousStatusText) {
    statusPanel.textContent = nextStatusText;
    previousStatusText = nextStatusText;
  }
}

let previousFrameTime = performance.now();

function frame(now = performance.now()) {
  const deltaTime = now - previousFrameTime;
  previousFrameTime = now;

  if (state.ribbon > 0) update(deltaTime);
  else {
    audio.stopPressure();
    updateScreenShake(deltaTime);
  }
  draw();
  updateStatusPanel();
  requestAnimationFrame(frame);
}

window.addEventListener('keydown', (event) => {
  const key = event.key;
  const character = getTypeableCharacter(event);

  if (character) {
    if (key === ' ') event.preventDefault();
    audio.resumeFromGesture();
    const nextTyped = appendTypedCharacter(state.typed, character);
    if (nextTyped !== state.typed) audio.playCue('typeKey');
    state.typed = nextTyped;
    return;
  }

  const shortcutEligible = isEmptyLineShortcutEligible(event, state.typed);
  const isGameMovement = shortcutEligible && isMovementCode(event.code);
  if (isGameMovement || ['Backspace', 'Escape', 'F2'].includes(key)) event.preventDefault();

  if (!isModifiedShortcutEvent(event)) audio.resumeFromGesture();

  if (isGameMovement) {
    activeMovementCodes.add(event.code);
    return;
  }

  if (key === 'Escape') {
    if (state.typed) {
      state.typed = '';
      state.message = 'Typed line cleared. Escape restarts only when the line is already empty.';
      audio.playCue('commit');
      return;
    }

    if (shortcutEligible) {
      state = initialState();
      activeMovementCodes.clear();
      audio.stopPressure();
    }
    return;
  }

  if (key === 'F2') {
    if (shortcutEligible) {
      state.hardboiled = !state.hardboiled;
      state.message = state.hardboiled ? 'Hardboiled Mode on: Backspace is barred. Empty-line F2 toggles it off.' : 'Hardboiled Mode off: Backspace works again. Empty-line F2 toggles it.';
      audio.playCue('commit');
    }
    return;
  }

  if (key === 'Enter') {
    if (!state.typed.trim() && inspectNearby()) return;
    commitWord();
    return;
  }

  if (key === 'Backspace') {
    if (!state.hardboiled) state.typed = state.typed.slice(0, -1);
    else {
      audio.playCue('blocked');
      dropRibbon(ribbonLoss.hardboiledBackspace, 4);
      state.message = 'Backspace is blocked in Hardboiled Mode. The ribbon frays, but only a little.';
    }
  }
});

window.addEventListener('keyup', (event) => {
  if (isMovementCode(event.code)) {
    activeMovementCodes.delete(event.code);
  }
});

window.addEventListener('blur', () => {
  activeMovementCodes.clear();
});

frame();
