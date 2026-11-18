# MedCon Portal for Vantage

The MedCon Consult Portal rebuilt as one Vantage custom widget. It looks the same as the website. All AI goes through a Vantage function that uses **Gemini 4 Hydrogen**, with GPT-5.6 Sol and GPT-5.6 Terra as backups. No API key is in the browser.

This folder is NOT used by the website. It only lives here so it can be copied into Vantage from a work computer.

## What's built (Build 1)

| Part | Status |
|---|---|
| Home shell: sidebar, top bar, search (press `/`), PHI disclaimer | Done |
| Dashboard: Ask Dr. Holtkamp chat (multi-turn, Thinking Mode, recommended consult card) + Fast Links | Done |
| Consult Generator: "find the right doc" router + all 30 specialty cards with tabs | Done |
| Journal Clubs grid, Search Results | Done |
| **ADTMC+** (intake → Q&A → review → final SOAP note → follow-up Q&A) | Done |
| **Neurology** (intake → Q&A → review → final consult note → follow-up Q&A) | Done |
| Every other page | Shows "not in Vantage yet" with a button to the web version |

Changes from the website (Vantage rules): no microphone button, no share links (JSONBin is blocked), the PHI check shows on every visit (widgets can't remember it), and a "Use the faster model instead" link appears if an answer takes over 30 seconds.

## How to move it into Vantage

1. Open `Vantage AI Prompt - Build 1 MedCon Shell.md` (in this folder) and paste it into the Vantage AI. It works in phases and stops after each one.
2. When it asks for the files, open each file below on GitHub, click **Copy raw file**, and paste it into the matching file in the Vantage code repository (or paste it to the Vantage AI if it asks for it in chat).

### Functions repository (copy of DPMAP Writer's functions repo)

| GitHub file | Vantage file |
|---|---|
| `vantage/function/medconAsk.ts` | `src/medconAsk.ts` (and export it from `src/index.ts`) |

### Widget repository (copy of DPMAP Writer's widget repo)

Keep DPMAP's `package.json`, `vite.config`, `index.html`, and `src/main.tsx`. Delete DPMAP's own app files and stylesheet. Then add:

| GitHub file | Vantage file |
|---|---|
| `vantage/widget/src/main.config.ts` | `src/main.config.ts` (replace) |
| `vantage/widget/src/Widget.tsx` | `src/Widget.tsx` (replace) |
| `vantage/widget/src/medcon/App.tsx` | `src/medcon/App.tsx` |
| `vantage/widget/src/medcon/ai/api.ts` | `src/medcon/ai/api.ts` |
| `vantage/widget/src/medcon/ai/bridge.ts` | `src/medcon/ai/bridge.ts` |
| `vantage/widget/src/medcon/ai/homePrompts.ts` | `src/medcon/ai/homePrompts.ts` |
| `vantage/widget/src/medcon/ai/useAiStatus.ts` | `src/medcon/ai/useAiStatus.ts` |
| `vantage/widget/src/medcon/consult/ConsultFlow.tsx` | `src/medcon/consult/ConsultFlow.tsx` |
| `vantage/widget/src/medcon/consult/adtmcPlus.tsx` | `src/medcon/consult/adtmcPlus.tsx` |
| `vantage/widget/src/medcon/consult/neurology.tsx` | `src/medcon/consult/neurology.tsx` |
| `vantage/widget/src/medcon/consult/types.ts` | `src/medcon/consult/types.ts` |
| `vantage/widget/src/medcon/data/colors.ts` | `src/medcon/data/colors.ts` |
| `vantage/widget/src/medcon/data/siteContent.ts` | `src/medcon/data/siteContent.ts` |
| `vantage/widget/src/medcon/pages/ConsultCard.tsx` | `src/medcon/pages/ConsultCard.tsx` |
| `vantage/widget/src/medcon/pages/ConsultGenerator.tsx` | `src/medcon/pages/ConsultGenerator.tsx` |
| `vantage/widget/src/medcon/pages/Dashboard.tsx` | `src/medcon/pages/Dashboard.tsx` |
| `vantage/widget/src/medcon/pages/OtherViews.tsx` | `src/medcon/pages/OtherViews.tsx` |
| `vantage/widget/src/medcon/styles/portal.css` | `src/medcon/styles/portal.css` |
| `vantage/widget/src/medcon/ui/Icon.tsx` | `src/medcon/ui/Icon.tsx` |
| `vantage/widget/src/medcon/ui/Markdown.tsx` | `src/medcon/ui/Markdown.tsx` |
| `vantage/widget/src/medcon/ui/WaitHint.tsx` | `src/medcon/ui/WaitHint.tsx` |
| `vantage/widget/src/medcon/ui/clipboard.ts` | `src/medcon/ui/clipboard.ts` |

No new npm packages are needed: only React and the `@osdk/widget.client` packages DPMAP already has.

## Adding the next specialty later

Each consult page is one settings file (like `consult/neurology.tsx`): prompts, quick-fill cases, colors, and note format. A new specialty = copy that file, swap the prompts from its website page, and add one line to `App.tsx` and `siteContent.ts`.

## For rebuilding the styles (on the Mac, not in Vantage)

`vantage/build/` holds the Tailwind source and a local test page with a fake AI.

```bash
cd vantage/build && npm install && npm run css && npm run typecheck
```

`npm run dev` opens the test page at http://localhost:5199 (add `?fail=plan` to test errors, `?delay=35000` to test the slow-answer hints).
