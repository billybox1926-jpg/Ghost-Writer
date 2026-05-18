import assert from 'node:assert/strict';
import { evaluateTrueNameAttempt, getRibbonDrop } from '../src/semantic-rules.js';

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

assert.deepEqual(
  getRibbonDrop(0, 12),
  { ribbon: 0, dropped: false },
  'dropRibbon helper should not report a drop when already empty'
);

console.log('Semantic rules tests passed. The True Name holds.');
