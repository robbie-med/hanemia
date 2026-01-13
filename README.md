# hanemia
# Phlebotomy Loss Tracker

A zero-backend web app that estimates diagnostic blood loss by hospital day based on:
- Orderables (CBC/CMP/Fe panel/etc.)
- Orderable → tube mapping (configurable)
- Tube draw volumes (configurable)
- Optional line waste (mL)

## Run locally
Open `index.html` directly, or run a simple server:

```bash
python3 -m http.server 8000
```
Then open:
http://localhost:8000

Deploy on GitHub Pages
	1.	Create a repo
	2.	Add these files
	3.	Settings → Pages → Deploy from branch → root

Data model
	•	Config: stored in localStorage key phleb_config_v1 (defaults ship in src/config.defaults.js)
	•	Patient+days: stored in localStorage key phleb_state_v1

Disclaimer

Decision-support estimates only. Not a diagnostic device.

---
