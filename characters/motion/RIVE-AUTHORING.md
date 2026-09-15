# Rive authoring contract

The editable SVG source tree remains the source of truth. Rive is a motion-authoring and runtime-delivery layer; it does not replace `characters/source/`.

## Import

Import `characters/source/master/base-character.svg` into the Rive Editor. Imported SVG artwork is converted into native Rive vector objects such as groups, shapes, paths, fills, and strokes. Reconstruct role props, state props, and expression variants from the governed source modules using `rive-import-manifest.json` and the locked anchor/rig contracts.

The artboard is exactly **512 × 512** and is named `ActorPresence`. Preserve the semantic layer names listed in the import manifest. Do not flatten role, state, face, halo, hand, limb, or shading groups into a single image.

## Motion state machine

Create one state machine named `ActorPresence`. Bind `role`, `state`, `attention`, and `reducedMotion` from the runtime projection. `completed` is not a verification verdict. `verifying` is an activity. Evidence and independent verification remain outside the animation state machine.

When `reducedMotion` is true, use the static equivalents defined in `characters/accessibility.json`; do not run looping breathing, orbit, scan, pulse, or progress animation.

## Runtime artifact boundary

A `.riv` file is the binary runtime format exported from the Rive Editor. It is a derived runtime artifact, not the canonical source. The Rive runtime consumes that exported file; it is not the authoring API for creating or modifying the `.riv` container.

Do not attempt to generate a `.riv` file from the runtime libraries or by serializing an invented binary format. The required gate is editor authoring followed by runtime export and parity verification against the canonical SVG sources.

## Evidence required before `runtimeFile.status` can change

1. Rive Editor version and operator recorded.
2. Canonical source commit and SHA-256 recorded.
3. Required artboard/layers present after import.
4. All six roles and eleven states exercised.
5. Reduced-motion branch exercised.
6. Browser/runtime screenshots compared to approved SVG baselines.
7. Exported `.riv` SHA-256 recorded.
8. No character state is treated as proof of approval, evidence, or verification.

References: Rive documentation on SVG assets, runtime export, and `.riv` format (`rive.app/docs`).
