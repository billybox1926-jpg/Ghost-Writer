export const CASE_PHASES = {
  BEGINNING: 'beginning',
  INVESTIGATION: 'investigation',
  READY: 'ready',
  CONFRONTATION: 'confrontation',
  ENDING: 'ending'
};

export const CASE_REGISTRY = {
  'mallory-vale': {
    title: 'The Mallory Vale Slice',
    phases: CASE_PHASES,
    objectives: {
      [CASE_PHASES.BEGINNING]: 'First: empty-line Enter inspects clues. Read the receipt, then Eddie.',
      [CASE_PHASES.INVESTIGATION]: 'Next: stand by Eddie; type REMEMBER, Enter, then ACCUSE, Enter.',
      [CASE_PHASES.READY]: 'Door word won: type OPEN, Enter. The locked room will answer.',
      [CASE_PHASES.CONFRONTATION]: 'Finish: type MALLORY VALE, Enter, once the door is open.',
      [CASE_PHASES.ENDING]: 'Ending lead: follow the printer\'s mark beyond the open alley.'
    },
    getPhase: ({ discoveredClueIds = [], witnessMemoryState = 'guarded', doorOpen = false, ghostActive = true }) => {
      if (!ghostActive) return CASE_PHASES.ENDING;
      if (doorOpen) return CASE_PHASES.CONFRONTATION;
      if (witnessMemoryState === 'cornered') return CASE_PHASES.READY;
      const hasReceipt = discoveredClueIds.includes('receipt');
      const hasWitnessTurn = witnessMemoryState !== 'guarded' || discoveredClueIds.includes('witness');
      if (hasReceipt || hasWitnessTurn) return CASE_PHASES.INVESTIGATION;
      return CASE_PHASES.BEGINNING;
    }
  },
  'black-ribbon-press': {
    title: 'Black Ribbon Press',
    phases: CASE_PHASES,
    objectives: {
      [CASE_PHASES.BEGINNING]: 'Case 2: The air smells of ink. Inspect the stained ledger.',
      [CASE_PHASES.INVESTIGATION]: 'Reveal the name: type REVEAL near the ledger, then talk to the Apprentice.',
      [CASE_PHASES.READY]: 'Name found, shield remains: type ERASE near the ledger or ghost.',
      [CASE_PHASES.CONFRONTATION]: 'Shield broken: banish the Ink Shadow with its True Name.',
      [CASE_PHASES.ENDING]: 'The press falls silent. A new lead points to the harbor.'
    },
    getPhase: ({ discoveredClueIds = [], witnessMemoryState = 'guarded', doorOpen = false, ghostActive = true }) => {
      if (!ghostActive) return CASE_PHASES.ENDING;
      const revealed = discoveredClueIds.includes('ledger-revealed');
      const erased = discoveredClueIds.includes('ledger-erased');
      if (erased) return CASE_PHASES.CONFRONTATION;
      if (revealed) return CASE_PHASES.READY;
      if (discoveredClueIds.includes('ledger')) return CASE_PHASES.INVESTIGATION;
      return CASE_PHASES.BEGINNING;
    }
  },
  'harbor-of-ink': {
    title: 'Harbor of Ink',
    phases: CASE_PHASES,
    objectives: {
      [CASE_PHASES.BEGINNING]: 'Case 3: Fog rolls off the docks. Inspect the shipping manifest.',
      [CASE_PHASES.INVESTIGATION]: 'The dockworker looks suspicious. Stand near him and talk.',
      [CASE_PHASES.READY]: 'Manifest decoded: type ANCHOR, then CONFESS near the witness.',
      [CASE_PHASES.CONFRONTATION]: 'The shadow is exposed: type UNTIE or FERRY to banish it with its True Name.',
      [CASE_PHASES.ENDING]: 'The harbor is quiet. You have survived.'
    },
    getPhase: ({ discoveredClueIds = [], witnessMemoryState = 'guarded', ghostActive = true }) => {
      if (!ghostActive) return CASE_PHASES.ENDING;
      const confessed = discoveredClueIds.includes('confessed');
      const decoded = discoveredClueIds.includes('manifest-decoded');
      const harborCleared = discoveredClueIds.includes('harbor-cleared');
      if (harborCleared) return CASE_PHASES.CONFRONTATION;
      if (confessed) return CASE_PHASES.READY;
      if (decoded) return CASE_PHASES.INVESTIGATION;
      if (discoveredClueIds.includes('manifest')) return CASE_PHASES.BEGINNING;
      return CASE_PHASES.BEGINNING;
    }
  }
};

export function getCasePhase(caseId, state) {
  const caseData = CASE_REGISTRY[caseId];
  return caseData ? caseData.getPhase(state) : CASE_PHASES.BEGINNING;
}

export function getCaseObjective(caseId, phase) {
  const caseData = CASE_REGISTRY[caseId];
  if (!caseData) return '';
  return caseData.objectives[phase] ?? caseData.objectives[CASE_PHASES.BEGINNING];
}