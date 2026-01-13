export function expandOrderablesToTubeEntries(orderableIds, cfg) {
  const map = new Map(cfg.orderables.map(o => [o.id, o]));
  const tubeCounts = new Map(); // tubeId -> count

  for (const id of orderableIds) {
    const ord = map.get(id);
    if (!ord) continue;
    for (const req of (ord.requirements || [])) {
      const prev = tubeCounts.get(req.tubeId) ?? 0;
      tubeCounts.set(req.tubeId, prev + (Number(req.count) || 0));
    }
  }

  return Array.from(tubeCounts.entries()).map(([tubeId, count]) => ({
    tubeId,
    count,
    extraMlWaste: 0
  }));
}
