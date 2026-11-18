// Local test harness: renders the MedCon app with a FAKE Vantage AI (canned answers).
// Not used in Vantage. Lets us click through every screen without Workshop.

import { createRoot } from "react-dom/client";
import { MedconApp } from "../../widget/src/medcon/App";
import { aiBridge } from "../../widget/src/medcon/ai/bridge";
import "../../widget/src/medcon/styles/portal.css";

const params = new URLSearchParams(location.search);
const DELAY = Number(params.get("delay") ?? 800);
const FAIL = params.get("fail"); // e.g. ?fail=plan to test error states

const QUESTIONS = {
  questions: [
    { question: "What is the exact character of the headache pain and is there any aura?", options: ["Throbbing with visual aura", "Constant pressure, no aura", "Sharp periorbital stabbing"] },
    { question: "Any thunderclap onset, fever, or neck stiffness?", options: ["None of these", "Thunderclap onset", "Fever and neck stiffness"] },
    { question: "Any contraindications to triptans or NSAIDs?", options: ["None", "Uncontrolled hypertension", "CAD or prior stroke"] },
  ],
};

const PLAN = {
  thinking_process: "TEST DATA. Primary migraine without red flags; normal exam. Dopamine antagonist cocktail is first line.",
  subjective: { hpi_paragraph: "TEST DATA. 24F active duty with 2 days of throbbing headache with photophobia and nausea.", ros_bullets: ["Positive photophobia", "Negative fever"] },
  red_flags: ["TEST DATA: return for thunderclap headache or focal deficit"],
  assessment: {
    synthesis_statement: "TEST DATA. Migraine without aura, status not met.",
    ddx: [
      { name: "Migraine without aura", icd10: "G43.009", desc: "Classic features.", likelihood: "High" },
      { name: "Tension-type headache", icd10: "G44.209", desc: "Less likely given nausea.", likelihood: "Low" },
    ],
  },
  plan: {
    disposition: [{ intervention: "Discharge to quarters 24h", is_primary: true, rationale: "Improves with treatment." }],
    workup: [{ intervention: "No imaging indicated", is_primary: true, rationale: "No red flags." }],
    treatment: [
      { intervention: "Prochlorperazine 10 mg IV", is_primary: true, rationale: "First line." },
      { intervention: "Dexamethasone 10 mg IV", is_primary: false, rationale: "Reduces recurrence." },
    ],
    profile: {
      days: 2,
      limitations: [{ intervention: "No PT", is_primary: true, rationale: "Recovery." }],
      commander_limitations: [{ intervention: "No PT", is_primary: true, rationale: "Recovery." }],
      instructions: [{ intervention: "Hydrate and rest in a dark room", is_primary: true }],
      soldier_instructions: [{ intervention: "Hydrate and rest in a dark room", is_primary: true }],
    },
  },
  references: [{ title: "AHS Consensus Statement 2021 (test link)", url: "https://example.org" }],
};

const DR_H = `### Guideline Framework
- **2023 AHS** acute migraine guidance (TEST DATA)

| Step | Drug | Dose |
|---|---|---|
| 1 | Prochlorperazine | 10 mg IV |
| 2 | Ketorolac | 30 mg IV |

> Warning: test data only.

1. Give the cocktail.
2. Reassess in 1 hour.

[RECOMMENDED_CONSULT: Neurology]`;

const JC_REPORT = `|||SECTION_THOUGHTS|||
1. **Search Strategy:** TEST DATA (no live search).
2. **Exclusion Criteria:** None.
3. **Guideline Check:** AHA/ASA 2021 (test).

|||SECTION_SUMMARY|||
# Journal Club Summary

## Executive Summary
[CONSENSUS: STRONG] TEST DATA. Short-course DAPT after minor stroke reduces recurrence. Stop at 21 days.

## Evidence Matrix
| Trial | Year | Evidence Level | Strength of Rec (SOR) | Key Findings | NNT/NNH | Risk of Bias | Clinical Impact |
|---|---|---|---|---|---|---|---|
| **Landmark:** CHANCE (test) | 2013 | [RCT] (N=5170) | [Strong] | Fewer strokes | NNT 29 | Low | Practice changing |
| **Recent:** TEST-TRIAL | 2023 | [MA] (N=999) | [Conditional] | Test result (verify) | n/a | Unclear | Confirms |

## Introduction
Brief clinical context. TEST DATA.

## Landmark Trial 1: CHANCE (test)
* **Year:** 2013
* **Results:** Test results.
* **Link:** [Click to Search](https://www.google.com/search?q=CHANCE+2013)

## Dr. Holtkamp's Clinical Pearls
> 🚨 **CRITICAL ALERT:** Test alert.

> ⚖️ **EVIDENCE:** Test nuance.

> 💡 **CLINICAL PEARL:** Test pearl.

|||SECTION_PLAN|||

# Treatment & Plan
1. **Initial Workup:** Test.
2. **First-Line Therapy:** Test.

|||SECTION_REFS|||

Test A. (2013). TEST reference. N Engl J Med.`;

function journalAnswer(task: string): string {
  if (task.endsWith(".questions"))
    return "Are you interested in adult or pediatric populations?\nWhich antiplatelet combination?\nWhat duration of therapy?\nMinor stroke or TIA or both?\nDo you want outcomes or bleeding risk?";
  if (task.endsWith(".report")) return JC_REPORT;
  if (task.endsWith(".audioScript"))
    return "Welcome back to Journal Club. This is test data. Here's the kicker: short-course dual antiplatelet therapy works. Boom, there it is. That's the bottom line.";
  return "TEST DATA. **CHANCE** used clopidogrel plus aspirin for 21 days.";
}

aiBridge.setSender((json) => {
  const req = JSON.parse(json);
  const task: string = req.task;
  setTimeout(() => {
    if (FAIL && task.includes(FAIL)) {
      aiBridge.receive(JSON.stringify({ nonce: req.nonce, ok: false, errorMessage: "Test failure." }));
      return;
    }
    let text = "";
    if (task.startsWith("journal")) text = journalAnswer(task);
    else if (task.endsWith(".questions")) text = JSON.stringify(QUESTIONS);
    else if (task.endsWith(".plan")) text = "```json\n" + JSON.stringify(PLAN) + "\n```";
    else if (task.endsWith(".refine")) text = "TEST DATA. Max prochlorperazine dose is 10 mg IV per dose.";
    else if (task === "home.router") text = "TEST DATA. Headache with photophobia fits neurology.\n[RECOMMENDED_CONSULT: Neurology]";
    else text = DR_H;
    aiBridge.receive(JSON.stringify({ nonce: req.nonce, ok: true, text, modelUsed: "Gemini 4 Hydrogen (fake)", usedBackupModel: false }));
  }, DELAY);
});

createRoot(document.getElementById("root")!).render(<MedconApp />);
