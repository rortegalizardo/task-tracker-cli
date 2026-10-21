---
id: REQ-0010
type: requirement
title: The ttc stats command prints the totals of open, done and overdue tasks
status: draft
revision: 2
owner_role: ROLE-product-manager
created: 2026-10-20
updated: 2026-10-20
initiative: INIT-0001
outcome_element: "O10. The user can read the totals of open, done and overdue tasks."
acceptance:
  - "no `tasks.json` and no `TTC_HOME` folder, then `ttc stats` → stdout is exactly the three lines `open: 0`, `done: 0` and `overdue: 0`, in that order, stderr is empty, exit code 0, and neither `tasks.json` nor the `TTC_HOME` folder is created"
  - "tasks 1 `Buy milk`, 2 `Pay rent` and 3 `Read`, all open and made with `ttc add`, then `ttc done 2` → `ttc stats` prints exactly the three lines `open: 2`, `done: 1` and `overdue: 0`, in that order, exit code 0"
  - "tasks 1 `Buy milk`, 2 `Pay rent` and 3 `Read`, all made with `ttc add`, then `ttc done 2`, then `ttc reopen 2` → `ttc stats` prints exactly the three lines `open: 3`, `done: 0` and `overdue: 0`, in that order, exit code 0"
  - "tasks 1 `A` (due `<yesterday>`), 2 `B` (due `<today>`), 3 `C` (due `<tomorrow>`), 4 `D` (no due date) and 5 `E` (due `<yesterday>`, then marked done with `ttc done 5`), all made with `ttc add`, then `ttc stats` → stdout is exactly the three lines `open: 4`, `done: 1` and `overdue: 1`, in that order, exit code 0 (`<yesterday>`, `<today>` and `<tomorrow>` are worked out from the machine's local date); `ttc list`, `ttc list --done` and `ttc list --overdue` print 4, 1 and 1 task lines"
  - "tasks 1 `A` (due 2020-01-01) and 2 `B` (due `<yesterday>`), both open and made with `ttc add`, then `ttc stats` → stdout is exactly the three lines `open: 2`, `done: 0` and `overdue: 2` (an overdue task is counted in `open` as well)"
  - "12 tasks made with `ttc add`, then `ttc done 1` and `ttc done 2` → `ttc stats` prints exactly the three lines `open: 10`, `done: 2` and `overdue: 0`"
  - "an open task 1 `Pay rent` whose due date is the local date, at the moment of the test, in the time zone `Pacific/Pago_Pago` (UTC-11) → `ttc stats` run with `TZ=Pacific/Pago_Pago` prints exactly the three lines `open: 1`, `done: 0` and `overdue: 0`; `ttc stats` run with `TZ=Pacific/Kiritimati` (UTC+14) at the same moment prints exactly the three lines `open: 1`, `done: 0` and `overdue: 1` (the two zones are 25 hours apart, so their local dates differ)"
  - "tasks 1 `Buy milk` and 2 `Pay rent` stored, then `ttc stats` run twice → both runs print the same three lines, stderr is empty, exit code 0, and `tasks.json` unchanged"
  - "each of `ttc stats now`, `ttc stats --all` and `ttc stats --json`, with task 1 stored → stderr is one line that starts with `ttc: `, stdout is empty, exit code 1, and `tasks.json` unchanged; with no `tasks.json`, `ttc stats now` gives the same kind of line and creates no `tasks.json`"
  - "`tasks.json` holds the text `{` and `ttc stats` runs → stderr is exactly one line `ttc: cannot read <path>: <reason>` (`<path>` is the path of `tasks.json`, `<reason>` is not empty), stdout is empty, exit code 1, and `tasks.json` still holds `{`"
  - "`ttc help` → stdout holds the usage line `ttc stats` as well as the usage lines of the stories it depends on, exit code 0"
  - "`npm test` runs `node:test` tests covering every criterion above → all pass"
  - "the pull request delivering this story → the CI `test` check passes"
