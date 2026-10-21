---
id: PD-0005
type: decision
title: Build ttc as option A, the ten-story command the spec states, under the architect's constraints
status: accepted
revision: 1
owner_role: ROLE-product-manager
created: 2026-10-20
updated: 2026-10-20
decided_on: 2026-10-20
affects: [INIT-0001]
supersedes:
superseded_by:
---

# PD-0005 — Build ttc as option A, the ten-story command the spec states, under the architect's constraints

## Context

SOLUTION_EXPLORATION for INIT-0001 recorded one option. The single option is
justified as a decision the requester already made (`Options` table in
`initiatives/INIT-0001-ttc-command-line-task-tracker/product/state.md`). The
requester fixed the shape of the solution, not only the problem:

- the commands and their flags;
- exactly ten stories, in a stated dependency order;
- Node 24 with built-in libraries only, and no network;
- one JSON file, written atomically;
- a command line with no UI.

This is recorded in the raw spec, in `PD-0001` items 1–3 and in
`project/constraints.md` rows 1–9.

The technical architect assessed option A as **`feasible-with-constraints`**,
complexity band `multi-component`
(`initiatives/INIT-0001-ttc-command-line-task-tracker/technical/assessment.md`,
round 1, 2026-10-20). That verdict is not `infeasible`.

## Decision

INIT-0001 is built as **option A**:

- the `ttc` command as the spec states it;
- ten command groups, one story each (`REQ-0001`…`REQ-0010`), in the spec's
  order;
- behaviour per `PD-0003` and `PD-0004`;
- one JSON file at `$TTC_HOME/tasks.json`;
- Node 24 built-ins only.

The architect's constraints C1–C7 are accepted as stated in the assessment.
Their product meaning is fixed in `PD-0004`. Every story carries the
constraints that bind it in its Technical constraints section:

- **C1:** Node 24 built-ins only, no network. The CI job has no install step.
  The built-in argument parser cannot be used as-is for single-dash arguments.
- **C2:** atomic at process level. `PD-0004` item 3 states this.
- **C3:** "today" is the local calendar date. Tests set the time zone, the
  clock and any write interruption from the test side, never through a `ttc`
  option or environment variable.
- **C4:** each test isolates its data, home and working folders.
- **C5:** the id upper bound. `PD-0004` item 2 states it.
- **C6:** CI on Node 24 on Linux is the arbiter. The `engines` field is
  aligned to Node 24.
- **C7:** `REQ-0001` fixes the stored-file layout. Stories after `REQ-0003`
  merge one at a time in `depends_on` order.

## Options considered

| Option | Why not |
| --- | --- |
| A different command set or flag syntax | The requester fixed the commands (raw spec; `PD-0001` item 1). |
| A database or several files instead of one JSON file | Contradicts `project/constraints.md` row 4. |
| A third-party argument parser or test library | Contradicts `project/constraints.md` row 2. The CI job also has no install step (C1). |
| Fewer or more stories, or a different order | The requester asked for exactly ten stories in the stated order. |
| A full-screen or graphical interface | "CLI only, no UI" (`PD-0001` item 3). |

## Consequences

**Costs.**

- **Merge order.** Stories that could be built in parallel after `REQ-0003`
  still merge one at a time, because they share the command list, the usage
  text and the argument rules (C7).
- **Fixed layout.** The stored-file layout fixed in `REQ-0001` is costly to
  change later. Later stories' tests write that layout directly (C7).
- **Unprotected `main`.** `main` is not branch-protected, so a red `test`
  check is caught by the ship step rather than by GitHub (risk R6). This is
  the owner's to change if wanted.

**Benefits.**

- **Nothing reopened.** The solution matches what the requester asked for,
  so nothing they fixed is reopened.
- **No unknowns left.** Every constraint and risk is named before
  decomposition.

> Once `status: accepted`, this body is never rewritten. A change of mind is a
> new decision with `supersedes: PD-0005`.
