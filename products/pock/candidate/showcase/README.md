# POCK Orb-O ImageToCode showcase

Responsive HTML/CSS translation of the current POCK brand reference boards.

## Scope

- brand overview
- light/dark lockup treatment
- app icon and favicon presentation
- desktop product-header mock
- activity-state system

The showcase references the candidate SVG masters directly from `products/pock/candidate/`. It does not duplicate the brand assets and does not alter runtime semantics.

## ImageToCode QA

The full local implementation was rendered in headless Chromium at:

- desktop: 1440 × 1000
- mobile: 390 × 844

Observed result:

- zero page errors
- zero console errors
- no desktop horizontal overflow after layout correction
- responsive state-grid collapse
- reduced-motion-safe static presentation

This remains review material while POCK identity status is candidate/review-gated.