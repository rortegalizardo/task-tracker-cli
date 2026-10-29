---
id: PSTATE-INIT-0005
type: product-state
title: Product definition state for INIT-0005
status: authoritative
revision: 3
owner_role: ROLE-product-manager
created: 2026-10-29
updated: 2026-10-29
updated_by_role: ROLE-product-manager
initiative: INIT-0005
phase: PRODUCT_DEFINITION
phase_entered: 2026-10-29
requester: "the requester (repository owner, rortegalizardo), via the driving session, 2026-10-29"
next_action: "ROLE-product-manager: PRODUCT_DEFINITION — outcome, out of scope, success measures, draft REQ, Product Definition Contract"
blocked_by: []
converged: false
readiness_verdict: none   # none | READY | READY-with-known-issues | NOT READY | void
stories: []
design_refs: []
decisions: []
---

# Product definition state — INIT-0005

`phase` above is the authority for where this work stands on the product side.
Delivery stage lives in `delivery/state.md` and is owned by `ROLE-orchestrator`;
these two files never describe the same thing and never share a writer.

## Where this stands

PRODUCT_DEFINITION. Discovery is written (J1–J3, P1–P3, `CAP-0001`, signals
1–5). No escalation-class ambiguity is open.

## Problem statement

The requester often needs a new task that is like one they already have, and
wants to make it as a copy instead of typing everything again. They asked to
keep it simple. Source: `sources/2026-10-29-requester-request.md` (verbatim).

Today the only way to make a task is `ttc add "<title>"` with `--due`, each
`--tag`, `--note` and `--important` typed again (`src/commands/add.js`; README
"Task notes", "Important tasks"). No command reads one task and makes another
from it (`src/commands/index.js`, 16 commands). Head `7f4bddf`.

## Next action

ROLE-product-manager: PRODUCT_DEFINITION — outcome, out of scope, success measures, draft REQ, Product Definition Contract.

## Blocked by

Nothing.

## Ambiguity log

All rows are `pm-resolvable`. They are clarifications of the stated outcome,
equivalent expressions of it, story-level detail, or already decided (§4.1;
escalation-policy §3 route 2). The requester's own words settle the ties:
"another task like an existing one", "make a copy without retyping
everything" and "Keep it simple"; the driving session relayed "Make the
product decisions yourself and record them as PD-; ask the requester only
genuine stakeholder or taste questions". No row changes the outcome, the user
or a success measure, and no row drops or narrows a stated need (§4.2), so no
`Q-` is raised.

| Date | Ambiguity | Class (`pm-resolvable` / `escalation`) | Resolution or `Q-` |
| --- | --- | --- | --- |
| 2026-10-29 | A1. What does the copy carry over from the original? | pm-resolvable | What the user would otherwise retype: the title, due date, tags, note and important mark ("without retyping everything"). The exact set is fixed in the convergence `PD-`. |
| 2026-10-29 | A2. Is the copy open, or does it keep the original's status? | pm-resolvable | Open. "another task" is new work to do, and copying a done task is the plain way to do it again. Recorded in the convergence `PD-`. |
| 2026-10-29 | A3. What id does the copy get? | pm-resolvable | The next id, like any new task. Already decided: ids are given in order and never reused (`PD-0003` item 1). |
| 2026-10-29 | A4. Where does the copy show in `ttc list`? | pm-resolvable | Where its id and important mark put it, like any task. Already decided (`PD-0003` item 7, `PD-0009`). |
| 2026-10-29 | A5. Can the copy differ from the original in the same command, for example a new due date? | pm-resolvable | The title, tags, note and mark can already be changed afterwards (`ttc rename`, `ttc tag`, `ttc note`, `ttc important` / `ttc unimportant`). A due date cannot: `ttc postpone` only moves it one day at a time and never sets or clears one (`PD-0011` items 3, 5). Whether the copy command takes a due date is decided at SOLUTION_CONVERGENCE between the options, after the architect costs them; "without retyping everything" and "Keep it simple" are the tie-breakers. |
| 2026-10-29 | A6. One task at a time, or several? | pm-resolvable | One: "make a copy". Copying several tasks in one command is out of scope. |
| 2026-10-29 | A7. What does the command print? | pm-resolvable | The new task's id, so the user can change the copy next without listing. Exact text decided at SOLUTION_CONVERGENCE. |
| 2026-10-29 | A8. Does the copy remember which task it came from? | pm-resolvable | No. Nothing in the ask needs it, and it would add stored data against "Keep it simple". Out of scope. |
| 2026-10-29 | A9. What happens to data files written by older ttc? | pm-resolvable | They keep working. Whether the stored format changes is the architect's to confirm at SOLUTION_EXPLORATION. |
| 2026-10-29 | A10. What is the command called? | pm-resolvable | `ttc copy`, the requester's own word ("make a copy"); equivalent names (`dup`, `clone`) add nothing (§4.1). Recorded in the convergence `PD-`. |

