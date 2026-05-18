export function findInspectableInRange(player, inspectables) {
  return inspectables.reduce((nearest, inspectable) => {
    const range = inspectable.range ?? 52;
    const distance = Math.hypot(player.x - inspectable.x, player.y - inspectable.y);

    if (distance > range) return nearest;
    if (!nearest || distance < nearest.distance) return { inspectable, distance };
    return nearest;
  }, null)?.inspectable ?? null;
}

export function discoverClue(discoveredClueIds, clueId) {
  if (discoveredClueIds.includes(clueId)) {
    return discoveredClueIds;
  }

  return [...discoveredClueIds, clueId];
}

export function getDiscoveredClues(inspectables, discoveredClueIds) {
  return discoveredClueIds
    .map((clueId) => inspectables.find((inspectable) => inspectable.id === clueId))
    .filter(Boolean);
}
