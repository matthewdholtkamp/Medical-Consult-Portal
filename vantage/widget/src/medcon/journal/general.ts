// General Journal Club: prompts copied from the website's journalclub.html.
// Changed for Vantage: no live web search (see NO_SEARCH_RULE) and a shorter audio script
// (the website cut its script to ~7,000 characters anyway).
import { JournalConfig, NO_SEARCH_RULE, sourcesBlock } from "./types";

export const JOURNAL_GENERAL: JournalConfig = {
  id: "journalGeneral",
  pageTitle: "General Journal Club",
  title: "Medical Journal Club",
  subtitle: "Evidence summaries, audio breakdowns, and landmark trials",
  tagline: "Learning Starts Now - Brought to you by Dr. Matthew Holtkamp",
  disclaimerStrong: "Educational Use Only.",
  disclaimerText: "Not medical advice. Verify all citations and guidelines clinically.",
  topicLabel: "Topic or Clinical Question",
  topicPlaceholder: "e.g., Dual antiplatelet therapy after minor stroke",
  step2Title: "Refining Questions",
  loaderQuestions: "Consulting Research Database...",
  loaderAnalysis: "Synthesizing Journal Club: Finding 2 Landmark & 2 Recent Trials...",
  tips: [
    "Checking for retracted papers...",
    "Cross-referencing 2024/2025 Guidelines...",
    "Verifying P-values and Confidence Intervals...",
    "Synthesizing Clinical Pearls...",
    "Consulting the Evidence Matrix...",
    "Reviewing Exclusion Criteria...",
  ],
  questionsPrompt: (topic) => `
Topic: "${topic}"
Role: Medical Research Librarian.
Task: Generate 5 specific *clarifying* questions to help the user narrow their search scope (PICO elements).

CRITICAL INSTRUCTION: Do NOT ask knowledge questions (e.g., "What is the pathophysiology?").
Instead, ask questions that force the user to choose a direction (e.g., "Are you interested in pediatric or adult populations?", "Do you want to focus on diagnosis or treatment?", "Which specific drug class is the intervention?").

Output: A simple list of questions, one per line. No bullets, no numbering, just the text.
`,
  mainPrompt: (topic, details, sources) => `
Role: Dr. Matthew Holtkamp (Senior Attending Physician & Medical Educator).
Task: Create a Journal Club analysis for: "${topic}".
Target Audience: Senior Attending Physicians and Medical Directors (High Authority).
Context: ${details}
${sourcesBlock(sources)}
STRATEGY: Chain of Verification (CoV) for Evidence-Based Medicine.
1. **Draft & Retrieve:** Internally identify key clinical guidelines (e.g., AHA, ACC, IDSA) and define the "Landmark Trials".
2. **Negative Verification (Self-Correction):** Before finalizing, explicitly check if any selected trial has been RETRACTED or significantly contradicted by newer 2024/2025 meta-analyses. If so, discard it.
3. **Verify Dates:** Explicitly check that "Recent Trials" are from the last 5 years (2020-2025).
4. **Synthesize:** Construct the final report using the verified evidence.

MANDATORY STRUCTURE:
1. Identify EXACTLY 4 Key Trials:
   - Trial 1 & 2: The Two Historical Landmark Trials (The foundation of current practice).
   - Trial 3 & 4: The Two Most Important Recent/Emerging Trials (Strictly 2020-2025).

2. ${NO_SEARCH_RULE}

OUTPUT FORMAT (Use Markdown). You MUST use the separators |||SECTION_THOUGHTS|||, |||SECTION_SUMMARY|||, |||SECTION_PLAN|||, and |||SECTION_REFS||| exactly as written below.

|||SECTION_THOUGHTS|||
1. **Search Strategy:** [Queries used]
2. **Exclusion Criteria:** [Trials rejected for date/retraction]
3. **Guideline Check:** [Guidelines verified]

|||SECTION_SUMMARY|||
# Journal Club Summary

## Executive Summary
[CONSENSUS: TAG] [Provide a 2-sentence bottom-line answer to the clinical question.]

**INSTRUCTION FOR [CONSENSUS: TAG]:** Start the Executive Summary with exactly one of:
- \`[CONSENSUS: STRONG]\` (High certainty, broad agreement)
- \`[CONSENSUS: CONDITIONAL]\` (Moderate certainty, depends on patient factors)
- \`[CONSENSUS: CONTROVERSIAL]\` (Conflicting data, no agreement)
- \`[CONSENSUS: EVOLVING]\` (New emerging data, not yet standard)

## Evidence Matrix
| Trial | Year | Evidence Level | Strength of Rec (SOR) | Key Findings | NNT/NNH | Risk of Bias | Clinical Impact |
|---|---|---|---|---|---|---|---|
| **Landmark:** [Name] | [YYYY] | [TAG] (N=[N]) | [SOR] | [Result] | [NNT/H] | [Low/High/Unclear] | [Impact] |
| **Landmark:** [Name] | [YYYY] | [TAG] (N=[N]) | [SOR] | [Result] | [NNT/H] | [Low/High/Unclear] | [Impact] |
| **Recent:** [Name] | [YYYY] | [TAG] (N=[N]) | [SOR] | [Result] | [NNT/H] | [Low/High/Unclear] | [Impact] |
| **Recent:** [Name] | [YYYY] | [TAG] (N=[N]) | [SOR] | [Result] | [NNT/H] | [Low/High/Unclear] | [Impact] |

**INSTRUCTION FOR [TAG]:** You MUST use one of these exact tags for the Evidence Level column:
- \`[RCT]\` for Randomized Controlled Trials (Green).
- \`[MA]\` for Meta-Analyses (Purple).
- \`[Guide]\` for Clinical Guidelines (Blue).
- \`[Cohort]\` for Observational/Retrospective (Amber).
- \`[Case]\` for Case Series/Reports (Gray).

**INSTRUCTION FOR [SOR]:** You MUST use one of these tags based on GRADE:
- \`[Strong]\` for high-certainty evidence where benefits clearly outweigh risks.
- \`[Conditional]\` for lower certainty or when patient values/preferences vary significantly.

## Introduction
Brief clinical context.

## Landmark Trial 1: [Trial Name/Acronym]
* **Year:** [YYYY]
* **Design/PICO:**
* **Evidence Level:** [e.g. High (RCT), Moderate (Observational)]
* **Results:**
* **Limitations:**
* **Link:** [Click to Search](https://www.google.com/search?q=[Trial Name]+[Year])

## Landmark Trial 2: [Trial Name/Acronym]
* **Year:** [YYYY]
* **Design/PICO:**
* **Evidence Level:** [e.g. High (RCT), Moderate (Observational)]
* **Results:**
* **Limitations:**
* **Link:** [Click to Search](https://www.google.com/search?q=[Trial Name]+[Year])

## Recent Major Trial 1: [Trial Name]
* **Year:** [YYYY]
* **Evidence Level:** [e.g. High (RCT), Moderate (Observational), Low (Case Series)]
* **Clinical Impact:** [Specific practice change or confirmation]
* **Key Findings:**
* **Link:** [Click to Search](https://www.google.com/search?q=[Trial Name]+[Year])

## Recent Major Trial 2: [Trial Name]
* **Year:** [YYYY]
* **Evidence Level:** [e.g. High (RCT), Moderate (Observational), Low (Case Series)]
* **Clinical Impact:** [Specific practice change or confirmation]
* **Key Findings:**
* **Link:** [Click to Search](https://www.google.com/search?q=[Trial Name]+[Year])

## Dr. Holtkamp's Clinical Pearls
> 🚨 **CRITICAL ALERT:** [Severe Safety Risk or Contraindication]

> ⚖️ **EVIDENCE:** [Nuanced/Conflicting Data]

> 💡 **CLINICAL PEARL:** [Key Takeaway]

|||SECTION_PLAN|||

# Treatment & Plan
Based on the evidence above, provide a stepwise clinical plan.
1. **Initial Workup:**
2. **First-Line Therapy:**
3. **Escalation/Refractory Management:**

|||SECTION_REFS|||

[Full APA Citations List]

CLEANLINESS INSTRUCTION: DO NOT use LaTeX syntax (like \\geq, \\text{}, or $...$). Use simple UTF-8 symbols (e.g., ≥, mg/kg) or plain text. Use separate paragraphs for clarity.
`,
  summaryHeading: /\n#\s+Journal Club Summary/i,
  planHeading: /\n#\s*(Treatment & Plan|Plan|Management)/i,
  badges: {
    RCT: { label: "RCT", className: "badge badge-rct" },
    MA: { label: "Meta-Analysis", className: "badge badge-meta" },
    GUIDE: { label: "Guideline", className: "badge badge-guide" },
    COHORT: { label: "Cohort", className: "badge badge-cohort" },
    CASE: { label: "Case Series", className: "badge badge-case" },
    STRONG: { label: "Strong Rec", className: "badge badge-strong" },
    CONDITIONAL: { label: "Conditional", className: "badge badge-conditional" },
    WEAK: { label: "Weak Rec", className: "badge badge-weak" },
    "CONSENSUS: STRONG": { label: "✓ Strong Consensus", className: "badge badge-consensus badge-consensus-strong" },
    "CONSENSUS: CONDITIONAL": { label: "! Conditional", className: "badge badge-consensus badge-consensus-conditional" },
    "CONSENSUS: CONTROVERSIAL": { label: "✕ Controversial", className: "badge badge-consensus badge-consensus-controversial" },
    "CONSENSUS: EVOLVING": { label: "⚗ Evolving Data", className: "badge badge-consensus badge-consensus-evolving" },
  },
  bottomLineTitle: "Clinical Bottom Line",
  tabs: ["Journal Club", "Treatment & Plan", "References"],
  listenLabel: "Listen",
  audioTitle: "🎙️ Dr. Holtkamp's Analysis",
  scriptStepText: "Step 1: Scripting Lecture (Dr. Holtkamp Style)...",
  scriptPrompt: (summary) => `
You are Dr. Matthew Holtkamp. Convert the following medical summary into a high-energy, podcast-style audio transcript.

Tone: **Fun, Witty, Fast-Paced, and Conversational.**
Style:
- Use short, punchy sentences to keep the tempo up.
- Be charismatic and less formal. Use humor where appropriate.
- Say things like "Here's the kicker," "Let's cut through the noise," "Boom, there it is," or "Welcome back to Journal Club."
- Avoid long, dragging explanations. Keep it moving.

Structure:
1. Intro (High energy, hook the listener immediately).
2. Discuss the 2 Landmark trials (The history - keep it snappy).
3. Discuss the 2 Recent trials (The update - what's new and exciting).
4. The "Bottom Line" advice (Clear, actionable, confident).

Length: Detailed but efficient. Aim for roughly 1,100 words (about 7 minutes spoken).
Write plain spoken sentences only: no headings, bullets, tables, or stage directions.

TEXT TO ADAPT:
${summary.substring(0, 6000)}
`,
  followUpPlaceholder: "Ask Dr. Holtkamp a follow-up...",
  followUpPrompt: (context, q) => `
Context: ${context}
User Question: "${q}"
Role: Dr. Holtkamp.
Task: Answer the question comparing the trials mentioned above if relevant. Be concise.
`,
  reportError: "Error building the final Journal Club report.",
};
