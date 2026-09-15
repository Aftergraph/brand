# Character authoring evidence

External review gates are intentionally separate from automated SVG and runtime validation.

Run `npm run character:authoring:preflight` immediately before external review. It records the exact Git candidate, canonical source hashes, and the currently verified Rive runtime hash in the ignored `authoring-preflight.json` file.

## Illustrator gate

1. Copy `illustrator-roundtrip.template.json` to `illustrator-roundtrip.json`.
2. Use the candidate commit and input SHA-256 from `authoring-preflight.json`.
3. Perform every checklist item from `characters/ci/ci-checks.yml` in Adobe Illustrator.
4. Record the saved SVG SHA-256 and set `pass: true` only after reopen verification succeeds.

## Rive gate

The runtime asset is authored in-repo with the official Rive CLI. Run `npm run character:rive:verify` and `npm run character:rive:qa`; then use `characters/motion/rive/runtime-manifest.json` as the cryptographic evidence binding for the tracked `.riv`. `rive-authoring.template.json` is retained as an optional review record when a human inspects or refines the file in Rive Editor.

## Human brand review

Copy `human-brand-review.template.json` to `human-brand-review.json` and review `characters/review/index.html`. A reviewer must explicitly score every criterion; automated tests do not satisfy this gate.

Evidence files must never claim a tool or review was performed when it was not. **Characters are a view. Evidence is the truth.**
