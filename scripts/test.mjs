import assert from 'node:assert/strict';
import { getCaseObjective, getCasePhase, CASE_PHASES, CASE_REGISTRY } from '../src/case-flow.js';
import { discoverClue, findInspectableInRange, getDiscoveredClues } from '../src/clue-journal.js';
import { createScreenShakeState, triggerScreenShakeState, updateScreenShakeState } from '../src/screen-shake.js';
import { appendTypedCharacter, getMovementAxis, getTypeableCharacter, isCommandEntryKeyEvent, isEmptyLineShortcutEligible, isMovementCode, maxTypedCharacters, normalizeCommittedWord } from '../src/input-rules.js';
import { evaluateTrueNameAttempt, getGhostCommandResult, getProximityPressure, getRibbonDrop, getWitnessCommandResult, ribbonLoss } from '../src/semantic-rules.js';
import { audioCueNames, getNextMuteState, getPressureIntensity } from '../src/audio-engine.js';

const trueName = 'MALLORY VALE';



assert.ok(
  audioCueNames.includes('typeKey') && audioCueNames.includes('trueNameBanish'),
  'audio cue registry should expose required short generated feedback names'
);

assert.equal(
  getNextMuteState(false),
  true,
  'audio mute helper should toggle unmuted audio to muted'
);

assert.equal(
  getNextMuteState(true),
  false,
  'audio mute helper should toggle muted audio back on'
);

assert.equal(
  getPressureIntensity('danger', { active: true, bound: true, lured: false, muted: false }),
  0,
  'bound ghosts should fade pressure audio out even at dangerous range'
);

assert.equal(
  getPressureIntensity('warning', { active: true, bound: false, lured: true, muted: false }),
  0,
  'lured ghosts should fade pressure audio out while chasing the false lead'
);

assert.equal(
  getPressureIntensity('danger', { active: true, angry: true, mutated: true, mutationLevel: 3, bound: false, lured: false, muted: false }),
  1,
  'angry mutated danger pressure should cap audio intensity at a safe maximum'
);

assert.equal(
  getPressureIntensity('safe', { active: true, bound: false, lured: false, muted: false }),
  0,
  'safe pressure should keep the ghost hum silent'
);

assert.equal(
  normalizeCommittedWord('  mallory   vale  '),
  'MALLORY VALE',
  'committed words should be trimmed, uppercased, and space-normalized before rule checks'
);

assert.equal(
  normalizeCommittedWord('A'.repeat(maxTypedCharacters + 8)).length,
  maxTypedCharacters,
  'committed words should be capped at the prototype input length limit'
);

assert.equal(
  appendTypedCharacter('INK', 'Y'),
  'INKY',
  'printable typewriter keys should append to the command buffer'
);

assert.equal(
  appendTypedCharacter('A'.repeat(maxTypedCharacters), 'B'),
  'A'.repeat(maxTypedCharacters),
  'typing should stop at the prototype input length limit'
);

assert.equal(
  getTypeableCharacter({ key: 'm' }),
  'M',
  'letter key presses should be normalized to uppercase typewriter text'
);

assert.equal(
  getTypeableCharacter({ key: 'r', repeat: true }),
  '',
  'held letter keys should not flood repeated command text'
);

assert.equal(
  getTypeableCharacter({ key: 'v', ctrlKey: true }),
  '',
  'browser or assistive modifier shortcuts should not leak into command text'
);

assert.equal(
  getTypeableCharacter({ key: 'Dead' }),
  '',
  'dead-key composition should be ignored until it resolves to a printable key'
);


assert.equal(
  isCommandEntryKeyEvent({ key: 'm', code: 'KeyM' }),
  true,
  'letter keys should be treated as command entry before shortcut handling'
);

assert.equal(
  isCommandEntryKeyEvent({ key: ' ', code: 'Space' }),
  true,
  'space should be treated as command entry for multi-word commands'
);

assert.equal(
  isEmptyLineShortcutEligible({ key: 'm', code: 'KeyM' }, ''),
  false,
  'audio letter shortcuts should not steal the first letter of MALLORY VALE'
);

assert.equal(
  isEmptyLineShortcutEligible({ key: 'e', code: 'KeyE' }, ''),
  false,
  'inspect letter shortcuts should not steal command-entry letters on an empty line'
);

