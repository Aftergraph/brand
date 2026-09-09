# Migration: Brand OS 1.0 → 1.1

## Compatibility

Existing `@aftergraph/brand`, `/tokens.css`, `/tokens.json`, `/react`, and `/svg/*` import paths remain valid. Primitive palette values remain unchanged.

## Required consumer changes

1. Replace the README marker with `<!-- aftergraph-brand-os:v1.1.0 -->`.
2. Replace schema `aftergraph.brand-assets/1.0` with a `schema_version: 2` contract using `schemas/brand-assets.schema.json`.
3. Set the correct class: corporate, product, technology, research, governance, or internal.
4. Remove current public parent copy naming ABDE Intelligence or AVC; retain it only in clearly historical provenance.
5. Consume semantic state aliases instead of local hex mappings.
6. Use the micro mark below 24 px and the favicon exports under `exports/favicon/`.
7. Treat locally required GitHub assets as generated/deployed copies with brand version and source commit; do not declare them canonical.

## Visual change

Canonical wordmarks and lockups are clean identity geometry. Taglines and explanatory copy move into page layout or social templates. This prevents logos from becoming unreadable content blocks at small sizes.

