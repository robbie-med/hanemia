import { DEFAULT_CONFIG } from "./config.defaults.js";

const KEY = "phleb_config_v1";

export function getEffectiveConfig() {
  const stored = loadConfig();
  if (!stored) return DEFAULT_CONFIG;

  if (stored.schemaVersion !== DEFAULT_CONFIG.schemaVersion) {
    const migrated = migrateConfig(stored);
    saveConfig(migrated);
    return migrated;
  }
  return stored;
}

export function loadConfig() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function saveConfig(cfg) {
  localStorage.setItem(KEY, JSON.stringify(cfg));
}

export function resetConfigToDefaults() {
  saveConfig(structuredClone(DEFAULT_CONFIG));
}

export function exportConfigJSON() {
  return JSON.stringify(getEffectiveConfig(), null, 2);
}

export function importConfigJSON(raw) {
  const cfg = JSON.parse(raw);
  if (!cfg || typeof cfg !== "object") throw new Error("Invalid JSON");
  if (!Array.isArray(cfg.tubes) || !Array.isArray(cfg.orderables)) {
    throw new Error("Config must include tubes[] and orderables[]");
  }
  // Force schemaVersion if missing
  if (typeof cfg.schemaVersion !== "number") cfg.schemaVersion = DEFAULT_CONFIG.schemaVersion;
  saveConfig(cfg);
}

function migrateConfig(oldCfg) {
  const base = structuredClone(DEFAULT_CONFIG);

  if (oldCfg.institution?.name) base.institution.name = oldCfg.institution.name;
  if (oldCfg.institution?.notes) base.institution.notes = oldCfg.institution.notes;

  if (Array.isArray(oldCfg.ebvPresets)) base.ebvPresets = oldCfg.ebvPresets;
  if (Array.isArray(oldCfg.tubes)) base.tubes = oldCfg.tubes;
  if (Array.isArray(oldCfg.orderables)) base.orderables = oldCfg.orderables;
  if (Array.isArray(oldCfg.bundles)) base.bundles = oldCfg.bundles;

  if (oldCfg.thresholds) base.thresholds = { ...base.thresholds, ...oldCfg.thresholds };
  if (oldCfg.ui) base.ui = { ...base.ui, ...oldCfg.ui };

  base.schemaVersion = DEFAULT_CONFIG.schemaVersion;
  return base;
}