assert.equal(
  isEmptyLineShortcutEligible({ key: 'ArrowUp', code: 'ArrowUp' }, ''),
  true,
  'non-text movement keys should remain eligible on an empty command line'
);

assert.equal(
  isEmptyLineShortcutEligible({ key: 'ArrowUp', code: 'ArrowUp' }, 'OPEN'),
  false,
  'movement shortcuts should not fire while a command is being typed'
);

assert.equal(
  isEmptyLineShortcutEligible({ key: 'Enter', code: 'Enter' }, ''),
  true,
  'empty-line Enter should remain eligible for contextual inspection'
);

for (const commandWord of ['REMEMBER', 'ACCUSE', 'FORGET', 'BURN', 'BIND', 'LIE', 'OPEN', 'MALLORY VALE']) {
  const typed = [...commandWord].reduce((buffer, key) => appendTypedCharacter(buffer, getTypeableCharacter({ key })), '');
  assert.equal(
    typed,
    commandWord,
    `${commandWord} should be typeable without letter shortcuts consuming any characters`
  );
}

assert.equal(
  isMovementCode('KeyW'),
  false,
  'letter keys should stay reserved for command entry instead of movement shortcuts'
);

assert.equal(
  isMovementCode('ArrowUp'),
  true,
  'arrow keys should remain recognized for movement shortcuts'
);

assert.deepEqual(
  getMovementAxis(new Set(['ArrowRight', 'ArrowUp'])),
  { dx: 1, dy: -1 },
  'movement state should derive a stable axis from active physical keys'
);

assert.equal(
  evaluateTrueNameAttempt('MALLORY VALE', trueName),
  'exact',
  'exact True Name should be accepted'
);

assert.equal(
  evaluateTrueNameAttempt('MALLORY V', trueName),
  'none',
  'incomplete correct prefix should not mutate the ghost'
);

assert.equal(
  evaluateTrueNameAttempt('MALLORY VANE', trueName),
  'misspelled',
  'close misspelling should mutate the ghost'
);

assert.equal(
  evaluateTrueNameAttempt('BURN', trueName),
  'none',
  'wrong word should not be treated as a True Name attempt'
);

assert.equal(
  evaluateTrueNameAttempt('MALLORY VALEX', trueName),
  'misspelled',
  'extra trailing characters should count as a botched True Name'
);

assert.deepEqual(
  getRibbonDrop(100, ribbonLoss.wrongWord),
  { ribbon: 94, dropped: true },
  'dropRibbon helper should subtract the tuned wrong-word loss when possible'
);

assert.deepEqual(
  getRibbonDrop(5, ribbonLoss.wrongWord),
  { ribbon: 0, dropped: true },
  'dropRibbon helper should clamp ribbon at zero'
);

const shake = createScreenShakeState();
triggerScreenShakeState(shake, 20, 500, () => 0);
assert.ok(
  shake.magnitude <= 12,
  'screen shake should cap tuned impacts below harsh full-screen jumps'
);
assert.equal(
  shake.duration,
  320,
  'screen shake should cap long impacts to a concise readable rhythm'
);

updateScreenShakeState(shake, 32);
const earlyOffset = Math.hypot(shake.offset.x, shake.offset.y);
assert.ok(
  earlyOffset > 0 && earlyOffset < 12,
  'screen shake should create a softened nonzero rhythmic offset after an impact'
);

const elapsedBeforeCarryover = shake.elapsed;
triggerScreenShakeState(shake, 3, 180, () => 0.25);
assert.equal(
  shake.elapsed,
  elapsedBeforeCarryover,
  'minor repeated shake events should not restart the cadence of a stronger shake'
);

updateScreenShakeState(shake, 1000);
assert.deepEqual(
  shake.offset,
  { x: 0, y: 0 },
  'screen shake should settle cleanly back to a neutral offset'
);

assert.deepEqual(
  getRibbonDrop(0, 12),
  { ribbon: 0, dropped: false },
  'dropRibbon helper should not report a drop when already empty'
);

assert.deepEqual(
  getWitnessCommandResult('guarded', 'FORGET', true),
  {
    kind: 'changed',
    memoryState: 'forgotten',
    label: 'FORGOTTEN',
    journal: "Witness: FORGET blurs the current lead.",
    message: 'FORGET is accepted. The witness loses the lead, but the darkness still remains.'
  },
  'FORGET should edit an in-range witness into the forgotten state'
);

