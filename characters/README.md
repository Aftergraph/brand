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
