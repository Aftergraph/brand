# POCK ImageToCode Design QA

**Date:** 2026-09-23  
**Scope:** `products/pock/candidate/showcase/`  
**Final result:** **blocked**

## Comparison target

### Source visual truth

1. POCK Brand Overview board
   - generated source: `pock_brand_identity_overview.png`
   - source pixels: 1448 × 1086
2. POCK Brand in Use board
   - generated source: `pock_brand_i_brug_viste_sig.png`
   - source pixels: 1448 × 1086
3. POCK Activity States board
   - generated source: `pock_aktivitetsikoner_brandark.png`
   - source pixels: 1448 × 1086

### Rendered implementation evidence

- browser-rendered desktop implementation capture: 1440 px CSS viewport, device scale factor 1
- browser-rendered mobile implementation capture: 390 px CSS viewport, device scale factor 1
- observed browser result before this QA comparison:
  - page errors: 0
  - console errors: 0
  - desktop horizontal overflow: none

For full-view comparison, the 1440 px desktop capture was normalized to the source-board width and each major section was compared against its corresponding source board.

## Required fidelity surfaces

### Fonts / typography

**P2 — Brand in Use title wraps differently**

Source: `Brand in Use` is one visual line.

Implementation: the title wraps to two lines at the desktop comparison width because the title scale is too large for its left column.

Impact: materially changes the source composition and pushes the visual weight too far left.

Fix:
- reduce desktop `.use-title-block h2` scale;
- widen the title column enough to preserve a single-line heading at 1440/1448 px;
- keep the mobile wrap behavior independent.

### Spacing / layout rhythm

**P2 — Overview primary lockup is under-scaled**

Source: POCK occupies substantially more of the dark upper field and acts as the dominant mark.

Implementation: the same lockup is visibly smaller; the right-side app icon / Orb-O group therefore competes more strongly than intended.

Fix:
- increase `.brand-lockup-hero` desktop scale;
- retune `.overview-primary` tracks so the left identity block regains source dominance.

**P2 — Light/dark mode lockups are under-scaled**

Source: POCK fills most of each mode card and is the obvious first read.

Implementation: the lockups have excess whitespace and reduced visual authority.

Fix:
- increase `.brand-lockup-card`;
- preserve existing card padding/radius rather than shrinking the cards.

**P3 — Activity section is vertically more compressed than the reference**

Implementation is readable and balanced, but the state system has less breathing room and slightly smaller state symbols than the source.

Follow-up:
- raise desktop state-icon size modestly;
- increase activity-section top/bottom rhythm without affecting tablet/mobile collapse.

### Colors / tokens

No P0/P1/P2 token mismatch found.

Implementation uses the governed POCK palette:
- Ink `#0B0D12`
- Cobalt `#3D63FF`
- Violet `#7C5CFF`
- Cyan `#22D3EE`
- Verified `#27C7A1`
- Needs You `#F3A83B`
- Error `#EF4444`

The source boards use the same overall palette family.

### Image quality / asset fidelity

PASS for asset type.

The implementation consumes the candidate SVG masters directly rather than substituting CSS-drawn logos or raster crops:
- Orb-O symbol
- app icon
- favicon
- state icons

This is the correct implementation boundary.

### Copy / content

Primary brand copy matches:
- `POCK`
- `By Aftergraph`
- `AI teammates. Real work.`
- `Brand in Use`
- activity state names

### Intentional source divergence

**BLOCKER — Needs You source board is stale relative to governed candidate asset**

The generated Activity States board shows an amber ring with an exclamation-style interior.

The governed candidate asset was subsequently changed during small-size falsification to:
- amber ring
- strong filled center marker

Reason: the earlier state collided too strongly with `idle` at 16–32 px.

Therefore the current implementation is correct against the governed asset, while the source board is no longer the exact current design truth.

Required resolution before strict visual-fidelity PASS:
- regenerate the Activity States reference board from the current governed state family, **or**
- explicitly designate the old exclamation board as historical reference only.

## Responsiveness

Desktop:
- no horizontal overflow observed at 1440 px;
- all three brand surfaces remain readable.

Mobile:
- 390 px browser capture completed with no page/console errors;
- major grids collapse without persistent-control clipping;
- no separate mobile source visual exists for strict pixel fidelity, so mobile QA is resilience-only rather than source-match QA.

## Comparison history

### Pass 1

Findings:
1. P2 overview primary lockup under-scaled.
2. P2 light/dark lockups under-scaled.
3. P2 Brand in Use heading wraps unlike source.
4. P2 source/asset conflict for Needs You state.
5. P3 activity section vertically compressed.

No P0 or P1 issue was found.

No visual fix is claimed in this pass. The result remains blocked until P2 findings are corrected and a revised browser-rendered capture is compared again.

## Implementation checklist

1. Increase desktop primary POCK lockup scale.
2. Increase mode-card lockup scale.
3. Keep `Brand in Use` on one line at the desktop source width.
4. Regenerate/update the Activity States source board to the current Needs You marker.
5. Recapture desktop at 1448 × 1086-equivalent comparison state.
6. Recapture 390 px mobile regression.
7. Re-run source-vs-implementation comparison.
8. Mark `final result: passed` only when no actionable P0/P1/P2 difference remains.
