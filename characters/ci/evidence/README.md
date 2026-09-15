# Character authoring evidence

External authoring gates are intentionally separate from automated SVG validation.

Run `npm run character:authoring:preflight` immediately before an external authoring session. It records the exact Git candidate and SHA-256 hashes of canonical source files in the ignored `authoring-preflight.json` file.

## Illustrator gate

1. Copy `illustrator-roundtrip.template.json` to `illustrator-roundtrip.json`.
2. Use the candidate commit and input SHA-256 from `authoring-preflight.json`.
3. Perform every checklist item from `characters/ci/ci-checks.yml` in Adobe Illustrator.
4. Record the saved SVG SHA-256 and set `pass: true` only after reopen verification succeeds.

## Rive gate

Copy `rive-authoring.template.json` to `rive-authoring.json` only after the canonical SVG has been imported into Rive Editor, rig/state-machine authoring is complete, a `.riv` runtime file has been exported, and SVG/runtime parity has been reviewed.

## Human brand review

Copy `human-brand-review.template.json` to `human-brand-review.json` and review `characters/review/index.html`. A reviewer must explicitly score every criterion; automated tests do not satisfy this gate.

Evidence files must never claim a tool or review was performed when it was not. **Characters are a view. Evidence is the truth.**
