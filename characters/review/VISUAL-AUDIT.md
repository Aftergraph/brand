# Character System visual audit

**Status:** machine-assisted visual QA only. This document does not satisfy the human brand-review gate.

The review surface is `characters/review/index.html`. It renders the generated SVG source directly and exposes both themes, all six roles, all eleven runtime states, twelve theme-specific avatar previews, the complete 132-card role×state review matrix, and the eleven new supporting icons.

## Findings addressed in this wave

1. **Incomplete full-page review capture.** Lazy-loaded SVGs caused lower matrix rows and theme-switched assets to appear blank in screenshots. The review generator now eagerly loads every asset and tests reject reintroduction of `loading="lazy"`.
2. **Role/state prop collisions.** Right-anchored role props overlapped right-anchored state props in non-idle compositions. Composition now preserves the runtime state on its canonical anchor and resolves a colliding role prop to the opposite governed slot.
3. **Light-theme entity face contrast.** Generic light-theme token substitution made the neutral entity eyes dark against the dark visor. The light theme now has an explicit Brand OS-token-bound entity face override while structural white still maps to light-theme text for outline contrast.
4. **Review completeness.** Avatars and the eleven new supporting icons are now included alongside roles, states, and compositions.

## Current visual observations

- The head/visor/halo silhouette remains consistent across every role because all derivatives share the same canonical anatomy.
- Role identity is carried by accent + prop rather than separate mascot geometry.
- State meaning is carried by a state prop, pose metadata, and expression rather than color alone.
- Role and state props remain simultaneously visible after slot resolution instead of hiding or merging either semantic layer.
- Dark and light themes preserve the same geometry and use only governed Brand OS token transformations.
- Supporting icons remain a separate 24×24 stroke family and do not replace Brand OS semantic icons that are already canonical.

## Deliberately still open

- Adobe Illustrator roundtrip has not been performed; editable-group/gradient survival must be evidenced in the actual application.
- Rive CLI authoring and headless runtime QA are implemented and a tracked `.riv` binary is claimed through `characters/motion/rive/runtime-manifest.json`; optional human inspection in Rive Editor is still available but is not a release blocker.
- Human brand review has not been performed. The reviewer must explicitly assess silhouette, role differentiation, state legibility, prop balance, dark/light behavior, compact readability, brand fit, and the evidence/truth boundary.

Automated visual checks can reject clipping, drift, missing renders, and known contrast regressions. They cannot approve aesthetic quality or institutional brand fit.

## Regression cases added from visual review

The visual baseline suite now includes explicit regression cases for `builder+thinking`, `verifier+verifying`, `observer+blocked`, and `researcher+approval-required` so role/state slot collisions cannot silently return. It also includes `light/entity+idle` and `light/builder+thinking` against the light canvas so the light-theme face-contrast and themed composition behavior are pinned by pixel regression.

These cases supplement the base/role/state baselines; they do not turn pixel equality into aesthetic approval.
