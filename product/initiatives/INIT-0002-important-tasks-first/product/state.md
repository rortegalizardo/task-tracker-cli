---
id: PSTATE-INIT-0002
type: product-state
title: Product definition state for INIT-0002
status: authoritative
revision: 7
owner_role: ROLE-product-manager
created: 2026-10-26
updated: 2026-10-26
updated_by_role: ROLE-product-manager
initiative: INIT-0002
phase: DECOMPOSITION
phase_entered: 2026-10-26
requester: "the requester (repository owner, rortegalizardo), via the driving session, 2026-10-26"
next_action: "ROLE-product-manager: DECOMPOSITION — write REQ-0011 in full (behavior, acceptance criteria, technical constraints from PD-0009, PD-0010 and assessment C1–C7), then dispatch the coherence check round 1 (ROLE-planner)"
blocked_by: []
converged: false
readiness_verdict: none   # none | READY | READY-with-known-issues | NOT READY | void
stories: [REQ-0011]
design_refs: []
decisions: [PD-0009, PD-0010]
---

# Product definition state — INIT-0002

`phase` above is the authority for where this work stands on the product side.
Delivery stage lives in `delivery/state.md` and is owned by `ROLE-orchestrator`;
these two files never describe the same thing and never share a writer.

## Where this stands

DECOMPOSITION. Option A chosen (`PD-0009`); the mark is stored in format 4 with a one-way upgrade (`PD-0010`); Solution Contract at `product/solution-contract.md`.

## Problem statement

The requester wants to mark some tasks as more important than others, and to
see the important ones first when they run `ttc list`. They asked to keep it
simple. Source: `sources/2026-10-26-requester-request.md` (verbatim).

Today every task is equal: `ttc list` shows tasks in ascending id order, and no
command or stored field marks a task as important (`src/commands/list.js`,
`src/commands/add.js`, README "Data file format", head `6ea6439`).

## Next action

ROLE-product-manager: DECOMPOSITION — write REQ-0011 in full (behavior, acceptance criteria, technical constraints from PD-0009, PD-0010 and assessment C1–C7), then dispatch the coherence check round 1 (ROLE-planner).

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

**Target user.** One person who keeps their own task list with `ttc` on their
own machine: the requester. ttc has one user and no shared list
(`CAP-0001` Boundaries; INIT-0001 out of scope). Source: S1 below.

**Jobs and problems, with sources.**

| # | Job or problem | Source |
| --- | --- | --- |
| J1 | Mark some tasks as more important than others. | Request, verbatim: "mark some tasks as more important than others" (`sources/2026-10-26-requester-request.md`) |
| J2 | See the important tasks first when listing, before the rest. | Request, verbatim: "see the important ones first when I list" (same file) |
| J3 | Keep the feature simple: little to learn, nothing else changes. | Request, verbatim: "Keep it simple." (same file) |
| P1 | Today every task is equal. `ttc list` sorts only by ascending id, so an important task shows wherever its id puts it. | `src/commands/list.js` (sort `a.id - b.id`), head `6ea6439` |
| P2 | No command, option or stored field marks a task as important. | `src/commands/` (add, list, status, tag, note, rename, delete, export, import, stats, help); README "Data file format" (`{ id, title, status, due, tags, note }`), head `6ea6439` |

**Current-state capability mapping (S2).** `CAP-0001` — local task tracking
from the `ttc` command line. This initiative extends it. `CAP-0001` is still
`draft` and does not yet describe behaviour that shipped (notes, search,
export filters). The current-state evidence for this initiative is the code and
README at head `6ea6439`:

- `ttc list [--open|--done|--all|--overdue] [--tag <t>] [--due-from ...] [--due-to ...] [--search <text>]`
  prints one line per task, `#<id> [ ]|[x] <title> [due:<date>] [!overdue] [+<tag>]...`,
  in ascending id order, or `No tasks.` (`src/commands/list.js`).
- `ttc add "<title>" [--due YYYY-MM-DD] [--tag <t>]... [--note "<text>"]` prints `Added task <id>` (`src/commands/add.js`).
- Pair commands with a no-op message: `done`/`reopen` print `Completed task <id>` /
  `Task <id> is already done` (`src/commands/status.js`).
- `tasks.json` is format version 3; older versions are read and rewritten as
  version 3 by the next changing command; a newer version is refused (README
  "Data file format").
