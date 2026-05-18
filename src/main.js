import { firstCasePhases, getFirstCaseObjective, getFirstCasePhase } from './case-flow.js';
import { discoverClue, findInspectableInRange, getDiscoveredClues } from './clue-journal.js';
import { createScreenShakeState, triggerScreenShakeState, updateScreenShakeState } from './screen-shake.js';
import { appendTypedCharacter, getMovementAxis, getTypeableCharacter, isMovementCode, normalizeCommittedWord } from './input-rules.js';
import { clamp, evaluateTrueNameAttempt, getGhostCommandResult, getProximityPressure, getRibbonDrop, getWitnessCommandResult, ribbonLoss } from './semantic-rules.js';

const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');

const activeMovementCodes = new Set();
const statusPanel = document.querySelector('#game-status');
let previousStatusText = statusPanel?.textContent.trim() ?? '';

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
    message: 'The typewriter chatters: clues must be read, not bumped into.',
    x: 146,
    y: 350,
    range: 62
  },
  {
    id: 'door',
    title: 'Locked alley door',
    journal: "Door: fresh scratches match Mallory's nails; the wood is waiting for OPEN.",
    message: 'The locked door smells of rain, roses, and burned newsprint. Eddie knows the word it obeys.',
    x: 858,
    y: 330,
    range: 64
  },
  {
    id: 'witness',
    title: 'Raincoat witness',
    journal: "Witness: Eddie Pike carried Mallory's receipt and flinches at FORGET, REMEMBER, and ACCUSE.",
    message: "Eddie Pike hides under his raincoat. Type FORGET, REMEMBER, or ACCUSE while he can hear it.",
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
  message: 'Case one: Mallory Vale vanished after Eddie Pike drove her to a locked alley door.',
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
    dropRibbon(result.loss, 5);
    return true;
  }

  state.witness.memoryState = result.memoryState;
  state.witness.memoryLabel = result.label;
  state.witness.edited = true;
  state.witness.lastJournal = result.journal;

  if (result.kind === 'changed') {
    state.discoveredClueIds = discoverClue(state.discoveredClueIds, 'witness');
    if (result.memoryState === 'truthful') state.clueFound = true;
    triggerScreenShake(6, 180);
    burst(state.witness.x, state.witness.y - 36, 18);
  } else {
    triggerScreenShake(3, 120);
  }

  updateCasePhase();
  return true;
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
    dropRibbon(result.loss, 4);
    return true;
  }

  if (result.kind === 'out-of-context') {
    triggerScreenShake(2, 100);
    return true;
  }

  const g = state.ghost;
  dropRibbon(result.loss, result.command === 'BURN' ? 8 : 5);
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
    g.boundUntil = performance.now() + result.duration;
    burst(g.x, g.y, 16);
  }

  if (result.command === 'LIE') {
    g.angry = false;
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

  const trueNameAttempt = evaluateTrueNameAttempt(word, state.ghost.name);

  if (trueNameAttempt === 'exact' && state.ghost.active) {
    if (!state.doorOpen) {
      state.message = 'True Name blocked: Mallory hears it through the locked door, but the sealed room keeps its confession. ACCUSE Eddie, then OPEN the door.';
      dropRibbon(ribbonLoss.gatedWord, 4);
      return;
    }

    state.ghost.active = false;
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
      state.message = 'OPEN is blocked: the lock rattles, but Eddie still owns the missing confession. ACCUSE him first.';
      dropRibbon(ribbonLoss.gatedWord, 4);
      return;
    }

    state.message = `${word} is accepted. ${commands[word]}`;
    triggerScreenShake(7, 220);
    if (word === 'OPEN') {
      state.doorOpen = true;
      state.discoveredClueIds = discoverClue(state.discoveredClueIds, 'door-open');
      updateCasePhase();
    }
    return;
  }

  dropRibbon(ribbonLoss.wrongWord, 7);
  state.message = `${word} is rejected. Wrong letters snag the ribbon, but the night gives you room to recover.`;
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
    if (!isBound && !isLured && pressure.drainRate > 0) {
      dropRibbon(pressure.drainRate, g.mutated ? 3.5 : 2);
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
  drawWitness();
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

  ctx.fillStyle = 'rgba(140, 255, 193, 0.12)';
  ctx.fillRect(518, 342, 88, 42);
  drawPixelText('WITNESS', 519, 332, 13, '#8cffc1');

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

function drawWitness() {
  const w = state.witness;
  const auraColor = w.edited ? 'rgba(242, 179, 95, 0.24)' : 'rgba(140, 255, 193, 0.14)';
  const coatColor = w.memoryState === 'cornered' ? '#3a1717' : (w.memoryState === 'forgotten' ? '#1a1d20' : '#1f271f');

  ctx.fillStyle = auraColor;
  ctx.beginPath();
  ctx.ellipse(w.x, w.y - 24, 34, 52, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = coatColor;
  ctx.fillRect(w.x - 15, w.y - 52, 30, 52);
  ctx.fillStyle = '#101010';
  ctx.fillRect(w.x - 22, w.y - 60, 44, 9);
  ctx.fillStyle = '#d7c7a1';
  ctx.fillRect(w.x - 8, w.y - 48, 16, 12);
  ctx.fillStyle = '#f2b35f';
  ctx.fillRect(w.x + 18, w.y - 32, 18, 3);
  drawPixelText(`EDDIE: ${w.memoryLabel}`, w.x - 54, w.y + 22, 13, w.edited ? '#f2b35f' : '#d7c7a1');

  if (isNearWitness()) {
    drawPixelText('type FORGET / REMEMBER / ACCUSE', w.x - 106, w.y - 76, 13, '#8cffc1');
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

  if (isLured) {
    ctx.strokeStyle = 'rgba(242, 179, 95, 0.45)';
    ctx.setLineDash([6, 8]);
    ctx.beginPath();
    ctx.moveTo(g.x, g.y + pulse);
    ctx.lineTo(g.lure.x, g.lure.y);
    ctx.stroke();
    ctx.setLineDash([]);
    drawPixelText('FALSE LEAD', g.lure.x - 44, g.lure.y - 16, 13, '#f2b35f');
  }

  if (isBound) {
    ctx.strokeStyle = 'rgba(140, 255, 193, 0.72)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(g.x, g.y + pulse, 54, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 1;
    drawPixelText('BOUND', g.x - 28, g.y + 88, 14, '#8cffc1');
  }

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

  const pressure = getProximityPressure(distance(state.player, state.ghost), state.ghost);
  const pressureColor = pressure.level === 'danger' ? '#9d2832' : (pressure.level === 'warning' ? '#f2b35f' : '#d7c7a1');
  drawPixelText(`Ribbon: ${Math.ceil(state.ribbon)}%`, 36, 52, 20, state.ribbon < 25 ? '#9d2832' : '#f2b35f');
  drawPixelText(`Pressure: ${pressure.label}`, 220, 52, 20, pressureColor);
  drawPixelText(`Witness: ${state.witness.memoryLabel}`, 520, 52, 20, state.witness.edited ? '#f2b35f' : '#d7c7a1');
  drawPixelText(`Typed: ${state.typed || '_'}`, 36, 88, 22, '#8cffc1');
  drawPixelText(state.message, 36, 120, 18, '#d7c7a1');
  drawPixelText(getFirstCaseObjective(state.casePhase), 36, 146, 15, '#8cffc1');
  drawPixelText(`Hardboiled Mode: ${state.hardboiled ? 'ON' : 'OFF'}`, 720, 146, 15, '#d7c7a1');

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
  const typedSummary = state.typed ? `Typed ${state.typed}.` : 'No letters typed.';

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
  else updateScreenShake(deltaTime);
  draw();
  updateStatusPanel();
  requestAnimationFrame(frame);
}

window.addEventListener('keydown', (event) => {
  const key = event.key;
  const hasShortcutModifier = event.ctrlKey || event.metaKey || event.altKey;
  const isGameMovement = isMovementCode(event.code) && !hasShortcutModifier;
  if (isGameMovement || [' ', 'Backspace', 'Escape', 'F2'].includes(key)) event.preventDefault();

  if (isGameMovement) {
    activeMovementCodes.add(event.code);
  }

  if (key === 'Escape') {
    state = initialState();
    activeMovementCodes.clear();
    return;
  }

  if (key === 'F2') {
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
      dropRibbon(ribbonLoss.hardboiledBackspace, 4);
      state.message = 'Backspace is blocked in Hardboiled Mode. The ribbon frays, but only a little.';
    }
    return;
  }

  const character = getTypeableCharacter(event);
  if (character) {
    state.typed = appendTypedCharacter(state.typed, character);
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
