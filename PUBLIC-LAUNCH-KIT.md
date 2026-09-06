# Aftergraph Public Launch Kit

**Status:** public communications kit  
**Brand:** provisional, not trademark-cleared  
**Canonical GitHub:** https://github.com/Aftergraph

This file gives contributors one consistent public narrative for Aftergraph without upgrading research maturity through marketing language.

## One-line positioning

> **Aftergraph builds infrastructure and open research for verifiable intelligent systems.**

## Short positioning

Aftergraph works on the systems layer around autonomous AI: missions, durable execution, bounded authority, evidence, verification, interoperability and Agentic Institution Engineering.

The core principle is simple:

> **An agent saying “done” is not the same as the system proving the outcome.**

## Technical positioning

Aftergraph explores and implements a stack for long-running autonomous systems where human intent becomes a machine-readable mission with explicit state, capabilities, authority, budgets, execution, evidence and independent verification.

Key public programs:

- **SPEC-001 / Mission Contract** — systems contract for verifiable long-horizon intelligent systems.
- **MISSION-Bench** — fault-injected benchmark and ablation framework.
- **AIE / Agentic Institution Engineering** — research and experimental standards track for authority, delegation, revocation, budgets, lifecycle, topology governance and evidence semantics.
- **Trust Gateway** — runtime control and enforcement surface.
- **WORKS** — durable execution plane for autonomous work.
- **Work Intelligence** — source-neutral observation to structured work inference.

## Canonical public links

- Organization: https://github.com/Aftergraph
- Research: https://github.com/Aftergraph/intelligence-systems-research
- Papers: https://github.com/Aftergraph/intelligence-systems-research/tree/main/PAPERS
- AIE: https://github.com/Aftergraph/aie
- Trust Gateway: https://github.com/Aftergraph/trust-gateway
- WORKS: https://github.com/Aftergraph/works-execution
- Governance: https://github.com/Aftergraph/after-graph-governance

## Public copy

### X / short social post

> Most agent stacks optimize how an agent acts. Aftergraph is working on what happens around the agent: missions, bounded authority, durable execution, evidence and independent verification. An agent saying “done” should not equal verified completion. Open research + code: https://github.com/Aftergraph

### LinkedIn

> We are building Aftergraph as an open engineering and research organization for verifiable intelligent systems.
>
> The problem we care about is larger than model quality: when autonomous systems run for hours or days, use tools, delegate work and consume real resources, how do we prove that the intended outcome actually happened within the allowed authority and budget?
>
> Our public work spans SPEC-001 Mission Contracts, MISSION-Bench, Agentic Institution Engineering, runtime enforcement, durable execution and evidence-gated verification.
>
> The design principle: **declared completion is not verified completion.**
>
> Research, code and reproducibility artifacts: https://github.com/Aftergraph

### Hacker News / technical community submission

**Suggested title:**

> Aftergraph: open research and infrastructure for verifiable long-horizon AI agents

**Submission text:**

> We have been working on a systems-level question around autonomous agents: how do you connect human intent to a persistent mission, bounded authority, resource budgets, durable execution, evidence and independent verification across heterogeneous runtimes?
>
> The public work includes a Mission Contract specification (SPEC-001), MISSION-Bench fault-injection experiments, an Agentic Institution Engineering track for portable authority/delegation semantics, and reference runtime/control-plane implementations.
>
> We are deliberately separating deterministic testbed results, conformance evidence, live-provider evidence and independent reproduction. Criticism, failed replications and contradictory prior art are welcome.
>
> https://github.com/Aftergraph

### Reddit / developer communities

> We are open-sourcing Aftergraph, a set of research and engineering projects around **verifiable intelligent systems**.
>
> Instead of treating an agent's final message as success, the stack separates execution from evidence and verification. It also treats authority, budgets, revocation, recovery and durable state as first-class system objects.
>
> Main entry points:
> - SPEC-001 / Mission Contract
> - MISSION-Bench
> - Agentic Institution Engineering (AIE)
> - Trust Gateway
> - WORKS durable execution
>
> We are especially interested in independent implementations, failed replications, security challenges and prior art we may have missed.
>
> https://github.com/Aftergraph

### Research / standards outreach email

**Subject:** Open research: verifiable long-horizon intelligent systems, mission contracts and delegated authority

> Hello,
>
> I am sharing the Aftergraph Intelligence Systems Research Program, an open research and implementation effort focused on long-horizon autonomous systems.
>
> The program investigates a vendor-neutral systems contract connecting human intent to persistent mission state, capabilities, attenuated authority, budgets, execution trajectories, evidence and independent verification. Related work includes MISSION-Bench and Agentic Institution Engineering (AIE), an experimental standards track for portable authority and delegation semantics.
>
> The repository includes specifications, reference implementations, conformance tests, benchmark artifacts, claim/evidence registries and reproducibility material. We explicitly welcome contradictory prior art, failed replication and independent implementations.
>
> Research: https://github.com/Aftergraph/intelligence-systems-research
> AIE: https://github.com/Aftergraph/aie
> Organization: https://github.com/Aftergraph
>
> Regards,
> Jonas Abde

## Messages to lead with

1. **Verifiable outcomes, not agent self-reporting.**
2. **Authority is bounded, delegated and revocable.**
3. **Durable work survives model turns and runtime failures.**
4. **Evidence is a system output, not prose in a log.**
5. **Existing standards are composed rather than reimplemented for branding.**
6. **Research claims remain attached to their evidence class.**

## Claims not to publish as settled facts

Do not use marketing copy that implies any of the following unless the canonical evidence registry has advanced:

- AIE is an established industry standard.
- deterministic sandbox results are equivalent to live-provider validation;
- conformance success proves scientific generalization;
- internal implementations are independent external reproduction;
- a zero observed failure rate means zero population failure probability;
- submission to IEEE, NIST, ISO or another SDO has occurred when it has not;
- provisional Aftergraph / ABDE Intelligence branding is trademark-cleared.

## Recommended social assets

Use canonical masters from this repository rather than ad-hoc screenshots:

- `packages/brand/svg/aftergraph-social-banner.svg`
- `packages/brand/svg/aftergraph-wordmark.svg`
- `packages/brand/svg/aftergraph-monogram.svg`
- `packages/brand/svg/aftergraph-lockup-horizontal.svg`
- `packages/brand/svg/aftergraph-lockup-stacked.svg`

For research posts, pair the social banner with a real architecture or benchmark figure from the source repository when the figure's evidence class is clear.

## Search / discovery vocabulary

Use naturally where relevant, not as keyword soup:

`verifiable intelligent systems`, `autonomous agents`, `agentic AI`, `long-horizon agents`, `AI agent verification`, `mission contracts`, `evidence-gated agents`, `delegated authority`, `agent governance`, `agent security`, `multi-agent systems`, `agent interoperability`, `MCP`, `A2A`, `SPIFFE`, `OpenTelemetry`, `AI evaluation`, `fault injection`, `MISSION-Bench`, `Agentic Institution Engineering`.

## Call to action

Prefer one concrete request per post:

- **Researchers:** reproduce or falsify a result.
- **Runtime implementers:** implement the contract independently.
- **Security engineers:** attack authority and evidence boundaries.
- **Standards practitioners:** critique semantics and protocol composition.
- **Developers:** run the quickstarts and report integration friction.
- **Everyone:** star/watch the public repositories they actually want to follow.

## Publication gate

Before publishing a metrics-heavy post, verify the current claim and experiment registries in `Aftergraph/intelligence-systems-research`. Public copy must be updated when evidence changes. Marketing does not get its own laws of physics.
