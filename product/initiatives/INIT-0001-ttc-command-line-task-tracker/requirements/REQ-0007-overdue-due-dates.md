---
id: REQ-0007
type: requirement
title: The ttc list command marks overdue tasks and can show only them
status: draft
revision: 3
owner_role: ROLE-product-manager
created: 2026-10-20
updated: 2026-10-20
initiative: INIT-0001
outcome_element: "O7. The user can see which open tasks are past their due date and list only those."
acceptance:
  - "`ttc add 'Pay rent' --due <yesterday>` then `ttc list` → stdout is exactly the single line `#1 [ ] Pay rent due:<yesterday> !overdue`, exit code 0 (`<yesterday>` is the day before the machine's local date, written `YYYY-MM-DD`)"
  - "open task 1 `Pay rent` with due date `<today>`, then `ttc list` → stdout is exactly the single line `#1 [ ] Pay rent due:<today>`, with no `!overdue` (`<today>` is the machine's local date)"
  - "open task 1 `Pay rent` with due date `<tomorrow>`, then `ttc list` → stdout is exactly the single line `#1 [ ] Pay rent due:<tomorrow>`, with no `!overdue`"
  - "task 1 `Pay rent` with due date `<yesterday>`, then `ttc done 1` → `ttc list --done` and `ttc list --all` each print exactly the single line `#1 [x] Pay rent due:<yesterday>`, with no `!overdue`"
  - "open task 1 `Pay rent` with no due date, then `ttc list` → stdout is exactly the single line `#1 [ ] Pay rent`, with no `!overdue`"
  - "`ttc add 'Pay rent' --due <yesterday> --tag home --tag bills` then `ttc list` → stdout is exactly the single line `#1 [ ] Pay rent due:<yesterday> !overdue +bills +home` (the marker comes after the due date and before the tags)"
  - "open task 1 `Pay rent` with due date `<yesterday>`, then `ttc done 1`, then `ttc reopen 1` → after `ttc done 1`, `ttc list --all` prints exactly `#1 [x] Pay rent due:<yesterday>`; after `ttc reopen 1`, it prints exactly `#1 [ ] Pay rent due:<yesterday> !overdue`"
  - "open task 1 `Pay rent` with due date `<yesterday>` and tag `home` → each of `ttc list`, `ttc list --open`, `ttc list --all` and `ttc list --tag home` prints exactly the single line `#1 [ ] Pay rent due:<yesterday> !overdue +home`"
  - "tasks 1 `A` (open, due `<yesterday>`, tag `home`), 2 `B` (open, due `<today>`), 3 `C` (due `<yesterday>`, then marked done with `ttc done 3`), 4 `D` (open, no due date) and 5 `E` (open, due 2020-01-01, tag `work`), then `ttc list --overdue` → stdout is exactly the two lines `#1 [ ] A due:<yesterday> !overdue +home` and `#5 [ ] E due:2020-01-01 !overdue +work`, in that order, stderr is empty, exit code 0"
  - "the same five tasks, then `ttc list --overdue --tag home` and `ttc list --tag work --overdue` → the first prints exactly the line `#1 [ ] A due:<yesterday> !overdue +home` and the second prints exactly the line `#5 [ ] E due:2020-01-01 !overdue +work`, exit code 0 both times"
  - "only task 1 `B` open with due date `<today>`, then `ttc list --overdue` → stdout is the single line `No tasks.`, exit code 0; with no `tasks.json`, `ttc list --overdue` prints the same line and creates neither `tasks.json` nor its folder"
  - "each of `ttc list --overdue --open`, `ttc list --open --overdue`, `ttc list --overdue --done`, `ttc list --all --overdue` and `ttc list --overdue --overdue` → stderr is one line that starts with `ttc: `, stdout is empty, exit code 1, and `tasks.json` unchanged"
  - "an open task 1 `Pay rent` whose due date is the local date, at the moment of the test, in the time zone `Pacific/Pago_Pago` (UTC-11) → `ttc list` run with `TZ=Pacific/Pago_Pago` prints exactly `#1 [ ] Pay rent due:<that date>`, with no `!overdue`; `ttc list` run with `TZ=Pacific/Kiritimati` (UTC+14) at the same moment prints exactly `#1 [ ] Pay rent due:<that date> !overdue` (the two zones are 25 hours apart, so their local dates differ)"
  - "`tasks.json` holds the text `{` and `ttc list --overdue` runs → stderr is exactly one line `ttc: cannot read <path>: <reason>` (`<path>` is the path of `tasks.json`, `<reason>` is not empty), stdout is empty, exit code 1, and `tasks.json` still holds `{`"
  - "`ttc help` → stdout holds the usage line `ttc list [--open|--done|--all|--overdue] [--tag <t>]` in place of the usage line `ttc list [--open|--done|--all] [--tag <t>]` of the list story it depends on, and holds the usage lines of the other stories it depends on, exit code 0"
  - "`npm test` runs `node:test` tests covering every criterion above → all pass"
  - "the pull request delivering this story → the CI `test` check passes"
