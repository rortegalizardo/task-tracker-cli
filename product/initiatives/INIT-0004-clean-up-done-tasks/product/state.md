---
id: PSTATE-INIT-0004
type: product-state
title: Product definition state for INIT-0004
status: authoritative
revision: 1
owner_role: ROLE-product-manager
created: 2026-10-28
updated: 2026-10-28
updated_by_role: ROLE-product-manager
initiative: INIT-0004
phase: INTAKE
phase_entered: 2026-10-28
requester: "the requester (repository owner, rortegalizardo), via the driving session, 2026-10-28"
next_action: "ROLE-product-manager: SKILL-advance-product-phase (INTAKE -> DISCOVERY), write the Discovery section"
blocked_by: []
converged: false
readiness_verdict: none   # none | READY | READY-with-known-issues | NOT READY | void
stories: []
design_refs: []
decisions: []
---

# Product definition state — INIT-0004

`phase` above is the authority for where this work stands on the product side.
Delivery stage lives in `delivery/state.md` and is owned by `ROLE-orchestrator`;
these two files never describe the same thing and never share a writer.

## Where this stands

INTAKE. Triage verdict `new-initiative`; draft initiative and this file written.

## Problem statement

The requester's task list is cluttered with tasks they finished long ago, and
they want to clean them up. They asked to keep it simple. Source:
`sources/2026-10-28-requester-request.md` (verbatim).

Today a finished task stays in `tasks.json` for good. `ttc list` hides it by
default (it shows open tasks, `PD-0003` item 7; README "Listing and filtering
tasks"), but it still shows under `ttc list --done` and `--all`, counts in the
`ttc stats` done total, and goes into every `ttc export`, whose default view is
`--all` (`src/commands/export.js`). The only way to remove it is
`ttc delete <id>`, one task per command (`src/commands/delete.js`; `REQ-0006`
Non-goals "Deleting several tasks in one command"). ttc does not record when a
task was finished: a task holds id, title, status, due, tags, note and
important (README "Data file format"; `src/storage.js`, format version 4).
Head `21e02ed`.

## Next action

ROLE-product-manager: SKILL-advance-product-phase (INTAKE -> DISCOVERY), write the Discovery section.

## Blocked by

Nothing.

## Ambiguity log

All rows are `pm-resolvable`. They are clarifications of the stated outcome,
equivalent expressions of it, story-level detail, or already decided (§4.1;
escalation-policy §3 route 2). The requester's own words settle the ties:
"Let me clean them up" and "Keep it simple"; the driving session relayed "You
make the actual product decisions" and "ask the requester only real
stakeholder or taste questions". No row changes the outcome, the user or a
success measure, and no row drops or narrows a stated need (§4.2), so no `Q-`
is raised.

| Date | Ambiguity | Class (`pm-resolvable` / `escalation`) | Resolution or `Q-` |
| --- | --- | --- | --- |
| 2026-10-28 | A1. Does "clean them up" mean remove the finished tasks, or hide them? | pm-resolvable | Remove them. Hiding already exists: `ttc list` shows open tasks by default (`PD-0003` item 7), and the clutter that remains is the done tasks still stored. Recorded in the convergence `PD-`. |
| 2026-10-28 | A2. Only tasks finished "ages ago", or every finished task? | pm-resolvable | Both meet the stated need: either way the tasks finished long ago are gone. ttc stores no finish date, so telling old from recent needs new stored data. Decided at SOLUTION_CONVERGENCE between the options, after the architect costs both; "Keep it simple" is the tie-breaker. |
| 2026-10-28 | A3. Should the command ask "are you sure?" first? | pm-resolvable | No. Already decided: "No command asks for confirmation" (`PD-0003` item 10; escalation-policy §3 route 2). The user can see what will go with `ttc list --done`. |
| 2026-10-28 | A4. Removed for good, or moved to an archive? | pm-resolvable | Removed for good, like `ttc delete`. An archive is a second list to learn, against "Keep it simple"; `ttc export <file> --done` already keeps a copy for anyone who wants one. Recorded in the convergence `PD-`. |
| 2026-10-28 | A5. Can a removed task's id come back? | pm-resolvable | No. Already decided: an id is never reused (`PD-0003` item 1). |
| 2026-10-28 | A6. Narrow the clean-up by tag, date or id? | pm-resolvable | No. One command with nothing to choose; out of scope. |
| 2026-10-28 | A7. What does the command print? | pm-resolvable | How many tasks it removed, so the user does not have to list to check. Exact text decided at SOLUTION_CONVERGENCE. |
| 2026-10-28 | A8. What happens when nothing is finished? | pm-resolvable | It succeeds, says nothing was removed, and changes nothing, like the existing no-op cases (`PD-0003` item 9). Exact text decided at SOLUTION_CONVERGENCE. |
| 2026-10-28 | A9. What happens to open tasks and to data files written by older ttc? | pm-resolvable | Open tasks are untouched; older files keep working. Whether the stored format changes is the architect's to confirm at SOLUTION_EXPLORATION. |

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
| 2026-10-28 | — | BOOTSTRAP | ROLE-product-manager | Raw request relayed by the driving session | Packet: `readiness: ready`, `scope.initiative: null`, profile S, no areas, no open `Q-` (`Q-0001` answered). `neighbouring` read in full: `CAP-0001` (draft) covers `ttc delete <id>` one task at a time and the open-only default of `ttc list`, not removing finished tasks together; no `PD-` (accepted or rejected) concerns a bulk clean-up; `REQ-0006` Non-goals "Deleting several tasks in one command" is a story boundary, not a rejection; `PD-0003` item 10 "No command asks for confirmation" and item 1 (ids never reused) bind. INIT-0001..INIT-0003 are not touched. Defect carried (advisory): `CAP-0001` is still draft and predates shipped behaviour; code and README at head `21e02ed` are the current-state evidence. Hooks: HOOK-canonical-root pass, HOOK-hydrate pass | `2b4a364ef1aee73c`, head `21e02ed` |
| 2026-10-28 | BOOTSTRAP | INTAKE | ROLE-product-manager | Packet emitted, scope resolved to none | Triage verdict `new-initiative`: not `satisfied-by CAP-0001` (the default `ttc list` hides done tasks but nothing removes them except `ttc delete <id>` one at a time); no `PD-` settles it; no constraint forbids it; no initiative covers it (INIT-0001 single delete, INIT-0002 important mark, INIT-0003 postpone), so not a duplicate; one outcome named. Raw request committed verbatim. `INIT-0004` allocated (counter 3 -> 4, checked against `origin/main` `21e02ed`). Size: small (≤3 stories expected). Hooks: HOOK-initiative-resolved pass, HOOK-phase-entry pass | `2b4a364ef1aee73c`, head `21e02ed` |

> Every product-side session updates this file before ending — **including
> sessions that failed**, which record the failure in `next_action` and do not
> advance `phase`.
