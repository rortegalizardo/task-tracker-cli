---
id: PSTATE-INIT-0003
type: product-state
title: Product definition state for INIT-0003
status: authoritative
revision: 4
owner_role: ROLE-product-manager
created: 2026-10-27
updated: 2026-10-27
updated_by_role: ROLE-product-manager
initiative: INIT-0003
phase: SOLUTION_EXPLORATION
phase_entered: 2026-10-27
requester: "the requester (repository owner, rortegalizardo), via the driving session, 2026-10-27"
next_action: "ROLE-planner (PRODUCT-DISCOVERY): one product-feasibility-assessment dispatch (capability scan, impact, assessment) for options A and B; then ROLE-product-manager records the verdicts in ## Options"
blocked_by: []
converged: false
readiness_verdict: none   # none | READY | READY-with-known-issues | NOT READY | void
stories: [REQ-0012]
design_refs: []
decisions: []
---

# Product definition state — INIT-0003

`phase` above is the authority for where this work stands on the product side.
Delivery stage lives in `delivery/state.md` and is owned by `ROLE-orchestrator`;
these two files never describe the same thing and never share a writer.

## Where this stands

SOLUTION_EXPLORATION. Outcome O1–O3, out of scope, draft `REQ-0012` and the Product Definition Contract written; architect consult next.

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

ROLE-planner (PRODUCT-DISCOVERY): one product-feasibility-assessment dispatch (capability scan, impact, assessment) for options A and B; then ROLE-product-manager records the verdicts in ## Options.

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

**Target user.** One person who keeps their own task list with `ttc` on their
own machine: the requester. ttc has one user and no shared list
(`CAP-0001` Boundaries; INIT-0001 out of scope). Source: S1 below.

**Jobs and problems, with sources.**

| # | Job or problem | Source |
| --- | --- | --- |
| J1 | Push a task back to a later date, often ("I keep pushing tasks back"). | Request, verbatim (`sources/2026-10-27-requester-request.md`) |
| J2 | Do it quickly: one short command. | Request, verbatim: "Give me a quick way to postpone a task." (same file) |
| J3 | Keep the feature simple: little to learn, nothing else changes. | Request, verbatim: "Keep it simple." (same file) |
| P1 | No command changes a task's due date after `ttc add`. | `src/commands/` (add, delete, export, help, import, important, list, note, rename, stats, status, tag); README usage; `PD-0003` Consequences "No way to change a due date"; head `ae4417c` |
| P2 | So pushing a task back today means editing `tasks.json` by hand, or deleting the task and adding it again, which gives it a new id. Until then an open task whose date has passed keeps showing `!overdue` in `ttc list`. | README "Data file format"; `src/commands/delete.js` (ids never reused, `PD-0003`); `src/overdue.js` (`isOverdue`: open, has a due date, due before today) |

**Current-state capability mapping (S2).** `CAP-0001` — local task tracking
from the `ttc` command line. This initiative extends it. `CAP-0001` is still
`draft` and does not describe everything that shipped; the current-state
evidence is the code and README at head `ae4417c`:

- `ttc add "<title>" [--due YYYY-MM-DD] [--tag <t>]... [--note "<text>"] [--important]`
  is the only way to give a task a due date (`src/commands/add.js`, README).
- A due date is `YYYY-MM-DD` and a real calendar date; "today" is the local
  date on the user's machine; a task is overdue when it is open and its due
  date is before today (`PD-0003` items 5–6, `src/overdue.js`).
- `ttc list` lines show `due:<date>` and `!overdue`
  (`#<id> [ ]|[x] <title> [due:<date>] [!overdue] [!important] [+<tag>]...`);
  the order is important tasks first, then ascending id; the due date does not
  affect the order (README "Listing and filtering tasks").
- Changing commands such as `ttc important <id>` print one confirmation line,
  write atomically under a lock, and work on open and done tasks
  (`src/commands/important.js`, `PD-0008`).
- `tasks.json` is format version 4 (README "Data file format", `PD-0010`).

**Success signals (S3).**

1. A user postpones a task with one command that names only the task.
2. Afterwards the task is due later than it was, and it is not overdue.
3. The command prints the task's new due date.
4. Nothing else about the task, the other tasks or the list order changes.
5. A data file written by older ttc still works.

**Known non-goals.** Hiding or snoozing tasks; setting or clearing a due date
at will; giving a due date to a task that has none; postponing several tasks
in one command; counting how often a task was postponed; weekends, holidays or
times of day; reminders; recurring tasks.

Sources: S1 = the request file above; INIT-0001 `initiative.md` out of scope;
S2/S3 = the code and README at head `ae4417c`.

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
| REQ-0012 | A task is postponed from the ttc command line in one short command | draft (rev 1) | CAP-0001 | none — no user-facing visual surface | none — on the frontier |

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
| 2026-10-27 | INTAKE | DISCOVERY | ROLE-product-manager | INTAKE exit criteria met: one initiative, one problem, one named requester, ambiguity rows A1–A11 all classified (`pm-resolvable`) | Entry precondition (`lifecycle-hooks.md` §3.4.1 DISCOVERY) holds: `initiative.md` at `status: draft`; state at INTAKE with requester, problem statement and a classified ambiguity log. Discovery written (J1–J3, P1–P2, S2 `CAP-0001`, S3 signals 1–5, non-goals). No `Q-` raised. Hooks: HOOK-phase-entry pass | `444a288e2444d5ce`, head `7ba472c` |
| 2026-10-27 | DISCOVERY | PRODUCT_DEFINITION | ROLE-product-manager | DISCOVERY exit criteria met: problem, user, current state and success signals stated with sources; no open escalation-class ambiguity | Entry precondition (`lifecycle-hooks.md` §3.4.1 PRODUCT_DEFINITION) holds: Discovery has the target user, jobs J1–J3 and problems P1–P2 each with a source (S1), mapping `CAP-0001` (S2), success signals 1–5 (S3) and known non-goals. Hooks: HOOK-phase-entry pass | `444a288e2444d5ce`, head `8978f33` |
| 2026-10-27 | PRODUCT_DEFINITION | SOLUTION_EXPLORATION | ROLE-product-manager | PRODUCT_DEFINITION exit criteria met: outcome O1–O3, out of scope (9 items), success measures 1–6, draft `REQ-0012` covering O1–O3, Product Definition Contract citing the raw request | Entry precondition (`lifecycle-hooks.md` §3.4.1 SOLUTION_EXPLORATION) holds: F1 `initiative.md` rev 2 has an outcome and a non-empty out-of-scope section; one `status: draft` `REQ-`; F2 draft-mode coverage (inline, deterministic): J1 -> `REQ-0012` Requirement, J2 -> Scope bullet 1 ("one short command"), J3 -> Non-goals and the initiative out of scope; no `R1` defect. `requirement` counter 11 -> 12, checked against `origin/main`. No scope `PD-` needed yet: A1–A11 are recorded in the chosen-option `PD-`. Hooks: HOOK-phase-entry pass | `444a288e2444d5ce`, head `b6c0a3e` |

> Every product-side session updates this file before ending — **including
> sessions that failed**, which record the failure in `next_action` and do not
> advance `phase`.
