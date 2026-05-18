export const firstCasePhases = {
  BEGINNING: 'beginning',
  INVESTIGATION: 'investigation',
  DOOR_READY: 'door-ready',
  CONFRONTATION: 'confrontation',
  ENDING_LEAD: 'ending-lead'
};

const phaseObjectives = {
  [firstCasePhases.BEGINNING]: 'First: empty-line Enter inspects clues. Read the receipt, then Eddie.',
  [firstCasePhases.INVESTIGATION]: 'Next: stand by Eddie; type REMEMBER, Enter, then ACCUSE, Enter.',
  [firstCasePhases.DOOR_READY]: 'Door word won: type OPEN, Enter. The locked room will answer.',
  [firstCasePhases.CONFRONTATION]: 'Finish: type MALLORY VALE, Enter, once the door is open.',
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
  if (witnessMemoryState === 'cornered') return firstCasePhases.DOOR_READY;

  const hasReceipt = discoveredClueIds.includes('receipt');
  const hasWitnessTurn = witnessMemoryState !== 'guarded' || discoveredClueIds.includes('witness');

  if (hasReceipt || hasWitnessTurn) return firstCasePhases.INVESTIGATION;
  return firstCasePhases.BEGINNING;
}

export function getFirstCaseObjective(phase) {
  return phaseObjectives[phase] ?? phaseObjectives[firstCasePhases.BEGINNING];
}
