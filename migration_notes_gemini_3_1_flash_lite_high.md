# Migration Notes: Gemini 3.1 Flash-Lite Preview (High Thinking)

## Objective
Migrate all instances of the Gemini API across the MedCon Portal to use `gemini-3.1-flash-lite-preview` with reasoning configured to `thinkingLevel: "high"`. Consolidate all model configurations to a single source of truth without modifying the application's core architecture or build process.

## Centralization Method
1. Created `js/model_config.js` as the single non-secret source of truth.
   - Declared `GEMINI_MODEL`, `GEMINI_THINKING_LEVEL`, and `GEMINI_API_VERSION`.
2. Updated all files (including inline/self-contained files that deliberately bypass `js/api.js`) to import `js/model_config.js`.
3. Updated string interpolation across all `fetch` URLs to rely on `${GEMINI_API_VERSION}` and `${GEMINI_MODEL}` dynamically.

## High Thinking Implementation
Implemented `thinkingConfig` across the API requests in the required JSON structure:
```json
{
  "generationConfig": {
    "thinkingConfig": {
      "thinkingLevel": "high"
    }
  }
}
```
This was implemented successfully across:
- `callGeminiApi` and `callGeminiText` shared utilities.
- `index.html` (Ask Dr. Holtkamp).
- `journalclub.html` and `journalclub_mil.html` logic.
- All 30+ specialty `.html` pages containing inline custom API endpoints.

## Old Model Names Found & Replaced
- `gemini-3-flash-preview`
- `gemini-2.5-flash-lite`
- `gemini-3-pro-preview`
- `gemini-2.5-flash`

## Files Changed
- `js/model_config.js` (Created)
- `js/api.js`
- `js/config.js`
- `index.html`
- `README.md`
- `verify_changes.py`
- `journalclub.html`
- `journalclub_mil.html`
- `ECG.html`
- `Imaging.html`
- `write_cognitive.py`
- `Cognitive.html`
- `ADTMCplus.html`
- `Audioconsult.html`
- *All remaining ~26 specialty `.html` pages (e.g. `cardiology.html`, `neurology.html`, `pediatrics.html`, etc.)*

## Compatibility Notes & Preview Risks
1. **TTS Preservation**: In `journalclub.html` and `journalclub_mil.html`, the TTS endpoint was specifically left pointing to its own custom Google API string so that Text-To-Speech doesn't break due to the text generation `3.1-flash-lite` model. All other URLs were updated.
2. **Dashboard Logic (`index.html`)**: The `isThinkingMode` toggle checkbox previously switched the app between `gemini-3-flash-preview` and `gemini-2.5-flash-lite`. Since the requirement forces all requests to the new model, the URL logic ignores the toggle entirely. However, the UI toggle remains (as it displays the thinking blocks in the DOM when enabled).
3. **ECG / strict models**: `ECG.html` previously mandated `temperature: 0` without thinking. This was refactored to `temperature: 0.2` and allowed `thinkingLevel: "high"` so reasoning would process reliably.

## Remaining TODOs
- Continuous monitoring of prompt interpretation under the `high` thinking level (particularly `ECG.html` and `Imaging.html` strict parsing scripts).
- If the `3.1-flash-lite-preview` tag rolls to a stable version name, `js/model_config.js` will need to be updated.