assert.deepEqual(
  getWitnessCommandResult('forgotten', 'FORGET', true),
  {
    kind: 'unchanged',
    memoryState: 'forgotten',
    label: 'FORGOTTEN',
    journal: 'Witness: FORGET blurs the current lead.',
    message: 'FORGET is accepted, but Eddie is already forgotten. The same word only deepens the bruise.'
  },
  'repeating a witness command should not change state twice'
);

assert.equal(
  getWitnessCommandResult('guarded', 'ACCUSE', false).kind,
  'out-of-range',
  'witness commands should require proximity to the witness'
);

assert.deepEqual(
  getWitnessCommandResult('truthful', 'ACCUSE', true),
  {
    kind: 'changed',
    memoryState: 'cornered',
    label: 'CORNERED',
    journal: 'Witness: ACCUSE ties the witness to the conspiracy.',
    message: 'ACCUSE is accepted. The witness breaks and gives up the secret word.'
  },
  'ACCUSE should connect Eddie to the door command and ending lead'
);


assert.deepEqual(
  getGhostCommandResult('BURN', { ghostActive: true, doorOpen: true }),
  {
    kind: 'accepted',
    command: 'BURN',
    loss: 8,
    pressure: 'enraged',
    message: 'BURN is accepted. The ghost flares hot and recoils, but the heat makes it faster after you.',
    journalFeedback: 'BURN hurts most, knocks the ghost back, then leaves it angry.'
  },
  'BURN should be an accepted high-cost enrage/recoil ghost command once the door is open'
);

assert.deepEqual(
  getGhostCommandResult('BIND', { ghostActive: true, doorOpen: true }),
  {
    kind: 'accepted',
    command: 'BIND',
    loss: 4,
    pressure: 'bound',
    duration: 2600,
    message: 'BIND is accepted. Black ribbon staples the ghost to the floor for a few breaths.',
    journalFeedback: 'BIND costs less ribbon and pauses ghost pressure briefly.'
  },
  'BIND should be a moderate-cost command that pauses ghost pressure'
);

assert.deepEqual(
  getGhostCommandResult('LIE', { ghostActive: true, doorOpen: true }),
  {
    kind: 'accepted',
    command: 'LIE',
    loss: 3,
    pressure: 'lured',
    duration: 3000,
    message: 'LIE is accepted. A false lead crosses the room; the ghost chases the wrong ending.',
    journalFeedback: 'LIE is cheap and redirects the ghost toward a decoy.'
  },
  'LIE should be the cheapest command and create lure behavior'
);

assert.equal(
  getGhostCommandResult('BIND', { ghostActive: true, doorOpen: false }).kind,
  'blocked',
  'ghost commands should be case-gated until the alley door is open'
);

assert.equal(
  getGhostCommandResult('BURN', { ghostActive: false, doorOpen: true }).kind,
  'out-of-context',
  'ghost commands should report out-of-context after the ghost is banished'
);

assert.deepEqual(
  getProximityPressure(48, { active: true, angry: true, mutated: false, mutationLevel: 0 }),
  { label: 'GRAVE-CLOSE', level: 'danger', drainRate: ribbonLoss.proximityAngry },
  'close angry ghosts should expose readable danger pressure and tuned drain'
);

assert.deepEqual(
  getProximityPressure(140, { active: true, angry: false, mutated: false, mutationLevel: 0 }),
  { label: 'DISTANT', level: 'safe', drainRate: 0 },
  'distant ghosts should not apply pressure drain'
);

assert.deepEqual(
  getWitnessCommandResult('guarded', 'BURN', true),
  { kind: 'none', memoryState: 'guarded' },
  'non-witness commands should be ignored by the witness state machine'
);


assert.equal(
  getCasePhase.bind(null, 'mallory-vale')({ discoveredClueIds: [], witnessMemoryState: 'guarded', doorOpen: false, ghostActive: true }),
  CASE_PHASES.BEGINNING,
  'first case should start in the beginning phase before clues turn the investigation'
);

assert.equal(
  getCasePhase.bind(null, 'mallory-vale')({ discoveredClueIds: ['receipt'], witnessMemoryState: 'guarded', doorOpen: false, ghostActive: true }),
  CASE_PHASES.INVESTIGATION,
  'finding the receipt should move the first case into its investigation turn'
);

