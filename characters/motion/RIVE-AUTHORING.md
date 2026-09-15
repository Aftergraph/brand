# Rive authoring contract

The editable SVG source tree remains the source of truth. Rive is a derived runtime-delivery layer and does not replace `characters/source/`.

## Canonical projection

`npm run character:rive:generate` deterministically projects the governed role × state SVG compositions into a Rive CLI source project under `characters/motion/rive/`. The project uses RML for the 512 × 512 `ActorPresence` artboard and View Model contract, plus Luau for native vector drawing. No PNG, WebP, or flattened raster is embedded in the runtime asset.

The `ActorPresence` View Model exposes `role`, `state`, `attention`, and `reducedMotion`. `completed` is execution state, not an independent verification verdict. `verifying` is an activity. Evidence, approval, and verification truth stay outside the character state machine.

## Runtime binary

`npm run character:rive:build` uses the official Rive CLI `--once` build to produce `characters/motion/rive/build/aftergraph_actor_presence.riv`. The `.riv` file is a derived runtime artifact. `runtime-manifest.json` binds that binary by SHA-256 to the generated RML, Luau, and canonical source manifest.

The build is reproducible: identical generated inputs must produce a byte-identical unsigned runtime file. The Rive Editor remains an optional inspection/refinement surface; it is no longer a prerequisite for producing the canonical runtime binary because the official Rive CLI can author the RML/Luau project directly.

## Runtime verification

`npm run character:rive:verify` checks source drift and Rive CLI problems. `npm run character:rive:qa` rebuilds the runtime asset, renders all eleven canonical states across all six roles through headless Rive, and round-trips the bound View Model values. The QA run uses `reducedMotion=true` so the captured frame is a stable static semantic representation.

Required invariants:

1. `characters/source/` remains canonical.
2. `ActorPresence` stays exactly 512 × 512.
3. All 6 roles and 11 states remain addressable from the bound View Model.
4. Headless runtime renders are non-empty and state-distinct.
5. `runtime-manifest.json` hashes match the tracked `.riv`, RML, Luau, and source manifest.
6. No character state is treated as proof of approval, evidence, or verification.

**Characters are a view. Evidence is the truth.**
