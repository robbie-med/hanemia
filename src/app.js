import { getEffectiveConfig, exportConfigJSON, importConfigJSON, resetConfigToDefaults } from "./config.store.js";
import { loadState, saveState, resetState, exportStateJSON, importStateJSON } from "./storage.js";
import { todayISO, addDaysISO } from "./dates.js";
import { expandOrderablesToTubeEntries } from "./expand.js";
import { calcEBVml, calcDailyLossMl, pct, round1 } from "./calc.js";
import { setInstitutionLine, fillEBVPresets, selectedMultiValues, setMultiSelected,
         renderPatientMetrics, renderDaysTable, renderTotals, renderWarnings } from "./ui.js";

const els = {
  institutionLine: document.getElementById("institutionLine"),
  weightKg: document.getElementById("weightKg"),
  ebvPreset: document.getElementById("ebvPreset"),
  ebvOverride: document.getElementById("ebvOverride"),
  contextFlags: document.getElementById("contextFlags"),

  patientMetrics: document.getElementById("patientMetrics"),

  btnAddDay: document.getElementById("btnAddDay"),
  daysTbody: document.getElementById("daysTbody"),

  totals: document.getElementById("totals"),
  warnings: document.getElementById("warnings"),

  // State tools
  btnExportState: document.getElementById("btnExportState"),
  btnImportState: document.getElementById("btnImportState"),
  btnResetState: document.getElementById("btnResetState"),

  // Config tools
  btnExportConfig: document.getElementById("btnExportConfig"),
  btnImportConfig: document.getElementById("btnImportConfig"),
  btnResetConfig: document.getElementById("btnResetConfig"),

  jsonBox: document.getElementById("jsonBox"),
  btnCopyJson: document.getElementById("btnCopyJson"),
  jsonStatus: document.getElementById("jsonStatus")
};

let cfg = getEffectiveConfig();
let state = loadState() || defaultState(cfg);

// ---------- Init UI ----------
setInstitutionLine(els.institutionLine, cfg);
fillEBVPresets(els.ebvPreset, cfg.ebvPresets);

hydratePatientInputs();
wireEvents();
recalcAndRender();

function defaultState(cfg) {
  const start = todayISO();
  return {
    patient: {
      weightKg: 10.0,
      ebvPresetId: cfg.ebvPresets?.[3]?.id || "child",
      ebvOverrideMlPerKg: null,
      contextFlags: []
    },
    days: [
      { hd: 1, dateISO: start, orderables: [], lineWasteMl: 0 }
    ]
  };
}

function hydratePatientInputs() {
  els.weightKg.value = String(state.patient.weightKg ?? "");
  els.ebvPreset.value = state.patient.ebvPresetId || "";
  els.ebvOverride.value = state.patient.ebvOverrideMlPerKg ?? "";
  setMultiSelected(els.contextFlags, state.patient.contextFlags || []);
}

