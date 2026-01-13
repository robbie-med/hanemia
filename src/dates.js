const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

export function todayISO() {
  const d = new Date();
  return toISODate(d);
}

export function toISODate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function addDaysISO(iso, deltaDays) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + deltaDays);
  return toISODate(d);
}

export function formatDDMMM(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${dd}${MONTHS[d.getMonth()]}`;
}

export function formatDDMMMYYYY(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  const dd = String(d.getDate()).padStart(2, "0");
  const m = MONTHS[d.getMonth()];
  const yyyy = d.getFullYear();
  return `${dd}${m}${yyyy}`;
}
