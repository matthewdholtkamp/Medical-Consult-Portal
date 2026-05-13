## 2024-05-21 - Accessible Controls on Dashboard
**Learning:** The dashboard has several interactive controls (hamburger menu, search input) that lack accessible labels, making navigation difficult for screen reader users. The "Consult Cards" are also `div`s with `onclick` handlers but lack `role="button"` and `tabindex`, which is a larger systemic issue to address in a future iteration.
**Action:** Added `aria-label` to the sidebar toggle buttons and the search input in `index.html` to immediately improve the experience for screen reader users.

## 2024-05-21 - Accessible Interactive Cards and Icon Buttons
**Learning:** This application heavily relies on `div` elements for interactive "cards" (e.g., the dashboard fast links and main grid) and icon-only buttons for actions like copy, mic input, and audio controls. While `div`s with `onclick` are functional, they completely exclude keyboard and screen reader users. Additionally, Material Symbols often read out their textual names (e.g., "mic" or "content_copy") confusingly without `aria-hidden="true"` and an overarching `aria-label`.
**Action:** When working on interactive UI elements in this repository, always ensure that clickable `div`s get `role="button"`, `tabindex="0"`, an explicit `onkeydown` handler for Enter/Space, and a `focus-visible` ring. Icon-only buttons must have `aria-label`s and `aria-hidden="true"` on the icon itself. Added these improvements to `index.html`, `Audioconsult.html`, and `Imaging.html`.
## 2024-05-18 - ARIA Live Regions for Dynamic Feedback
**Learning:** This static, vanilla JS application generates dynamic notifications (e.g., "Copied to clipboard!" via `copy-success` elements or error boxes upon API failures) that become visible without a page reload. Initially, these messages were missing ARIA live regions, making them invisible to screen readers when they appeared.
**Action:** Always ensure that transient, dynamically appearing success messages include `role="status"` and `aria-live="polite"`. High-priority dynamic error messages should include `role="alert"` and `aria-live="assertive"`. This pattern has been applied to `#copy-success` elements, share link messages, and dynamically injected error notifications in `index.html`.

## 2024-05-22 - Icon-only Buttons and Tooltips
**Learning:** Icon-only buttons (like `#micBtn`) often receive an `aria-label` for screen reader accessibility, but can lack a visual tooltip for mouse users who may not immediately recognize the icon's function.
**Action:** When working on icon-only buttons, ensure both an `aria-label` (for screen readers) and a `title` attribute (for visual tooltips on hover) are provided to maximize usability across different interaction methods.

## 2024-05-22 - Focus Styles on Details/Summary Elements
**Learning:** The `<summary>` elements in the application (like the 'View Research Logic' dropdowns in the journal club pages) act as interactive buttons but were lacking the proper offset classes (`focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900`) for their focus rings. Without the offset, the `ring-orange-500` outline blends directly into the dark `bg-slate-900` container, making keyboard focus nearly invisible.
**Action:** When working on interactive `<summary>` elements or expandable sections, always append the offset utility classes alongside the main ring class to ensure the focus state is clearly legible for keyboard navigators.

## 2024-05-22 - ARIA Live Regions on Dynamically Injected Errors
**Learning:** In the text-to-speech audio generation flow (e.g., `journalclub.html`), rate limit errors were being handled by dynamically injecting a `<div>` containing an error message directly into the DOM via `.innerHTML +=`. Because this injected element lacked `role="alert"` and `aria-live="assertive"`, screen readers would not proactively announce the failure to visually impaired users, leaving them unaware that the generation stopped.
**Action:** Always scrutinize error handling blocks (especially `catch` statements or non-200 HTTP responses) that dynamically construct and inject UI elements. Ensure that critical error injections include `role="alert"` and `aria-live="assertive"` within the template string itself.
