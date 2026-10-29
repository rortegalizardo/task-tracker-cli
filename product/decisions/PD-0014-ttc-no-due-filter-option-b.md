---
id: PD-0014
type: decision
title: Build INIT-0006 as option B, ttc list --no-due narrows any view to tasks with no due date, and ttc export takes it too
status: accepted
revision: 1
owner_role: ROLE-product-manager
created: 2026-10-29
updated: 2026-10-29
decided_on: 2026-10-29
affects: [INIT-0006, REQ-0015, CAP-0001]
supersedes:
superseded_by:
---

# PD-0014 — Build INIT-0006 as option B, ttc list --no-due narrows any view to tasks with no due date, and ttc export takes it too

## Context

The requester said: "Tasks without a due date get lost in my list. Give me a
quick way to see just those. Keep it simple."
(`initiatives/INIT-0006-tasks-without-due-date/product/sources/2026-10-29-requester-request.md`).
Today `ttc list` shows open tasks, important first, then by id, and a task
with no due date is a line with no `due:` token among the others. No option
shows only those tasks: `--due-from` and `--due-to` leave them out,
`--overdue` never shows them, and `ttc export` shares the `ttc list` options
(Discovery P1–P3 in `initiatives/INIT-0006-tasks-without-due-date/product/state.md`).
The ambiguity log there (A1–A9) is all `pm-resolvable`. The architect found
option A (`--no-due` as a fifth status view) and option B (`--no-due` as a
filter, like `--tag`) both `feasible-with-constraints`, band `contained`,
with constraints C1–C10 (C8 A only, C9 B only), risks R1–R5 and narrowing
points P1–P7 and N1–N5, none blocking or costly, and no stored-format change
in either (`initiatives/INIT-0006-tasks-without-due-date/technical/assessment.md`,
round 1).

