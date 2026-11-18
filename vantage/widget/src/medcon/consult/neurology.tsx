// Neurology page: prompts, quick fills, and note format copied from the website's neurology.html.
import { Icon } from "../ui/Icon";
import type { ConsultConfig, NoteInput, SelectedItem } from "./types";

const formatItems = (items: SelectedItem[]) =>
  items.map((i) => `• ${i.val}\n` + (i.rationale ? `    Rationale: ${i.rationale}\n` : "")).join("");

function buildNote(n: NoteInput): string {
  const p = n.plan;
  const now = new Date();
  const timeString = now.toLocaleDateString() + " " + now.toLocaleTimeString();

  let note = `NEUROLOGY CONSULTATION NOTE\n`;
  note += `Date/Time: ${timeString}\n`;
  note += `Location: ${n.location} (Small Mil-Comm Hospital)\n`;
  note += `Patient Status: ${n.location === "Inpatient" || n.location === "ER" ? "Acute/Admitted" : "Outpatient"}\n`;
  note += `----------------------------------------\n\n`;

  note += `SUBJECTIVE:\n`;
  note += `${p.subjective.hpi_paragraph}\n\n`;
  note += `ROS / Focused History:\n`;
  p.subjective.ros_bullets.forEach((b) => (note += `- ${b}\n`));

  note += `\nCLINICAL DATA:\n`;
  note += `${n.vignette}\n`;

  note += `\nASSESSMENT & LOCALIZATION:\n`;
  note += `${p.assessment.synthesis_statement}\n\n`;
  note += `Differential Diagnosis:\n`;
  p.assessment.ddx.forEach((d) => (note += `- ${d.name} [${d.icd10 ?? ""}] (${d.likelihood ?? ""})\n`));

  note += `\nPLAN:\n`;
  note += `Disposition:\n`;
  note += n.disposition.length ? formatItems(n.disposition) : `(None selected)\n\n`;

  note += `Workup / Orders:\n`;
  note += n.workup.length ? formatItems(n.workup) : `(None selected)\n`;

  note += `\nTreatment / Interventions:\n`;
  note += n.treatment.length ? formatItems(n.treatment) : `(None selected)\n`;

  note += `\nDuty Limitations / Profile (${n.days} days):\n`;
  n.profile.forEach((i) => (note += `- ${i}\n`));

  note += `\nPatient Instructions:\n`;
  p.plan.profile.instructions.forEach((i) => (note += `- ${i.intervention}\n`));
  return note;
}

const PLAN_SYSTEM = `
### Clinical Reasoning Framework (Chain of Verification):
1.  **Draft & Verify:** Internally generate the plan, then explicitly cross-check it against current guidelines (e.g., 2024/2025 Specialty Guidelines).
2.  **Risk Stratification:** Determine "Sick" (Unstable/Inpatient) vs "Not Sick" (Stable/Outpatient).
3.  **Guideline Application:** Apply specific criteria (e.g., Validated Scores, Algorithms).
4.  **Pathophysiology:** Link findings to the underlying mechanism.

You are a Board-Certified Neurology Consultant for a SMALL MILITARY COMMUNITY HOSPITAL.

CRITICAL CAPABILITY CONTEXT:
1. No EVT/Thrombectomy. No Neuro ICU.
2. Limited MRI availability after hours.
3. Population: Active Duty (Profiles needed), Retirees, Dependents.

CONDITION-SPECIFIC RULES:
A) SUSPECTED STROKE (Ischemic):
   - **DRIP & SHIP PROTOCOL**: If eligible, administer Tenecteplase (TNK) 0.25 mg/kg (Max 25mg) IV Bolus IMMEDIATELY.
   - **MANDATORY TRANSFER**: If LVO suspected or Lytics given, transfer to Comprehensive Stroke Center.
B) MIGRAINE / HEADACHE:
   - First Line: "Migraine Cocktail" (Compazine 10mg IV + Benadryl 25mg IV + Toradol 30mg IV).
   - Adjuncts: Dexamethasone 10mg IV (reduce recurrence), IVF bolus, Magnesium.
   - Avoid Narcotics.
   - Disposition: Discharge with Neuro follow-up if improved. Active Duty needs "Quarters" (24-48h).
C) SEIZURE:
   - Acute: Ativan 2mg IV/IM.
   - Load: Keppra 1000-1500mg IV or Vimpat 200-400mg IV.
   - Status Epilepticus: Intubate and Transfer immediately.
   - New Onset: CT Head, Labs, Drivers License restriction (usually 6mo).
D) TBI / CONCUSSION:
   - Use MACE 2 criteria.
   - CT Decision: PECARN (Peds) or New Orleans/Canadian Head CT rules.
   - Duty Status: strict Profile (No PT, No Weapons, No Driving Military Vehicles) for 7 days minimum. Follow up TBI clinic.

CLINICAL RIGOR:
- Treatment: Be VERY PRESCRIPTIVE. Include Drug Name, Exact Dose.
- Military Duty Limitations: Be specific (Quarters, Profile duration).

OUTPUT JSON SCHEMA:
{
    "thinking_process": "Extremely detailed internal reasoning narrative explaining pathophysiology, score calculation logic, and exhaustive treatment decisions.",
    "subjective": { "hpi_paragraph": "string", "ros_bullets": ["string"] },
    "red_flags": ["string"],
    "assessment": {
        "synthesis_statement": "Summary of neuro status INCLUDING localization and pathophysiology.",
        "ddx": [ {"name": "string", "icd10": "string", "desc": "string", "likelihood": "High/Med/Low"} ]
    },
    "plan": {
        "disposition": [ {"intervention": "string (e.g., Admit, Transfer to Level 1, Discharge to Duty, Quarters)", "is_primary": boolean, "rationale": "Detailed explanation citing guidelines and pathophysiology"} ],
        "workup": [ {"intervention": "string (Specific MRI sequences, CT, Labs)", "is_primary": boolean, "rationale": "Detailed explanation of why this test is ordered and what it will change clinically"} ],
        "treatment": [ {"intervention": "string (Medication Name with EXACT Dose/Route/Frequency, Nursing orders)", "is_primary": boolean, "rationale": "Detailed explanation of drug mechanism, why this dose, and expected physiological change"} ],
        "profile": {
            "days": number,
            "limitations": [ {"intervention": "string (e.g. No PT, No Weapons, No Driving)", "is_primary": boolean, "rationale": "string"} ],
            "instructions": [ {"intervention": "string", "is_primary": boolean} ]
        }
    },
    "references": [ {"title": "string", "url": "string"} ]
}
`;

