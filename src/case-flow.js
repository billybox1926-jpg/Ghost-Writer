export const firstCasePhases = {
  BEGINNING: 'beginning',
  INVESTIGATION: 'investigation',
  CONFRONTATION: 'confrontation',
  ENDING_LEAD: 'ending-lead'
};

const phaseObjectives = {
  [firstCasePhases.BEGINNING]: 'Begin: inspect the receipt and the witness before Mallory closes in.',
  [firstCasePhases.INVESTIGATION]: 'Investigation: make Eddie remember, then accuse him for the door word.',
  [firstCasePhases.CONFRONTATION]: 'Confrontation: open the alley door and type MALLORY VALE.',
  [firstCasePhases.ENDING_LEAD]: 'Ending lead: follow the printer\'s mark beyond the open alley.'
};

export function getFirstCasePhase({
  discoveredClueIds = [],
  witnessMemoryState = 'guarded',
  doorOpen = false,
  ghostActive = true
} = {}) {
  if (!ghostActive) return firstCasePhases.ENDING_LEAD;
  if (doorOpen) return firstCasePhases.CONFRONTATION;

  const hasReceipt = discoveredClueIds.includes('receipt');
  const hasWitnessTurn = witnessMemoryState !== 'guarded' || discoveredClueIds.includes('witness');

  if (hasReceipt || hasWitnessTurn) return firstCasePhases.INVESTIGATION;
  return firstCasePhases.BEGINNING;
}

export function getFirstCaseObjective(phase) {
  return phaseObjectives[phase] ?? phaseObjectives[firstCasePhases.BEGINNING];
}