function wireEvents() {
  els.weightKg.addEventListener("change", () => {
    state.patient.weightKg = numOrNull(els.weightKg.value);
    persist();
  });

  els.ebvPreset.addEventListener("change", () => {
    state.patient.ebvPresetId = els.ebvPreset.value;
    persist();
  });

  els.ebvOverride.addEventListener("change", () => {
    const v = numOrNull(els.ebvOverride.value);
    state.patient.ebvOverrideMlPerKg = v;
    persist();
  });

  els.contextFlags.addEventListener("change", () => {
    state.patient.contextFlags = selectedMultiValues(els.contextFlags);
    persist();
  });

  els.btnAddDay.addEventListener("click", () => {
    addDay();
    persist();
  });

  // State tools
  els.btnExportState.addEventListener("click", () => {
    els.jsonBox.value = exportStateJSON(state);
    els.jsonStatus.textContent = "Patient+days JSON exported to box.";
  });

  els.btnImportState.addEventListener("click", () => {
    try {
      const imported = importStateJSON(els.jsonBox.value);
      state = imported;
      hydratePatientInputs();
      persist(false);
      els.jsonStatus.textContent = "Imported patient+days JSON.";
    } catch (e) {
      els.jsonStatus.textContent = `Import failed: ${e.message}`;
    }
  });

  els.btnResetState.addEventListener("click", () => {
    resetState();
    state = defaultState(cfg);
    hydratePatientInputs();
    persist(false);
    els.jsonStatus.textContent = "State reset.";
  });

  // Config tools
  els.btnExportConfig.addEventListener("click", () => {
    els.jsonBox.value = exportConfigJSON();
    els.jsonStatus.textContent = "Config JSON exported to box.";
  });

  els.btnImportConfig.addEventListener("click", () => {
    try {
      importConfigJSON(els.jsonBox.value);
      cfg = getEffectiveConfig();
      setInstitutionLine(els.institutionLine, cfg);
      fillEBVPresets(els.ebvPreset, cfg.ebvPresets);
      // Keep current state but re-render with new config
      if (!state.patient.ebvPresetId) state.patient.ebvPresetId = cfg.ebvPresets?.[0]?.id || "adult";
      hydratePatientInputs();
      persist(false);
      els.jsonStatus.textContent = "Config imported and applied.";
    } catch (e) {
      els.jsonStatus.textContent = `Config import failed: ${e.message}`;
    }
  });

  els.btnResetConfig.addEventListener("click", () => {
    resetConfigToDefaults();
    cfg = getEffectiveConfig();
    setInstitutionLine(els.institutionLine, cfg);
    fillEBVPresets(els.ebvPreset, cfg.ebvPresets);
    hydratePatientInputs();
    persist(false);
    els.jsonStatus.textContent = "Config reset to defaults.";
  });

  els.btnCopyJson.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(els.jsonBox.value || "");
      els.jsonStatus.textContent = "Copied to clipboard.";
    } catch {
      els.jsonStatus.textContent = "Copy failed (clipboard not available).";
    }
  });
}

function persist(reRender = true) {
  saveState(state);
  if (reRender) recalcAndRender();
}

function addDay() {
  const nextHd = (state.days?.length || 0) + 1;
  const lastDate = state.days?.[state.days.length - 1]?.dateISO || todayISO();
  const nextDate = addDaysISO(lastDate, 1);
  state.days.push({ hd: nextHd, dateISO: nextDate, orderables: [], lineWasteMl: 0 });
}

