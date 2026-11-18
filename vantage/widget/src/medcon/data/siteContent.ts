// Everything the portal links to (same list as the website's index.html).
// pageId = a page built into this widget. webPath = the page on the public website (not moved yet).

export type ItemType = "consult" | "journal" | "tool" | "military";

export interface SiteItem {
  title: string;
  type: ItemType;
  category: "Medicine" | "Surgery" | "Support" | "Journal" | "Tool";
  desc: string;
  tags: string;
  color?: string;
  icon?: string;
  pageId?: "adtmcPlus" | "neurology" | "journalGeneral" | "journalMilitary";
  webPath?: string;
  url?: string;
}

export const WEBSITE_BASE = "https://matthewdholtkamp.github.io/Medical-Consult-Portal/";

export const SITE_CONTENT: SiteItem[] = [
  { title: "ADTMC", type: "consult", category: "Medicine", desc: "Medic sick call services. Note Generation.", tags: "sick call, medic, notes", color: "green", webPath: "ADTMC.html" },
  { title: "ADTMC+", type: "consult", category: "Medicine", desc: "Sick call for providers. Note Generation.", tags: "sick call, provider, notes", color: "indigo", pageId: "adtmcPlus" },
  { title: "Internal Medicine", type: "consult", category: "Medicine", desc: "Adult hospital medicine.", tags: "im, hospitalist, general", color: "blue", webPath: "IM.html" },
  { title: "ICU", type: "consult", category: "Medicine", desc: "Critical Care consults.", tags: "critical care, intensive, shock", color: "purple", webPath: "ICU.html" },
  { title: "Cardiology", type: "consult", category: "Medicine", desc: "Consults for cardiovascular.", tags: "heart, stemi, cardio", color: "red", webPath: "cardiology.html" },
  { title: "Neurology", type: "consult", category: "Medicine", desc: "Brain + CNS consults.", tags: "neuro, stroke, seizure", color: "yellow", pageId: "neurology" },
  { title: "Pediatrics", type: "consult", category: "Medicine", desc: "Infants + children.", tags: "peds, kids, baby", color: "pink", webPath: "pediatrics.html" },
  { title: "Psychiatry", type: "consult", category: "Support", desc: "Mental health consults.", tags: "mental, psych, behavioral", color: "teal", webPath: "psychiatry.html" },
  { title: "Orthopedics", type: "consult", category: "Surgery", desc: "Bone + joint consults.", tags: "ortho, surgery, fracture", color: "orange", webPath: "orthopedic_surgery.html" },
  { title: "Rheumatology", type: "consult", category: "Medicine", desc: "Autoimmune consults.", tags: "rheum, joints, immune", color: "cyan", webPath: "rheumatology.html" },
  { title: "Endocrinology", type: "consult", category: "Medicine", desc: "Hormone/metabolism.", tags: "endo, diabetes, thyroid", color: "fuchsia", webPath: "endocrinology.html" },
  { title: "Gastroenterology", type: "consult", category: "Medicine", desc: "Digestive consults.", tags: "gi, stomach, liver", color: "emerald", webPath: "gastroenterology.html" },
  { title: "ENT", type: "consult", category: "Surgery", desc: "Ear, Nose, Throat.", tags: "ent, ears, sinus", color: "teal", webPath: "ent.html" },
  { title: "General Surgery", type: "consult", category: "Surgery", desc: "Acute Abdomen, Hernia.", tags: "surgery, appendix, gallstone", color: "stone", webPath: "general_surgery.html" },
  { title: "Heme/Onc", type: "consult", category: "Medicine", desc: "Blood and Cancer.", tags: "heme, onc, anemia", color: "rose", webPath: "hematology_oncology.html" },
  { title: "Hepatology", type: "consult", category: "Medicine", desc: "Liver Disease.", tags: "liver, cirrhosis, hep", color: "amber", webPath: "hepatology.html" },
  { title: "Infectious Disease", type: "consult", category: "Medicine", desc: "Sepsis, STI, Tropical.", tags: "id, infection, sepsis", color: "lime", webPath: "infectious_disease.html" },
  { title: "Nephrology", type: "consult", category: "Medicine", desc: "Kidney, Electrolytes.", tags: "renal, kidney, aki", color: "sky", webPath: "nephrology.html" },
  { title: "Neurosurgery", type: "consult", category: "Surgery", desc: "Spine, Trauma, Cranial.", tags: "neuro, spine, trauma", color: "zinc", webPath: "neurosurgery.html" },
  { title: "OB/GYN", type: "consult", category: "Surgery", desc: "Women's Health.", tags: "obgyn, pregnancy, gyn", color: "pink", webPath: "obgyn.html" },
  { title: "Occ. Therapy", type: "consult", category: "Support", desc: "ADLs, Hands.", tags: "ot, rehab, hands", color: "orange", webPath: "occupational_therapy.html" },
  { title: "Pharmacology", type: "consult", category: "Support", desc: "Dosing, Interactions.", tags: "pharm, meds, drugs", color: "cyan", webPath: "pharmacology.html" },
  { title: "Physical Therapy", type: "consult", category: "Support", desc: "MSK, Gait, Rehab.", tags: "pt, rehab, muscle", color: "blue", webPath: "physical_therapy.html" },
  { title: "PM&R", type: "consult", category: "Support", desc: "Rehab, TBI, Pain.", tags: "pmr, rehab, pain", color: "violet", webPath: "pmr.html" },
  { title: "Pulmonary", type: "consult", category: "Medicine", desc: "Lungs, Breathing.", tags: "pulm, copd, asthma", color: "cyan", webPath: "pulmonary.html" },
  { title: "Radiology", type: "consult", category: "Support", desc: "Imaging Guidance.", tags: "rad, xray, ct", color: "gray", webPath: "radiology.html" },
  { title: "Urology", type: "consult", category: "Surgery", desc: "Stones, Retention.", tags: "uro, stones, bladder", color: "yellow", webPath: "urology.html" },
  { title: "General Journal Club", type: "journal", category: "Journal", desc: "Evidence summaries and audio breakdowns.", tags: "research, papers, evidence", color: "red", pageId: "journalGeneral" },
  { title: "Military Medicine", type: "journal", category: "Journal", desc: "Operational medicine updates, TCCC guidelines.", tags: "operational, deployment, tccc", color: "emerald", pageId: "journalMilitary" },
  { title: "Live Ai Consults", type: "consult", category: "Medicine", desc: "Real-time audio consultation with Dr. Holtkamp.", tags: "audio, voice, mic, live", color: "rose", webPath: "Audioconsult.html" },
  { title: "AI Imaging Vision", type: "consult", category: "Support", desc: "Radiology decision support. X-Ray/CT/MRI Analysis.", tags: "rad, image, vision, xray, ct", color: "indigo", webPath: "Imaging.html" },
  { title: "Cognitive Assessment", type: "consult", category: "Medicine", desc: "Behavioral Neurology & MoCA Navigator.", tags: "neuro, cognitive, moca, memory", color: "indigo", webPath: "Cognitive.html" },
  { title: "Tricare Formulary", type: "tool", category: "Tool", desc: "DOD Medication Formulary.", tags: "drugs, meds, pharmacy", icon: "pill", url: "https://www.express-scripts.com/frontend/open-enrollment/tricare/fst/#/" },
  { title: "MedCalc", type: "tool", category: "Tool", desc: "Clinical Calculators.", tags: "calc, score, risk", icon: "calculator", url: "https://www.mdcalc.com/" },
  { title: "OpenEvidence", type: "tool", category: "Tool", desc: "Medical Search Engine.", tags: "search, guidelines", icon: "search", url: "https://www.openevidence.com/" },
  { title: "PubMed AI", type: "tool", category: "Tool", desc: "AI-Powered Citation Search.", tags: "research, literature", icon: "science", url: "https://www.pubmed.ai/search/" },
  { title: "Ask Sage", type: "tool", category: "Tool", desc: "Military AI Assistant.", tags: "ai, army, dod", icon: "medal", url: "https://chat.genai.army.mil/login?code=CDAO-NORTHCOM/" },
  { title: "Genesis (EMR)", type: "military", category: "Tool", desc: "Electronic Medical Record.", tags: "mhs, cerner, record", icon: "server", url: "https://avhe.health.mil" },
  { title: "MODS", type: "military", category: "Tool", desc: "Medical Operational Data System.", tags: "admin, manpower", icon: "shield", url: "https://www.mods.army.mil" },
  { title: "Army Remote Dashboard", type: "military", category: "Tool", desc: "Remote Patient Monitoring.", tags: "telehealth, monitoring", icon: "heartPulse", url: "https://client.wvd.azure.us/arm/webclient/index.html" },
];

export const CONSULT_TITLES =
  "ADTMC, ADTMC+, Internal Medicine, ICU, Cardiology, Neurology, Pediatrics, Psychiatry, Orthopedics, Rheumatology, Endocrinology, Gastroenterology, ENT, General Surgery, Heme/Onc, Hepatology, Infectious Disease, Nephrology, Neurosurgery, OB/GYN, Occ. Therapy, Pharmacology, Physical Therapy, PM&R, Pulmonary, Radiology, Urology, AI Imaging Vision, Cognitive Assessment.";

export function findConsult(title: string): SiteItem | undefined {
  const t = title.trim().toLowerCase();
  return SITE_CONTENT.find((c) => c.type === "consult" && c.title.toLowerCase() === t);
}