## Discovery

**Target user.** One person who keeps their own task list with `ttc` on their
own machine: the requester. ttc has one user and no shared list
(`CAP-0001` Boundaries; INIT-0001 out of scope). Source: S1 below.

**Jobs and problems, with sources.**

| # | Job or problem | Source |
| --- | --- | --- |
| J1 | Often make a new task that is like a task already in the list ("I often need another task like an existing one."). | Request, verbatim (`sources/2026-10-29-requester-request.md`) |
| J2 | Make it as a copy, without typing its details again ("Let me make a copy without retyping everything."). | Request, verbatim (same file) |
| J3 | Keep the feature simple: little to learn, nothing else changes ("Keep it simple."). | Request, verbatim (same file) |
| P1 | Today a task like an existing one is made with `ttc add`, typing the title, `--due`, each `--tag`, `--note` and `--important` again; the title and note must be retyped exactly. | `src/commands/add.js`; README "Task notes", "Important tasks"; head `7f4bddf` |
| P2 | No command reads one task and makes another from it. | `src/commands/index.js` (16 commands); `ttc help` at head `7f4bddf` |
| P3 | Once a task exists, its title, tags, note and mark can be changed (`ttc rename`, `ttc tag`, `ttc note`, `ttc important`, `ttc unimportant`), but its due date can only be moved one day at a time with `ttc postpone`, which never gives a task its first due date and never clears one. A copy that keeps an old due date would be overdue and could only be postponed day by day. | `PD-0011` items 3, 5; README "Postponing a task"; INIT-0001 out of scope "Changing or clearing a due date after `add`" |

**Current-state capability mapping (S2).** `CAP-0001` — local task tracking
from the `ttc` command line. This initiative extends it. `CAP-0001` is still
`draft` and does not describe everything that shipped; the current-state
evidence is the code and README at head `7f4bddf`:

- `ttc add "<title>" [--due YYYY-MM-DD] [--tag <t>]... [--note "<text>"] [--important]`
  makes an open task with the next id and prints `Added task <id>`
  (`PD-0003` items 1, 10; `src/commands/add.js`). With no id left it fails with
  `ttc: no task id is left`.
- Title, tag and date rules: `PD-0003` items 3–5; the latest due date ttc
  stores is `9999-12-31` (`PD-0011` item 6). Note rules: README "Task notes".
- `ttc list` shows open tasks unless `--done`, `--all` or `--overdue` is given,
  important tasks first, then by id (`PD-0003` item 7, `PD-0009`).
- Changing commands write atomically under a lock; a refusal writes nothing; a
  failure after the save exits 1 and keeps the change (`PD-0004` items 3–4,
  `PD-0008`).
- `tasks.json` is format version 4; versions 1–3 are read and rewritten as
  version 4 by the next changing command (README "Data file format", `PD-0010`).

**Success signals (S3).**

1. A user makes a new task like an existing one with one short command that
   needs only the existing task's id.
