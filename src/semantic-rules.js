export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export const ribbonLoss = {
  wrongWord: 6,
  gatedWord: 2,
  witnessOutOfRange: 3,
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
    message: 'BURN is accepted. Mallory flares hot and recoils, but the heat makes her faster after you.',
    journalFeedback: 'BURN hurts most, knocks the ghost back, then leaves her angry.'
  },
  BIND: {
    loss: 4,
    pressure: 'bound',
    duration: 2600,
    message: 'BIND is accepted. Black ribbon staples Mallory to the floor for a few breaths.',
    journalFeedback: 'BIND costs less ribbon and pauses ghost pressure briefly.'
  },
  LIE: {
    loss: 3,
    pressure: 'lured',
    duration: 3000,
    message: 'LIE is accepted. A false obituary crosses the alley; Mallory chases the wrong ending.',
    journalFeedback: 'LIE is cheap and redirects the ghost toward a decoy.'
  }
};

export function getGhostCommandResult(command, { ghostActive, doorOpen }) {
  const normalizedCommand = normalizeName(command);
  const rule = ghostCommandRules[normalizedCommand];

  if (!rule) return { kind: 'none' };

  if (!ghostActive) {
    return {
      kind: 'out-of-context',
      command: normalizedCommand,
      message: `${normalizedCommand} has nothing to bite. Mallory is already gone.`
    };
  }

  if (!doorOpen) {
    return {
      kind: 'blocked',
      command: normalizedCommand,
      loss: ribbonLoss.gatedWord,
      message: `${normalizedCommand} scratches at the sealed door. Open Mallory's room before fighting the ghost directly.`
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
    message: 'FORGET is accepted. Eddie loses the fare, but the locked alley door still stains his sleeve.',
    journal: "Witness: FORGET blurs Eddie's fare, leaving only Mallory's door in his panic."
  },
  REMEMBER: {
    state: 'truthful',
    label: 'REMEMBERED',
    message: 'REMEMBER is accepted. Eddie sees Mallory Vale pressing the receipt into his palm at the locked alley door.',
    journal: "Witness: REMEMBER pins Eddie's receipt to Mallory Vale and the locked alley door."
  },
  ACCUSE: {
    state: 'cornered',
    label: 'CORNERED',
    message: 'ACCUSE is accepted. Eddie breaks: Black Ribbon Press paid him, and the door only listens to OPEN.',
    journal: 'Witness: ACCUSE ties Eddie to Black Ribbon Press and gives up OPEN.'
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