The choice is settled by the request itself (escalation-policy §3 route 2;
`product-manager-orchestrator` §4.1). The quick command the request asks for
is the same under both options: `ttc list --no-due`, which shows the open
tasks with no due date, nothing else typed. The options differ only in
combinations the request does not mention, so neither drops or narrows a
stated need (§4.2). "Keep it simple" decides those: under B, `--no-due`
follows the rule every `ttc list` filter already follows ("All options
combine with AND", README), so there is nothing new to learn; under A it
joins the "pick one view" group with an unstated "open only" meaning, and
`--no-due --done` becomes an error.

## Decision

1. **No due date (A1, C2).** A task has no due date when its stored due date
   is empty: exactly the tasks whose `ttc list` line has no `due:` token.
   Every task in every data format version holds a due value, empty or a
   date, so every task either has no due date or has one.
2. **The option (A2, A3, A4, N5).** `ttc list` gains the option `--no-due`.
   It takes no value and may be given once. It narrows the status view to
   the tasks with no due date, the way `--tag` narrows it:
   - `ttc list --no-due` shows the open tasks with no due date (the default
     view is `--open`; `ttc list --open --no-due` is the same);
   - `ttc list --done --no-due` shows the done tasks with no due date;
   - `ttc list --all --no-due` shows every task with no due date.
   It combines with `--tag` and `--search` by AND, like every filter.
   Example: open task 2 `Call mom` with no due date, open task 1 `Pay rent`
   due `2000-01-02`, done task 4 `Fix bike` with no due date: `ttc list
   --no-due` prints `#2 [ ] Call mom`; `ttc list --all --no-due` prints
   `#2 [ ] Call mom` then `#4 [x] Fix bike`.
3. **Combinations that can never match are refused (A6, N1, C10, R4).** A
   task with no due date is never overdue (`PD-0003` item 6), and `--due-from`
   and `--due-to` leave out tasks with no due date. So `--no-due` given with
   `--overdue`, `--due-from` or `--due-to` is refused before the list is read,
   exit 1, nothing on stdout, nothing written, with the existing message form
   `ttc: options cannot be combined: <opts>`. `<opts>` names `--no-due` and
   each of `--overdue`, `--due-from` and `--due-to` that was given, in the
   order the usage line lists them (`--overdue`, `--no-due`, `--due-from`,
   `--due-to`), separated by single spaces, whatever order they were typed in:
   - `ttc list --no-due --overdue` → `ttc: options cannot be combined: --overdue --no-due`
   - `ttc list --due-to 2026-01-31 --no-due` → `ttc: options cannot be combined: --no-due --due-to`
   - `ttc list --no-due --due-from 2026-01-01 --due-to 2026-01-31` →
     `ttc: options cannot be combined: --no-due --due-from --due-to`

   **Check order.** Argument errors come first, as today (unknown option,
   missing value, an option given twice, an unexpected argument; `PD-0003`
   item 2), then for `ttc export` the `--format` check, then the filter
   checks in this order: two status views given; **this refusal**; the tag;
   the `--due-from` date; the `--due-to` date; `--due-from` later than
   `--due-to`; an empty `--search`. So `ttc list --done --overdue --no-due`
   prints `ttc: options cannot be combined: --done --overdue`, and
   `ttc list --no-due --due-from 2026-02-30` prints
   `ttc: options cannot be combined: --no-due --due-from`. Without
   `--no-due`, every combination behaves exactly as today.
4. **What is shown (A5, C3; adds to `PD-0009` item 4).** Each task is shown on
   the line `ttc list` prints for it today (`PD-0003` item 8, `PD-0009`
   item 5), important tasks first, then the others, each group in ascending
   id order; `No tasks.` when none match. `PD-0009` item 4's list of filters
   the order rule covers gains `--no-due`.
5. **Nothing is written (C1, N3).** `ttc list --no-due` never writes
   `tasks.json` and never creates it or its folder. With no `tasks.json` it
   prints `No tasks.` and exits 0. A file written by older ttc (format
   versions 1–3) is read and left exactly as it is. A file that cannot be
   read fails as today, after the argument checks.
6. **`ttc export` takes it too (A7, N2, C5, C9).** `ttc export` takes
   `--no-due` with the same meaning, the same refusals and the same check
   order, keeping one option set for both commands, as the README promises
   ("mean the same as for `ttc list`"). Its default view stays `--all`, so
   `ttc export --no-due` exports every task with no due date, open and done,
   as `ttc export --tag <t>` exports every task with that tag. Every other
   export rule is unchanged: JSON or CSV, standard output or a file, a JSON
   export keeps the list's next id and the stored order of the tasks, and
   `tasks.json` is never written.
7. **Help (P1, P7; adds to `PD-0003` item 12).** Two usage lines change, in
   place, and the order of the lines does not:
   - `ttc list [--open|--done|--all|--overdue] [--no-due] [--tag <t>] [--due-from YYYY-MM-DD] [--due-to YYYY-MM-DD] [--search <text>]`
   - `ttc export [<file>] [--format json|csv] [--open|--done|--all|--overdue] [--no-due] [--tag <t>] [--due-from YYYY-MM-DD] [--due-to YYYY-MM-DD] [--search <text>]`
8. **README.** "Listing and filtering tasks" documents `--no-due`: what it
   shows, that it narrows any status view, that `ttc list --no-due` shows the
   open tasks with no due date, and the refusal in item 3 with one example.
   Its existing sentence "When `--due-from` or `--due-to` is given, tasks with
   no due date are left out" stays. "Exporting tasks" shows the new usage
   line and lists `--no-due` among the options that mean the same as for
   `ttc list`.
9. **Everything else is unchanged (O3, A9).** Every command typed as it can
   be typed today gives the same output and exit code as before, except
   `ttc help`, which changes only in the two lines of item 7. `ttc stats`
   does not count tasks with no due date. No stored-format change:
   `tasks.json` stays version 4 (C2).
10. **Tests (N4, C4, C6, C7).** The test oracle (`test/support/ttc-model.js`)
    and the argument fuzzing (`fuzz-gen.js`, `fuzz-harness.js`) gain
    `--no-due` and the refusal of item 3, written from this record, not from
    the new code (R1). The tests that assert the `ttc list` or `ttc export`
    usage line gain the new text. The perf guard (10,000 tasks, median
    under 500 ms) must still pass; it needs no new case.
11. **No visual surface.** ttc is "CLI only, no UI" (`project/constraints.md`
    row 8; `PD-0001` item 3). No design role is dispatched and no `DES-` is
    made; the story carries `design_refs: []`, and its acceptance criteria
    state the exact command output and exit codes.
12. **The architect's constraints.** C1–C7, C9 and C10 of
    `technical/assessment.md` (round 1) bind the story; C8 does not (option A
    only).
13. **How this record relates to earlier ones.** It adds to `PD-0003` items 7
    and 12 and `PD-0009` item 4. It changes nothing already decided there.

## Options considered

| Option | Why not |
| --- | --- |
| A — `--no-due` as a fifth status view (`--open|--done|--all|--overdue|--no-due`) | Gives the same `ttc list --no-due`, but adds an unstated "open only" meaning, makes `--no-due --done` an error, and leaves no way to list done tasks with no due date; one more rule to learn, against "Keep it simple" (C8). If export took it, a later move to B would change `ttc export --no-due` (R3) |
| Never-matching combinations print `No tasks.` under the AND rule | Exit 0 with `No tasks.` reads as "you have no such tasks" when the user typed a contradiction (R4). The platform already refuses a contradiction it can see in the arguments alone (`--due-from` later than `--due-to`) |
| `ttc export` keeps refusing `--no-due` (list only) | Splits the one option set the two commands share for the first time and makes the README promise "mean the same as for `ttc list`" untrue; a second set to keep in step costs more than the option it leaves out (C5) |
| A new command, for example `ttc undated` | A command that is only a view of the list; the request says "my list", and `--overdue` is the precedent for showing one kind of task on its own as a `ttc list` option |
| Moving tasks with no due date to the end of `ttc list`, or marking them | Changes the output of `ttc list` as it is typed today (O3); the request asks for "a quick way to see just those" |
| Counting tasks with no due date in `ttc stats` | Not asked (A9); "Keep it simple" |
| `--undated`, `--no-date` or `--nodue` as the name | Equivalent (§4.1). `--no-due` reads as the requester's "without a due date" and sits with `--due`, `--due-from` and `--due-to`. `--undated` only guards against a later "no due date" option on `ttc add` or `ttc copy` (R5), which nothing needs: `ttc add` without `--due` already makes a task with no due date, and removing a date stays out of scope |

## Consequences

**Costs.**

- **One more option and fixed text.** The refusal message form, its check
  order and the two usage lines are fixed; changing one later needs a record
  that supersedes this one. Tests assert them.
- **One exception to "all options combine with AND".** `--no-due` with
  `--overdue`, `--due-from` or `--due-to` is an error, not an empty list.
  The README states it.
- **Export changes too.** `ttc export` gains the option and its usage line
  changes; `ttc export --no-due` gives open and done tasks while
  `ttc list --no-due` gives open ones, the same split `--tag` has today.
- **Tests move.** The oracle and the fuzzing gain the option, written from
  this record (C6, R1); the usage-line tests gain the new text.

**Benefits.**

- One short command, `ttc list --no-due`, shows exactly the tasks that get
  lost, as `ttc list` already shows them.
- Nothing new to learn: it narrows a view like `--tag`, and works with every
  view and filter it can match.
- No format change, no write, and no change to any command as typed today
  apart from two `ttc help` lines.

## Provenance

Decided by `ROLE-product-manager` at SOLUTION_CONVERGENCE of INIT-0006;
`context_digest` `c995399e88ef32e3`, head `bec62d4`.

> Once `status: accepted`, this body is never rewritten. A change of mind is a
> new decision with `supersedes: PD-0014`.
