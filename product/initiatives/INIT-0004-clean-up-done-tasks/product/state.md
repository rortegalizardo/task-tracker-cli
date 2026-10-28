---
id: PSTATE-INIT-0004
type: product-state
title: Product definition state for INIT-0004
status: authoritative
revision: 2
owner_role: ROLE-product-manager
created: 2026-10-28
updated: 2026-10-28
updated_by_role: ROLE-product-manager
initiative: INIT-0004
phase: DISCOVERY
phase_entered: 2026-10-28
requester: "the requester (repository owner, rortegalizardo), via the driving session, 2026-10-28"
next_action: "ROLE-product-manager: SKILL-advance-product-phase (DISCOVERY -> PRODUCT_DEFINITION)"
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

DISCOVERY. Discovery written (J1–J3, P1–P3, S2 `CAP-0001`, S3 signals 1–5, non-goals). No `Q-` raised.

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

ROLE-product-manager: SKILL-advance-product-phase (DISCOVERY -> PRODUCT_DEFINITION).

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

**Target user.** One person who keeps their own task list with `ttc` on their
own machine: the requester. ttc has one user and no shared list
(`CAP-0001` Boundaries; INIT-0001 out of scope). Source: S1 below.

**Jobs and problems, with sources.**

| # | Job or problem | Source |
| --- | --- | --- |
| J1 | Get rid of tasks finished long ago, which clutter the list ("My list is cluttered with tasks I finished ages ago."). | Request, verbatim (`sources/2026-10-28-requester-request.md`) |
| J2 | Remove them all in one go, not one by one ("Let me clean them up."). | Request, verbatim (same file) |
| J3 | Keep the feature simple: little to learn, nothing else changes ("Keep it simple."). | Request, verbatim (same file) |
| P1 | A done task is stored for good. It shows under `ttc list --done` and `ttc list --all`, counts in the `ttc stats` done total, and goes into every `ttc export`, whose default view is `--all`. | `src/filter.js` (`parseFilter`), `src/commands/export.js` (default `--all`), `src/commands/stats.js`; README "Listing and filtering tasks", "Exporting tasks"; head `21e02ed` |
| P2 | Removing done tasks takes one `ttc delete <id>` per task, after finding each id with `ttc list --done`. | `src/commands/delete.js`; `REQ-0006` Non-goals "Deleting several tasks in one command"; `PD-0003` items 1, 10 |
| P3 | ttc does not record when a task was finished, so "finished ages ago" cannot be told apart from "finished today" with the data stored now. | README "Data file format" (task keys id, title, status, due, tags, note, important); `src/storage.js` format version 4; `src/commands/status.js` (`done` sets status only) |

**Current-state capability mapping (S2).** `CAP-0001` — local task tracking
from the `ttc` command line. This initiative extends it. `CAP-0001` is still
`draft` and does not describe everything that shipped; the current-state
evidence is the code and README at head `21e02ed`:

- `ttc done <id>` marks a task done; `ttc reopen <id>` makes it open again
  (`src/commands/status.js`, `PD-0003` items 9–10).
- `ttc list` shows open tasks unless `--done`, `--all` or `--overdue` is given;
  a done task's line shows `[x]` (`PD-0003` items 7–8).
- `ttc delete <id>` removes one task, prints `Deleted task <id>`, and its id is
  never reused (`PD-0003` items 1, 10; `src/commands/delete.js`).
- "No command asks for confirmation" (`PD-0003` item 10).
- Changing commands write atomically under a lock; a refusal writes nothing; a
  failure after the save exits 1 and keeps the change (`PD-0004` items 3–4,
  `PD-0008`). A no-op never writes (`src/commands/status.js`,
  `src/commands/important.js`).
- `ttc stats` prints `open: <n>`, `done: <n>`, `overdue: <n>` (`PD-0003`
  item 15).
- `tasks.json` is format version 4; versions 1–3 are read and rewritten as
  version 4 by the next changing command (README "Data file format", `PD-0010`).

**Success signals (S3).**

1. A user removes finished tasks with one command that needs nothing else
   typed.
2. Afterwards the finished tasks the user wanted gone no longer show under
   `ttc list --done` or `--all`, in `ttc stats`, or in `ttc export`.
3. The command says how many tasks it removed.
4. Open tasks, their ids and their fields are unchanged; removed ids are never
   given again.
5. A data file written by older ttc still works.

**Known non-goals.** An archive or undo; an "are you sure?" prompt; narrowing
the clean-up by tag, date or id; removing open tasks; automatic or scheduled
clean-ups; any change to how other commands behave.

Sources: S1 = the request file above; INIT-0001 `initiative.md` out of scope;
S2/S3 = the code and README at head `21e02ed`.

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
| 2026-10-28 | INTAKE | DISCOVERY | ROLE-product-manager | INTAKE exit criteria met: one initiative, one problem, one named requester, ambiguity rows A1–A9 all classified (`pm-resolvable`) | Entry precondition (`lifecycle-hooks.md` §3.4.1 DISCOVERY) holds: `initiative.md` at `status: draft`; state at INTAKE with requester, problem statement and a classified ambiguity log. Discovery written (J1–J3, P1–P3, S2 `CAP-0001`, S3 signals 1–5, non-goals). No `Q-` raised. Hooks: HOOK-phase-entry pass | `2b4a364ef1aee73c`, head `b2e2601` |

> Every product-side session updates this file before ending — **including
> sessions that failed**, which record the failure in `next_action` and do not
> advance `phase`.
