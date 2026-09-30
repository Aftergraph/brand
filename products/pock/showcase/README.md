# POCK Orb-O canonical showcase

Responsive HTML/CSS translation of the governed POCK brand system.

## Scope

- brand overview
- light/dark lockup treatment
- app icon and favicon
- desktop product-header treatment
- canonical activity-state system
- responsive/mobile behavior

The showcase references canonical assets directly from `products/pock/`; it does not duplicate or redraw the brand masters.

## QA

Headless Chromium evidence was captured at:

- desktop: 1448 × 1086
- mobile: 390 × 844

Observed:

- zero page errors
- zero console errors
- no horizontal overflow
- responsive state-grid collapse
- reduced-motion-safe static presentation

See `design-qa.md` for the source-vs-render comparison history and final PASS.