- `ttc export` JSON is the stored format; CSV has the header
  `id,title,status,due,tags,note` (README "Exporting tasks").

**Success signals (S3).**

1. After a user marks tasks as important, `ttc list` shows every marked task
   before every unmarked one, in every view and with every filter.
2. One command marks a task and one command unmarks it; `ttc add` can mark a
   new task.
3. A user can tell from a list line whether a task is marked.
4. A list with no marked task prints exactly what it prints today.
5. A data file written by older ttc still works, and no task in it is marked.

**Known non-goals.** Several importance levels; filtering the list to
important tasks only; counting them in `ttc stats`; a CSV column; any other
sort order or sort option; reminders.

Sources: S1 = the request file above; INIT-0001 `initiative.md` out of scope;
S2/S3 = the code and README at head `6ea6439`.

## Options

| Option | User-visible difference | Feasibility verdict | Cost / risk | Trade-off |
| --- | --- | --- | --- | --- |
| A — one on/off important mark | `ttc add ... --important`; `ttc important <id>` marks, `ttc unimportant <id>` unmarks (no-op messages, no write on a no-op); `ttc list` prints important tasks first, ascending id inside each group, with a `!important` token on the line | `feasible-with-constraints`, band `multi-component` (`technical/assessment.md`, round 1) | Constraints C1–C7 (`technical/assessment.md` round 1). C2: the format 4 upgrade is one-way, so older ttc refuses the file after new ttc's first change | Least to learn: two groups only |
| B — three levels (high, normal, low) | `ttc add ... --priority high\|normal\|low`; `ttc priority <id> <level>`; `ttc list` orders high, normal, low, ascending id inside each level, with `!high` / `!low` tokens | `feasible-with-constraints`, band `multi-component` (`technical/assessment.md`, round 1) | C1–C7 plus C8 (fixed level spelling and case); P2: no success or no-op message defined yet | Finer ordering, more to learn; contradicts the out-of-scope item "more than one level" |

