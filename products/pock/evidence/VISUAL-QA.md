# POCK Orb-O canonical visual QA

**Status:** PASS  
**Promotion:** Aftergraph/brand#38

## Small-size render matrix

Reviewed at 16, 32, 64, 128 and 256 px, with the app-icon master at 1024 px.

### Identity

- Orb-O retains ring + satellite recognition through 16 px.
- App icon remains legible at 16/32/64 px.
- Favicon remains legible at 16 px.
- Endorsed lockups keep POCK primary and Aftergraph secondary.

### State grammar

- `idle`: uninterrupted single ring
- `working`: open orbital arc + satellite marker
- `searching`: dotted ring + center point
- `solving`: interlocking multi-loop knot
- `needs-you`: amber ring + filled center signal
- `verified`: ring + check
- `error`: ring + cross

The final `working` and `needs-you` forms were corrections discovered during falsification; critical states therefore do not depend on color alone.

## Accessibility / runtime boundary

- Below **24 px**, state icons MUST be accompanied by accessible text, an `aria-label`, or adjacent state copy.
- Motion is enhancement only; static silhouettes preserve meaning.
- `verified` artwork is a projection only, never verification evidence.
- `needs-you` is used only for actual human-attention state.
- Glow, color, animation and branding never establish runtime truth or authority.

**Final visual QA: PASS.**
