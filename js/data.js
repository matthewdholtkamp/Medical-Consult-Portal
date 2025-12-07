// Site Content Data used for Search and Directory
export const siteContent = [
    {
        id: "cardiology",
        title: "Cardiology Consultant",
        type: "consult",
        desc: "Decision support for ACS, Heart Failure, Arrhythmias.",
        tags: "sick call, medic, notes",
        color: "red",
        icon: "heart_broken",
        prompts: {
            questions: `You are an expert Board-Certified Cardiologist. Review the intake data AND ANY ATTACHED IMAGES (e.g., ECG tracing, Echo report, Device interrogation). If an ECG image is provided, interpret the rhythm, ST changes, and intervals FIRST. Generate 5-7 targeted, high-level cardiology questions to refine the differential (ACS, HF, Arrhythmia, Valvular). Focus on risk stratification and determining "sick vs not sick". Return strictly JSON: { "questions": ["Question 1", "Question 2"...] }`,
            plan: `You are a Board-Certified Cardiology Consultant. Generate a SOAP note and Plan based on the text data and VISUAL FINDINGS (if images provided). CRITICAL: If Inpatient, order IV meds/telemetry. If Outpatient, focus on oral meds. Dispo must match stability. Review strict vitals. OUTPUT JSON SCHEMA: { "subjective": { "hpi_paragraph": "", "ros_bullets": [] }, "assessment": { "synthesis_statement": "Include interpretation of any images (ECG/Echo) here.", "ddx": [] }, "plan": { "disposition": "", "workup": [], "treatment": [], "profile": { "days": 0, "limitations": [], "instructions": [] } }, "references": [] }`
        },
        example: {
            location: "Inpatient",
            cc: "68M admitted last night for ADHF. Now complaining of increasing SOB while lying flat and palpitations.",
            vitals: "BP 105/70, HR 115 Irreg (AFib?), RR 24, 89% RA -> 94% 2L NC",
            pe: "Bibasilar crackles 1/2 way up fields. +3 pitting edema BL LE. JVD to mandible.",
            meds: "Metoprolol 25, Lisinopril 10. Lasix 20mg IV x1 given 4h ago.",
            labs: "Cr 1.4 (base 1.0), K 4.2, BNP 1200.",
            pmh: "HFpEF, HTN, Hx AFib (not anticoagulated recently)."
        }
    },
    {
        id: "im",
        title: "Internal Medicine",
        type: "consult",
        desc: "Hospitalist logic for Sepsis, Pneumonia, Metabolic cases.",
        tags: "sick call, medic, notes",
        color: "indigo",
        icon: "stethoscope",
        prompts: {
            questions: `You are an expert Board-Certified Internal Medicine Physician (Hospitalist). Review the intake data AND ANY ATTACHED IMAGES (X-rays, wounds, rashes). Generate 5-7 targeted questions to refine the differential. Focus on "Sick vs Not Sick", qSOFA, and admission criteria. Return strictly JSON: { "questions": ["Question 1", "Question 2"...] }`,
            plan: `You are a Board-Certified Hospitalist. Generate a SOAP note based on text and VISUAL DATA (if images provided). If Inpatient/ER, use IV ABX/Fluids. If Clinic, oral only. Dispo 'Transfer' if unstable. OUTPUT JSON SCHEMA: { "subjective": { "hpi_paragraph": "", "ros_bullets": [] }, "assessment": { "synthesis_statement": "Include interpretation of any images here.", "ddx": [] }, "plan": { "disposition": "", "workup": [], "treatment": [], "profile": { "days": 0, "limitations": [], "instructions": [] } }, "references": [] }`
        },
        example: {
            location: "ER",
            cc: "76F admitted for AMS, fever (102.5), and productive cough. O2 sats dropped to 88% on RA.",
            vitals: "T 102.5, HR 115, BP 92/58, RR 24, O2 91% on 4L NC",
            pe: "Ill-appearing, oriented x1. Crackles RLL. Tachycardic. Abd soft.",
            meds: "Metformin, Atorvastatin. 1L NS given in ER.",
            labs: "WBC 18.2, Lactate 3.4, Cr 1.8. CXR: RLL Consolidation.",
            pmh: "DM2, HTN, CKD Stage 3, hx of UTI."
        }
    },
    {
        id: "adtmc",
        title: "ADTMC / Sick Call",
        type: "consult",
        desc: "General sick call services and note generation.",
        tags: "sick call, medic, notes",
        color: "green",
        icon: "medical_services",
        // Fallback generic prompts if needed, or specific ones
        prompts: {
            questions: `You are a Military Medical Officer.Review the sick call intake.Generate 3 - 5 simple questions to rule out red flags.Return JSON: { "questions": [...] } `,
            plan: `You are a Military Medical Officer.Generate a Sick Call SOAP note.Focus on Return to Duty vs Quarters.OUTPUT JSON SCHEMA compatible with above.`
        },
        example: {
            location: "BAS",
            cc: "22M active duty c/o sore throat and fever x2 days.",
            vitals: "T 101.2, HR 90, BP 120/80",
            pe: "Erythematous pharynx, +exudates, no LAD.",
            meds: "None",
            labs: "Strep positive",
            pmh: "None"
        }
    },
    { title: "ICU", type: "consult", desc: "Critical Care consults.", tags: "critical care, intensive, shock", action: "openFrame('ICU.html', 'ICU')", color: "purple" },
    { title: "Neurology", type: "consult", desc: "Brain + CNS consults.", tags: "neuro, stroke, seizure", action: "openFrame('neurology.html', 'Neurology')", color: "yellow" },
    { title: "Pediatrics", type: "consult", desc: "Infants + children.", tags: "peds, kids, baby", action: "openFrame('pediatrics.html', 'Pediatrics')", color: "pink" },
    { title: "Psychiatry", type: "consult", desc: "Mental health consults.", tags: "mental, psych, behavioral", action: "openFrame('psychiatry.html', 'Psychiatry')", color: "teal" },
    { title: "Orthopedics", type: "consult", desc: "Bone + joint consults.", tags: "ortho, surgery, fracture", action: "openFrame('orthopedic_surgery.html', 'Orthopedics')", color: "orange" },
    { title: "Rheumatology", type: "consult", desc: "Autoimmune consults.", tags: "rheum, joints, immune", action: "openFrame('rheumatology.html', 'Rheumatology')", color: "cyan" },

    { title: "General Journal Club", type: "journal", desc: "Evidence summaries and audio breakdowns.", tags: "research, papers, evidence", action: "openFrame('journalclub.html', 'General Journal Club')", color: "red" },
    { title: "Military Medicine", type: "journal", desc: "Operational medicine updates, TCCC guidelines.", tags: "operational, deployment, tccc", action: "openFrame('journalclub_mil.html', 'Military Medicine')", color: "emerald" },

    { title: "Tricare Formulary", type: "tool", desc: "DOD Medication Formulary.", tags: "drugs, meds, pharmacy", action: "window.open('https://www.express-scripts.com/frontend/open-enrollment/tricare/fst/#/', '_blank')", icon: "medication" },
    { title: "MedCalc", type: "tool", desc: "Clinical Calculators.", tags: "calc, score, risk", action: "window.open('https://www.mdcalc.com/', '_blank')", icon: "calculate" },
    { title: "OpenEvidence", type: "tool", desc: "Medical Search Engine.", tags: "search, guidelines", action: "window.open('https://www.openevidence.com/', '_blank')", icon: "search" },
    { title: "PubMed AI", type: "tool", desc: "AI-Powered Citation Search.", tags: "research, literature", action: "window.open('https://www.pubmed.ai/search/', '_blank')", icon: "science" },
    { title: "Ask Sage", type: "tool", desc: "Military AI Assistant.", tags: "ai, army, dod", action: "window.open('https://chat.genai.army.mil/login?code=CDAO-NORTHCOM/', '_blank')", icon: "military_tech" },
    { title: "Genesis (EMR)", type: "military", desc: "Electronic Medical Record.", tags: "mhs, cerner, record", action: "window.open('https://genesis.health.mil', '_blank')", icon: "dns" },
    { title: "MODS", type: "military", desc: "Medical Operational Data System.", tags: "admin, manpower", action: "window.open('https://www.mods.army.mil', '_blank')", icon: "admin_panel_settings" },
    { title: "Army Remote Dashboard", type: "military", desc: "Remote Patient Monitoring.", tags: "telehealth, monitoring", action: "window.open('https://client.wvd.azure.us/arm/webclient/index.html', '_blank')", icon: "monitor_heart" }
];
