import { getEffectiveConfig, saveConfig, exportConfigJSON, importConfigJSON, resetConfigToDefaults } from "./config.store.js";

const els = {
  tubesTbody: document.getElementById("tubesTbody"),
  ordTbody: document.getElementById("ordTbody"),
  jsonBox: document.getElementById("jsonBox"),
  status: document.getElementById("status"),

  btnSave: document.getElementById("btnSave"),
  btnExport: document.getElementById("btnExport"),
  btnImport: document.getElementById("btnImport"),
  btnReset: document.getElementById("btnReset"),
  btnCopy: document.getElementById("btnCopy")
};

let cfg = structuredClone(getEffectiveConfig());
renderAll();

els.btnSave.addEventListener("click", () => {
  saveConfig(cfg);
  els.status.textContent = "Saved to localStorage.";
});

els.btnExport.addEventListener("click", () => {
  els.jsonBox.value = exportConfigJSON();
  els.status.textContent = "Exported config JSON.";
});

els.btnImport.addEventListener("click", () => {
  try {
    importConfigJSON(els.jsonBox.value);
    cfg = structuredClone(getEffectiveConfig());
    renderAll();
    els.status.textContent = "Imported config JSON.";
  } catch (e) {
    els.status.textContent = `Import failed: ${e.message}`;
  }
});

els.btnReset.addEventListener("click", () => {
  resetConfigToDefaults();
  cfg = structuredClone(getEffectiveConfig());
  renderAll();
  els.status.textContent = "Reset to defaults.";
});

els.btnCopy.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(els.jsonBox.value || "");
    els.status.textContent = "Copied.";
  } catch {
    els.status.textContent = "Copy failed.";
  }
});

function renderAll() {
  renderTubes();
  renderOrderables();
  els.jsonBox.value = JSON.stringify(cfg, null, 2);
}

function renderTubes() {
  els.tubesTbody.innerHTML = "";
  for (const t of cfg.tubes) {
    const tr = document.createElement("tr");

    tr.appendChild(td(t.id));
    tr.appendChild(td(t.label));

    const tdMl = document.createElement("td");
    const inp = document.createElement("input");
    inp.type = "number";
    inp.step = "0.1";
    inp.min = "0";
    inp.value = String(t.ml ?? 0);
    inp.addEventListener("change", () => {
      t.ml = Math.max(0, Number(inp.value) || 0);
      els.jsonBox.value = JSON.stringify(cfg, null, 2);
    });
    tdMl.appendChild(inp);
    tr.appendChild(tdMl);

    tr.appendChild(td(t.family || ""));

    els.tubesTbody.appendChild(tr);
  }
}

function renderOrderables() {
  els.ordTbody.innerHTML = "";
  for (const o of cfg.orderables) {
    const tr = document.createElement("tr");
    tr.appendChild(td(o.id));
    tr.appendChild(td(o.label));
    tr.appendChild(td(o.category || ""));

    const req = (o.requirements || []).map(r => `${r.tubeId}×${r.count}`).join(", ");
    tr.appendChild(td(req));

    els.ordTbody.appendChild(tr);
  }
}

function td(text) {
  const td = document.createElement("td");
  td.textContent = text;
  return td;
}
