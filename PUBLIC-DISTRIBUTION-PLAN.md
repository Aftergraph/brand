# Aftergraph Public Distribution Plan

**Status:** active public-discoverability plan  
**Canonical organization:** https://github.com/Aftergraph  
**Communications source:** [`PUBLIC-LAUNCH-KIT.md`](./PUBLIC-LAUNCH-KIT.md)  
**Evidence source:** `Aftergraph/intelligence-systems-research`

This plan turns the launch kit into a repeatable distribution program without promoting a research draft beyond its evidence.

## 1. Launch order

Use this order so every external post has a credible destination before traffic arrives.

1. GitHub organization front door
2. Intelligence Systems Research
3. AIE
4. Trust Gateway
5. WORKS
6. Work Intelligence
7. Governance
8. Studio / product surface

The public story is:

`research → institution semantics → enforcement → execution → work intelligence → governance → product experience`

## 2. Primary audiences

| Audience | Lead with | Destination |
|---|---|---|
| AI / systems researchers | SPEC-001, MISSION-Bench, falsification, reproducibility | `intelligence-systems-research` |
| Agent-framework implementers | portable mission and authority semantics | `aie`, research |
| Security / IAM engineers | attenuation, revocation, fail-closed enforcement, evidence | `aie`, `trust-gateway` |
| Distributed-systems engineers | durable execution, leases, recovery, evidence | `works-execution` |
| Product / agent-UX teams | verified outcomes, approvals, Needs You, durable work | `studio`, `work-intelligence-v2` |
| Standards practitioners | conformance, protocol composition, independent implementation | `aie`, governance, research |

## 3. Channel sequence

### Wave A — technical discovery

Publish the canonical technical introduction on:

- Hacker News / Show HN when the chosen repository is runnable and the title accurately reflects maturity;
- relevant Reddit developer/research communities;
- X technical thread;
- LinkedIn engineering/research post;
- GitHub repository releases for meaningful public milestones.

Every post should use one concrete call to action: reproduce, implement, attack, review, or run.

### Wave B — research outreach

Target researchers and standards practitioners with the research/standards email from `PUBLIC-LAUNCH-KIT.md`.

Prioritize communities working on:

- autonomous agents;
- agent evaluation;
- AI assurance / TEVV;
- authorization and delegated authority;
- MCP / A2A interoperability;
- SPIFFE identity;
- distributed systems and durable execution.

### Wave C — evidence-led follow-ups

Do not repeatedly repost the organization pitch. Follow with artifacts:

1. SPEC-001 architecture / formal model
2. MISSION-Bench design and fault injections
3. authority attenuation and revocation
4. Cost Per Verified Outcome / control-plane economics
5. AIE interoperability milestones
6. Trust Gateway fail-closed runtime demo
7. WORKS durable execution demo
8. Studio human-control experience

Each follow-up must link to its source repository rather than laundering evidence through a social post.

## 4. Weekly cadence

A sustainable cadence is more valuable than a 48-hour burst followed by archaeological silence.

- **1 technical artifact post / week**
- **1 short progress/evidence update / week**
- **1 external-reproduction or criticism request / week**
- **1 release-quality long-form post when a real milestone changes**

Avoid daily low-information posts. Public credibility has a rate limit even if social APIs do not.

## 5. Launch assets

Use only canonical assets from this repository:

- `packages/brand/svg/aftergraph-social-banner.svg`
- `packages/brand/svg/aftergraph-wordmark.svg`
- `packages/brand/svg/aftergraph-monogram.svg`
- `packages/brand/svg/aftergraph-lockup-horizontal.svg`
- `packages/brand/svg/aftergraph-lockup-stacked.svg`

For benchmark or research posts, prefer the actual figure from the research repo plus an explicit evidence-class caption.

## 6. Conversion path

Every public post should drive users into one of these actions:

1. **Star / Watch** a relevant repository
2. **Run** a quickstart
3. **Open** an interoperability/reproduction issue
4. **Implement** a specification independently
5. **Submit** contradictory prior art
6. **Report** a security/evidence-boundary failure

Do not optimize for impressions alone. The useful funnel is:

`view → repository visit → artifact read/run → star/watch → issue/reproduction/implementation`

## 7. Metrics

Track per public wave:

- GitHub stars by flagship repository
- watchers/subscribers
- unique contributors
- issue quality and source
- forks
- external implementations
- reproduction attempts
- citations / references
- inbound links
- release downloads where applicable
- time from public post to first technically meaningful interaction

The strongest growth metric is not followers. It is **independent technical engagement with a verifiable artifact**.

## 8. Publication gates

Before a metrics-heavy research post:

- inspect the current claim registry;
- inspect the experiment registry;
- confirm the evidence class;
- confirm the exact repository revision;
- check that a historical README or manuscript label has not become stale;
- do not describe STUDY-011 as a completed external validation until the repository's current integrity gate says so.

Before an AIE interoperability claim:

- consult `Aftergraph/aie/STATUS.md`;
- distinguish local TCK evidence from externally attested evidence;
- do not label AIE an established industry standard.

## 9. GitHub metadata gate

Apply the metadata contract in `Aftergraph/.github/DISCOVERABILITY.md`:

- canonical descriptions;
- relevant topics;
- recommended pins;
- Discussions where moderation capacity exists;
- private vulnerability reporting for security-sensitive repos;
- stale homepage cleanup;
- meaningful public releases.

The remaining GitHub-admin operations are tracked in `Aftergraph/.github#6`.

## 10. Public launch checklist

- [x] Organization front door exists
- [x] Public research index exists
- [x] Research citation metadata exists
- [x] AIE canonical citation URL is correct
- [x] Public contribution/security/support templates exist
- [x] Canonical public copy exists
- [x] Canonical social assets exist
- [x] Discoverability metadata contract exists
- [x] Distribution plan exists
- [ ] GitHub topics applied via repository settings
- [ ] Organization pins applied
- [ ] Canonical organization website/homepage set
- [ ] AIE and Research Discussions decision applied
- [ ] Security/private-vulnerability settings verified
- [ ] First externally meaningful public release published
- [ ] First technical launch post published by an authorized social account

## 11. Claim discipline

The following distinctions remain mandatory:

- deterministic sandbox ≠ live-provider validation;
- local conformance ≠ independent external reproduction;
- zero observed failures ≠ zero risk;
- research draft ≠ established standard;
- visual polish ≠ empirical evidence;
- provisional brand ≠ trademark clearance.

Aftergraph should be easy to discover because the work is technically interesting, not because the adjectives escaped containment.
