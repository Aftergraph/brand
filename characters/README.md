# Aftergraph Character System v1

> **Characters are a view. Evidence is the truth.**

This directory defines Aftergraph's canonical **actor-presence asset language**. Characters are human-readable role archetypes for interfaces and communication; they are not product logos, repository identities, or sources of operational truth.

## Delivery

The canonical product form is `character-sprite.svg`: one native SVG sprite containing 23 symbols (6 role characters, 6 avatars, 11 shared states). `manifest.json` provides stable symbol IDs and machine-readable bindings.

The earlier glossy 3D artwork remains a separate raster concept/campaign pack. It is not presented as vector artwork and is not the source of runtime truth.

## Canonical roles

`entity`, `guide`, `builder`, `verifier`, `observer`, `researcher`.

Role names are deliberately generic. Product names are not baked into the character contract. This keeps character identity independent from repository naming and from governed naming-review blockers.

## State invariant

A product may render a character state only from actual runtime state. `completed` means actor execution completed; it does **not** establish independent verification. Approval, evidence and verified outcomes remain governed by their canonical system records.

## Usage

For a sprite-capable surface, reference the symbol registered in `manifest.json`, for example `#ag-role-builder`, `#ag-avatar-verifier`, or `#ag-state-approval-required`. Consumers must provide adjacent text/status semantics for consequential states; character pose or color is never the sole signal.

## Source and generation

- `roles.json` — archetypes and canonical palette-token bindings.
- `states.json` — actor-state vocabulary and attention semantics.
- `manifest.json` — asset registry and semantic-icon bindings.
- `character-sprite.svg` — generated native SVG asset sprite.
- `../scripts/generate-characters.mjs` — deterministic source generator.

Run `npm run generate` from the Brand OS root to regenerate the sprite.