capabilities: []
design_refs: []
decisions: [PD-0001, PD-0003]
depends_on: [REQ-0001, REQ-0002, REQ-0003, REQ-0004, REQ-0007]
constraints: []
observability: []
rollout: none
readiness: not-assessed
tickets: []
supersedes:
superseded_by:
---

# REQ-0010 — The ttc stats command prints the totals of open, done and overdue tasks

> A requirement **is** the engineering-ready product story. The canonical schema
> is `schemas/frontmatter.md` §"Engineering-ready product story"; its sixteen
> elements are the sections below plus the frontmatter above. Every section is
> written — an element with nothing to say carries its explicit empty form, never
> a blank.

## Requirement

The user can read the totals of open, done and overdue tasks.

## Scope

This story covers `ttc stats` and nothing else:

- the three totals, their order and their wording;
- the rule that an overdue task is counted in the open total as well;
- the argument rules and the unreadable-list error for this command;
- the one new usage line.

Code lives in the repository rortegalizardo/task-tracker-cli (~/Desktop/Projects/task-tracker-cli).

## Non-goals

- Totals per tag, per due date or per week — the spec asks for three totals only.
- A line for the number of all tasks — `PD-0003` item 15 fixes three lines, and open plus done is the number of tasks.
- Machine-readable output, such as JSON, or any option on the command — the usage line shows none.
- Charts or percentages — there is no visual surface (`constraints.md` row 8).
- Showing which tasks are overdue — `ttc list --overdue` does that.

## Behavior

**Command.** `ttc stats`

- **Output (`PD-0003` item 15).** It prints exactly three lines to stdout, in this order, then exits 0:
  - `open: <n>`
  - `done: <n>`
  - `overdue: <n>`
- **What each total counts.** `open` is the number of open tasks. `done` is the number of done tasks. `overdue` is the number of overdue tasks, by the rule in item 6: open, with a due date before today, where "today" is the date on the user's machine in its local time zone. A task due today is not overdue, a done task is never overdue, and a task with no due date is never overdue.
- **Overdue tasks are also open tasks.** An overdue task is counted in `open` as well as in `overdue`. Every task is open or done, so `open` plus `done` is the number of tasks, and `overdue` is never more than `open`.
- **No tasks.** With no tasks, all three totals are 0. With no `tasks.json`, the output is the same (item 13).
- **Nothing is written.** `stats` is a command that does not change the list: it never creates `tasks.json` or its folder, and never changes `tasks.json` (item 13). It prints nothing to stderr on success.
- **Unreadable list.** When `tasks.json` cannot be read, it fails with `ttc: cannot read <path>: <reason>` (item 13).
- **Argument rules (item 2).** It takes no argument. An extra argument and any option are errors, because the usage line shows none. Each error prints one line `ttc: <message>` (item 11).
- **Usage line this story adds (item 12).** `ttc stats`

## Acceptance criteria