export const NEUROLOGY: ConsultConfig = {
  id: "neurology",
  pageTitle: "Neurology",
  variant: "neuro",
  maxWidth: "max-w-5xl",
  accent: {
    progress: "bg-indigo-600",
    stepActive: "bg-indigo-600 text-white shadow-[0_0_10px_rgba(79,70,229,0.5)]",
    badge: "bg-indigo-600",
    label: "text-indigo-400",
    questionText: "text-indigo-300",
    focusRing: "focus-visible:ring-indigo-500",
    inputFocus: "focus:ring-indigo-500 focus:border-indigo-500",
    startBtn: "from-indigo-700 to-indigo-600 hover:from-indigo-600 hover:to-indigo-500",
    primaryBtn: "bg-indigo-600 hover:bg-indigo-500",
    refineBtn: "bg-indigo-700 hover:bg-indigo-600",
    refineLabel: "text-indigo-300",
    checkbox: "accent-indigo-500",
    bullet: "text-indigo-400",
    introBorder: "border-indigo-500",
    spinnerColor: "#6366f1",
    thinkingIcon: "text-indigo-400",
  },
  header: (
    <header className="text-center mb-8 border-b border-slate-700 pb-6 relative">
      <div className="flex justify-center items-center mb-2">
        <Icon name="brain" className="text-indigo-500 mr-3" size={36} />
        <h1 className="text-4xl font-bold text-white tracking-wider">
          AI NEUROLOGY <span className="text-indigo-500">CONSULTANT</span>
        </h1>
      </div>
      <p className="text-lg text-slate-400">Small Military Community Hospital (General Neuro &amp; Stroke Protocols)</p>
    </header>
  ),
  intakeCardClass: "bg-slate-800 p-6 rounded-lg shadow-xl border-t-4 border-indigo-600",
  sectionCardClass: "bg-slate-800 p-6 rounded-lg shadow-xl border border-slate-700",
  location: {
    label: "Patient Location",
    hint: "Determines urgency, formulary, and transfer necessity.",
    withIcon: true,
    boxClass: "mb-8 bg-slate-900 p-4 rounded-lg border border-slate-700 shadow-inner",
    selectClass: "w-full p-3 border border-slate-600 rounded bg-slate-800 text-white focus:ring-2 focus:ring-indigo-500 outline-none text-lg",
    options: [
      { value: "ER", label: "Emergency Room (ER/Trauma Bay)" },
      { value: "Inpatient", label: "Inpatient Ward (Admitted)" },
      { value: "Clinic", label: "Outpatient Clinic" },
      { value: "Deployed", label: "CTMC / BAS" },
    ],
  },
  vignettePlaceholder:
    "e.g., 24M Active Duty with intractable migraine x3 days. \n\nVitals: BP 110/70, HR 80, Temp 98.4\nExam: Non-focal exam. CN intact. Neck supple...",
  templates: [
    {
      key: "stroke",
      label: "Stroke (Ischemic)",
      icon: "ambulance",
      iconClass: "text-red-400",
      text: "58M Retiree brought in by EMS. Wife states he slumped over at breakfast 45 mins ago. R sided weakness, global aphasia. Last known well 0800 (1 hour ago).\n\nVitals: BP 195/105, HR 92 (Irreg), O2 96%, Glucose 108\nExam: Global aphasia. Eyes deviated left. R facial droop. R Arm drift (falls immediately). R Leg 2/5. NIHSS approx 18.\nMeds: Lisinopril, Atorvastatin. No anticoagulants known.\nLabs: CT Head Non-Con: No hemorrhage, no large infarct. ASPECTS 10.\nPMH: HTN, HLP, Smoker.",
    },
    {
      key: "migraine",
      label: "Migraine",
      icon: "bolt",
      iconClass: "text-indigo-400",
      text: "24F Active Duty. Severe throbbing HA x2 days. Photophobia, Nausea. Tried Motrin/Tylenol/Excedrin with no relief. No focal weakness.\n\nVitals: BP 110/70, HR 80, Temp 98.4\nExam: Non-focal exam. CN intact. Neck supple. Distress due to pain.\nMeds: OCP. No other daily meds.\nLabs: None yet.\nPMH: History of Migraines.",
    },
    {
      key: "seizure",
      label: "Seizure",
      icon: "wave",
      iconClass: "text-yellow-400",
      text: "30M presenting after a witnessed generalized tonic-clonic seizure lasting 2 minutes. Currently post-ictal, confused but breathing spontaneously.\n\nVitals: BP 140/90, HR 110, RR 20, 98% RA\nExam: Lethargic, follows simple commands. No focal deficits. Small tongue bite.\nMeds: None.\nLabs: Glucose 110. CT Head pending.\nPMH: No prior seizure history. Recent mild head trauma 1 week ago.",
    },
  ],
  startLabel: "Start Neurology Assessment",
  loading: { questions: "Consulting Neurology AI...", plan: "Developing Neuro Plan..." },
  questions: {
    title: "Localization & Etiology",
    icon: "doctor",
    intro:
      "To refine the differential (Stroke vs Migraine vs Seizure vs TBI) and determine disposition/duty status, I need to clarify the following.",
    prompt: `
You are an expert Board-Certified Neurologist for a Small Military Community Hospital.
Review the intake data.
Generate 5-7 targeted, high-level neurology questions to refine the differential.
The case could be STROKE, MIGRAINE, SEIZURE, VERTIGO, NEUROPATHY, or TBI.

FOCUS ON:
1. Differential Differentiation (e.g., "Any aura?", "Duration of shaking?", "Vertigo triggered by movement?").
2. Red Flags (Thunderclap onset, Fever/Stiff Neck, Loss of Consciousness).
3. Contraindications (TNK/tPA exclusions, Pregnancy, Contrast allergy).

Provide 3-4 highly probable multiple-choice options for each question to make it easy for the referring provider to answer.
Return strictly JSON: { "questions": [ { "question": "Question text?", "options": ["Option A", "Option B", "Option C"] } ] }
`,
    failMessage: "Consultation failed. Please try again.",
  },
  plan: {
    system: PLAN_SYSTEM,
    buttonLabel: "Generate Plan & Orders",
    failMessage: "Failed to generate plan.",
  },
  review: {
    assessmentTitle: "Assessment & Localization",
    workupTitle: "Workup / Imaging",
    treatmentTitle: "Meds & Interventions",
    dispositionTitle: "Disposition & Profile",
    profileDaysLabel: "Quarters/Profile Duration (Days)",
    locationBanner: (location) =>
      location === "ER" || location === "Inpatient"
        ? {
            tone: "acute",
            title: "Small Hospital Acute Mode",
            text: "Capabilities: CT, TNK (Stroke), Cocktails (Migraine). No EVT/Neuro ICU.",
            workupTag: "STAT / Transfer",
            medsTag: "IV / Acute",
          }
        : {
            tone: "clinic",
            title: "Clinic / Outpatient Mode",
            text: "Focus on oral meds, duty status profiles, and referrals.",
            workupTag: "Ambulatory",
            medsTag: "Oral Only",
          },
  },
  final: {
    title: "Consultation Note",
    watermark: "GENERATED BY AI NEUROLOGY CONSULTANT",
    refineLabel: "Consultant Q&A (Refine the plan)",
    refinePlaceholder: "e.g., 'What is the max dose of Compazine?' or 'Can they go to the field?'",
    refineSystem: "You are a concise Neurologist. Answer the specific question based on the context of the current patient.",
    refineContext: (vignette, plan, q) => `Patient Context: ${vignette}. Plan: ${JSON.stringify(plan.plan)}. Question: ${q}`,
    refineWaiting: "Consulting literature...",
    refinePrefix: "Consultant: ",
    refineError: "Connection error.",
    copyDone: "Copied to clipboard!",
    referencesTitle: "Clinical Guidelines & Evidence",
    buildNote,
  },
};