capabilities: []
design_refs: []
decisions: [PD-0001, PD-0003, PD-0004, PD-0005]
depends_on: [REQ-0001, REQ-0002, REQ-0003, REQ-0004]
constraints: ["C1 (technical/assessment.md, round 1)", "C3 (technical/assessment.md, round 1)", "C4 (technical/assessment.md, round 1)", "C6 (technical/assessment.md, round 1)", "C7 (technical/assessment.md, round 1)"]
observability: []
rollout: none
readiness: not-assessed
tickets: []
supersedes:
superseded_by:
---

# REQ-0007 — The ttc list command marks overdue tasks and can show only them

> A requirement **is** the engineering-ready product story. The canonical schema
> is `schemas/frontmatter.md` §"Engineering-ready product story"; its sixteen
> elements are the sections below plus the frontmatter above. Every section is
> written — an element with nothing to say carries its explicit empty form, never
> a blank.

## Requirement

The user can see which open tasks are past their due date, and list only those.

## Scope

This story changes `ttc list` and nothing else:

- the meaning of "overdue" and of "today";
- the `!overdue` marker on a task line in every list view;
- the new status option `--overdue` and its rules;
- the changed usage line for `list`.

It adds no new command. It changes no stored data.

Code lives in the repository rortegalizardo/task-tracker-cli (~/Desktop/Projects/task-tracker-cli).

## Non-goals

- Changing or clearing a due date after `add` — no command in the spec (`PD-0003` Consequences).
- A "due soon" or "due today" marker — a task due today is not overdue, and the spec asks for no other marker.
- Sorting tasks by due date — `list` keeps ascending id order.
- Reminders or notifications — not in the spec.
- A time of day on a due date — a due date is a calendar date.
- Counting overdue tasks — `ttc stats` is a later story and uses this story's rule.

## Behavior

**Today and overdue (`PD-0003` item 6).**

- "Today" is the date on the user's machine, in its local time zone, not the date in UTC.
- A task is overdue when it is open and its due date is before today.
- A task due today is not overdue. A done task is never overdue. A task with no due date is never overdue.
- A task's overdue state follows its status: `done` removes it, and `reopen` brings it back if the due date is still before today.

**The marker (item 8).** An overdue task's line gets `!overdue` after `due:YYYY-MM-DD` and before the tags. Example: `#3 [ ] Pay rent due:2026-10-01 !overdue +bills +home`. The marker appears in every view in which an overdue task is shown: the default view, `--open`, `--all`, `--tag` views and `--overdue`. No other line gets the marker, and the `--done` view never has it.

**`--overdue` (item 7).**

