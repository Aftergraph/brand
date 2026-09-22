# POCK product identity — review record

**Status:** proposed / needs brand-architecture review  
**Owner:** Aftergraph  
**Selected working direction:** **Endorsed POCK**  
**Candidate identity:** **Orb-O**  
**Endorsement:** **POCK by Aftergraph**  
**Candidate tagline:** **AI teammates. Real work.**

## Direction

POCK remains owned and endorsed by Aftergraph while retaining a distinctive product motif. The Orb-O is therefore developed as a POCK product symbol, not as a replacement for the Aftergraph master brand.

The candidate asset family lives under `products/pock/candidate/` until PR #38 resolves promotion.

## Recovered evidence

The September 22, 2026 branding work consistently used:

- a POCK wordmark where the `O` becomes a blue → violet → cyan orbital mark;
- a smaller satellite dot at the upper-right;
- dark/light lockups;
- app-icon and favicon forms;
- monochrome treatment;
- activity-orb states;
- Space Grotesk for brand/headlines and Inter for UI/body;
- the tagline **AI teammates. Real work.**

Source identity and provenance are recorded in `candidate/evidence/source-registry.json`. Raw source hashing is explicitly marked BLOCKED because the project-library source bytes could not be materialized; hashes are not invented.

## Candidate hierarchy

```text
products/pock/
├── manifest.json
├── README.md
└── candidate/
    ├── tokens.json
    ├── identity/
    │   ├── symbol.svg
    │   ├── lockup-dark.svg
    │   ├── lockup-light.svg
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

## Promotion gate

Candidate assets may move into canonical identity paths only after:

1. Brand OS validation and tests pass.
2. PR #38 explicitly approves endorsed POCK treatment.
3. The asset family is visually reviewed at small and large sizes.
4. Source provenance remains attached.
5. Runtime semantics remain separate from the activity-orb visual layer.

## Runtime boundary

Activity orbs are descriptive presentation. A green or `verified` visual must never itself be treated as verification evidence. Approval, completion, authority, and verification remain governed by POCK/Aftergraph runtime contracts.
