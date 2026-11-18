// ADTMC+ page: prompts, quick fills, and note format copied from the website's ADTMCplus.html.
import type { ConsultConfig, NoteInput, SelectedItem } from "./types";

const formatItems = (items: SelectedItem[]) =>
  items.map((i) => `• ${i.val}\n` + (i.rationale ? `    Rationale: ${i.rationale}\n` : "")).join("");

function buildNote(n: NoteInput): string {
  const p = n.plan;
  let note = `SUBJECTIVE:\n`;
  note += `${p.subjective.hpi_paragraph}\n\n`;
  note += `Review of Systems:\n`;
  p.subjective.ros_bullets.forEach((b) => (note += `- ${b}\n`));

  note += `\nCLINICAL DATA:\n`;
  note += `${n.vignette}\n`;

  note += `\nASSESSMENT:\n`;
  note += `${p.assessment.synthesis_statement}\n\n`;
  note += `Differential Diagnosis:\n`;
  p.assessment.ddx.forEach((d) => (note += `- ${d.name} [${d.icd10 ?? ""}] (${d.likelihood ?? ""}): ${d.desc ?? ""}\n`));

  note += `\nPLAN:\n`;
  note += `Disposition:\n`;
  note += n.disposition.length ? formatItems(n.disposition) : `(None selected)\n\n`;

  note += `Workup (Labs/Rads/Consults):\n`;
  note += n.workup.length ? formatItems(n.workup) : `- None\n`;

  note += `\nTreatment / Education:\n`;
  note += n.treatment.length ? formatItems(n.treatment) : `- None\n`;

  note += `\nProfile (Duration: ${n.days} days):\n`;
  note += `Commander Limitations:\n`;
  if (n.profile.length) n.profile.forEach((l) => (note += `- ${l}\n`));
  else note += `- No specific limitations.\n`;

  note += `Soldier Instructions:\n`;
  p.plan.profile.instructions.forEach((i) => (note += `- ${i.intervention}\n`));
  return note;
}

const PLAN_SYSTEM = `
You are an expert Military Physician Assistant/Medical Provider.
Generate a high-precision, protocol-driven SOAP note.

### Clinical Reasoning Framework (Chain of Verification):
1.  **Draft & Verify:** Internally generate the plan, then explicitly cross-check it against current guidelines (e.g., 2024/2025 Specialty Guidelines).
2.  **Risk Stratification:** Determine "Sick" (Unstable/Inpatient) vs "Not Sick" (Stable/Outpatient).
3.  **Guideline Application:** Apply specific criteria (e.g., Validated Scores, Algorithms).
4.  **Pathophysiology:** Link findings to the underlying mechanism.

### Output Requirements:
-   **DDx:** Qualitative likelihood (High/Med/Low).
-   **Treatment:** PRESCRIPTIVE (Drug, Dose, Route, Freq).
-   **Profile:** MANDATORY. Be specific (e.g., "Quarters 24h", "No Rucking").

OUTPUT JSON ONLY with this exact schema:
{
    "thinking_process": "Extremely detailed internal reasoning narrative explaining pathophysiology, score calculation logic, and exhaustive treatment decisions.",
    "subjective": {
        "hpi_paragraph": "A complete paragraph narrative of the HPI.",
        "ros_bullets": ["ROS point 1", "ROS point 2"]
    },
    "red_flags": ["string"],
    "assessment": {
        "synthesis_statement": "The most likely diagnosis and reasoning supported by evidence.",
        "ddx": [
            {"name": "Diagnosis Name", "icd10": "ICD-10 Code", "desc": "One sentence description of why.", "likelihood": "e.g. High, Medium, Low"}
        ]
    },
    "plan": {
        "disposition": [ {"intervention": "Triage recommendation (e.g., Maintain Outpatient, ER Transfer, Admission)", "is_primary": boolean, "rationale": "Detailed explanation"} ],
        "workup": [ {"intervention": "Lab 1, X-Ray View, Consult Name", "is_primary": boolean, "rationale": "Detailed explanation"} ],
        "treatment": [ {"intervention": "Medication Name & Dose, Non-pharm intervention", "is_primary": boolean, "rationale": "Detailed explanation"} ],
        "profile": {
            "days": number,
            "commander_limitations": [ {"intervention": "Limitation 1", "is_primary": boolean, "rationale": "Detailed explanation"} ],
            "soldier_instructions": [ {"intervention": "Instruction 1", "is_primary": boolean} ]
        }
    },
    "references": [
        {"title": "Title of the Guideline/Article", "url": "https://valid-url.com"}
    ]
}
`;

