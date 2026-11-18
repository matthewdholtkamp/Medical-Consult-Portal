// Operational (Military) Journal Club: prompts copied from the website's journalclub_mil.html.
// Changed for Vantage: no live web search (see NO_SEARCH_RULE) and a shorter audio script.
import { JournalConfig, NO_SEARCH_RULE, sourcesBlock } from "./types";

export const JOURNAL_MILITARY: JournalConfig = {
  id: "journalMilitary",
  pageTitle: "Military Medicine",
  title: "Operational Medicine Journal Club",
  subtitle: "JTS CPGs, Deployed Medicine, and Tactical Evidence",
  tagline: "Deployment Readiness Starts Now - Brought to you by Dr. Matthew Holtkamp",
  disclaimerStrong: "Operational Use Only.",
  disclaimerText: "Verify with current JTS Clinical Practice Guidelines (CPGs) and Theater Medical Directors.",
  topicLabel: "Operational Topic or Clinical Question",
  topicPlaceholder: "e.g., Fresh Whole Blood transfusion in Prolonged Field Care",
  step2Title: "Refining Operational Context",
  loaderQuestions: "Consulting JTS Guidelines...",
  loaderAnalysis: "Synthesizing Doctrine...",
  tips: [
    "Reviewing 2024 JTS CPG Updates...",
    "Checking TCCC-MP Guidelines...",
    "Analyzing Role 1 Resource Constraints...",
    "Scanning JSOM for Recent Trauma Data...",
    "Verifying Prolonged Field Care Protocols...",
    "Consulting Deployed Medicine Resources...",
  ],
  questionsPrompt: (topic) => `
Topic: "${topic}"
Role: Medical Research Librarian for Deployed Operations.
Task: Generate 5 specific *operational clarifying* questions to help the user narrow their search scope (Deployment Context).

CRITICAL INSTRUCTION: Do NOT ask basic knowledge questions.
Instead, ask questions that force the user to choose a tactical direction (e.g., "Is this Role 1, Role 2, or PFC?", "What are the evacuation constraints?", "Available resources/blood products?").

Output: A simple list of questions, one per line. No bullets, no numbering, just the text.
`,
  mainPrompt: (topic, details, sources) => `
Role: Dr. Matthew Holtkamp (Senior Operational Medical Officer).
Task: Create an Operational Journal Club analysis for: "${topic}".
Target Audience: Theater Medical Commanders & JTS Leadership (High Authority).
Context: ${details}
${sourcesBlock(sources)}
STRATEGY: Chain of Verification (CoV) for Operational Medicine.
1. **Draft & Retrieve:** Internally identify JTS Clinical Practice Guidelines (CPGs) and TCCC Protocols.
2. **Negative Verification (Self-Correction):** Explicitly check if the referenced CPG has been superseded by a 2024/2025 update or if TCCC-MP guidelines have changed. Avoid outdated doctrine.
3. **Verify Relevance:** Ensure "Recent Evidence" is from JSOM or relevant trauma journals (2020-2025) and applies to the specific operational context (Role 1/PFC).
4. **Synthesize:** Construct the final report ensuring doctrine adherence.

MANDATORY STRUCTURE:
1. Identify EXACTLY 4 Key References:
   - **Key CPG/Doctrine 1 & 2:** Two relevant Joint Trauma System (JTS) CPGs or Doctrine publications.
   - **Recent Evidence 3 & 4:** Two recent articles from *Journal of Special Operations Medicine (JSOM)* or major Trauma Journals (Strictly 2020-2025).

2. ${NO_SEARCH_RULE}

OUTPUT FORMAT (Use Markdown). You MUST use the separators |||SECTION_THOUGHTS|||, |||SECTION_SUMMARY|||, |||SECTION_PLAN|||, and |||SECTION_REFS||| exactly as written below.

|||SECTION_THOUGHTS|||
1. **Search Strategy:** [Queries used]
2. **Doctrine Verification:** [CPGs verified/superseded]
3. **Operational Relevance:** [Checked for Role 1/PFC applicability]

|||SECTION_SUMMARY|||
# Operational Journal Club Summary

## Executive Summary
[DOCTRINE: TAG] [Provide a 2-sentence bottom-line answer to the operational question (BLUF).]

**INSTRUCTION FOR [DOCTRINE: TAG]:** Start the Executive Summary with exactly one of:
- \`[DOCTRINE: STANDARD]\` (Core CPG/TCCC Protocol)
- \`[DOCTRINE: EMERGING]\` (Promising evidence, not yet standard)
- \`[DOCTRINE: NOT RECOMMENDED]\` (Against current doctrine or dangerous)

## Operational Evidence Matrix
| Source | Year | Evidence Level | Strength of Rec (SOR) | Key Recommendation/Finding | Operational Impact |
|---|---|---|---|---|---|
| **CPG:** [Name] | [YYYY] | [CPG] | [Strong/Weak/Expert] | [Recommendation] | [Role 1/PFC] |
| **CPG:** [Name] | [YYYY] | [CPG] | [Strong/Weak/Expert] | [Recommendation] | [Role 1/PFC] |
| **Recent:** [Name] | [YYYY] | [TAG] | [N/A] | [Result] | [Protocol Change] |
| **Recent:** [Name] | [YYYY] | [TAG] | [N/A] | [Result] | [Protocol Change] |

**INSTRUCTION FOR [TAG]:** You MUST use one of these exact tags for the Evidence Level column:
- \`[CPG]\` for JTS Guidelines (Blue).
- \`[RCT]\` for Randomized Controlled Trials (Green).
- \`[Obs]\` for Observational/Retrospective (Amber).
- \`[Review]\` for Reviews/White Papers (Gray).

**INSTRUCTION FOR [SOR]:** You MUST use one of these tags based on JTS/DoD strength of recommendation:
- \`[Strong]\` for directives/standards where benefits clearly outweigh risks.
- \`[Weak]\` for suggestions where evidence is less certain.
- \`[Expert]\` for consensus-based recommendations without high-level evidence.

## Introduction
Brief tactical/clinical context.

## Key CPG/Doctrine 1: [CPG Name/Number]
* **Publication Date:** [YYYY]
* **Key Recommendation:**
* **Operational Relevance:** [Role 1/PFC Application]
* **Link:** [Click to Search](https://www.google.com/search?q=JTS+CPG+[Topic])

## Key CPG/Doctrine 2: [CPG Name/Number]
* **Publication Date:** [YYYY]
* **Key Recommendation:**
* **Operational Relevance:** [Role 1/PFC Application]
* **Link:** [Click to Search](https://www.google.com/search?q=JTS+CPG+[Topic])

## Recent Evidence 1: [Article Title - JSOM/Trauma]
* **Year:** [YYYY]
* **Evidence Level:** [e.g. High (RCT), Moderate (Observational), Low (Case Series)]
* **Operational Impact:** [Change in TCCC/PFC Protocol]
* **Key Findings:**
* **Link:** [Click to Search](https://www.google.com/search?q=[Title]+[Year])

## Recent Evidence 2: [Article Title - JSOM/Trauma]
* **Year:** [YYYY]
* **Evidence Level:** [e.g. High (RCT), Moderate (Observational), Low (Case Series)]
* **Operational Impact:** [Change in TCCC/PFC Protocol]
* **Key Findings:**
* **Link:** [Click to Search](https://www.google.com/search?q=[Title]+[Year])

## Dr. Holtkamp's Operational Pearls
> 🚨 **TACTICAL ALERT:** [Critical Safety/Contraindication]

> ⚖️ **OPERATIONAL REALITY:** [Logistics/Resource constraint]

> 💡 **MEDIC TIP:** [Field expedient tip]

|||SECTION_PLAN|||

# Operational Plan
Based on the evidence above, provide a stepwise operational plan.
1. **Role 1 / PFC Considerations:**
2. **Evacuation & En-route Care:**
3. **Role 2/3 Escalation:**

|||SECTION_REFS|||

[Full APA Citations List]

CLEANLINESS INSTRUCTION: DO NOT use LaTeX syntax (like \\geq, \\text{}, or $...$). Use simple UTF-8 symbols (e.g., ≥, mg/kg) or plain text. Use separate paragraphs for clarity.
`,
  summaryHeading: /\n#\s+Operational Journal Club Summary/i,
  planHeading: /\n#\s*(Operational Plan|Plan|Management)/i,
  badges: {
    CPG: { label: "JTS CPG", className: "badge badge-guide" },
    RCT: { label: "RCT", className: "badge badge-rct" },
    OBS: { label: "Observational", className: "badge badge-cohort" },
    REVIEW: { label: "Review", className: "badge badge-case" },
    STRONG: { label: "Strong Rec", className: "badge badge-strong" },
    WEAK: { label: "Weak Rec", className: "badge badge-weak-mil" },
    EXPERT: { label: "Expert Opinion", className: "badge badge-expert" },
    "DOCTRINE: STANDARD": { label: "🛡 Standard Protocol", className: "badge badge-consensus badge-doctrine-standard" },
    "DOCTRINE: EMERGING": { label: "⚗ Emerging Data", className: "badge badge-consensus badge-consensus-evolving" },
    "DOCTRINE: NOT RECOMMENDED": { label: "⊘ Not Recommended", className: "badge badge-consensus badge-consensus-controversial" },
  },
  bottomLineTitle: "Operational Bottom Line",
  tabs: ["Guideline Review", "Operational Plan", "References"],
  listenLabel: "Listen to Brief",
  audioTitle: "🎙️ Dr. Holtkamp's Briefing",
  scriptStepText: "Step 1: Scripting Briefing (Dr. Holtkamp Style)...",
  scriptPrompt: (summary) => `
You are Dr. Matthew Holtkamp giving a Military Medical Briefing (SITREP). Convert the following operational summary into a professional, authoritative audio transcript.

Tone: **Direct, Command-Presence, Efficient, "Bottom Line Up Front" (BLUF).**
Style:
- Use military precision.
- Say things like "Listen up," "Here is the bottom line," "Tactical significance," or "Down range application."
- Avoid fluff. Focus on survivability and mission impact.

Structure:
1. Intro (Sitrep overview).
2. Discuss the 2 Key CPGs/Doctrine (The Standard).
3. Discuss the 2 Recent Evidence items (The Update/Challenge).
4. The "Bottom Line" advice (Actionable, life-saving).

Length: Detailed but efficient. Aim for roughly 1,100 words (about 7 minutes spoken).
Write plain spoken sentences only: no headings, bullets, tables, or stage directions.

TEXT TO ADAPT:
${summary.substring(0, 6000)}
`,
  followUpPlaceholder: "Ask Dr. Holtkamp a follow-up about regulations or protocol...",
  followUpPrompt: (context, q) => `
Context: ${context}
User Question: "${q}"
Role: Dr. Holtkamp (Operational Medical Expert).
Task: Answer the question comparing the CPGs and trials mentioned above if relevant. Be concise and tactical.
`,
  reportError: "Error building the final doctrine report.",
};
