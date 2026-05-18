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

export function isModifiedShortcutEvent(event) {
  return Boolean(event.ctrlKey || event.metaKey || event.altKey);
}

export function isCommandEntryKeyEvent(event) {
  return Boolean(
    !event.isComposing
      && !isModifiedShortcutEvent(event)
      && event.key !== 'Dead'
      && /^[a-zA-Z ]$/.test(event.key)
  );
}

export function isBlockedTextInputEvent(event) {
  return Boolean(
    event.isComposing
      || event.repeat
      || isModifiedShortcutEvent(event)
      || event.key === 'Dead'
  );
}

export function getTypeableCharacter(event) {
  if (isBlockedTextInputEvent(event) || !isCommandEntryKeyEvent(event)) return '';
  return event.key.toUpperCase();
}

export function isEmptyLineShortcutEligible(event, currentTyped) {
  return Boolean(
    !currentTyped.trim()
      && !event.repeat
      && !event.isComposing
      && !isModifiedShortcutEvent(event)
      && !isCommandEntryKeyEvent(event)
  );
}

export function appendTypedCharacter(currentTyped, character) {
  if (!character || currentTyped.length >= maxTypedCharacters) return currentTyped;
  return `${currentTyped}${character}`.slice(0, maxTypedCharacters);
}

export function normalizeCommittedWord(value) {
  return normalizeName(value).slice(0, maxTypedCharacters);
}
