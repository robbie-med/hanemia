export function round1(x) {
  return Math.round((Number(x) + Number.EPSILON) * 10) / 10;
}

export function calcEBVml(weightKg, mlPerKg) {
  const w = Number(weightKg);
  const v = Number(mlPerKg);
  if (!isFinite(w) || w <= 0) return 0;
  if (!isFinite(v) || v <= 0) return 0;
  return w * v;
}

export function calcDailyLossMl(tubeEntries, tubeCatalog) {
  const tubeMap = new Map(tubeCatalog.map(t => [t.id, Number(t.ml) || 0]));
  let total = 0;

  for (const e of tubeEntries) {
    const ml = tubeMap.get(e.tubeId) ?? 0;
    const count = Number(e.count) || 0;
    total += ml * count;
    total += Number(e.extraMlWaste || 0);
  }
  return round1(total);
}

export function pct(value, denom) {
  const v = Number(value);
  const d = Number(denom);
  if (!isFinite(v) || !isFinite(d) || d <= 0) return 0;
  return (v / d) * 100;
}