function recalcAndRender() {
  // Compute EBV
  const weightKg = Number(state.patient.weightKg) || 0;
  const preset = cfg.ebvPresets.find(p => p.id === state.patient.ebvPresetId) || cfg.ebvPresets[0];
  const mlPerKg = Number(state.patient.ebvOverrideMlPerKg) || Number(preset?.mlPerKg) || 0;
  const ebvMl = calcEBVml(weightKg, mlPerKg);

  // Compute each day
  const dayRows = [];
  let cumulativeMl = 0;

  for (const day of state.days) {
    const tubeEntries = expandOrderablesToTubeEntries(day.orderables || [], cfg);
    const tubeLoss = calcDailyLossMl(tubeEntries, cfg.tubes);
    const waste = Number(day.lineWasteMl) || 0;
    const dailyMl = round1(tubeLoss + waste);
    cumulativeMl = round1(cumulativeMl + dailyMl);

    const mlPerKgDay = weightKg > 0 ? (dailyMl / weightKg) : 0;
    const pctEBV = pct(dailyMl, ebvMl);

    dayRows.push({
      dailyMl,
      mlPerKgDay,
      pctEBV
    });
  }

  const cumulativePctEBV = pct(cumulativeMl, ebvMl);

  // Render patient metrics
  renderPatientMetrics(els.patientMetrics, [
    { label: "EBV", value: ebvMl ? `${round1(ebvMl)} mL` : "—", sub: `${mlPerKg} mL/kg × ${weightKg || "—"} kg` },
    { label: "Cumulative phlebotomy + waste", value: `${round1(cumulativeMl)} mL`, sub: ebvMl ? `${round1(cumulativePctEBV)}% EBV` : "EBV not set" }
  ]);

  // Render days table
  renderDaysTable(els.daysTbody, {
    days: state.days,
    dayRows,
    cfg,
    handlers: {
      onSetDayDate: (idx, iso) => {
        state.days[idx].dateISO = iso;
        persist();
      },
      onToggleOrderable: (idx, ordId, checked) => {
        const set = new Set(state.days[idx].orderables || []);
        if (checked) set.add(ordId); else set.delete(ordId);
        state.days[idx].orderables = Array.from(set);
        persist();
      },
      onSetWaste: (idx, v) => {
        state.days[idx].lineWasteMl = Math.max(0, Number(v) || 0);
        persist();
      },
      onRemoveDay: (idx) => {
        state.days.splice(idx, 1);
        // Renumber HD sequentially
        state.days.forEach((d, i) => d.hd = i + 1);
        persist();
      }
    }
  });

  // Totals
  renderTotals(els.totals, [
    { label: "Total days", value: String(state.days.length), sub: "" },
    { label: "Cumulative loss", value: `${round1(cumulativeMl)} mL`, sub: ebvMl ? `${round1(cumulativePctEBV)}% EBV` : "EBV not set" }
  ]);

  // Warnings
  const warnings = computeWarnings({
    cfg,
    patient: state.patient,
    weightKg,
    ebvMl,
    dayRows,
    days: state.days,
    cumulativeMl,
    cumulativePctEBV
  });

  renderWarnings(els.warnings, warnings);
}

function computeWarnings(ctx) {
  const warnings = [];
  const { cfg, patient, weightKg, ebvMl, dayRows, days, cumulativePctEBV } = ctx;

  const pedsLike = ["preterm","term","infant","child"].includes(patient.ebvPresetId);
  const pedsThresh = Number(cfg.thresholds?.pedsDailyMlPerKgWarn) || 0;
  const adultDailyHi = Number(cfg.thresholds?.adultHighIntensityDailyMl) || 0;

  // Per-day warnings
  for (let i = 0; i < dayRows.length; i++) {
    const d = dayRows[i];
    const label = `HD ${days[i].hd}`;

    if (pedsLike && pedsThresh > 0 && d.mlPerKgDay > pedsThresh) {
      warnings.push({
        level: "alert-warn",
        text: `${label}: Daily phlebotomy ${d.mlPerKgDay.toFixed(2)} mL/kg/day exceeds threshold (${pedsThresh} mL/kg/day).`
      });
    }

    if (!pedsLike && adultDailyHi > 0 && d.dailyMl > adultDailyHi) {
      warnings.push({
        level: "alert-warn",
        text: `${label}: Daily phlebotomy ${d.dailyMl.toFixed(1)} mL exceeds “high intensity” threshold (${adultDailyHi} mL/day).`
      });
    }
  }

  // Cumulative EBV warnings
  if (ebvMl > 0) {
    if (cumulativePctEBV >= 10) {
      warnings.push({ level: "alert-bad", text: `Cumulative loss ${cumulativePctEBV.toFixed(1)}% of EBV (≥10%).` });
    } else if (cumulativePctEBV >= 5) {
      warnings.push({ level: "alert-warn", text: `Cumulative loss ${cumulativePctEBV.toFixed(1)}% of EBV (≥5%).` });
    }
  } else if (weightKg <= 0) {
    warnings.push({ level: "alert-warn", text: "Enter weight to compute EBV-based risk metrics." });
  }

  return warnings;
}

function numOrNull(v) {
  const n = Number(v);
  return isFinite(n) && n > 0 ? n : null;
}
