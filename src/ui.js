import { formatDDMMM } from "./dates.js";

export function setInstitutionLine(el, cfg) {
  el.textContent = `${cfg.institution?.name || "Config"} — schema v${cfg.schemaVersion}`;
}

export function fillEBVPresets(selectEl, presets) {
  selectEl.innerHTML = "";
  for (const p of presets) {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = `${p.label} (${p.mlPerKg} mL/kg)`;
    selectEl.appendChild(opt);
  }
}

export function selectedMultiValues(selectEl) {
  return Array.from(selectEl.selectedOptions).map(o => o.value);
}

export function setMultiSelected(selectEl, values) {
  const set = new Set(values || []);
  for (const opt of selectEl.options) opt.selected = set.has(opt.value);
}

export function renderPatientMetrics(el, metrics) {
  el.innerHTML = "";
  for (const m of metrics) el.appendChild(metricRow(m.label, m.value, m.sub));
}

export function renderTotals(el, totals) {
  el.innerHTML = "";
  for (const t of totals) el.appendChild(metricRow(t.label, t.value, t.sub));
}

export function renderWarnings(el, warnings) {
  el.innerHTML = "";
  if (!warnings.length) {
    el.appendChild(alertBox("alert-good", "No warnings triggered by current thresholds."));
    return;
  }
  for (const w of warnings) el.appendChild(alertBox(w.level, w.text));
}

export function renderDaysTable(tbody, model) {
  const { days, dayRows, cfg, handlers } = model;
  tbody.innerHTML = "";

  for (let i = 0; i < days.length; i++) {
    const day = days[i];
    const row = dayRows[i];
    const tr = document.createElement("tr");

    tr.appendChild(tdText(String(day.hd)));

    // Date input + 13JAN label
    const tdDate = document.createElement("td");
    const dateWrap = document.createElement("div");
    dateWrap.style.display = "grid";
    dateWrap.style.gap = "6px";

    const dateInput = document.createElement("input");
    dateInput.type = "date";
    dateInput.value = day.dateISO || "";
    dateInput.addEventListener("change", () => handlers.onSetDayDate(i, dateInput.value));

    const dateLabel = document.createElement("div");
    dateLabel.className = "subtle";
    dateLabel.textContent = day.dateISO ? formatDDMMM(day.dateISO) : "";

    dateWrap.appendChild(dateInput);
    dateWrap.appendChild(dateLabel);
    tdDate.appendChild(dateWrap);
    tr.appendChild(tdDate);

    // Panels: pills + button (no inline picker)
    const tdPanels = document.createElement("td");
    tdPanels.appendChild(renderSelectedPills(day.orderables || [], cfg));

    const btn = document.createElement("button");
    btn.className = "btn btn-primary";
    btn.textContent = "Edit panels";
    btn.addEventListener("click", () => handlers.onOpenPanelModal(i));
    tdPanels.appendChild(document.createElement("div")).style.height = "8px";
    tdPanels.appendChild(btn);
    tr.appendChild(tdPanels);

    // Waste
    const tdWaste = document.createElement("td");
    const wasteInput = document.createElement("input");
    wasteInput.type = "number";
    wasteInput.min = "0";
    wasteInput.step = "0.1";
    wasteInput.value = String(day.lineWasteMl ?? 0);
    wasteInput.addEventListener("change", () => handlers.onSetWaste(i, wasteInput.value));
    tdWaste.appendChild(wasteInput);
    tr.appendChild(tdWaste);

    tr.appendChild(tdText(row.dailyMl.toFixed(1)));
    tr.appendChild(tdText(row.mlPerKgDay.toFixed(2)));
    tr.appendChild(tdText(row.pctEBV.toFixed(2)));

    // Remove
    const tdRm = document.createElement("td");
    const rmBtn = document.createElement("button");
    rmBtn.className = "btn btn-danger";
    rmBtn.textContent = "Remove";
    rmBtn.addEventListener("click", () => handlers.onRemoveDay(i));
    tdRm.appendChild(rmBtn);
    tr.appendChild(tdRm);

    tbody.appendChild(tr);
  }
}

/* ---------- Modal content renderer ---------- */
export function renderPanelModal(bodyEl, cfg, selectedIds, onToggle) {
  bodyEl.innerHTML = "";
  const orderablesByCategory = groupOrderables(cfg);
  const catOrder = cfg.ui?.defaultOrderableCategoryOrder || Object.keys(orderablesByCategory);

  const picker = document.createElement("div");
  picker.className = "panel-picker";

  for (const cat of catOrder) {
    const items = orderablesByCategory[cat];
    if (!items || !items.length) continue;

    const box = document.createElement("div");
    box.className = "cat";

    const h = document.createElement("h3");
    h.textContent = cat;
    box.appendChild(h);

    for (const ord of items) {
      const wrap = document.createElement("div");
      wrap.className = "check";

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = selectedIds.includes(ord.id);
      cb.addEventListener("change", () => onToggle(ord.id, cb.checked));

      const lab = document.createElement("label");
      lab.textContent = ord.label;

      wrap.appendChild(cb);
      wrap.appendChild(lab);
      box.appendChild(wrap);
    }

    picker.appendChild(box);
  }

  bodyEl.appendChild(picker);
}

/* ---------- Helpers ---------- */
function tdText(text) {
  const td = document.createElement("td");
  td.textContent = text;
  return td;
}

function renderSelectedPills(selectedIds, cfg) {
  const div = document.createElement("div");
  div.className = "pills";
  const map = new Map(cfg.orderables.map(o => [o.id, o.label]));

  if (!selectedIds || !selectedIds.length) {
    const p = document.createElement("span");
    p.className = "pill pill-muted";
    p.textContent = "None selected";
    div.appendChild(p);
    return div;
  }

  for (const id of selectedIds) {
    const label = map.get(id) || id;
    const pill = document.createElement("span");
    pill.className = "pill";
    pill.textContent = label;
    div.appendChild(pill);
  }
  return div;
}

function groupOrderables(cfg) {
  const out = {};
  for (const o of cfg.orderables) {
    const cat = o.category || "Other";
    out[cat] ||= [];
    out[cat].push(o);
  }
  for (const k of Object.keys(out)) out[k].sort((a,b)=>a.label.localeCompare(b.label));
  return out;
}

function metricRow(label, value, sub) {
  const div = document.createElement("div");
  div.className = "metric";
  const left = document.createElement("b");
  left.textContent = label;
  const right = document.createElement("div");
  right.innerHTML = `<div>${escapeHtml(value)}</div>${sub ? `<div class="subtle">${escapeHtml(sub)}</div>` : ""}`;
  div.appendChild(left);
  div.appendChild(right);
  return div;
}

function alertBox(levelClass, text) {
  const div = document.createElement("div");
  div.className = `alert ${levelClass || ""}`;
  div.textContent = text;
  return div;
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
