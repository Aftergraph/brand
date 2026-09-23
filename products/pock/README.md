# POCK product identity

**Status:** canonical / active  
**Owner:** Aftergraph  
**Product identity:** **POCK**  
**Mark:** **Orb-O**  
**Endorsement:** **POCK by Aftergraph**  
**Tagline:** **AI teammates. Real work.**

## Brand architecture

POCK is an endorsed Aftergraph product. Orb-O is POCK's product mark and does not replace the Aftergraph master brand.

The canonical public asset family lives directly under `products/pock/`. The reviewed `candidate/` tree remains preserved as provenance for PR #38.

## Canonical hierarchy

```text
products/pock/
├── manifest.json
├── README.md
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
├── evidence/
│   ├── source-registry.json
│   ├── canonical-assets.json
│   └── VISUAL-QA.md
└── showcase/
    ├── index.html
    ├── styles.css
    ├── README.md
    ├── design-qa.md
    └── reference/
        └── activity-states.html
```

## State grammar

- `idle`: uninterrupted single ring
- `working`: open orbital arc + satellite
- `searching`: dotted ring + center point
- `solving`: interlocking multi-loop knot
- `needs-you`: amber ring + filled center signal
- `verified`: ring + check
- `error`: ring + cross

Below 24 px, the icon is never the sole semantic carrier.

## Runtime boundary

Brand and activity visuals are presentation. They never create or imply runtime authority, approval, completion, or verification evidence. `verified` may project a verified runtime state only after the runtime already owns that truth.