2. The new task holds the details the user would otherwise have retyped.
3. The command says the new task's id, so the user can change the copy next.
4. The original task and every other task are unchanged; the new task gets a
   new id, never one used before.
5. A data file written by older ttc still works.

**Known non-goals.** Copying several tasks at once; recurring or automatic
copies; templates; linking a copy to its original; any change to how other
commands behave.

Sources: S1 = the request file above; INIT-0001 `initiative.md` out of scope;
S2/S3 = the code and README at head `7f4bddf`.

## Options

| Option | User-visible difference | Feasibility verdict | Cost / risk | Trade-off |
| --- | --- | --- | --- | --- |

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
| 2026-10-29T06:51:09Z | — | BOOTSTRAP | ROLE-product-manager | Raw request relayed by the driving session | Packet: `readiness: ready`, `scope.initiative: null`, profile S, no areas, no open `Q-` (`Q-0001` answered). `neighbouring` read in full: `CAP-0001` (draft) has no copy of a task; no `PD-` (accepted or rejected) concerns copying a task; INIT-0001 out of scope "Recurring tasks" and "Changing or clearing a due date after `add`" are story boundaries, not rejected decisions, and a copy made by hand is not a recurring task; `PD-0003` items 1, 2, 7, 10, `PD-0004`, `PD-0008`, `PD-0009`, `PD-0010` and `PD-0011` bind. INIT-0001..INIT-0004 are not touched. Defect carried (advisory): `CAP-0001` is still draft and predates shipped behaviour; code and README at head `7f4bddf` are the current-state evidence. Hooks: HOOK-canonical-root pass, HOOK-hydrate pass | `0e519ee7443786e9`, head `7f4bddf` |
| 2026-10-29T06:52:56Z | BOOTSTRAP | INTAKE | ROLE-product-manager | Packet emitted, scope resolved to none | Triage verdict `new-initiative`: not `satisfied-by CAP-0001` (no command makes a task from another; `ttc add` needs every detail typed again); no `PD-` settles it; no constraint forbids it; no initiative covers it (INIT-0001 base commands, INIT-0002 important mark, INIT-0003 postpone, INIT-0004 clean), so not a duplicate; one outcome named. Raw request committed verbatim. `INIT-0005` allocated (counter 4 -> 5, checked against `origin/main` `7f4bddf`). Size: small (≤3 stories expected). Hooks: HOOK-initiative-resolved pass, HOOK-phase-entry pass | `0e519ee7443786e9`, head `7f4bddf` |
| 2026-10-29T06:53:58Z | INTAKE | DISCOVERY | ROLE-product-manager | INTAKE exit criteria met: one initiative, one problem, one named requester, ambiguity rows A1–A10 all classified (`pm-resolvable`) | Entry precondition (`lifecycle-hooks.md` §3.4.1 DISCOVERY) holds: `initiative.md` at `status: draft`; state at INTAKE with requester, problem statement and a classified ambiguity log. Discovery written (J1–J3, P1–P3, S2 `CAP-0001`, S3 signals 1–5, non-goals). No delegate consulted (optional, read-only; the code answers the current state). No `Q-` raised. Hooks: HOOK-phase-entry pass | `0e519ee7443786e9`, head `7d335d8` |
| 2026-10-29T06:54:12Z | DISCOVERY | PRODUCT_DEFINITION | ROLE-product-manager | DISCOVERY exit criteria met: problem, user, current state and success signals stated with sources; no open escalation-class ambiguity | Entry precondition (`lifecycle-hooks.md` §3.4.1 PRODUCT_DEFINITION) holds: Discovery has the target user, jobs J1–J3 and problems P1–P3 each with a source (S1), mapping `CAP-0001` (S2), success signals 1–5 (S3) and known non-goals. Hooks: HOOK-phase-entry pass | `0e519ee7443786e9`, head `28899a1` |

> Every product-side session updates this file before ending — **including
> sessions that failed**, which record the failure in `next_action` and do not
> advance `phase`.
