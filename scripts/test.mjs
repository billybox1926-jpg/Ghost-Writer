import assert from 'node:assert/strict';
import { discoverClue, findInspectableInRange, getDiscoveredClues } from '../src/clue-journal.js';
import { createScreenShakeState, triggerScreenShakeState, updateScreenShakeState } from '../src/screen-shake.js';
import { evaluateTrueNameAttempt, getRibbonDrop, getWitnessCommandResult } from '../src/semantic-rules.js';

const trueName = 'MALLORY VALE';

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
  getRibbonDrop(100, 12),
  { ribbon: 88, dropped: true },
  'dropRibbon helper should subtract from ribbon when possible'
);

assert.deepEqual(
  getRibbonDrop(5, 12),
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
    journal: 'Witness: FORGET makes Eddie lose the minute after Mallory died.',
    message: 'Eddie Pike forgets the last minute. His cigarette falls through his fingers.'
  },
  'FORGET should edit an in-range witness into the forgotten state'
);

assert.deepEqual(
  getWitnessCommandResult('forgotten', 'FORGET', true),
  {
    kind: 'unchanged',
    memoryState: 'forgotten',
    label: 'FORGOTTEN',
    journal: 'Witness: FORGET makes Eddie lose the minute after Mallory died.',
    message: 'Eddie Pike is already forgotten. The same word only deepens the bruise.'
  },
  'repeating a witness command should not change state twice'
);

assert.equal(
  getWitnessCommandResult('guarded', 'ACCUSE', false).kind,
  'out-of-range',
  'witness commands should require proximity to the witness'
);

assert.deepEqual(
  getWitnessCommandResult('guarded', 'BURN', true),
  { kind: 'none', memoryState: 'guarded' },
  'non-witness commands should be ignored by the witness state machine'
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

console.log('Semantic rules and clue journal tests passed. The True Name holds.');
