// src/config.defaults.js
// Default configuration shipped with the app (works out-of-the-box on GitHub Pages).
// Design goals:
// 1) Clinicians click orderables (CMP, Fe panel, etc.) — NOT tubes.
// 2) The app expands orderables -> tube requirements using this mapping.
// 3) Later: a Settings page can edit this same schema and persist to localStorage.
//
// IMPORTANT:
// - Tube sizes/volumes and panel->tube mappings vary by institution.
// - These defaults are a reasonable "generic US inpatient" starting point.
// - The app should allow later editing + export/import of this config.

export const DEFAULT_CONFIG = {
  schemaVersion: 1,

  institution: {
    name: "Generic US Inpatient Defaults",
    notes:
      "Defaults are generic. Tube sizes and panel-to-tube mapping vary by lab and supply chain. Edit in Settings when available."
  },

  // Estimated Blood Volume (EBV) presets (mL/kg). Allow override in patient header.
  ebvPresets: [
    { id: "preterm", label: "Preterm neonate", mlPerKg: 95 },
    { id: "term", label: "Term neonate", mlPerKg: 85 },
    { id: "infant", label: "Infant", mlPerKg: 75 },
    { id: "child", label: "Child", mlPerKg: 72 },
    { id: "adult", label: "Adult", mlPerKg: 70 }
  ],

  // Tube catalog: default draw volumes (mL) used for estimation.
  // Keep IDs stable; Settings editor can modify ml values and labels later.
  tubes: [
    // Adult-ish common vacutainer sizes
    { id: "sst_3_5", label: "Gold top (SST) 3.5 mL", ml: 3.5, family: "Serum" },
    { id: "sst_5", label: "Gold top (SST) 5 mL", ml: 5.0, family: "Serum" },
    { id: "red_5", label: "Red top (serum) 5 mL", ml: 5.0, family: "Serum" },

    { id: "green_3", label: "Green top (heparin) 3 mL", ml: 3.0, family: "Plasma" },
    { id: "green_5", label: "Green top (heparin) 5 mL", ml: 5.0, family: "Plasma" },

    { id: "edta_3", label: "Purple top (EDTA) 3 mL", ml: 3.0, family: "Heme" },
    { id: "edta_4", label: "Purple top (EDTA) 4 mL", ml: 4.0, family: "Heme" },

    { id: "blue_2_7", label: "Light blue (citrate) 2.7 mL", ml: 2.7, family: "Coags" },
    { id: "blue_4_5", label: "Light blue (citrate) 4.5 mL", ml: 4.5, family: "Coags" },

    { id: "gray_2", label: "Gray top (fluoride/oxalate) 2 mL", ml: 2.0, family: "GlycolysisInhibitor" },

    { id: "pink_6", label: "Pink top (blood bank EDTA) 6 mL", ml: 6.0, family: "BloodBank" },
    { id: "pink_4", label: "Pink top (blood bank EDTA) 4 mL", ml: 4.0, family: "BloodBank" },

    // Blood culture bottles (volumes vary widely; keep configurable)
    { id: "bcx_aerobic", label: "Blood culture bottle (aerobic) 10 mL", ml: 10.0, family: "Culture" },
    { id: "bcx_anaerobic", label: "Blood culture bottle (anaerobic) 10 mL", ml: 10.0, family: "Culture" },
    { id: "bcx_peds", label: "Peds blood culture bottle 1 mL", ml: 1.0, family: "Culture" },

    // ABG/VBG syringes (draw volume estimate; configurable)
    { id: "abg_syringe_1", label: "ABG syringe 1 mL", ml: 1.0, family: "BloodGas" },
    { id: "vbg_syringe_1", label: "VBG syringe 1 mL", ml: 1.0, family: "BloodGas" },

    // Pediatric micro-collection (common approximations; editable)
    { id: "micro_0_6", label: "Microtainer 0.6 mL", ml: 0.6, family: "Micro" },
    { id: "peds_sst_1_1", label: "Peds SST 1.1 mL", ml: 1.1, family: "Serum" },
    { id: "peds_edta_0_5", label: "Peds EDTA 0.5 mL", ml: 0.5, family: "Heme" },
    { id: "peds_blue_1_8", label: "Peds citrate 1.8 mL", ml: 1.8, family: "Coags" },

    // Urine/etc are not blood loss; include for completeness if you want to log “labs ordered”
    // (Should not contribute to blood loss calculations.)
    { id: "urine_cup", label: "Urine specimen cup (0 mL blood)", ml: 0.0, family: "NonBlood" },
    { id: "swab", label: "Swab (0 mL blood)", ml: 0.0, family: "NonBlood" }
  ],

  // Orderables = what clinicians click.
  // requirements = list of tubes required for that orderable.
  //
  // Notes:
  // - Many chemistries can be serum (SST) or plasma (heparin) depending on lab. Defaults choose SST.
  // - For “add-on” or combined draws, users should still only click orderables; the app will sum tubes.
  // - If your institution uses different tube sizes (e.g., SST 4 mL), edit tubes[].ml + labels in Settings later.
  orderables: [
    // ---------- Core daily labs ----------
    { id: "cbc", label: "CBC", category: "Hematology", requirements: [{ tubeId: "edta_3", count: 1 }] },
    { id: "cbc_diff", label: "CBC w/ diff", category: "Hematology", requirements: [{ tubeId: "edta_3", count: 1 }] },
    { id: "retic", label: "Reticulocyte count", category: "Hematology", requirements: [{ tubeId: "edta_3", count: 1 }] },

    { id: "bmp", label: "BMP", category: "Chemistry", requirements: [{ tubeId: "sst_3_5", count: 1 }] },
    { id: "cmp", label: "CMP", category: "Chemistry", requirements: [{ tubeId: "sst_3_5", count: 1 }] },
    { id: "renal", label: "Renal function panel", category: "Chemistry", requirements: [{ tubeId: "sst_3_5", count: 1 }] },
    { id: "hepatic", label: "Hepatic function panel", category: "Chemistry", requirements: [{ tubeId: "sst_3_5", count: 1 }] },

    { id: "mg", label: "Magnesium", category: "Chemistry", requirements: [{ tubeId: "sst_3_5", count: 1 }] },
    { id: "phos", label: "Phosphorus", category: "Chemistry", requirements: [{ tubeId: "sst_3_5", count: 1 }] },

    // ---------- Coagulation ----------
    { id: "ptinr", label: "PT/INR", category: "Coagulation", requirements: [{ tubeId: "blue_2_7", count: 1 }] },
    { id: "ptt", label: "aPTT", category: "Coagulation", requirements: [{ tubeId: "blue_2_7", count: 1 }] },
    { id: "ptinr_ptt", label: "PT/INR + aPTT", category: "Coagulation", requirements: [{ tubeId: "blue_2_7", count: 1 }] },
    { id: "fibrinogen", label: "Fibrinogen", category: "Coagulation", requirements: [{ tubeId: "blue_2_7", count: 1 }] },
    { id: "ddimer", label: "D-dimer", category: "Coagulation", requirements: [{ tubeId: "blue_2_7", count: 1 }] },

    // ---------- Inflammation ----------
    { id: "crp", label: "CRP", category: "Inflammation", requirements: [{ tubeId: "sst_3_5", count: 1 }] },
    { id: "esr", label: "ESR", category: "Inflammation", requirements: [{ tubeId: "edta_3", count: 1 }] },
    { id: "procal", label: "Procalcitonin", category: "Inflammation", requirements: [{ tubeId: "sst_3_5", count: 1 }] },

    // ---------- Endocrine / metabolic ----------
    { id: "tsh", label: "TSH", category: "Endocrine", requirements: [{ tubeId: "sst_3_5", count: 1 }] },
    { id: "ft4", label: "Free T4", category: "Endocrine", requirements: [{ tubeId: "sst_3_5", count: 1 }] },
    { id: "tsh_ft4", label: "TSH + Free T4", category: "Endocrine", requirements: [{ tubeId: "sst_3_5", count: 1 }] },

    { id: "a1c", label: "Hemoglobin A1c", category: "Endocrine", requirements: [{ tubeId: "edta_3", count: 1 }] },
    { id: "beta_hydroxy", label: "Beta-hydroxybutyrate", category: "Endocrine", requirements: [{ tubeId: "sst_3_5", count: 1 }] },

    // Glucose variants
    { id: "glucose_serum", label: "Glucose (serum)", category: "Chemistry", requirements: [{ tubeId: "sst_3_5", count: 1 }] },
    { id: "glucose_poc", label: "Glucose (POC, no blood loss logged)", category: "Chemistry", requirements: [] },

    // ---------- Cardiac ----------
    { id: "troponin", label: "Troponin", category: "Cardiac", requirements: [{ tubeId: "sst_3_5", count: 1 }] },
    { id: "bnp", label: "BNP / NT-proBNP", category: "Cardiac", requirements: [{ tubeId: "sst_3_5", count: 1 }] },

    // ---------- Lipids ----------
    { id: "lipid", label: "Lipid panel", category: "Chemistry", requirements: [{ tubeId: "sst_3_5", count: 1 }] },

    // ---------- Anemia / iron / nutrition ----------
    { id: "iron_panel", label: "Fe panel (Iron/TIBC/%Sat)", category: "Anemia", requirements: [{ tubeId: "sst_3_5", count: 1 }] },
    { id: "ferritin", label: "Ferritin", category: "Anemia", requirements: [{ tubeId: "sst_3_5", count: 1 }] },
    { id: "b12", label: "Vitamin B12", category: "Nutrition", requirements: [{ tubeId: "sst_3_5", count: 1 }] },
    { id: "folate", label: "Folate", category: "Nutrition", requirements: [{ tubeId: "sst_3_5", count: 1 }] },
    { id: "vitd", label: "25-OH Vitamin D", category: "Nutrition", requirements: [{ tubeId: "sst_3_5", count: 1 }] },

    // ---------- Hemolysis / heme ----------
    { id: "ldh", label: "LDH", category: "Hematology", requirements: [{ tubeId: "sst_3_5", count: 1 }] },
    { id: "haptoglobin", label: "Haptoglobin", category: "Hematology", requirements: [{ tubeId: "sst_3_5", count: 1 }] },
    { id: "bilirubin_total", label: "Bilirubin total", category: "Chemistry", requirements: [{ tubeId: "sst_3_5", count: 1 }] },
    { id: "bilirubin_direct", label: "Bilirubin direct", category: "Chemistry", requirements: [{ tubeId: "sst_3_5", count: 1 }] },

    // ---------- Therapeutic drug levels (common) ----------
    { id: "vanc_trough", label: "Vancomycin level (trough/random)", category: "DrugLevels", requirements: [{ tubeId: "sst_3_5", count: 1 }] },
    { id: "gent_level", label: "Gentamicin level", category: "DrugLevels", requirements: [{ tubeId: "sst_3_5", count: 1 }] },
    { id: "tobra_level", label: "Tobramycin level", category: "DrugLevels", requirements: [{ tubeId: "sst_3_5", count: 1 }] },
    { id: "phenytoin", label: "Phenytoin level", category: "DrugLevels", requirements: [{ tubeId: "sst_3_5", count: 1 }] },
    { id: "valproate", label: "Valproate level", category: "DrugLevels", requirements: [{ tubeId: "sst_3_5", count: 1 }] },
    { id: "carbamazepine", label: "Carbamazepine level", category: "DrugLevels", requirements: [{ tubeId: "sst_3_5", count: 1 }] },
    { id: "tacrolimus", label: "Tacrolimus level", category: "DrugLevels", requirements: [{ tubeId: "edta_3", count: 1 }] },

    // ---------- Blood gas / lactate ----------
    { id: "abg", label: "ABG", category: "BloodGas", requirements: [{ tubeId: "abg_syringe_1", count: 1 }] },
    { id: "vbg", label: "VBG", category: "BloodGas", requirements: [{ tubeId: "vbg_syringe_1", count: 1 }] },
    { id: "lactate", label: "Lactate (gray top)", category: "BloodGas", requirements: [{ tubeId: "gray_2", count: 1 }] },

    // ---------- Micro (blood loss relevant only for blood cultures) ----------
    { id: "blood_cx_set", label: "Blood cultures (set: aerobic + anaerobic)", category: "Microbiology",
      requirements: [{ tubeId: "bcx_aerobic", count: 1 }, { tubeId: "bcx_anaerobic", count: 1 }] },
    { id: "blood_cx_single", label: "Blood culture (single bottle)", category: "Microbiology",
      requirements: [{ tubeId: "bcx_aerobic", count: 1 }] },
    { id: "blood_cx_peds", label: "Blood culture (peds bottle)", category: "Microbiology",
      requirements: [{ tubeId: "bcx_peds", count: 1 }] },

    { id: "urine_cx", label: "Urine culture (no blood loss)", category: "Microbiology", requirements: [{ tubeId: "urine_cup", count: 1 }] },
    { id: "rpp", label: "Respiratory pathogen panel (swab, no blood loss)", category: "Microbiology", requirements: [{ tubeId: "swab", count: 1 }] },

    // ---------- Blood bank ----------
    { id: "type_screen", label: "Type & screen", category: "BloodBank", requirements: [{ tubeId: "pink_6", count: 1 }] },
    { id: "type_cross", label: "Type & crossmatch", category: "BloodBank", requirements: [{ tubeId: "pink_6", count: 1 }] },

    // ---------- Autoimmune / rheum (examples) ----------
    { id: "ana", label: "ANA", category: "Rheumatology", requirements: [{ tubeId: "sst_3_5", count: 1 }] },
    { id: "rf", label: "Rheumatoid factor", category: "Rheumatology", requirements: [{ tubeId: "sst_3_5", count: 1 }] },
    { id: "ccp", label: "Anti-CCP", category: "Rheumatology", requirements: [{ tubeId: "sst_3_5", count: 1 }] },
    { id: "c3_c4", label: "Complement C3/C4", category: "Rheumatology", requirements: [{ tubeId: "sst_3_5", count: 1 }] },

    // ---------- Pediatrics “micro” alternatives (optional clicks) ----------
    // These let you run the app in a peds mode even before you add a formal toggle.
    { id: "cbc_micro", label: "CBC (micro)", category: "Hematology", requirements: [{ tubeId: "peds_edta_0_5", count: 1 }] },
    { id: "cmp_peds_sst", label: "CMP (peds SST)", category: "Chemistry", requirements: [{ tubeId: "peds_sst_1_1", count: 1 }] },
    { id: "coags_peds", label: "PT/INR + aPTT (peds citrate)", category: "Coagulation", requirements: [{ tubeId: "peds_blue_1_8", count: 1 }] }
  ],

  // Optional convenience bundles clinicians can click (adds multiple orderables at once).
  // These are editable later and reduce clicking.
  bundles: [
    { id: "daily_am_basic", label: "Daily AM labs (CBC + BMP)", includes: ["cbc", "bmp"] },
    { id: "daily_am_full", label: "Daily AM labs (CBC + CMP)", includes: ["cbc", "cmp"] },
    { id: "sepsis_eval", label: "Sepsis eval (CBC + CMP + CRP + Procal + Blood cx set + Lactate)", includes: ["cbc", "cmp", "crp", "procal", "blood_cx_set", "lactate"] },
    { id: "anemia_workup", label: "Anemia workup (CBC + Retic + Fe panel + Ferritin + B12 + Folate)", includes: ["cbc", "retic", "iron_panel", "ferritin", "b12", "folate"] }
  ],

  // Thresholds used for warnings / risk scoring (editable later).
  thresholds: {
    // Typical policy-style pediatric warning (toggleable in UI later).
    pedsDailyMlPerKgWarn: 3.0,

    // “High intensity phlebotomy” flag (not a guideline; a heuristic threshold).
    adultHighIntensityDailyMl: 30.0
  },

  // Optional: groups used for UI filtering (purely cosmetic)
  ui: {
    defaultOrderableCategoryOrder: [
      "Hematology",
      "Chemistry",
      "Coagulation",
      "Inflammation",
      "Endocrine",
      "Cardiac",
      "DrugLevels",
      "BloodGas",
      "Microbiology",
      "BloodBank",
      "Rheumatology",
      "Nutrition"
    ]
  }
};
