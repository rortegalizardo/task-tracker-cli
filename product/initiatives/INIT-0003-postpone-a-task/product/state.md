---
id: PSTATE-INIT-0003
type: product-state
title: Product definition state for INIT-0003
status: authoritative
revision: 1
owner_role: ROLE-product-manager
created: 2026-10-27
updated: 2026-10-27
updated_by_role: ROLE-product-manager
initiative: INIT-0003
phase: INTAKE
phase_entered: 2026-10-27
requester: "the requester (repository owner, rortegalizardo), via the driving session, 2026-10-27"
next_action: "ROLE-product-manager: SKILL-advance-product-phase INTAKE -> DISCOVERY (write the Discovery section)"
blocked_by: []
converged: false
readiness_verdict: none   # none | READY | READY-with-known-issues | NOT READY | void
stories: []
design_refs: []
decisions: []
---

# Product definition state — INIT-0003

`phase` above is the authority for where this work stands on the product side.
Delivery stage lives in `delivery/state.md` and is owned by `ROLE-orchestrator`;
these two files never describe the same thing and never share a writer.

## Where this stands

INTAKE. Triage verdict `new-initiative`; draft initiative and this file written.

## Problem statement

The requester keeps pushing tasks back and wants a quick way to postpone a
task. They asked to keep it simple. Source:
`sources/2026-10-27-requester-request.md` (verbatim).

Today a task's due date can only be set when the task is added
(`ttc add "<title>" [--due YYYY-MM-DD] ...`). No command changes it afterwards
(`src/commands/`: add, delete, export, help, import, important, list, note,
rename, stats, status, tag; README usage; head `ae4417c`). INIT-0001 left
"Changing or clearing a due date after `add`" out of scope, and `PD-0003`
Consequences records "No way to change a due date".

## Next action

ROLE-product-manager: SKILL-advance-product-phase INTAKE -> DISCOVERY (write the Discovery section).

## Blocked by

Nothing.

## Ambiguity log

All rows are `pm-resolvable`. They are clarifications of the stated outcome,
equivalent expressions of it, or story-level detail (§4.1), and the
requester's own words settle the ties: "a quick way" and "Keep it simple"
(escalation-policy §3 route 2, the initiative's stated outcome). No row
changes the outcome, the user or a success measure, and no row is a
stakeholder or taste question under escalation-policy §2 A, so no `Q-` is
raised.

| Date | Ambiguity | Class (`pm-resolvable` / `escalation`) | Resolution or `Q-` |
| --- | --- | --- | --- |
| 2026-10-27 | A1. What does postponing change: the task's due date, or does it hide the task until later ("snooze")? | pm-resolvable | The due date, moved later. It is the only date a task carries (README "Data file format"), and pushing a task back in a due-date tracker means a later due date. Hiding tasks would add a new idea to learn; "Keep it simple" rules it out. Recorded in the convergence `PD-`. |
| 2026-10-27 | A2. How far does a task move, and how does the user say so? | pm-resolvable | Equivalent expressions of one outcome (§4.1). "A quick way" means the default needs nothing but the task id. Decided at SOLUTION_CONVERGENCE between the options. |
| 2026-10-27 | A3. When a task is already overdue, does the new date count from its old due date or from today? | pm-resolvable | From the later of the two. Counting from an overdue date can leave the task still overdue after postponing it, which is not pushing it back; only this rule keeps the outcome (§4.1). Recorded in the convergence `PD-`. |
| 2026-10-27 | A4. What happens to a task with no due date? | pm-resolvable | It has no date to push back, so the command refuses it with a one-line error and changes nothing. Giving it a first due date would be setting a due date, which is out of scope. Exact text decided at SOLUTION_CONVERGENCE. |
| 2026-10-27 | A5. Can a done task be postponed? | pm-resolvable | Story-level detail. Default: the same rule as `ttc important`, which works on open and done tasks (`src/commands/important.js`), so there is no extra rule to learn. Decided at SOLUTION_CONVERGENCE. |
| 2026-10-27 | A6. Several tasks in one command? | pm-resolvable | No. One task id per command, like every other changing command (`src/commands/`). |
| 2026-10-27 | A7. Should ttc count or show how often a task was postponed? | pm-resolvable | No. Out of scope: the ask is a quick way to postpone, not a record of the habit. |
| 2026-10-27 | A8. Should the user also be able to set any due date, or clear one? | pm-resolvable | No. Out of scope: the ask is to postpone. |
| 2026-10-27 | A9. Weekends, holidays or times of day? | pm-resolvable | No. Calendar days only; a due date is a date (`PD-0003` item 5). |
| 2026-10-27 | A10. What does the command print? | pm-resolvable | The task's new due date, so the user does not have to list to check it. Exact text decided at SOLUTION_CONVERGENCE. |
| 2026-10-27 | A11. What happens to data files written by older ttc? | pm-resolvable | They keep working. Whether the stored format changes is the architect's to confirm at SOLUTION_EXPLORATION. |

## Discovery

_Written at DISCOVERY._

## Options

_Written at SOLUTION_EXPLORATION._

## Consultation log

| Date | Delegate role | Question | Answer / verdict | Recorded as |
| --- | --- | --- | --- | --- |

Dispatch log: `phase | delegate | vendor | model | tokens-scale | ledger run | artifact produced`

## Escalation log

| Date | Question | `Q-` | Asked of | Answer | Recorded as |
| --- | --- | --- | --- | --- | --- |

## Stories

| `REQ-` | Title | Status | `CAP-` | `DES-` | Sequencing note |
| --- | --- | --- | --- | --- | --- |

## Coverage validation

_Run at DECOMPOSITION._

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

_Assembled at ENGINEERING_READY._

## Handoff log

| Date | Receiving role | Packet digest | Note |
| --- | --- | --- | --- |

## Phase log

| Date | From | To | Role | Trigger | Outcome | `context_digest` |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-10-27 | — | BOOTSTRAP | ROLE-product-manager | Raw request relayed by the driving session | Packet: `readiness: ready`, `scope.initiative: null`, profile S, no areas, no open `Q-`. `neighbouring` read in full: `CAP-0001` (draft) covers due dates set at `add` and the overdue mark, not changing a due date; no `PD-` (accepted or rejected) concerns postponing; `PD-0003` Consequences "No way to change a due date" and INIT-0001 out of scope "Changing or clearing a due date after `add`" are scope boundaries, not rejections. Defect carried (advisory): `CAP-0001` is still draft and predates shipped behaviour; code and README at head `ae4417c` are the current-state evidence. Hooks: HOOK-canonical-root pass, HOOK-hydrate pass | `444a288e2444d5ce`, head `ae4417c` |
| 2026-10-27 | BOOTSTRAP | INTAKE | ROLE-product-manager | Packet emitted, scope resolved to none | Triage verdict `new-initiative`: no `CAP-` does this (no command changes a due date, `src/commands/`); no `PD-` settles it; no constraint forbids it; no initiative covers it (INIT-0001 excluded it, INIT-0002 is the important mark); one outcome named. Raw request committed verbatim. `INIT-0003` allocated (counter 2 -> 3, checked against `origin/main` `ae4417c`). Size: small (≤3 stories expected). Hooks: HOOK-initiative-resolved pass, HOOK-phase-entry pass | `444a288e2444d5ce`, head `ae4417c` |

> Every product-side session updates this file before ending — **including
> sessions that failed**, which record the failure in `next_action` and do not
> advance `phase`.
