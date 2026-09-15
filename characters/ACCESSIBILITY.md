# Aftergraph Character System — Accessibility Contract

The character is a view of actor state, never the source of operational truth. Every product surface must expose the state in text or another non-visual semantic channel; color alone must never communicate role, attention, approval, completion, or verification.

## Semantic and decorative modes

Use `visualMode: "semantic"` when the character is the accessible state representation. Supply `ariaLabel`, or synthesize one from actor label, role, state, progress, and attention. Use `visualMode: "decorative"` only when equivalent state text is adjacent; the character must then be `aria-hidden="true"`.

## Reduced motion

Honor `prefers-reduced-motion: reduce`. Replace looping orbit, breathing, scan, pulse, and progress motion with the static pose listed in `accessibility.json`. A transition may not be the only indication that state changed.

## Truth boundaries

`completed` means execution finished; it does not mean verified, accepted, correct, or approved. `verifying` is an activity and is not a verdict. Verification verdicts and evidence must be exposed as independent text/data, not inferred from character pose, color, expression, or animation.

## Color, focus, and interaction

State identity requires a text label plus a non-color cue. Interactive cards retain normal keyboard focus and target-size requirements independently of the character art. Character SVGs do not become controls merely because they are animated; actions such as approve, reject, inspect evidence, retry, or open details remain explicit UI controls with accessible names.