_Recommended option and why:_ **A.** It is what the request asks for ("mark
some tasks as more important", "see the important ones first", "Keep it
simple"). It stays inside the out-of-scope section, which excludes levels, and
it carries one constraint fewer than B (no C8).

_Chosen (SOLUTION_CONVERGENCE, 2026-10-26):_ **A**, `PD-0009`. B rejected for
the reasons in `PD-0009` "Options considered". The architect's C2/P1 choice:
option (a), the one-way format 4 upgrade, `PD-0010`. No option is left under
consideration.

## Consultation log

| Date | Delegate role | Question | Answer / verdict | Recorded as |
| --- | --- | --- | --- | --- |
| 2026-10-26 | ROLE-planner (PRODUCT-DISCOVERY) | Feasibility verdict, constraints, risks and band for options A and B (one dispatch: capability scan, impact, assessment; §9d.1) | A and B both `feasible-with-constraints`, `multi-component`; constraints C1–C8; false assumptions P1–P3 | `technical/capability-scan.md`, `technical/impact.md`, `technical/assessment.md` (round 1); this row; C1–C3 and P1 go to the convergence `PD-`. Vendor claude, model opus |

Dispatch log: `phase | delegate | vendor | model | tokens-scale | ledger run | artifact produced`

- `SOLUTION_EXPLORATION | ROLE-planner | claude | opus | L (subagent reported 166,151 tokens, 22 tool uses, 345 s) | aa0daa48e900afa25 | technical/capability-scan.md, impact.md, assessment.md`

## Escalation log

| Date | Question | `Q-` | Asked of | Answer | Recorded as |
| --- | --- | --- | --- | --- | --- |

## Stories

| `REQ-` | Title | Status | `CAP-` | `DES-` | Sequencing note |
| --- | --- | --- | --- | --- | --- |
| REQ-0011 | Important tasks are marked from the ttc command line and listed first | draft | CAP-0001 | none — no user-facing visual surface | none — on the frontier |

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
| 2026-10-26 | INTAKE | DISCOVERY | ROLE-product-manager | INTAKE exit criteria met: one initiative, one problem, one named requester, ambiguity rows A1–A9 all classified (`pm-resolvable`) | Entry precondition (`lifecycle-hooks.md` §3.4.1 DISCOVERY) holds: `initiative.md` at `status: draft`; state at INTAKE with requester, problem statement and a classified ambiguity log. Discovery written (J1–J3, P1–P2, S2 `CAP-0001`, S3 signals 1–5, non-goals). No `Q-` raised. Hooks: HOOK-phase-entry pass | `b14f2ea367f1add1`, head `68a070b` |
| 2026-10-26 | DISCOVERY | PRODUCT_DEFINITION | ROLE-product-manager | DISCOVERY exit criteria met: problem, user, current state and success signals stated with sources; no open escalation-class ambiguity | Entry precondition (`lifecycle-hooks.md` §3.4.1 PRODUCT_DEFINITION) holds: Discovery has the target user, jobs J1–J3 and problems P1–P2 each with a source (S1), mapping `CAP-0001` (S2), success signals 1–5 (S3) and known non-goals. Hooks: HOOK-phase-entry pass | `b14f2ea367f1add1`, head `dc90a63` |
| 2026-10-26 | PRODUCT_DEFINITION | SOLUTION_EXPLORATION | ROLE-product-manager | PRODUCT_DEFINITION exit criteria met: outcome O1–O3, out of scope (9 items), success measures 1–5, draft `REQ-0011` covering O1–O3, Product Definition Contract citing the raw request | Entry precondition (`lifecycle-hooks.md` §3.4.1 SOLUTION_EXPLORATION) holds: F1 `initiative.md` rev 2 has an outcome and a non-empty out-of-scope section; one `status: draft` `REQ-`; F2 draft-mode coverage (inline, deterministic): J1 -> `REQ-0011` Scope bullet 1, J2 -> Scope bullet 2, J3 -> Non-goals and the initiative out of scope; no `R1` defect. No scope `PD-` needed yet: A1–A9 are recorded in the chosen-option `PD-`. Hooks: HOOK-phase-entry pass | `b14f2ea367f1add1`, head `60ea0b2` |
| 2026-10-26 | SOLUTION_EXPLORATION | SOLUTION_CONVERGENCE | ROLE-product-manager | SOLUTION_EXPLORATION exit criteria met: options A and B recorded, each with a feasibility verdict (`feasible-with-constraints`) and a user-visible trade-off; PM recommends A with reasons | Entry precondition (`lifecycle-hooks.md` §3.4.1 SOLUTION_CONVERGENCE) holds: X1 two distinguishable options; X2 each verdict in the closed set (`technical/assessment.md` round 1); one Consultation log row for the one delegate response. No design dispatch: no visual surface (requester's run limits; to be recorded in the convergence `PD-`, §9d.5). Hooks: HOOK-phase-entry pass | `b14f2ea367f1add1`, head `9731f42` |
| 2026-10-26 | SOLUTION_CONVERGENCE | SOLUTION_CONVERGENCE | ROLE-product-manager | Run stopped at a clean checkpoint: projected usage crosses the owner's frozen 400k-token product ceiling | No transition. Phase entered, no convergence work started; `next_action` names the resume step. No `Q-` open | `b14f2ea367f1add1`, head `9731f42` |
| 2026-10-26 | SOLUTION_CONVERGENCE | DECOMPOSITION | ROLE-product-manager | SOLUTION_CONVERGENCE exit criteria met: one accepted chosen-option `PD-0009` (option A), indexed, with the rejected option B and its reasons; `PD-0010` settles the C1 format rule and the C2/P1 choice (a); `REQ-0011` (draft) is consistent with both (its scope already names the mark, list order, storage, export/import and help); no option left under consideration; Solution Contract `product/solution-contract.md` cites `PD-0009` and states that there is no design concept (no visual surface, `PD-0009` item 11) | Resumed on the owner's go-ahead (2026-10-26, new ceilings: 550k tokens, 4M cache reads, 60 min). Entry precondition (`lifecycle-hooks.md` §3.4.1 DECOMPOSITION) holds: exactly one accepted chosen-option `PD-` (`PD-0009`) citing verdict `feasible-with-constraints` (`technical/assessment.md` round 1). Counter `decision` 8 -> 10, checked against `origin/main` `3dbf454`. No `Q-`: every choice is PM-resolvable under the requester's run limits. Hooks: HOOK-canonical-root pass, HOOK-hydrate pass (`readiness: needs-orchestration`, expected before HANDOFF; defect carried: `CAP-0001` draft predates shipped behaviour), HOOK-phase-entry pass | `6136a67d57b0d9fc`, head `3dbf454` |

> Every product-side session updates this file before ending — **including
> sessions that failed**, which record the failure in `next_action` and do not
> advance `phase`.
