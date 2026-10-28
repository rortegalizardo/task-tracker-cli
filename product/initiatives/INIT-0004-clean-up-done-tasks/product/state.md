---
id: PSTATE-INIT-0004
type: product-state
title: Product definition state for INIT-0004
status: authoritative
revision: 6
owner_role: ROLE-product-manager
created: 2026-10-28
updated: 2026-10-28
updated_by_role: ROLE-product-manager
initiative: INIT-0004
phase: DECOMPOSITION
phase_entered: 2026-10-28
requester: "the requester (repository owner, rortegalizardo), via the driving session, 2026-10-28"
next_action: "ROLE-product-manager: write REQ-0013 rev 2 (behavior, acceptance criteria, technical constraints C1–C5), then dispatch the coherence check round 1 of 2 (terminal unless blocking)"
blocked_by: []
converged: false
readiness_verdict: none   # none | READY | READY-with-known-issues | NOT READY | void
stories: [REQ-0013]
design_refs: []
decisions: [PD-0012]
---

# Product definition state — INIT-0004

`phase` above is the authority for where this work stands on the product side.
Delivery stage lives in `delivery/state.md` and is owned by `ROLE-orchestrator`;
these two files never describe the same thing and never share a writer.

## Where this stands

DECOMPOSITION. `PD-0012` (option A, `ttc clean` removes every done task) and the Solution Contract are recorded. `REQ-0013` is written in full next, then checked for technical coherence.

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

ROLE-product-manager: write REQ-0013 rev 2 (behavior, acceptance criteria, technical constraints C1–C5), then dispatch the coherence check round 1 of 2 (terminal unless blocking).

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

| Option | User-visible difference | Feasibility verdict | Cost / risk | Trade-off |
| --- | --- | --- | --- | --- |
| A — `ttc clean` removes every done task | Every finished task goes in one run, including one finished today | `feasible-with-constraints`, band `contained` (`technical/assessment.md`, round 1) | Constraints C1–C5. R5 (oracle copies the new code), R6 (an age rule added later would change what `clean` does). P1, P7 to settle. No stored-format change | Least to learn: one command, one rule, nothing new stored. A task finished a minute ago is removed too; `ttc list --done` shows beforehand exactly what goes |
| B — `ttc clean` removes done tasks finished more than 30 days ago | Recently finished tasks stay; `ttc done` starts recording the finish date | `feasible-with-constraints`, band `multi-component` (`technical/assessment.md`, round 1) | Constraints C1–C9: format version 5 and a one-way upgrade for every user from any changing command (C6, C7, R4); changes to `done`, `reopen`, import and JSON export (C8); a backwards day count the platform lacks (C9). R1: every task already done when B ships has no date, so the first clean removes all of them anyway. P1–P6 to settle | Keeps recent finished tasks, but only from the second month after it ships; a 30-day rule, a finish date in every JSON export and a format change to accept |

_Recommended option and why:_ **A.** It is the whole ask: "Let me clean them
up" is one command that clears the finished tasks out, and "Keep it simple"
rules out a stored finish date, an age threshold and a format change nobody
asked for. Both options remove the tasks finished long ago, so both meet J1;
B's only gain, keeping recent finished tasks, does not even appear on its first
run (R1), and it costs a one-way format upgrade for every user (C6, R4). A user
who wants to keep a finished task can see it in `ttc list --done` first and
`ttc reopen` it, or keep a copy with `ttc export <file> --done` (P7). Adding
an age rule later stays possible (R6).

_Chosen (SOLUTION_CONVERGENCE, 2026-10-28):_ **A**, `PD-0012`. B rejected for the
reasons in `PD-0012` "Options considered". P1 settled as the architect
recommended: one count line for every number, 0 included, and the usage line
after `ttc delete <id>` (`PD-0012` items 4, 5, 11); P7 settled by the README
caution (item 12). P2–P6 applied to B only. No option is left under
consideration.

## Consultation log

| Date | Delegate role | Question | Answer / verdict | Recorded as |
| --- | --- | --- | --- | --- |
| 2026-10-28 | ROLE-planner (PRODUCT-DISCOVERY) | Feasibility verdict, constraints, risks and band for options A and B (one dispatch: capability scan, impact, assessment; §9d.1) | A `feasible-with-constraints`, `contained`; B `feasible-with-constraints`, `multi-component`; constraints C1–C9 (C6–C9 B only); risks R1–R6; narrowing points P1–P7 (P5 costly), none blocking; A needs no format change, B forces format version 5 (C6) | `technical/capability-scan.md`, `technical/impact.md`, `technical/assessment.md` (round 1); this row; C3 and P1, P7 go to the convergence `PD-`. Vendor claude, model opus |

