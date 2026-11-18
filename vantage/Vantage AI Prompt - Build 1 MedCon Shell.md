MEDCON PORTAL – BUILD 1 (home shell + ADTMC+ + Neurology)

Work in phases. After each phase, give me a short report and the exact click test, then STOP and wait for my "go". Keep reads small (search a name, read ~40 lines around it). Never edit DPMAP Writer itself.

GOAL
Build "MedCon Portal" in Vantage as ONE custom widget that fills a Workshop page, made from a COPY of DPMAP Writer (/Army_NIPR/GLWACH/DPMAP/DPMAP Writer). I already have all the widget code and the function code; I will paste the files when you ask. Your job: duplicate the template, paste/place my files, fix only what Vantage needs (model names, imports), publish tagged versions, and wire Workshop.

AI MODELS
Gemini 4 Hydrogen (primary, new lightweight Gemini) -> GPT-5.6 Sol (backup) -> GPT-5.6 Terra (fast / last resort). My function already has this chain with timeouts (Hydrogen 120 s, Sol 120 s, Terra 60 s) and a one-time retry on bad JSON.

PHASE 1 – Report and duplicate (no code changes yet)
1. Report Hydrogen's exact Vantage API name, plus Sol's and Terra's, from each model's sidebar snippet. If Hydrogen isn't available to functions, say so and STOP.
2. Report the function timeout limit and whether 120 + 120 + 60 s fits. If not, tell me the numbers you'd use (shorten Terra, then Sol, never Hydrogen below 90 s).
3. Duplicate DPMAP Writer's Workshop module, widget set + widget repo, and functions repo into a new folder /Army_NIPR/GLWACH/MedCon Portal/. Names: "MedCon Portal" (module), "MedCon Portal Widget Repo", "MedCon Portal Functions". Report the new resource links and the versions pinned on DPMAP's main that you copied from.
STOP.

PHASE 2 – Function
1. Ask me for vantage/function/medconAsk.ts and wait for it. Add it as src/medconAsk.ts and export MedconFunctions from src/index.ts the same way DPMAP exports its functions.
2. Change ONLY: (a) the three model imports to the exact names from Phase 1, keeping the @Uses line with all three; (b) if DPMAP's working createChatCompletion call uses different param or response field names, match DPMAP inside callModel(). Remove DPMAP's own writer function from the copy.
3. Publish a TAGGED release. Run function_preview with:
   {"nonce":"t1","task":"test","system":"Reply in JSON.","messages":[{"role":"user","content":"Return {\"ok\":true}"}],"json":true}
   Report the output. modelUsed must be "Gemini 4 Hydrogen".
4. Also run it with an empty string. It must return quickly with errorMessage "EMPTY_REQUEST".
STOP.

PHASE 3 – Widget
1. Keep DPMAP's package.json, vite config, index.html and src/main.tsx. Delete DPMAP's own app components, assistant code, and stylesheet(s) from the copy, and remove their imports from main.tsx.
2. Ask me for the widget files and wait for them (about 22 files under src/; I'll paste each one with its path). Put each file at the path I give.
3. src/Widget.tsx imports useFoundryWidgetContext from "@osdk/widget.client-react". If DPMAP's main.tsx imports the widget differently (named vs default, ".js" suffix), fix only the import line.
4. Rules already followed in my code: no <form> elements, no CDN or outside network calls, no browser storage, no new npm packages. Don't add any.
5. Build and lint. Fix only compile errors and tell me each fix. Publish a TAGGED widget set version.
STOP.

PHASE 4 – Workshop wiring (same pattern as DPMAP)
- String variable writerRequestJson (default "").
- Function variable writerResponseJson = medconAsk(requestJson: writerRequestJson), recomputeStrategy "onInputsChange", pinned to the Phase 2 tag.
- Custom widget (Phase 3 tag): parameters writerRequestJson -> writerRequestJson, writerResponse -> writerResponseJson. Event writeRequested -> recalculateVariable writerResponseJson. Permissions: ALLOW_DOWNLOADS, ALLOW_POPUPS, ALLOW_MODALS, ALLOW_FORMS.
- One full-page layout, no padding, widget fills the page.
- Report a binding table (parameter -> variable, event -> action) and both pinned versions.
STOP.

PHASE 5 – Click tests (I run these)
Give me these steps and the expected result for each:
1. Check "I confirm…", click I Understand. Dashboard shows "What's on your mind, Doc?"
2. Type "Acute migraine treatment in the ED?" and click Ask Dr. H. An answer appears, ending with a Neurology "Recommended Consult" card.
3. Consult Generator: type "22M ankle sprain at PT", click Find Consultant. Triage reasoning plus a consult card.
4. Open Neurology. Click Migraine, then Start Neurology Assessment. 5–7 questions appear. Tick one per question, click Generate Plan & Orders. Review shows Assessment, Workup, Meds, Disposition. Click Finalize Note. The note starts "NEUROLOGY CONSULTATION NOTE". Ask "Max dose of Compazine?". An answer starts "Consultant:". Click Copy to Clipboard.
5. Open ADTMC+. Click Ankle Sprain, run all 4 steps. The note starts "SUBJECTIVE:" and has "Commander Limitations".
6. Open Cardiology. It says "Cardiology is not in Vantage yet" with an "Open the web version" button.
If any step fails, find the cause, say it in one sentence, fix it on the branch, publish a higher tag, repin, and give me the test again.

Handoff: list every resource link and pinned version, any open proposal/branch to merge, and confirm the old DPMAP Writer was not changed.
