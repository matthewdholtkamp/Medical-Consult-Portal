## 2024-05-21 - Accessible Controls on Dashboard
**Learning:** The dashboard has several interactive controls (hamburger menu, search input) that lack accessible labels, making navigation difficult for screen reader users. The "Consult Cards" are also `div`s with `onclick` handlers but lack `role="button"` and `tabindex`, which is a larger systemic issue to address in a future iteration.
**Action:** Added `aria-label` to the sidebar toggle buttons and the search input in `index.html` to immediately improve the experience for screen reader users.
