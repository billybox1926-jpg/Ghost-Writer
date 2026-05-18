import { normalizeName } from './semantic-rules.js';

export const maxTypedCharacters = 24;

export const movementCodeMap = {
  ArrowUp: 'up',
  KeyW: 'up',
  ArrowDown: 'down',
  KeyS: 'down',
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right'
};

export function isMovementCode(code) {
  return Object.hasOwn(movementCodeMap, code);
}

export function getMovementAxis(activeCodes) {
  return {
    dx: Number(activeCodes.has('ArrowRight') || activeCodes.has('KeyD'))
      - Number(activeCodes.has('ArrowLeft') || activeCodes.has('KeyA')),
    dy: Number(activeCodes.has('ArrowDown') || activeCodes.has('KeyS'))
      - Number(activeCodes.has('ArrowUp') || activeCodes.has('KeyW'))
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

export function appendTypedCharacter(currentTyped, character) {
  if (!character || currentTyped.length >= maxTypedCharacters) return currentTyped;
  return `${currentTyped}${character}`.slice(0, maxTypedCharacters);
}

export function normalizeCommittedWord(value) {
  return normalizeName(value).slice(0, maxTypedCharacters);
}
