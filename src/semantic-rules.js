export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
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
    message: 'Eddie Pike forgets the fare on the receipt, but the locked alley door still stains his sleeve.',
    journal: "Witness: FORGET blurs Eddie's fare, leaving only Mallory's door in his panic."
  },
  REMEMBER: {
    state: 'truthful',
    label: 'REMEMBERED',
    message: 'Eddie Pike remembers Mallory Vale pressing the receipt into his palm at the locked alley door.',
    journal: "Witness: REMEMBER pins Eddie's receipt to Mallory Vale and the locked alley door."
  },
  ACCUSE: {
    state: 'cornered',
    label: 'CORNERED',
    message: 'Eddie Pike breaks. Black Ribbon Press paid him, and the door only listens to OPEN.',
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
      message: `${normalizedCommand} needs a living witness close enough to hear the keys.`
    };
  }

  if (memoryState === commandState.state) {
    return {
      kind: 'unchanged',
      memoryState,
      label: commandState.label,
      journal: commandState.journal,
      message: `Eddie Pike is already ${commandState.label.toLowerCase()}. The same word only deepens the bruise.`
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
