# Aftergraph Character Motion Specification

Motion communicates **activity, attention, and transition**. It never upgrades operational truth. A character may look completed only because runtime state is `completed`; it may not animate itself into a verified or approved state.

## Layers

- **Micro motion:** blink, subtle breathing, low-amplitude halo drift.
- **State loop:** thinking orbit, execution edge flow, inspection lens, waiting pulse, verification scan.
- **Transition:** short movement between runtime states; transitions are capped at 500 ms.
- **Attention signal:** blocked and approval-required may pulse, but must also expose text/non-color cues.
- **Terminal transition:** completed/failed play once and settle to a static pose.

All authored clips and timing live in `motion.json`. Product implementations must use the runtime-projected state as the input; animation time cannot advance the actor lifecycle.

## Reduced motion

When `reducedMotion` is true, every state resolves directly to its `reduced.clip`. All reduced variants are static and non-looping. This mirrors `characters/accessibility.json` and `prefers-reduced-motion` behavior.

## Rive implementation

The Rive state machine consumes `role`, `state`, `attention`, and `reducedMotion`. The `.riv` runtime file remains editor-authored and parity-gated; this specification is the machine-readable contract used to author and review it.