- `ttc list --overdue` shows the overdue tasks, in ascending id order, one line each, in the format of item 8.
- `--tag <t>` may be added and narrows the view, as for the other views.
- `--overdue` cannot be combined with `--open`, `--done` or `--all`: giving two is an error, and so is giving `--overdue` twice (item 2).
- When no task is overdue it prints `No tasks.` and exits 0. When `tasks.json` does not exist it prints the same and creates nothing (item 13).
- It prints nothing to stderr on success and never changes `tasks.json`.

**Everything else about `list`** is as in the list story: the default view is open tasks, the `--tag` rules, the argument rules and the unreadable-list error (`ttc: cannot read <path>: <reason>`, item 13; `PD-0004` item 8).

**Usage line (item 12).** This story changes the line for `list` to `ttc list [--open|--done|--all|--overdue] [--tag <t>]`. It replaces the line that the list story added; the usage still has one line for `list`.

## Acceptance criteria

- [ ] `ttc add 'Pay rent' --due <yesterday>` then `ttc list` → stdout is exactly the single line `#1 [ ] Pay rent due:<yesterday> !overdue`, exit code 0 (`<yesterday>` is the day before the machine's local date, written `YYYY-MM-DD`)
- [ ] open task 1 `Pay rent` with due date `<today>`, then `ttc list` → stdout is exactly the single line `#1 [ ] Pay rent due:<today>`, with no `!overdue` (`<today>` is the machine's local date)
- [ ] open task 1 `Pay rent` with due date `<tomorrow>`, then `ttc list` → stdout is exactly the single line `#1 [ ] Pay rent due:<tomorrow>`, with no `!overdue`
- [ ] task 1 `Pay rent` with due date `<yesterday>`, then `ttc done 1` → `ttc list --done` and `ttc list --all` each print exactly the single line `#1 [x] Pay rent due:<yesterday>`, with no `!overdue`
- [ ] open task 1 `Pay rent` with no due date, then `ttc list` → stdout is exactly the single line `#1 [ ] Pay rent`, with no `!overdue`
- [ ] `ttc add 'Pay rent' --due <yesterday> --tag home --tag bills` then `ttc list` → stdout is exactly the single line `#1 [ ] Pay rent due:<yesterday> !overdue +bills +home` (the marker comes after the due date and before the tags)
- [ ] open task 1 `Pay rent` with due date `<yesterday>`, then `ttc done 1`, then `ttc reopen 1` → after `ttc done 1`, `ttc list --all` prints exactly `#1 [x] Pay rent due:<yesterday>`; after `ttc reopen 1`, it prints exactly `#1 [ ] Pay rent due:<yesterday> !overdue`
- [ ] open task 1 `Pay rent` with due date `<yesterday>` and tag `home` → each of `ttc list`, `ttc list --open`, `ttc list --all` and `ttc list --tag home` prints exactly the single line `#1 [ ] Pay rent due:<yesterday> !overdue +home`
- [ ] tasks 1 `A` (open, due `<yesterday>`, tag `home`), 2 `B` (open, due `<today>`), 3 `C` (due `<yesterday>`, then marked done with `ttc done 3`), 4 `D` (open, no due date) and 5 `E` (open, due 2020-01-01, tag `work`), then `ttc list --overdue` → stdout is exactly the two lines `#1 [ ] A due:<yesterday> !overdue +home` and `#5 [ ] E due:2020-01-01 !overdue +work`, in that order, stderr is empty, exit code 0
- [ ] the same five tasks, then `ttc list --overdue --tag home` and `ttc list --tag work --overdue` → the first prints exactly the line `#1 [ ] A due:<yesterday> !overdue +home` and the second prints exactly the line `#5 [ ] E due:2020-01-01 !overdue +work`, exit code 0 both times
- [ ] only task 1 `B` open with due date `<today>`, then `ttc list --overdue` → stdout is the single line `No tasks.`, exit code 0; with no `tasks.json`, `ttc list --overdue` prints the same line and creates neither `tasks.json` nor its folder
- [ ] each of `ttc list --overdue --open`, `ttc list --open --overdue`, `ttc list --overdue --done`, `ttc list --all --overdue` and `ttc list --overdue --overdue` → stderr is one line that starts with `ttc: `, stdout is empty, exit code 1, and `tasks.json` unchanged
- [ ] an open task 1 `Pay rent` whose due date is the local date, at the moment of the test, in the time zone `Pacific/Pago_Pago` (UTC-11) → `ttc list` run with `TZ=Pacific/Pago_Pago` prints exactly `#1 [ ] Pay rent due:<that date>`, with no `!overdue`; `ttc list` run with `TZ=Pacific/Kiritimati` (UTC+14) at the same moment prints exactly `#1 [ ] Pay rent due:<that date> !overdue` (the two zones are 25 hours apart, so their local dates differ)
- [ ] `tasks.json` holds the text `{` and `ttc list --overdue` runs → stderr is exactly one line `ttc: cannot read <path>: <reason>` (`<path>` is the path of `tasks.json`, `<reason>` is not empty), stdout is empty, exit code 1, and `tasks.json` still holds `{`
- [ ] `ttc help` → stdout holds the usage line `ttc list [--open|--done|--all|--overdue] [--tag <t>]` in place of the usage line `ttc list [--open|--done|--all] [--tag <t>]` of the list story it depends on, and holds the usage lines of the other stories it depends on, exit code 0
- [ ] `npm test` runs `node:test` tests covering every criterion above → all pass
- [ ] the pull request delivering this story → the CI `test` check passes

## Sequencing

- `REQ-0001` comes first: the change runs inside the command skeleton, reads the stored list and updates `ttc help`.
- `REQ-0002` comes before it: tasks with due dates exist only because `add --due` can create them.
- `REQ-0003` comes before it: this story changes the `list` command, so `list` must exist.
- `REQ-0004` comes before it: the rule "a done task is never overdue" and the return of the marker on `reopen` can be shown only once a task can be marked done and reopened.

## Technical constraints

- **C1** (`technical/assessment.md`, round 1): The runtime is Node 24 with built-in modules only, and no network. The CI job has no install step, so a dependency also fails CI, and the built-in argument parser cannot be used as it is for single-dash arguments such as `-1` and `-home`.
- **C3** (`technical/assessment.md`, round 1): "Today" is the local calendar date in the process's time zone, and a due date is compared as a calendar date, never as an instant. Tests set the time zone and, where needed, the clock from the test side only; no `ttc` option or environment variable may exist for them.
- **C4** (`technical/assessment.md`, round 1): Test files run at the same time in separate processes. Every test uses its own data folder, home folder and working folder, and never reads or writes the real home folder of the person running the tests.
- **C6** (`technical/assessment.md`, round 1): Verification runs on Node 24 on Linux with a UTC clock in CI, and CI is the arbiter. The `engines` field is aligned to Node 24, and other operating systems are not verified.
- **C7** (`technical/assessment.md`, round 1): Stories after `REQ-0003` merge one at a time, in `depends_on` order, because they share the command list, the usage text and the argument rules. The stored-file layout is the one `REQ-0001` fixes.

## Observability

none — a local, offline command; its stdout/stderr lines and exit code are the whole operable signal, and the requester ruled out network (constraints.md row 3).

## Rollout

none

## Notes

- Criteria that need a date use `<yesterday>`, `<today>` and `<tomorrow>`, worked out from the machine's local date when the test runs, so they stay true on any day. The fixed date 2020-01-01 is always in the past.
- The time-zone criterion rests on `PD-0003` item 6 ("in its local time zone").
- `PD-0003` item 8 introduces the marker in the task-line format; this is the only story that adds `!overdue` and `--overdue`.
- The wording of argument-shape errors is engineering's (`PD-0003` item 2); the criteria assert only the form `ttc: <message>`.

> **Immutable once `status: accepted`** — in its product content. The lifecycle
> fields `status`, `readiness`, and `tickets` are advanced by the delivery roles
> under the restricted authority in `manifest.yaml`. Any content change is a new
> `REQ-` with `supersedes`.
