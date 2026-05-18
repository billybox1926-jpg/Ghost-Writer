import { normalizeName } from './semantic-rules.js';

export const maxTypedCharacters = 24;

export const movementCodeMap = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right'
};

export function isMovementCode(code) {
  return Object.hasOwn(movementCodeMap, code);
}

export function getMovementAxis(activeCodes) {
  return {
    dx: Number(activeCodes.has('ArrowRight')) - Number(activeCodes.has('ArrowLeft')),
    dy: Number(activeCodes.has('ArrowDown')) - Number(activeCodes.has('ArrowUp'))
  };
}

export function isBlockedTextInputEvent(event) {
  return Boolean(
    event.isComposing
      || event.repeat
      || event.ctrlKey
      || event.metaKey
      || event.altKey
      || event.key === 'Dead'
  );
}

export function getTypeableCharacter(event) {
  if (isBlockedTextInputEvent(event)) return '';
  if (!/^[a-zA-Z ]$/.test(event.key)) return '';
  return event.key.toUpperCase();
}

export function isCommandEntryEvent(event) {
  return Boolean(getTypeableCharacter(event));
}

export function canUseEmptyLineShortcut(event, currentTyped) {
  return !isBlockedTextInputEvent(event) && !currentTyped.trim() && !isCommandEntryEvent(event);
}

export function appendTypedCharacter(currentTyped, character) {
  if (!character || currentTyped.length >= maxTypedCharacters) return currentTyped;
  return `${currentTyped}${character}`.slice(0, maxTypedCharacters);
}

export function normalizeCommittedWord(value) {
  return normalizeName(value).slice(0, maxTypedCharacters);
}
