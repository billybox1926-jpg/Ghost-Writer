export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export const ribbonLoss = {
  wrongWord: 6,
  gatedWord: 2,
  witnessOutOfRange: 3,
  hardboiledWitnessShortcut: 7,
  hardboiledBackspace: 2,
  trueNameMissBase: 8,
  trueNameMissPerMutation: 3,
  proximityCalm: 0.026,
  proximityAngry: 0.055,
  proximityMutatedBase: 0.085,
  proximityMutatedPerLevel: 0.03
};

export const ghostCommandRules = {
  BURN: {
    loss: 8,
    pressure: 'enraged',
    message: 'BURN is accepted. The ghost flares hot and recoils, but the heat makes it faster after you.',
    journalFeedback: 'BURN hurts most, knocks the ghost back, then leaves it angry.'
  },
  BIND: {
    loss: 4,
    pressure: 'bound',
    duration: 2600,
    message: 'BIND is accepted. Black ribbon staples the ghost to the floor for a few breaths.',
    journalFeedback: 'BIND costs less ribbon and pauses ghost pressure briefly.'
  },
  LIE: {
    loss: 3,
    pressure: 'lured',
    duration: 3000,
    message: 'LIE is accepted. A false lead crosses the room; the ghost chases the wrong ending.',
    journalFeedback: 'LIE is cheap and redirects the ghost toward a decoy.'
  },
  ERASE: {
    loss: 5,
    pressure: 'weakened',
    duration: 4000,
    message: 'ERASE is accepted. The ink shield thins; the ghost becomes vulnerable to its True Name.',
    journalFeedback: 'ERASE weakens the Ink Shadow, breaking its name-shield.'
  }
};

export function getHardboiledWitnessCommandResult(memoryState, command, { isInRange, currentCaseId }) {
  const normalizedCommand = normalizeName(command);

  if (currentCaseId !== 'mallory-vale' || normalizedCommand !== 'REMEMBER') return { kind: 'none', memoryState };

  if (!isInRange) {
    return {
      kind: 'out-of-range',
      memoryState,
      loss: ribbonLoss.witnessOutOfRange,
      message: 'Hardboiled REMEMBER dies in the rain. Eddie must be close enough to hear it.'
    };
  }

  if (memoryState === 'cornered') {
    return {
      kind: 'unchanged',
      memoryState: 'cornered',
      label: 'HARD TRUTH',
      journal: 'Hardboiled: REMEMBER cornered Eddie without a second draft.',
      message: 'Hardboiled REMEMBER is already burned into Eddie. The door word is yours.'
    };
  }

  return {
    kind: 'changed',
    memoryState: 'cornered',
    label: 'HARD TRUTH',
    loss: ribbonLoss.hardboiledWitnessShortcut,
    journal: 'Hardboiled: REMEMBER cornered Eddie without a second draft.',
    message: 'Hardboiled REMEMBER hits like a thrown chair. Eddie coughs up the door word in one take.'
  };
}

export function getGhostCommandResult(command, { ghostActive, doorOpen, shieldActive }) {
  const normalizedCommand = normalizeName(command);
  const rule = ghostCommandRules[normalizedCommand];

  if (!rule) return { kind: 'none' };

  if (!ghostActive) {
    return {
      kind: 'out-of-context',
      command: normalizedCommand,
      message: `${normalizedCommand} has nothing to bite. The ghost is already gone.`
    };
  }

  const isBlocked = (shieldActive !== undefined) ? shieldActive : !doorOpen;

  if (isBlocked && normalizedCommand !== 'ERASE') {
    return {
      kind: 'blocked',
      command: normalizedCommand,
      loss: ribbonLoss.gatedWord,
      message: `${normalizedCommand} scratches at the barrier. Break the ghost's shield or door before fighting directly.`
    };
  }

  return {
    kind: 'accepted',
    command: normalizedCommand,
    ...rule
  };
}

export function getProximityPressure(distanceToGhost, ghostState) {
  if (!ghostState.active) return { label: 'BANISHED', level: 'clear', drainRate: 0 };
  if (distanceToGhost >= 120) return { label: 'DISTANT', level: 'safe', drainRate: 0 };

  const label = distanceToGhost < 54 ? 'GRAVE-CLOSE' : (distanceToGhost < 86 ? 'CLOSE' : 'NEAR');
  const level = distanceToGhost < 54 ? 'danger' : (distanceToGhost < 86 ? 'warning' : 'watch');
  const drainRate = ghostState.mutated
    ? ribbonLoss.proximityMutatedBase + ghostState.mutationLevel * ribbonLoss.proximityMutatedPerLevel
    : (ghostState.angry ? ribbonLoss.proximityAngry : ribbonLoss.proximityCalm);

  return { label, level, drainRate };
}

