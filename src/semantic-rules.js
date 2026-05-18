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
