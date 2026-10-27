---
id: PSTATE-INIT-0002
type: product-state
title: Product definition state for INIT-0002
status: authoritative
revision: 1
owner_role: ROLE-product-manager
created: 2026-10-26
updated: 2026-10-26
updated_by_role: ROLE-product-manager
initiative: INIT-0002
phase: INTAKE
phase_entered: 2026-10-26
requester: "the requester (repository owner, rortegalizardo), via the driving session, 2026-10-26"
next_action: "ROLE-product-manager: SKILL-advance-product-phase (INTAKE -> DISCOVERY)"
blocked_by: []
converged: false
readiness_verdict: none   # none | READY | READY-with-known-issues | NOT READY | void
stories: []
design_refs: []
decisions: []
---

# Product definition state — INIT-0002

`phase` above is the authority for where this work stands on the product side.
Delivery stage lives in `delivery/state.md` and is owned by `ROLE-orchestrator`;
these two files never describe the same thing and never share a writer.

## Where this stands

INTAKE. The ask is a new initiative: the product has no way to mark a task as
important today. Size: small (≤3 stories expected; target 1).

## Problem statement

The requester wants to mark some tasks as more important than others, and to
see the important ones first when they run `ttc list`. They asked to keep it
simple. Source: `sources/2026-10-26-requester-request.md` (verbatim).

Today every task is equal: `ttc list` shows tasks in ascending id order, and no
command or stored field marks a task as important (`src/commands/list.js`,
`src/commands/add.js`, README "Data file format", head `6ea6439`).

## Next action

ROLE-product-manager: SKILL-advance-product-phase (INTAKE -> DISCOVERY).

## Blocked by

Nothing.

## Ambiguity log

All rows are `pm-resolvable`. Two sources give the PM that authority: §4.1
covers equivalent expressions of the same outcome and story-level detail, and
the requester's run limits tell the PM to "Fill the gaps and make the
technical/product choices yourself, recording them as PD- records". The
requester's "Keep it simple" is the tie-breaker (escalation-policy §3 route 2).
No row is a stakeholder or taste question under escalation-policy §2 A, so no
`Q-` is raised.

| Date | Ambiguity | Class (`pm-resolvable` / `escalation`) | Resolution or `Q-` |
| --- | --- | --- | --- |
| 2026-10-26 | A1. One important mark, or several levels (high/medium/low)? | pm-resolvable | One on/off mark. "more important than others" needs two groups, and "Keep it simple" rules out levels. Recorded in the convergence `PD-`. |
| 2026-10-26 | A2. How does a user mark and unmark a task? | pm-resolvable | Equivalent expressions of one outcome (§4.1). Decided at SOLUTION_CONVERGENCE. |
| 2026-10-26 | A3. What order applies inside the important group and inside the rest? | pm-resolvable | Today's order (ascending id) inside each group, so nothing else about the list changes. |
| 2026-10-26 | A4. Which list views put important tasks first? | pm-resolvable | Every view and filter of `ttc list`. Filters still decide which tasks show; the mark only changes the order. |
| 2026-10-26 | A5. How does an important task look in a list line? | pm-resolvable | It must be visible, or the user cannot tell where the important group ends. Exact text decided at SOLUTION_CONVERGENCE. |
| 2026-10-26 | A6. Does a task keep its mark through done, reopen, rename, tag and note? | pm-resolvable | Yes. Only the unmark command removes it. |
| 2026-10-26 | A7. Do export and import carry the mark? | pm-resolvable | A JSON export is the stored format, so it carries the mark, and import restores it. The CSV columns stay as they are ("Keep it simple"; the ask is about listing). |
| 2026-10-26 | A8. Should list filter to only important tasks, or stats count them? | pm-resolvable | No. Out of scope: the ask is to see them first, not to filter or count them. |
| 2026-10-26 | A9. What happens to data files written by older ttc? | pm-resolvable | They keep working, and no task in them is important. |

## Discovery

_Written at DISCOVERY._

## Options

| Option | User-visible difference | Feasibility verdict | Cost / risk | Trade-off |
| --- | --- | --- | --- | --- |

_Recommended option and why:_

## Consultation log

| Date | Delegate role | Question | Answer / verdict | Recorded as |
| --- | --- | --- | --- | --- |

## Escalation log

| Date | Question | `Q-` | Asked of | Answer | Recorded as |
| --- | --- | --- | --- | --- | --- |

## Stories

| `REQ-` | Title | Status | `CAP-` | `DES-` | Sequencing note |
| --- | --- | --- | --- | --- | --- |

## Readiness log

Written by `ROLE-product-readiness-reviewer` only. One row per review round,
appended — a prior row is never edited, withdrawn, or overwritten. `Verdict` is
one of `READY`, `READY-with-known-issues`, or `NOT READY`; the first two open
the handoff gate, the third shuts it. Conditions and known issues live in their
own column and never in the verdict. `Story-set digest` is the ordered list of
`(REQ- id, revision, updated)` triples plus the initiative `revision`, and is
what makes the verdict void when the set moves.

| Date | Round | Verdict | Conditions | Reviewer | Story-set digest | Findings | Finding ids |
| --- | --- | --- | --- | --- | --- | --- | --- |

## Readiness findings

Written by `ROLE-product-readiness-reviewer` only, one block per round producing
at least one finding. Finding ids are `RF-<INIT-nnnn>-<round>-<n>`, scoped to
this file: they bump no counter and appear in no index. A `NOT READY` verdict
with no findings rows is invalid output.

| Finding | Criterion | Artifact | What is wrong | Route phase | Route role |
| --- | --- | --- | --- | --- | --- |

## Handoff packet

_Written at ENGINEERING_READY._

## Handoff log

| Date | Receiving role | Packet digest | Note |
| --- | --- | --- | --- |

## Phase log

| Date | From | To | Role | Trigger | Outcome | `context_digest` |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-10-26 | — | BOOTSTRAP | ROLE-product-manager | Raw request relayed by the driving session | Packet: `readiness: ready`, `scope.initiative: null`, profile S, no areas. `neighbouring` read in full: `CAP-0001` (draft) lists "priorities" among INIT-0001's exclusions, not as a decision; no `PD-` (accepted or rejected) concerns importance or priority; no open `Q-`. Note: `CAP-0001` is still draft and predates shipped behaviour (notes, search, export filters from RCDEV-839..841); code and README at head `6ea6439` are the current-state evidence. Hooks: HOOK-canonical-root pass, HOOK-hydrate pass | `b14f2ea367f1add1`, head `6ea6439` |
| 2026-10-26 | BOOTSTRAP | INTAKE | ROLE-product-manager | Packet emitted, scope resolved to none | Triage verdict `new-initiative`: no `CAP-` does this (grep of `src/`, `bin/`, README for priority/important: none); no `PD-` settles it; no constraint forbids it; no initiative covers it (INIT-0001 excluded "Priorities"); one outcome named. Raw request committed verbatim. `INIT-0002` allocated (counter 1 -> 2, checked against `origin/main` `6ea6439`). Size: small (≤3 stories expected). Hooks: HOOK-initiative-resolved pass, HOOK-phase-entry pass | `b14f2ea367f1add1`, head `6ea6439` |

> Every product-side session updates this file before ending — **including
> sessions that failed**, which record the failure in `next_action` and do not
> advance `phase`.
