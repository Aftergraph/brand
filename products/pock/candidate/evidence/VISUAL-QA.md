# POCK Orb-O candidate — visual QA

**Scope:** candidate identity only  
**Branch:** `brand/pock-canonical-v1`  
**Target:** small-size legibility, silhouette separation, endorsed lockup readability, and state-semantic separation.

## Render matrix

Candidate SVGs were rasterized at:

- 16 px
- 32 px
- 64 px
- 128 px
- 256 px
- app-icon source scale: 1024 px

The comparison covered:

- Orb-O symbol
- app icon
- favicon
- idle
- working
- searching
- solving
- needs-you
- verified
- error

## Findings

### PASS — identity

- Orb-O retains the ring + satellite signature through 16 px.
- App icon retains the Orb-O silhouette at 16/32/64 px.
- Favicon remains legible at 16 px.
- The dark endorsed lockup remains readable and visibly separates POCK product identity from the `BY AFTERGRAPH` endorsement.
- The lockup tagline remains secondary to the product name.

### FIXED — state collision

Initial QA found two weak small-size distinctions:

1. `working` read too much like a double-ring variation.
2. `needs-you` shared too much silhouette with `idle` at 16–32 px.

Corrections:

- `working` now uses an open orbital arc + satellite marker.
- `needs-you` now uses a full amber ring + strong filled center marker.

This preserves a distinct silhouette independent of animation.

### PASS — state grammar after correction

At 16–128 px:

- `idle`: uninterrupted single ring
- `working`: open orbital arc + satellite
- `searching`: dotted ring + center point
- `solving`: interlocking multi-loop knot
- `needs-you`: ring + filled center signal
- `verified`: ring + check
- `error`: ring + cross

Critical states therefore do not depend on color alone.

## Accessibility / usage contract

- Below **24 px**, state icons MUST be accompanied by accessible text, an `aria-label`, or adjacent state copy. The icon must not be the sole semantic carrier.
- Motion is optional enhancement only. Static silhouettes must preserve state meaning.
- `verified` artwork is a UI state projection only. It is never verification evidence by itself.
- `needs-you` must map to an actual user-attention state; it must not be used decoratively.
- Do not infer runtime truth from glow, color, animation, or state-orb appearance.

## Promotion result

**Visual QA: PASS with corrections.**

Remaining promotion gates:

1. Brand governance approval / PR #38 merge decision.
2. Canonical-path promotion after approval.
3. Consumer integration into `Aftergraph/Pock-bot`.
4. Runtime screenshot QA in the actual POCK shell.
