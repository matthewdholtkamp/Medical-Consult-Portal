MEDCON PORTAL – BUILD 2 (General + Military Journal Club)

Run this only after Build 1 works in "MedCon Portal" (/Army_NIPR/GLWACH/MedCon Portal/). Work on a branch. After each phase give a short report and the click test, then STOP for my "go". Keep reads small. Do not change DPMAP Writer.

WHAT CHANGES
- Widget only. No Workshop changes and no function changes: the Journal Club uses the same medconAsk function (Gemini 4 Hydrogen -> GPT-5.6 Sol -> GPT-5.6 Terra) and the same writerRequestJson -> writerResponseJson wiring.
- 5 new files and 4 replaced files in the MedCon Portal Widget Repo. No new npm packages.
- The page reads its audio script aloud with the browser's built-in speech (window.speechSynthesis). Nothing leaves the computer.

PHASE 1 – Check and paste
1. Report the widget set version and function version pinned in the MedCon Portal module on main.
2. Tell me whether a long answer fits: the Journal Club report is the longest output (up to ~8,000 tokens). Confirm medconAsk's maxTokens is 8000 and the function timeout still covers Hydrogen 120 s + Sol 120 s + Terra 60 s.
3. Ask me for the files and wait. I will paste each with its path:
   New: src/medcon/journal/JournalClub.tsx, src/medcon/journal/general.ts, src/medcon/journal/military.ts, src/medcon/journal/types.ts, src/medcon/ui/speech.ts
   Replace: src/medcon/App.tsx, src/medcon/data/siteContent.ts, src/medcon/ui/Markdown.tsx, src/medcon/styles/portal.css
4. Build and lint. Fix only compile errors and tell me each one. Publish a TAGGED widget set version and pin the module to it. Confirm the parameter bindings and the writeRequested event are still bound after re-pinning.
STOP.

PHASE 2 – Click tests (I run these)
Give me these steps with the expected result:
1. Sidebar > Journal Clubs > General Journal Club. Header reads "Medical Journal Club".
2. Type "Dual antiplatelet therapy after minor stroke", click Initialize Refinement. Five questions appear plus a "Source articles (optional)" box.
3. Answer two questions, click Generate Analysis. The report shows a Clinical Bottom Line with a colored consensus badge, an Evidence Matrix table with colored RCT/Meta-Analysis badges, three colored pearl boxes (red, amber, blue), and tabs Journal Club / Treatment & Plan / References.
4. Ask "Which trial changed practice most?" under Interactive Discussion. An answer appears.
5. Click Listen. "Step 1: Scripting Lecture" shows, then the computer reads the script aloud and shows the voice name. Pause, Resume and Stop work.
6. Click Copy Text and Copy Plan. A "copied" message shows at the bottom.
7. Repeat steps 1–3 on Military Medicine with "Fresh whole blood in Prolonged Field Care". Header reads "Operational Medicine Journal Club" and the tabs read Guideline Review / Operational Plan / References.
If audio is silent: tell me whether the Workshop iframe blocks speechSynthesis. Don't work around it. Text and Copy Script still work.
If any step fails, give the cause in one sentence, fix it on the branch, publish a higher tag, repin, and give me the test again.

Handoff: new pinned widget version, the open proposal to merge, and confirmation that Build 1 pages (Dashboard, ADTMC+, Neurology) still pass a quick check.
