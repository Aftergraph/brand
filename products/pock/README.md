# POCK product identity — review record

**Status:** proposed / needs brand-architecture review  
**Owner:** Aftergraph  
**Candidate identity:** **Orb-O**  
**Candidate tagline:** **AI teammates. Real work.**

## Evidence recovered

The September 22, 2026 POCK branding work produced a consistent candidate family centered on the Orb-O mark:

- POCK wordmark with the `O` rendered as a blue → violet → cyan activity/orb symbol.
- A smaller satellite dot at the upper-right of the orbital mark.
- Dark and light lockups.
- Standalone app icon / favicon treatment.
- Monochrome treatment.
- Activity-orb state family.
- Brand-system compositions using Space Grotesk for brand/headlines and Inter for UI/body.
- Candidate palette observed in the brand-system grid:
  - Ink `#0B0D12`
  - Cloud `#F6F7FB`
  - Cobalt `#3D63FF`
  - Violet `#7C5CFF`
  - Mint / Verified `#27C7A1`
  - Amber / Needs You `#F3A83B`

Recovered candidate asset names from the working set include:

- `POCK-logo med lysende orb.png`
- `POCK-logo med glødende planetemblem.png`
- `POCK brandidentitet og logopakke.png`
- `POCK Brand System Grid.png`
- `POCK brandguide med AI-orbtema.png`
- `Neon planetorbit i mørk appikon.png`

These are evidence of the design direction, not yet repository-canonical production assets.

## Canonical collision

Current `BRAND-ARCHITECTURE.md` defines **Aftergraph as the master brand** and product treatment as:

> `AFTERGRAPH / PRODUCT`

with an endorsed lockup, product motif, limited accent, and no implication that a repository/service automatically becomes an independent brand.

The recovered POCK work is visually closer to an autonomous identity than the current product rule permits.

Therefore this change intentionally **does not**:

- add POCK to `registry.json` as an active product,
- declare the Orb-O mark canonical,
- replace Aftergraph's master mark,
- create public-release assets,
- or alter the master-brand architecture.

## Decision required

Resolve one of these explicitly before canonical asset import:

1. **Endorsed POCK** — preserve Orb-O as a product motif/symbol but use an `AFTERGRAPH / POCK` or `POCK by Aftergraph` endorsed lockup.
2. **Exception / sub-brand** — amend Brand Architecture to permit POCK a stronger autonomous identity while retaining explicit Aftergraph ownership/endorsement.
3. **Master-brand only** — retire the autonomous POCK wordmark and use Aftergraph product syntax exclusively.

## Proposed asset hierarchy after decision

```text
products/pock/
├── manifest.json
├── README.md
├── identity/
│   ├── lockup-dark.svg
│   ├── lockup-light.svg
│   ├── symbol.svg
│   └── monochrome.svg
├── app/
│   ├── app-icon.svg
│   └── favicon.svg
├── states/
│   ├── idle.svg
│   ├── working.svg
│   ├── searching.svg
│   ├── solving.svg
│   ├── needs-you.svg
│   ├── verified.svg
│   └── error.svg
└── evidence/
    └── source-registry.json
```

The production SVGs should be reconstructed/vectorized from the approved mark, not treated as screenshots cropped out of a brand board.

## Runtime boundary

The Orb-O and activity-orb visuals are presentation only. They must never become evidence of completion, approval, or verification. POCK runtime state remains governed by its canonical execution and verification contracts.