export function normalizeName(value) {
  return value.trim().toUpperCase().replace(/\s+/g, ' ');
}

export function nameMatchRatio(attempt, trueName) {
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

export function hasIncorrectCharacterSequence(attempt, trueName) {
  const sharedLength = Math.min(attempt.length, trueName.length);

  for (let index = 0; index < sharedLength; index += 1) {
    if (attempt[index] !== trueName[index]) return true;
  }

  return attempt.length > trueName.length;
}

export function isMisspelledTrueName(attempt, trueName) {
  const typed = normalizeName(attempt);
  const target = normalizeName(trueName);

  return (
    typed !== target
    && typed.length >= Math.ceil(target.length * 0.7)
    && hasIncorrectCharacterSequence(typed, target)
    && nameMatchRatio(typed, target) >= 0.7
  );
}

export function evaluateTrueNameAttempt(attempt, trueName) {
  const typed = normalizeName(attempt);
  const target = normalizeName(trueName);

  if (typed === target) return 'exact';
  if (isMisspelledTrueName(typed, target)) return 'misspelled';
  return 'none';
}

export function getRibbonDrop(ribbon, amount) {
  const nextRibbon = clamp(ribbon - amount, 0, 100);

  return {
    ribbon: nextRibbon,
    dropped: nextRibbon < ribbon
  };
}

export const witnessCommandStates = {
  FORGET: {
    state: 'forgotten',
    label: 'FORGOTTEN',
    message: 'FORGET is accepted. The witness loses the lead, but the darkness still remains.',
    journal: "Witness: FORGET blurs the current lead."
  },
  REMEMBER: {
    state: 'truthful',
    label: 'REMEMBERED',
    message: 'REMEMBER is accepted. The witness sees the True Name pressing into their palm.',
    journal: "Witness: REMEMBER pins the receipt to the True Name."
  },
  ACCUSE: {
    state: 'cornered',
    label: 'CORNERED',
    message: 'ACCUSE is accepted. The witness breaks and gives up the secret word.',
    journal: 'Witness: ACCUSE ties the witness to the conspiracy.'
  },
  GOSSIP: {
    state: 'truthful',
    label: 'GOSSIPING',
    message: 'GOSSIP is accepted. The apprentice whispers about Victor\'s secret ink and the hidden ledger.',
    journal: "Witness: GOSSIP reveals Victor's secret ink and the ledger."
  }
};

export function getWitnessCommandResult(memoryState, command, isInRange) {
  const normalizedCommand = normalizeName(command);
  const commandState = witnessCommandStates[normalizedCommand];

  if (!commandState) {
    return { kind: 'none', memoryState };
  }

  if (!isInRange) {
    return {
      kind: 'out-of-range',
      memoryState,
      loss: ribbonLoss.witnessOutOfRange,
      message: `${normalizedCommand} is rejected at this distance. Eddie must be close enough to hear the keys.`
    };
  }

  if (memoryState === commandState.state) {
    return {
      kind: 'unchanged',
      memoryState,
      label: commandState.label,
      journal: commandState.journal,
      message: `${normalizedCommand} is accepted, but Eddie is already ${commandState.label.toLowerCase()}. The same word only deepens the bruise.`
    };
  }

  return {
    kind: 'changed',
    memoryState: commandState.state,
    label: commandState.label,
    journal: commandState.journal,
    message: commandState.message
  };
}

export function getHarborCommandResult(command, { discoveredClueIds, isNearWitness }) {
  const normalizedCommand = normalizeName(command);

  if (normalizedCommand === 'ANCHOR') {
    if (!discoveredClueIds.includes('manifest')) {
      return { kind: 'blocked', message: 'ANCHOR is blocked: Need to read the manifest first.' };
    }
    return { kind: 'accepted', newClue: 'manifest-decoded' };
  }

  if (normalizedCommand === 'CONFESS') {
    if (!discoveredClueIds.includes('manifest-decoded')) {
      return { kind: 'blocked', message: 'CONFESS is blocked: Decode the manifest first.' };
    }
    if (!isNearWitness) {
      return { kind: 'blocked', message: 'CONFESS is blocked: The dockworker needs you to stand closer.' };
    }
    return { kind: 'accepted', newClue: 'confessed' };
  }

  if (normalizedCommand === 'UNTIE' || normalizedCommand === 'FERRY') {
    if (!discoveredClueIds.includes('confessed')) {
      return { kind: 'blocked', message: `${normalizedCommand} is blocked: The dockworker hasn't confessed yet.` };
    }
    return { kind: 'accepted', newClue: 'harbor-cleared' };
  }

  return { kind: 'none' };
}

