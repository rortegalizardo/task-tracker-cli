---
id: PSTATE-INIT-0006
type: product-state
title: Product definition state for INIT-0006
status: authoritative
revision: 1
owner_role: ROLE-product-manager
created: 2026-10-29
updated: 2026-10-29
updated_by_role: ROLE-product-manager
initiative: INIT-0006
phase: INTAKE
phase_entered: 2026-10-29
requester: "the requester (repository owner, rortegalizardo), via the driving session, 2026-10-29"
next_action: "ROLE-product-manager: SKILL-advance-product-phase INTAKE -> DISCOVERY (write the Discovery section)"
blocked_by: []
converged: false
readiness_verdict: none   # none | READY | READY-with-known-issues | NOT READY | void
stories: []
design_refs: []
decisions: []
---

# Product definition state — INIT-0006

`phase` above is the authority for where this work stands on the product side.
Delivery stage lives in `delivery/state.md` and is owned by `ROLE-orchestrator`;
these two files never describe the same thing and never share a writer.

## Where this stands

INTAKE. Triage verdict `new-initiative`; `INIT-0006` allocated; raw request
committed verbatim; ambiguities A1–A9 classified, all `pm-resolvable`.

## Problem statement

Tasks with no due date get lost in the requester's list, and they want a
quick, simple way to see only those tasks. Source:
`sources/2026-10-29-requester-request.md` (verbatim).

Today `ttc list` shows open tasks, important first, then by id; a task with
no due date is a line with no `due:` token, mixed in with the dated ones.
No option shows only the tasks with no due date: `--due-from` and `--due-to`
leave them out, `--overdue` never includes them (a task with no due date is
never overdue, `PD-0003` item 6), and `ttc list --no-due` fails with
`ttc: unknown option: --no-due` (`src/filter.js`; `ttc help`; checked on the
CLI at head `5be0561`).

## Next action

ROLE-product-manager: SKILL-advance-product-phase INTAKE -> DISCOVERY (write the Discovery section).

## Blocked by

Nothing.

## Ambiguity log

All rows are `pm-resolvable`: each is a clarification of the stated outcome,
an equivalent expression of it, a story-level detail, or already decided
(`product-manager-orchestrator` §4.1; escalation-policy §3 route 2). The
requester's own words settle the ties: "Tasks without a due date get lost in
my list", "a quick way to see just those" and "Keep it simple". No row changes
the outcome, the user or a success measure, and no row drops or narrows a
stated need (§4.2), so no `Q-` is raised.

| Date | Ambiguity | Class (`pm-resolvable` / `escalation`) | Resolution or `Q-` |
| --- | --- | --- | --- |
| 2026-10-29 | A1. Which tasks are "without a due date"? | pm-resolvable | Tasks whose stored due date is empty (`due` is null), the tasks `ttc list` prints with no `due:` token. A due date is a task's only date (`PD-0003`). |
| 2026-10-29 | A2. Open tasks only, or done tasks too? | pm-resolvable | "my list" is what `ttc list` shows by default: open tasks (`PD-0003` item 7). The quick way shows the open tasks with no due date with nothing else typed. Whether done tasks with no due date can also be shown is decided at SOLUTION_CONVERGENCE between the options, after the architect costs them; "Keep it simple" is the tie-breaker. |
| 2026-10-29 | A3. Where is the quick way: an option of `ttc list` or a new command? | pm-resolvable | Decided at SOLUTION_CONVERGENCE. "my list" points at `ttc list`, where `--overdue` already shows one kind of task on its own (`REQ-0007`). |
| 2026-10-29 | A4. What is it called? | pm-resolvable | An equivalent expression of the same outcome (§4.1). Recorded in the convergence `PD-`. |
| 2026-10-29 | A5. How are the tasks shown? | pm-resolvable | Exactly as `ttc list` shows them today: the same line format and order, important first, then by id; `No tasks.` when none match. Already decided (`PD-0003` items 7, 8; `PD-0009` items 4, 5). |
| 2026-10-29 | A6. What happens when it is given with the options that pick tasks by due date (`--due-from`, `--due-to`, `--overdue`), which can never match a task with no due date? | pm-resolvable | A story-level detail. Decided at SOLUTION_CONVERGENCE from the architect's input. |
| 2026-10-29 | A7. Does `ttc export`, which takes the same task-picking options as `ttc list`, get it too? | pm-resolvable | Not asked ("see just those"). Decided at SOLUTION_CONVERGENCE as a story boundary, after the architect says what keeping or splitting the shared option set costs; "Keep it simple" is the tie-breaker. |
| 2026-10-29 | A8. Can a task with no due date be given one from there? | pm-resolvable | Out of scope. The ask is to see the tasks; giving or changing a due date after `ttc add` has been out of scope since INIT-0001 (its out of scope "Changing or clearing a due date after `add`"). |
| 2026-10-29 | A9. Does `ttc stats` count them? | pm-resolvable | Out of scope: not asked, and "Keep it simple". `ttc stats` output is unchanged. |

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

Dates are UTC timestamps.

| Date | From | To | Role | Trigger | Outcome | `context_digest` |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-10-29T17:49:59Z | — | BOOTSTRAP | ROLE-product-manager | Raw request relayed by the driving session | Packet: `readiness: ready`, `scope.initiative: null`, profile S, no areas, no open `Q-` (`Q-0001` answered). `neighbouring` read in full: `CAP-0001` (draft) has no way to list only tasks with no due date; no `PD-` (accepted or rejected) concerns it; `PD-0003` items 6–8, `PD-0009` items 4–5 (overdue, list view, line, order) bind; INIT-0001 out of scope "Changing or clearing a due date after `add`" is a story boundary, not a rejected decision. INIT-0001..INIT-0005 are not touched. Advisory, carried: `CAP-0001` is still draft and predates shipped behaviour (code and README at head `5be0561` are the current-state evidence); `delivery/tickets.md` mirror `synced_on` 2026-10-21 is stale; the working tree has an uncommitted delivery-owned edit to `INIT-0005/delivery/tickets.md`, left alone. Hooks: HOOK-canonical-root pass, HOOK-hydrate pass | `c995399e88ef32e3`, head `5be0561` |
| 2026-10-29T17:50:50Z | BOOTSTRAP | INTAKE | ROLE-product-manager | Packet emitted, scope resolved to none | Triage verdict `new-initiative`: not `satisfied-by CAP-0001` (no option lists only tasks with no due date: `--due-from`/`--due-to` leave them out, `--overdue` never includes them, `--no-due` is an unknown option); no `PD-` settles it; no constraint forbids it; no initiative covers it (INIT-0001 base commands and `--overdue`, INIT-0002 important mark, INIT-0003 postpone, INIT-0004 clean, INIT-0005 copy), so not a duplicate; one outcome named. Raw request committed verbatim. `INIT-0006` allocated (counter 5 -> 6, checked against `origin/main` `5be0561`). Size: small (≤3 stories expected). Hooks: HOOK-initiative-resolved pass, HOOK-phase-entry pass | `c995399e88ef32e3`, head `5be0561` |

> Every product-side session updates this file before ending — **including
> sessions that failed**, which record the failure in `next_action` and do not
> advance `phase`.
