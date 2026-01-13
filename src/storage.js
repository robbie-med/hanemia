const STATE_KEY = "phleb_state_v1";

export function loadState() {
  const raw = localStorage.getItem(STATE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function saveState(state) {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

export function resetState() {
  localStorage.removeItem(STATE_KEY);
}

export function exportStateJSON(state) {
  return JSON.stringify(state, null, 2);
}

export function importStateJSON(raw) {
  const obj = JSON.parse(raw);
  if (!obj || typeof obj !== "object") throw new Error("Invalid JSON");
  if (!obj.patient || !Array.isArray(obj.days)) throw new Error("State must include patient and days[]");
  return obj;
}