- [ ] no `tasks.json` and no `TTC_HOME` folder, then `ttc stats` → stdout is exactly the three lines `open: 0`, `done: 0` and `overdue: 0`, in that order, stderr is empty, exit code 0, and neither `tasks.json` nor the `TTC_HOME` folder is created
- [ ] tasks 1 `Buy milk`, 2 `Pay rent` and 3 `Read`, all open and made with `ttc add`, then `ttc done 2` → `ttc stats` prints exactly the three lines `open: 2`, `done: 1` and `overdue: 0`, in that order, exit code 0
- [ ] tasks 1 `Buy milk`, 2 `Pay rent` and 3 `Read`, all made with `ttc add`, then `ttc done 2`, then `ttc reopen 2` → `ttc stats` prints exactly the three lines `open: 3`, `done: 0` and `overdue: 0`, in that order, exit code 0
- [ ] tasks 1 `A` (due `<yesterday>`), 2 `B` (due `<today>`), 3 `C` (due `<tomorrow>`), 4 `D` (no due date) and 5 `E` (due `<yesterday>`, then marked done with `ttc done 5`), all made with `ttc add`, then `ttc stats` → stdout is exactly the three lines `open: 4`, `done: 1` and `overdue: 1`, in that order, exit code 0 (`<yesterday>`, `<today>` and `<tomorrow>` are worked out from the machine's local date); `ttc list`, `ttc list --done` and `ttc list --overdue` print 4, 1 and 1 task lines
- [ ] tasks 1 `A` (due 2020-01-01) and 2 `B` (due `<yesterday>`), both open and made with `ttc add`, then `ttc stats` → stdout is exactly the three lines `open: 2`, `done: 0` and `overdue: 2` (an overdue task is counted in `open` as well)
- [ ] 12 tasks made with `ttc add`, then `ttc done 1` and `ttc done 2` → `ttc stats` prints exactly the three lines `open: 10`, `done: 2` and `overdue: 0`
- [ ] an open task 1 `Pay rent` whose due date is the local date, at the moment of the test, in the time zone `Pacific/Pago_Pago` (UTC-11) → `ttc stats` run with `TZ=Pacific/Pago_Pago` prints exactly the three lines `open: 1`, `done: 0` and `overdue: 0`; `ttc stats` run with `TZ=Pacific/Kiritimati` (UTC+14) at the same moment prints exactly the three lines `open: 1`, `done: 0` and `overdue: 1` (the two zones are 25 hours apart, so their local dates differ)
- [ ] tasks 1 `Buy milk` and 2 `Pay rent` stored, then `ttc stats` run twice → both runs print the same three lines, stderr is empty, exit code 0, and `tasks.json` unchanged
- [ ] each of `ttc stats now`, `ttc stats --all` and `ttc stats --json`, with task 1 stored → stderr is one line that starts with `ttc: `, stdout is empty, exit code 1, and `tasks.json` unchanged; with no `tasks.json`, `ttc stats now` gives the same kind of line and creates no `tasks.json`
- [ ] `tasks.json` holds the text `{` and `ttc stats` runs → stderr is exactly one line `ttc: cannot read <path>: <reason>` (`<path>` is the path of `tasks.json`, `<reason>` is not empty), stdout is empty, exit code 1, and `tasks.json` still holds `{`
- [ ] `ttc help` → stdout holds the usage line `ttc stats` as well as the usage lines of the stories it depends on, exit code 0
- [ ] `npm test` runs `node:test` tests covering every criterion above → all pass
- [ ] the pull request delivering this story → the CI `test` check passes

## Sequencing

- `REQ-0001` comes first: `stats` reads the stored list, runs inside the command skeleton, prints errors in the one-line form and adds its line to `ttc help`.
- `REQ-0002` comes before it: tasks, with due dates, exist only because `add --due` can create them.
- `REQ-0003` comes before it: the criteria compare the totals with the number of lines that `ttc list` and `ttc list --done` print, which that story provides.
- `REQ-0004` comes before it: the `done` total counts tasks marked done with `ttc done`, and `reopen` moves a task back to `open`.
- `REQ-0007` comes before it: the `overdue` total uses the overdue rule that story introduces, and the criteria compare the overdue total with the number of lines that `ttc list --overdue` prints, which that story adds.

## Technical constraints

None yet — filled at DECOMPOSITION from the architect's assessment (technical/assessment.md).

## Observability

none — a local, offline command; its stdout/stderr lines and exit code are the whole operable signal, and the requester ruled out network (constraints.md row 3).

## Rollout

none

## Notes

- Criteria that need a date use `<yesterday>`, `<today>` and `<tomorrow>`, worked out from the machine's local date when the test runs, so they stay true on any day. The fixed date 2020-01-01 is always in the past.
- The time-zone criterion rests on `PD-0003` item 6 ("in its local time zone"), the same as in `REQ-0007`.
- The wording of argument-shape errors is engineering's (`PD-0003` item 2); the criteria assert only the form `ttc: <message>`.
- `PD-0003` item 15 gives the three lines and the counting rule.

> **Immutable once `status: accepted`** — in its product content. The lifecycle
> fields `status`, `readiness`, and `tickets` are advanced by the delivery roles
> under the restricted authority in `manifest.yaml`. Any content change is a new
> `REQ-` with `supersedes`.