Dispatch log: `phase | delegate | vendor | model | tokens-scale | ledger run | artifact produced`

- `SOLUTION_EXPLORATION | ROLE-planner | claude | opus | L (subagent reported 125,313 tokens, 25 tool uses, 327 s) | a20827c30634d2743 | technical/capability-scan.md, impact.md, assessment.md`

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
| 2026-10-28 | DISCOVERY | PRODUCT_DEFINITION | ROLE-product-manager | DISCOVERY exit criteria met: problem, user, current state and success signals stated with sources; no open escalation-class ambiguity | Entry precondition (`lifecycle-hooks.md` §3.4.1 PRODUCT_DEFINITION) holds: Discovery has the target user, jobs J1–J3 and problems P1–P3 each with a source (S1), mapping `CAP-0001` (S2), success signals 1–5 (S3) and known non-goals. Hooks: HOOK-phase-entry pass | `2b4a364ef1aee73c`, head `5d2d9fa` |
| 2026-10-28 | PRODUCT_DEFINITION | SOLUTION_EXPLORATION | ROLE-product-manager | PRODUCT_DEFINITION exit criteria met: outcome O1–O3, out of scope (7 items), success measures 1–6, draft `REQ-0013` covering O1–O3, Product Definition Contract citing the raw request | Entry precondition (`lifecycle-hooks.md` §3.4.1 SOLUTION_EXPLORATION) holds: F1 `initiative.md` rev 2 has an outcome and a non-empty out-of-scope section; one `status: draft` `REQ-`; F2 draft-mode coverage (inline, deterministic): J1 -> `REQ-0013` Requirement, J2 -> Requirement ("one short command"), J3 -> Non-goals and the initiative out of scope; no `R1` defect. `requirement` counter 12 -> 13, checked against `origin/main`. No scope `PD-` needed yet: A1–A9 are recorded in the chosen-option `PD-`. Hooks: HOOK-phase-entry pass | `2b4a364ef1aee73c`, head `40416ec` |
| 2026-10-28 | SOLUTION_EXPLORATION | SOLUTION_CONVERGENCE | ROLE-product-manager | SOLUTION_EXPLORATION exit criteria met: options A and B recorded, each with a feasibility verdict (`feasible-with-constraints`) and a user-visible trade-off; PM recommends A with reasons | Entry precondition (`lifecycle-hooks.md` §3.4.1 SOLUTION_CONVERGENCE) holds: X1 two distinguishable options; X2 each verdict in the closed set (`technical/assessment.md` round 1); one Consultation log row for the one delegate response. No design dispatch: no visual surface (`project/constraints.md` row 8, `PD-0001` item 3; to be recorded in the convergence `PD-`, §9d.5). Hooks: HOOK-phase-entry pass | `2b4a364ef1aee73c`, head `6a25069` |
| 2026-10-28 | SOLUTION_CONVERGENCE | DECOMPOSITION | ROLE-product-manager | SOLUTION_CONVERGENCE exit criteria met: one accepted chosen-option `PD-0012` (option A), indexed, with the rejected option B and its reasons; it also settles A1–A9, C3 and P1, P7; `REQ-0013` (draft) is consistent with it; no option left under consideration; Solution Contract `product/solution-contract.md` cites `PD-0012` and states there is no design concept (no visual surface, `PD-0012` item 13) | Choice settled by the request (escalation-policy §3 route 2: "Let me clean them up", "Keep it simple"; the driving session relayed that the PM makes the product decisions); no `Q-`. Entry precondition (`lifecycle-hooks.md` §3.4.1 DECOMPOSITION) holds: exactly one accepted chosen-option `PD-` (`PD-0012`) citing verdict `feasible-with-constraints` (`technical/assessment.md` round 1). Counter `decision` 11 -> 12, checked against `origin/main`. `INIT-0004` rev 3. Hooks: HOOK-phase-entry pass | `2b4a364ef1aee73c`, head `e3b874b` |

> Every product-side session updates this file before ending — **including
> sessions that failed**, which record the failure in `next_action` and do not
> advance `phase`.
