# hanemia
---
# Phlebotomy Loss Tracker (Static GitHub Pages)

A **zero-backend** web app that estimates **diagnostic blood loss** by hospital day using a configurable mapping of **orderables (CBC/CMP/Fe panel/etc.) → tubes → default draw volumes**, plus optional **line waste**. Built to run as a **static site on GitHub Pages** with **localStorage** persistence (no database).

> **Clinical note:** This is **decision-support**. It estimates blood removed for lab testing based on configurable assumptions. It does **not** diagnose anemia, does **not** account for all blood losses (bleeding/procedures/hemolysis/dilution), and should be interpreted in clinical context.

---

## Features

- **Hospital Day (HD) table**
  - Add/remove hospital days
  - Per-day date (calendar input) with compact display (e.g., `13JAN`)
- **Clickable panels / orderables**
  - Select CBC/CMP/Fe panel/etc. per HD (clinician-friendly)
  - App automatically expands orderables into tube requirements using config
- **Real-time calculations**
  - Daily loss (mL)
  - Daily mL/kg/day
  - Daily % of estimated blood volume (EBV)
  - Cumulative totals across the admission
- **Warnings (configurable thresholds)**
  - Pediatric policy-style warning (default `3.0 mL/kg/day`)
  - “High intensity” adult daily draw heuristic (default `30 mL/day`)
  - Cumulative %EBV warnings (default bands at 5% and 10%)
- **Config overlay (no database)**
  - Ships with complete defaults (`src/config.defaults.js`)
  - Editable config stored in localStorage
  - Export/import config JSON for sharing across clinicians/services
  - Reset config to defaults
- **State persistence**
  - Patient + days saved to localStorage
  - Export/import state JSON
  - Reset state

---

## How it works

### Conceptual model
1. Clinician selects **orderables** per day (e.g., “CMP”).
2. Each orderable maps to **tube requirements** (e.g., 1 × SST).
3. Each tube has a **default draw volume** (mL).
4. Daily diagnostic loss = sum(tube volumes × counts) + optional line waste.
5. EBV is estimated from weight and an age-group preset (mL/kg), with optional override.
6. App displays daily and cumulative blood loss in mL, mL/kg/day, and %EBV.

### No backend
Everything runs in the browser. Persistence uses `localStorage`.

- Config key: `phleb_config_v1`
- Patient+days key: `phleb_state_v1`

---

## Repository structure

```text
phlebotomy-tracker/
  index.html
  README.md
  assets/
    styles.css
  src/
    app.js              # boot + event wiring + state render loop
    ui.js               # DOM rendering helpers
    calc.js             # EBV and mL computations
    expand.js           # orderables → tube entries
    dates.js            # ISO date + DDMMM formatting (e.g., 13JAN)
    storage.js          # localStorage for patient+days
    config.defaults.js  # shipped defaults (orderables/tubes/EBV presets)
    config.store.js     # localStorage overlay + migration

```
⸻

Quick start (local)

Option A: Open directly

You can open index.html directly in a browser.
Some browsers restrict module imports for file:// URLs; if you see errors, use Option B.

Option B: Run a tiny local server
```bash
python3 -m http.server 8000
```
Open:
http://localhost:8000


⸻

Deploy to GitHub Pages
	1.	Create a GitHub repo (e.g., phlebotomy-tracker)
	2.	Add the project files at the repo root
	3.	In GitHub:
	•	Settings → Pages
	•	Build and deployment
	•	Source: Deploy from a branch
	•	Branch: main (or master)
	•	Folder: / (root)
	4.	Save. GitHub Pages will publish the site.

⸻

Using the app

Patient section
	•	Weight (kg): required for EBV-based metrics
	•	EBV preset: choose age group (mL/kg)
	•	EBV override (mL/kg): optional; if provided, override preset
	•	Context flags: currently informational scaffolding (future risk scoring can use these)

The app computes:
	•	EBV (mL) = weight × (mL/kg)

Hospital Day table

For each HD:
	•	Set date (optional but recommended)
	•	Click panels/orderables for that day
	•	Enter optional Waste (mL) (line waste, discard, etc.)
	•	The app computes:
	•	Daily mL
	•	Daily mL/kg/day
	•	Daily %EBV

Add/remove days with buttons. Removing a day renumbers HD sequentially.

Totals + warnings

Below the table:
	•	Cumulative loss (mL) and %EBV
	•	Warnings based on thresholds in config

⸻

Configuration system (defaults + localStorage overlay)

Why this exists

Tube sizes and orderable→tube mapping vary by institution. Clinicians should not need to know tubes to use the app, so the shipped config provides a working default mapping. Institutions can then:
	•	adjust tube volumes,
	•	adjust panel mappings,
	•	and share their config JSON with colleagues.

What’s in the config

DEFAULT_CONFIG includes:
	•	ebvPresets[] (mL/kg)
	•	tubes[] (tubeId → default draw volume mL)
	•	orderables[] (orderableId → tube requirements)
	•	bundles[] (optional multi-order shortcuts)
	•	thresholds (warning heuristics)
	•	ui (category ordering)

Overlay behavior

The app loads:
	•	localStorage config if present, else shipped defaults
	•	if schema version changes in the future, migration can keep user edits

Export / import config

Use the Config card:
	•	Export config → writes the config JSON to the text box
	•	Import config → reads JSON from the text box and stores it in localStorage
	•	Reset config → replaces localStorage config with shipped defaults

Common workflow for institutions
	1.	One clinician edits config (future settings page) or imports a curated JSON.
	2.	They export that JSON.
	3.	Others import the same JSON.

⸻

Export / import patient+days (state)

Use the top header buttons:
	•	Export: writes patient+days JSON to the text box
	•	Import: reads JSON from the text box and loads it
	•	Reset: clears patient+days and starts a new admission

⸻

Safety & limitations
	•	Estimates diagnostic phlebotomy only.
	•	Does not include bleeding, procedures, hemolysis, dilution, transfusions, or fluid shifts.
	•	Tube volumes and mappings are assumptions; validate locally.
	•	Not a medical device; do not use as sole basis for clinical decisions.

---

## License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.

- You may use, modify, and redistribute this software under the terms of the AGPL-3.0.
- If you run a modified version of this software and make it available for use over a network (e.g., a hosted web app), you must also make the complete corresponding source code of your modified version available under the same license.

See `LICENSE` for the full text.