assert.equal(
  getCasePhase.bind(null, 'mallory-vale')({ discoveredClueIds: ['receipt', 'witness'], witnessMemoryState: 'cornered', doorOpen: false, ghostActive: true }),
  CASE_PHASES.READY,
  'cornering Eddie should point the first case objective to the door word before the door opens'
);

assert.equal(
  getCasePhase.bind(null, 'mallory-vale')({ discoveredClueIds: ['receipt', 'witness'], witnessMemoryState: 'cornered', doorOpen: true, ghostActive: true }),
  CASE_PHASES.CONFRONTATION,
  'opening the locked door should mark the the ghost Vale confrontation phase'
);

assert.equal(
  getCasePhase.bind(null, 'mallory-vale')({ discoveredClueIds: ['ending-lead'], witnessMemoryState: 'cornered', doorOpen: true, ghostActive: false }),
  CASE_PHASES.ENDING,
  'banishing the ghost should advance to the ending lead'
);

assert.match(
  getCaseObjective.bind(null, 'mallory-vale')(CASE_PHASES.ENDING),
  /Black Ribbon Press|printer/i,
  'ending lead objective should point to the next case hook'
);

const inspectables = [
  { id: 'receipt', title: 'Rain-blurred receipt', x: 100, y: 100, range: 24 },
  { id: 'door', title: 'Locked alley door', x: 260, y: 100, range: 40 }
];

assert.equal(
  findInspectableInRange({ x: 108, y: 100 }, inspectables)?.id,
  'receipt',
  'nearby player should be able to inspect the closest in-range clue'
);

assert.equal(
  findInspectableInRange({ x: 180, y: 100 }, inspectables),
  null,
  'distant player should not inspect clues out of range'
);

assert.deepEqual(
  discoverClue(['receipt'], 'door'),
  ['receipt', 'door'],
  'journal helper should append newly discovered clues'
);

assert.deepEqual(
  discoverClue(['receipt'], 'receipt'),
  ['receipt'],
  'journal helper should keep discovered clues unique during a run'
);

assert.deepEqual(
  getDiscoveredClues(inspectables, ['door', 'missing', 'receipt']).map((clue) => clue.id),
  ['door', 'receipt'],
  'journal helper should resolve discovered clue ids and ignore stale ids'
);


assert.deepEqual(
  getGhostCommandResult('ERASE', { ghostActive: true, shieldActive: true }),
  {
    kind: 'accepted',
    command: 'ERASE',
    loss: 5,
    pressure: 'weakened',
    duration: 4000,
    message: 'ERASE is accepted. The ink shield thins; the ghost becomes vulnerable to its True Name.',
    journalFeedback: 'ERASE weakens the Ink Shadow, breaking its name-shield.'
  },
  'ERASE should be an accepted command that weakens the Ink Shadow'
);

assert.deepEqual(
  getWitnessCommandResult('guarded', 'GOSSIP', true),
  {
    kind: 'changed',
    memoryState: 'truthful',
    label: 'GOSSIPING',
    journal: "Witness: GOSSIP reveals Victor's secret ink and the ledger.",
    message: 'GOSSIP is accepted. The apprentice whispers about Victor\'s secret ink and the hidden ledger.'
  },
  'GOSSIP should move the apprentice to the truthful state'
);


assert.equal(
  getCasePhase('black-ribbon-press', { discoveredClueIds: [], ghostActive: true }),
  CASE_PHASES.BEGINNING,
  'black ribbon press should start in beginning phase'
);

assert.equal(
  getCasePhase('black-ribbon-press', { discoveredClueIds: ['ledger'], ghostActive: true }),
  CASE_PHASES.INVESTIGATION,
  'finding the ledger should advance case 2 to investigation'
);

assert.equal(
  getCasePhase('black-ribbon-press', { discoveredClueIds: ['ledger', 'ledger-revealed'], ghostActive: true }),
  CASE_PHASES.READY,
  'revealing the name should advance case 2 to ready (shield still up)'
);

assert.equal(
  getCasePhase('black-ribbon-press', { discoveredClueIds: ['ledger', 'ledger-revealed', 'ledger-erased'], ghostActive: true }),
  CASE_PHASES.CONFRONTATION,
  'erasing the shield should advance case 2 to confrontation'
);

console.log('Semantic rules and clue journal tests passed. The True Name holds.');
