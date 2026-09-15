# Aftergraph Character System v1

> **Characters are a view. Evidence is the truth.**

This directory defines Aftergraph's canonical **actor-presence asset language**. Characters are human-readable role archetypes for interfaces and communication; they are not product logos, repository identities, or sources of operational truth.

## Delivery

The canonical authoring source is now the layered, compositional tree under `source/`: `source/master/base-character.svg` + `source/master/anchors.json` + `source/roles/roles.svg` + `source/states/states.svg`. These files preserve independently editable anatomy, stable pivots, role props, state props, and Brand OS token bindings.

> **Deprecated:** `character-sprite.svg` is the legacy 23-symbol flattened compatibility sprite. Do not add new authoring work to it and do not treat it as source of truth. It remains temporarily available for existing consumers while they migrate to composition-derived exports.

The earlier glossy 3D artwork remains a separate raster concept/campaign pack. It is not presented as vector artwork and is not the source of runtime truth.

## Canonical roles

`entity`, `guide`, `builder`, `verifier`, `observer`, `researcher`.

Role names are deliberately generic. Product names are not baked into the character contract. This keeps character identity independent from repository naming and from governed naming-review blockers.

## State invariant

A product may render a character state only from actual runtime state. `completed` means actor execution completed; it does **not** establish independent verification. Approval, evidence and verified outcomes remain governed by their canonical system records.

## Usage

New consumers compose the canonical base anatomy with one generic role module and one runtime-derived state module. Consumers must provide adjacent text/status semantics for consequential states; character pose or color is never the sole signal.

### Migration from `character-sprite.svg`

1. Stop authoring or extending `#ag-role-*`, `#ag-avatar-*`, and `#ag-state-*` in the legacy sprite.
2. Use `source/master/base-character.svg` as canonical anatomy and `source/master/anchors.json` as the pivot/attachment contract.
3. Attach role props from `source/roles/roles.svg` and state props/pose metadata from `source/states/states.svg`.
4. Generate runtime SVG/sprite/raster outputs from this compositional source; never edit derived exports by hand.
5. Keep the legacy sprite only as a compatibility input until each consuming surface has migrated.

## Source and generation

- `source/master/base-character.svg` — canonical editable 512×512 anatomy.
- `source/master/anchors.json` — stable joint, pivot, and prop anchors.
- `source/roles/roles.svg` — six editable role-prop symbols.
- `source/states/states.svg` — eleven editable state-prop/pose symbols.
- `source/icons/icon-mapping.json` — Supporting Icons v1 reuse/new diff against Brand OS semantics.
- `contracts/components.d.ts` — actor-presence component data contracts.
- `ci/ci-checks.yml` — Illustrator roundtrip and visual-regression gate contract.
- `governance/product-aliases.json` — product-to-generic-role alias boundary.
- `roles.json`, `states.json`, `manifest.json` — compatibility/runtime registries.
- `character-sprite.svg` — **deprecated** generated compatibility sprite.

`npm run generate` still reproduces the deprecated sprite for compatibility. New generation work must target composition-derived exports from `source/`.

## Compositional production pipeline

`npm run generate` now produces the deterministic compositional vector layer under `generated/`: six standalone roles, eleven standalone states, six avatars derived from the same head anatomy, all sixty-six role × state combinations, eleven newly required supporting icons, and integrity manifests. Derived files are never hand-authored; `scripts/compose-characters.mjs --check` and `scripts/generate-character-icons.mjs --check` reject drift.

Additional canonical source modules are:

- `source/expressions/expressions.svg` + `expressions.json` — operational face/expression vocabulary and state defaults.
- `source/rig/rig.json` — pivot hierarchy and bounded joint rotation contract.
- `source/icons/new-icons.svg` — only the Supporting Icons v1 concepts that could not reuse Brand OS semantics.
- `accessibility.json` + `ACCESSIBILITY.md` — semantic/decorative modes, non-color cues, and reduced-motion fallbacks.
- `contexts.json` — governed dark, light, transparent, and high-contrast visibility QA contexts.

## QA and release exports

`npm run character:qa` executes geometry bounds, small-size rendering, context visibility, and Puppeteer + pixelmatch visual regression. Baseline snapshots are committed; transient actual/diff images are not.

`npm run character:export` creates a release-only `exports/characters/` tree containing **100 governed assets × 4 formats**: editable SVG plus PNG, WebP, and AVIF derivatives, each with byte size and SHA-256 in the release manifest. Raster derivatives are reproducible release artifacts and are intentionally not canonical source.

## Motion layer

`motion/rive-import-manifest.json` and `motion/RIVE-AUTHORING.md` define the Rive handoff. SVG remains canonical. A `.riv` file must be authored/exported through Rive Editor and parity-verified before it can be registered as a runtime artifact; no `.riv` file is claimed by this repository yet.

## Production sprites

`generated/sprites/characters.svg` is the compositional SVG sprite and contains **89 namespaced symbols**: six roles, eleven states, six avatars, and all sixty-six role × state combinations. `generated/sprites/icons.svg` contains the eleven new Supporting Icons v1 symbols. Internal IDs and gradient references are namespaced per symbol so sprite composition cannot collide in the DOM.

The root-level `character-sprite.svg` remains the deprecated 23-symbol compatibility artifact; do not confuse it with the compositional sprite under `generated/sprites/`.

## Motion vocabulary

`motion/motion.json` defines the machine-readable motion vocabulary and state transitions. Normal motion may loop for active states; every reduced-motion variant is static and non-looping. Motion can communicate activity and attention only and cannot establish evidence, approval, or verification.

## Themes and release exports

The editable source is authored once. `characters/themes.json` derives dark and light product variants from canonical Brand OS tokens; theme variants are generated outputs and must never be hand-edited.

- Dark generated vectors: `characters/generated/{roles,states,avatars,compositions}`.
- Light generated vectors: `characters/generated/themes/light/{roles,states,avatars,compositions}`.
- Dark runtime sprite: `characters/generated/sprites/characters.svg`.
- Light runtime sprite: `characters/generated/themes/light/sprites/characters.svg`.
- Theme-neutral supporting icons: `characters/generated/sprites/icons.svg`.
- Release exporter: `npm run character:export` creates SVG, PNG, WebP, and AVIF variants plus a SHA-256 manifest under `exports/characters/`.

The release exporter contains 89 dark character assets, 89 light character assets, and 11 theme-neutral supporting icons: 189 governed logical assets / 756 format files. Raster files are delivery artifacts only; the layered SVG source tree remains canonical.
