---
id: PD-0001
type: decision
title: Treat the requester's spec as complete, record its rules as constraints, and decide every detail inside it
status: accepted
revision: 1
owner_role: ROLE-product-manager
created: 2026-10-20
updated: 2026-10-20
decided_on: 2026-10-20
affects: [INIT-0001, PROJECT-constraints, PROJECT-principles]
supersedes:
superseded_by:
---

# PD-0001 — Treat the requester's spec as complete, record its rules as constraints, and decide every detail inside it

## Context

Product Memory was bootstrapped on 2026-10-20 with one constraint ("Node.js,
built-in libraries only") and an empty, `draft` principles file. A draft
principles file sets `foundation: incomplete`, so hydration returns
`readiness: degraded`, which forbids advancing a phase until the degradation is
repaired (`product-manager-orchestrator` §8.5).

The same day the requester gave a full spec for the `ttc` command-line task
tracker, with instructions on how to run the work. Both are committed verbatim
in
[`initiatives/INIT-0001-ttc-command-line-task-tracker/product/sources/2026-10-20-requester-spec.md`](../initiatives/INIT-0001-ttc-command-line-task-tracker/product/sources/2026-10-20-requester-spec.md).
The spec states hard rules that bind every command, and it leaves many
user-visible details open (how ids look, what `list` shows by default, what
`import` does with existing tasks, and so on).

## Decision

1. **The spec is complete and the PM decides inside it.** Question: who
   decides the details the spec leaves open? Answer, supplied by the requester
   on 2026-10-20: "The spec is complete. Decide everything inside it yourself
   (record decisions as PD- where your process requires). Only escalate to the
   requester if the spec contradicts itself." Every open detail is therefore
   decided by `ROLE-product-manager` and recorded as a `PD-`. A detail is
   taken to the requester only when the spec contradicts itself.
2. **The spec's hard rules become project constraints 2–9** in
   `project/constraints.md`, quoted from the requester: Node 24; no network;
   one JSON file at `$TTC_HOME/tasks.json` (default `~/.ttc`); atomic writes;
   one-line errors on stderr with a non-zero exit; `node:test` tests for every
   command with the CI `test` check passing; CLI only, no UI; and the
   repository every ticket names.
3. **No user-facing visual surface.** Question: does this product have a
   surface that needs design? Answer, supplied by the requester on
   2026-10-20: "No design work: CLI only, no UI — skip all design roles/DES
   records; record that the initiative has no user-facing visual surface."
   No design role is dispatched and no `DES-` record is made for INIT-0001.
   Every story carries `design_refs: []`, so the composition criterion of
   `schemas/frontmatter.md` does not apply. What the terminal prints is
   product behaviour, and each story states it in its `## Behavior` section
   and acceptance criteria.
4. **Every ticket names its repository**: `rortegalizardo/task-tracker-cli`
   (`~/Desktop/Projects/task-tracker-cli`), as the requester instructed. Each
   story states it in its `## Scope` section so the ticket carries it.
5. **No principles are recorded.** The requester stated none and called the
   spec complete. `project/principles.md` becomes `authoritative` and says so
   explicitly, rather than staying `draft` and keeping the tree degraded.

## Options considered

| Option | Why not |
| --- | --- |
| Ask the requester about every user-visible detail the spec leaves open | The requester said not to: escalate only if the spec contradicts itself |
| Keep the spec's rules only inside the initiative's stories | They bind every command and every later initiative; a constraint is where every role reads them, and a story is not |
| Leave `principles.md` as `draft` | Hydration stays `degraded`, which forbids advancing any phase |
| Write principles the PM infers from the spec | That would invent requester intent; the spec's rules are hard limits and belong in constraints |
| Run the design roles anyway for terminal output | The requester excluded design work; terminal text is specified in the stories instead |

## Consequences

Costs first:

- The PM's answers to user-visible details bind delivery without the
  requester seeing them first. Changing one later needs a new `PD-` that
  supersedes the one that recorded it.
- Constraints 2–9 bind every later initiative too. Relaxing one (for example
  allowing a network feature) needs a `PD-` that amends `constraints.md`.
- With no `DES-` records, nobody reviews terminal output visually; the
  stories' acceptance criteria are the only specification of it.

Benefits:

- The phase machine runs end to end without stopping for questions the
  requester already answered.
- Hydration returns `ready` once constraints and principles are
  `authoritative`.

> Once `status: accepted`, this body is never rewritten. A change of mind is a
> new decision with `supersedes: PD-0001`.