export const ADTMC_PLUS: ConsultConfig = {
  id: "adtmcPlus",
  pageTitle: "ADTMC+",
  variant: "adtmc",
  maxWidth: "max-w-4xl",
  accent: {
    progress: "bg-orange-600",
    stepActive: "bg-orange-600 text-white shadow-[0_0_10px_rgba(249,115,22,0.5)]",
    badge: "bg-orange-600",
    label: "text-orange-400",
    questionText: "text-orange-300",
    focusRing: "focus-visible:ring-orange-500",
    inputFocus: "focus:ring-orange-500 focus:border-orange-500",
    startBtn: "from-orange-700 to-orange-600 hover:from-orange-600 hover:to-orange-500",
    primaryBtn: "bg-orange-600 hover:bg-orange-500",
    refineBtn: "bg-orange-700 hover:bg-orange-600",
    refineLabel: "text-orange-300",
    checkbox: "accent-orange-500",
    bullet: "text-orange-500",
    introBorder: "border-orange-500",
    spinnerColor: "#F97316",
    thinkingIcon: "text-orange-400",
  },
  header: (
    <header className="text-center mb-6 relative">
      <h1 className="text-3xl font-bold text-orange-500">ADTMC + (The MAJ Russell Special)</h1>
      <p className="text-lg text-slate-300">Medic Decision Support &amp; Documentation Tool</p>
    </header>
  ),
  intakeCardClass: "bg-slate-800 p-6 rounded-lg shadow-md border border-slate-700",
  sectionCardClass: "bg-slate-800 p-6 rounded-lg shadow-md border border-slate-700",
  location: {
    label: "Current Location of Interview",
    withIcon: false,
    boxClass: "mb-6 bg-slate-900 p-3 rounded border border-slate-600",
    selectClass: "w-full p-2 border border-slate-500 rounded bg-slate-800 text-white focus:ring-2 focus:ring-orange-500 outline-none",
    options: [
      { value: "CTMC", label: "Consolidated Troop Medical Center (CTMC)" },
      { value: "BAS", label: "Battalion Aid Station (BAS)" },
      { value: "ER", label: "Emergency Room (ER)" },
      { value: "PCSL", label: "Primary Care Clinic (PCSL)" },
    ],
  },
  phiExtraLine: 'Do not enter unit specifics or unique events (e.g., "The Brigade Commander").',
  vignettePlaceholder:
    "e.g., 22M active duty soldier with right ankle pain. Twisted it during PT run this morning. \n\nVitals: BP 124/78, HR 82, RR 16, 98% RA\nExam: Swelling lateral malleolus. (+) Anterior Drawer...",
  templates: [
    {
      key: "msk",
      label: "Ankle Sprain",
      icon: "bone",
      iconClass: "text-orange-400",
      text: "22M active duty soldier with right ankle pain. Twisted it during PT run this morning. Swollen, can bear weight but painful.\n\nVitals: BP 124/78, HR 82, RR 16, 98% RA\nExam: Swelling lateral malleolus. (+) Anterior Drawer. FROM. PMS Intact.\nMeds: None\nAllergies: NKDA\nPMH: None",
    },
    {
      key: "uri",
      label: "URI / Cough",
      icon: "wind",
      iconClass: "text-blue-400",
      text: "19F presenting with 3 days of sore throat, rhinorrhea, and non-productive cough. Denies fever or shortness of breath.\n\nVitals: T 98.9, HR 76, BP 115/72, RR 14, 100% RA\nExam: Pharynx erythematous, no exudates. Lungs clear to auscultation bilaterally.\nMeds: Occasional Ibuprofen for HA.\nAllergies: Penicillin (hives)\nPMH: None",
    },
    {
      key: "heat",
      label: "Heat Illness",
      icon: "thermometer",
      iconClass: "text-red-400",
      text: "20M brought to BAS after falling out of a 6-mile ruck march. C/o severe muscle cramps, headache, and nausea.\n\nVitals: T 100.2 (oral), HR 115, BP 105/65, RR 20\nExam: Diaphoretic, flushed. Alert and oriented x3. Diffuse muscle cramping in bilateral LE.\nMeds: None\nAllergies: NKDA\nPMH: None",
    },
  ],
  startLabel: "Start Medic Assessment",
  loading: { questions: "Processing Clinical Data...", plan: "Processing Clinical Data..." },
  questions: {
    title: "Clinical Clarification",
    icon: "clipboardCheck",
    intro: "The AI has generated specific questions to clarify the case.",
    prompt: `
You are an expert combat medic assistant.
Based on the Clinical Data provided, generate 5-7 concise, targeted follow-up questions to build a complete HPI and ROS.
Do NOT ask for data already provided (e.g., if Vitals are present, don't ask for them).
Provide 3-4 highly probable multiple-choice options for each question to make it easy for the user to answer.
Return strictly JSON: { "questions": [ { "question": "Question text?", "options": ["Option A", "Option B", "Option C"] } ] }
`,
    failMessage: "Failed to generate questions. Please try again.",
  },
  plan: {
    system: PLAN_SYSTEM,
    buttonLabel: "Generate Assessment & Plan",
    failMessage: "Failed to generate SOAP note. Please try again.",
  },
  review: {
    assessmentTitle: "Assessment",
    workupTitle: "Workup (Labs/Rads/Consults)",
    treatmentTitle: "Treatment (Meds/Edu)",
    dispositionTitle: "Disposition",
    profileTitle: "Profile / Limitations",
    profileDaysLabel: "Profile Duration (Days)",
  },
  final: {
    title: "Final SOAP Note",
    refineLabel: "Consultant Q&A (Refine the plan)",
    refinePlaceholder: "e.g., 'What is the dose for Motrin?' or 'Why did you suggest X-Ray?'",
    refineSystem:
      "You are a helpful medical assistant. The medic has a generated plan but has a follow-up question. Answer concisely in plain text.",
    refineContext: (vignette, _plan, q) => `Current Context: Patient with ${vignette}. The user asks: ${q}`,
    refineWaiting: "Asking AI...",
    refinePrefix: "AI: ",
    refineError: "Error getting response.",
    copyDone: "Copied successfully!",
    referencesTitle: "Clinical Evidence & References (Not included in Clipboard Copy)",
    referencesHint: "Links to guidelines and evidence supporting this plan.",
    buildNote,
  },
};
