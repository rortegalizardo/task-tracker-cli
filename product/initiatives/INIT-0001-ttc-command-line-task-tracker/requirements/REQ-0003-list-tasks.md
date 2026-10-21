---
id: REQ-0003
type: requirement
title: The ttc list command shows tasks by status and tag, one line each, in id order
status: draft
revision: 4
owner_role: ROLE-product-manager
created: 2026-10-20
updated: 2026-10-20
initiative: INIT-0001
outcome_element: "O3. The user can list open, done or all tasks, optionally only those holding one tag."
acceptance:
  - "each of `ttc list`, `ttc list --open`, `ttc list --done` and `ttc list --all` with no `tasks.json` → stdout is the single line `No tasks.`, stderr is empty, exit code 0, and neither `tasks.json` nor its folder is created"
  - "`ttc list` with list L (tasks 1 `Pay rent` — open, due 2099-12-31, tags `home` and `bills`; 2 `Call Ann` — done, tag `bills`; 3 `Read` — open, tag `home`; written to `tasks.json` by the test, because this story does not depend on `ttc done`) → stdout is exactly the two lines `#1 [ ] Pay rent due:2099-12-31 +bills +home` and `#3 [ ] Read +home`, stderr is empty, exit code 0"
  - "`ttc add 'Pay rent' --due 2099-12-31 --tag home --tag bills` then `ttc list`, with no earlier `tasks.json` → stdout of `ttc list` is exactly the single line `#1 [ ] Pay rent due:2099-12-31 +bills +home`, exit code 0"
  - "`ttc list --open` with list L → stdout is exactly the two lines `#1 [ ] Pay rent due:2099-12-31 +bills +home` and `#3 [ ] Read +home`, exit code 0"
  - "`ttc list --done` with list L → stdout is exactly the single line `#2 [x] Call Ann +bills`, exit code 0"
  - "`ttc list --all` with list L → stdout is exactly the three lines `#1 [ ] Pay rent due:2099-12-31 +bills +home`, `#2 [x] Call Ann +bills` and `#3 [ ] Read +home`, in that order, exit code 0"
  - "list L written to the file with its tasks in the order 3, 1, 2 and task 1's tags in the order `home`, `bills` → `ttc list --all` prints the lines of tasks 1, 2 and 3 in that order, and the line of task 1 ends with `+bills +home`"
  - "`ttc list --tag home` with list L → stdout is exactly the two lines `#1 [ ] Pay rent due:2099-12-31 +bills +home` and `#3 [ ] Read +home`, exit code 0"
  - "`ttc list --tag bills --all` with list L → stdout is exactly the two lines `#1 [ ] Pay rent due:2099-12-31 +bills +home` and `#2 [x] Call Ann +bills`, exit code 0"
  - "`ttc list --tag bills` and `ttc list --tag bills --done` with list L → the first prints exactly the line of task 1 and the second prints exactly the line `#2 [x] Call Ann +bills`, exit code 0 both times"
  - "`ttc list --tag HOME` with list L → stdout is the same two lines as `ttc list --tag home`, exit code 0"
  - "`ttc list --tag work` with list L → stdout is the single line `No tasks.`, stderr is empty, exit code 0"
  - "`ttc list --tag bills --done` and `ttc list --done --tag bills` with list L → both print exactly the single line `#2 [x] Call Ann +bills`"
  - "each of `ttc list --open --done`, `ttc list --done --all`, `ttc list --all --open` and `ttc list --all --all` → stderr is one line that starts with `ttc: `, stdout is empty, exit code 1, and `tasks.json` unchanged"
  - "each of `ttc list extra`, `ttc list --tag`, `ttc list --tag home --tag bills` and `ttc list --sort` → stderr is one line that starts with `ttc: `, stdout is empty, exit code 1, and `tasks.json` unchanged"
  - "`ttc list --tag 'two words'` → stderr is exactly the line `ttc: invalid tag: two words`, stdout is empty, exit code 1, and `tasks.json` unchanged"
  - "any `ttc list` command that succeeds, with list L → `tasks.json` has the same bytes after the command as before"
  - "`tasks.json` holds the text `{` and `ttc list` runs → stderr is exactly one line `ttc: cannot read <path>: <reason>` (`<path>` is the path of `tasks.json`, `<reason>` is not empty), stdout is empty, exit code 1, and `tasks.json` still holds `{`"
  - "`ttc help` → stdout holds the usage line `ttc list [--open|--done|--all] [--tag <t>]` as well as the usage lines of the stories it depends on, exit code 0"
  - "`npm test` runs `node:test` tests covering every criterion above → all pass"
  - "the pull request delivering this story → the CI `test` check passes"
capabilities: [CAP-0001]
design_refs: []
decisions: [PD-0001, PD-0003, PD-0004, PD-0005]
depends_on: [REQ-0001, REQ-0002]
constraints: ["C1 (technical/assessment.md, round 1)", "C4 (technical/assessment.md, round 1)", "C6 (technical/assessment.md, round 1)"]
observability: []
rollout: none
readiness: not-assessed
tickets: []
supersedes:
superseded_by:
---

# REQ-0003 — The ttc list command shows tasks by status and tag, one line each, in id order

> A requirement **is** the engineering-ready product story. The canonical schema
> is `schemas/frontmatter.md` §"Engineering-ready product story"; its sixteen
> elements are the sections below plus the frontmatter above. Every section is
> written — an element with nothing to say carries its explicit empty form, never
> a blank.

## Requirement

The user can list open, done or all tasks, optionally only those holding one tag, one line per task in id order.

## Scope

This story covers `ttc list [--open|--done|--all] [--tag <t>]` and nothing else:

- the status views `--open`, `--done` and `--all`, and the default view;
- the `--tag` filter;
- the order and the one-line format of a task;
- the empty state, the errors and the argument rules for this command;
- the one new usage line.

It never changes the stored list.

Code lives in the repository rortegalizardo/task-tracker-cli (~/Desktop/Projects/task-tracker-cli).

## Non-goals

- `--overdue` and the `!overdue` marker — the due-dates story adds both. In this story `--overdue` is an unknown option.
- Any order other than ascending id, and any sorting or limiting option — the spec has none.
- Searching by title text — not in the spec.
- Filtering by more than one tag — `--tag` may be given once (`PD-0003` item 7).
- Counting tasks — `ttc stats` is a later story.
- Marking tasks done — `ttc done` is a later story, so this story's tests write done tasks into `tasks.json` directly.

## Behavior

**Command.** `ttc list [--open|--done|--all] [--tag <t>]`

- **Status view (`PD-0003` item 7).** With no status option it shows open tasks. `--open` shows open tasks, `--done` shows done tasks and `--all` shows every task. `--open`, `--done` and `--all` cannot be combined: giving two is an error, and so is giving the same one twice (item 2).
- **Tag filter (items 7 and 4).** `--tag <t>` may be given once and narrows any status view to tasks holding that tag. `<t>` must be a valid tag: 1 to 32 characters, the first an English letter or a digit and each of the others an English letter, a digit, `-` or `_`. Otherwise the error is `ttc: invalid tag: <t>`, with `<t>` as typed. Tags are case-insensitive, so `--tag HOME` matches a task tagged `home`. A second `--tag` is an error (item 2).
- **Order (item 7).** Tasks are shown in ascending id order, whatever order the file stores them in.
- **One task line (item 8).** In this order, separated by single spaces: `#<id>`; `[ ]` for an open task or `[x]` for a done task; the title; `due:YYYY-MM-DD` if the task has a due date; `+<tag>` for each tag, in alphabetical order. Example: `#1 [ ] Pay rent due:2099-12-31 +bills +home`. There is no `!overdue` marker in this story.
- **Empty state (item 7).** When nothing matches, it prints `No tasks.` to stdout and exits 0. This includes the case where `tasks.json` does not exist.
- **Success.** The command prints only the task lines (or `No tasks.`) to stdout, prints nothing to stderr, and exits 0.
- **Read-only (item 13).** It never changes `tasks.json` and never creates it or its folder.
- **Argument rules (item 2).** Options may come before or after each other. These are errors: an extra positional argument, `--tag` with no value, `--tag` given twice, two status options, and an unknown option. Each prints one line `ttc: <message>` (item 11).
- **Unreadable list.** When `tasks.json` cannot be read, `list` fails with `ttc: cannot read <path>: <reason>` (item 13; `PD-0004` item 8).
- **Usage line this story adds (item 12).** `ttc list [--open|--done|--all] [--tag <t>]`

## Acceptance criteria

- [ ] each of `ttc list`, `ttc list --open`, `ttc list --done` and `ttc list --all` with no `tasks.json` → stdout is the single line `No tasks.`, stderr is empty, exit code 0, and neither `tasks.json` nor its folder is created
- [ ] `ttc list` with list L (tasks 1 `Pay rent` — open, due 2099-12-31, tags `home` and `bills`; 2 `Call Ann` — done, tag `bills`; 3 `Read` — open, tag `home`; written to `tasks.json` by the test, because this story does not depend on `ttc done`) → stdout is exactly the two lines `#1 [ ] Pay rent due:2099-12-31 +bills +home` and `#3 [ ] Read +home`, stderr is empty, exit code 0
- [ ] `ttc add 'Pay rent' --due 2099-12-31 --tag home --tag bills` then `ttc list`, with no earlier `tasks.json` → stdout of `ttc list` is exactly the single line `#1 [ ] Pay rent due:2099-12-31 +bills +home`, exit code 0
- [ ] `ttc list --open` with list L → stdout is exactly the two lines `#1 [ ] Pay rent due:2099-12-31 +bills +home` and `#3 [ ] Read +home`, exit code 0
- [ ] `ttc list --done` with list L → stdout is exactly the single line `#2 [x] Call Ann +bills`, exit code 0
- [ ] `ttc list --all` with list L → stdout is exactly the three lines `#1 [ ] Pay rent due:2099-12-31 +bills +home`, `#2 [x] Call Ann +bills` and `#3 [ ] Read +home`, in that order, exit code 0
- [ ] list L written to the file with its tasks in the order 3, 1, 2 and task 1's tags in the order `home`, `bills` → `ttc list --all` prints the lines of tasks 1, 2 and 3 in that order, and the line of task 1 ends with `+bills +home`
- [ ] `ttc list --tag home` with list L → stdout is exactly the two lines `#1 [ ] Pay rent due:2099-12-31 +bills +home` and `#3 [ ] Read +home`, exit code 0
- [ ] `ttc list --tag bills --all` with list L → stdout is exactly the two lines `#1 [ ] Pay rent due:2099-12-31 +bills +home` and `#2 [x] Call Ann +bills`, exit code 0
- [ ] `ttc list --tag bills` and `ttc list --tag bills --done` with list L → the first prints exactly the line of task 1 and the second prints exactly the line `#2 [x] Call Ann +bills`, exit code 0 both times
- [ ] `ttc list --tag HOME` with list L → stdout is the same two lines as `ttc list --tag home`, exit code 0
- [ ] `ttc list --tag work` with list L → stdout is the single line `No tasks.`, stderr is empty, exit code 0
- [ ] `ttc list --tag bills --done` and `ttc list --done --tag bills` with list L → both print exactly the single line `#2 [x] Call Ann +bills`
- [ ] each of `ttc list --open --done`, `ttc list --done --all`, `ttc list --all --open` and `ttc list --all --all` → stderr is one line that starts with `ttc: `, stdout is empty, exit code 1, and `tasks.json` unchanged
- [ ] each of `ttc list extra`, `ttc list --tag`, `ttc list --tag home --tag bills` and `ttc list --sort` → stderr is one line that starts with `ttc: `, stdout is empty, exit code 1, and `tasks.json` unchanged
- [ ] `ttc list --tag 'two words'` → stderr is exactly the line `ttc: invalid tag: two words`, stdout is empty, exit code 1, and `tasks.json` unchanged
- [ ] any `ttc list` command that succeeds, with list L → `tasks.json` has the same bytes after the command as before
- [ ] `tasks.json` holds the text `{` and `ttc list` runs → stderr is exactly one line `ttc: cannot read <path>: <reason>` (`<path>` is the path of `tasks.json`, `<reason>` is not empty), stdout is empty, exit code 1, and `tasks.json` still holds `{`
- [ ] `ttc help` → stdout holds the usage line `ttc list [--open|--done|--all] [--tag <t>]` as well as the usage lines of the stories it depends on, exit code 0
- [ ] `npm test` runs `node:test` tests covering every criterion above → all pass
- [ ] the pull request delivering this story → the CI `test` check passes

## Sequencing

- `REQ-0001` comes first: `list` reads the stored list, runs as a command of the skeleton, prints its errors in the one-line form and adds its line to `ttc help`.
- `REQ-0002` comes before it: `list` has tasks to show only once `add` can create them, and `list` must read back the tasks that `add` writes, including their due dates and tags.

## Technical constraints

- **C1** (`technical/assessment.md`, round 1): The runtime is Node 24 with built-in modules only, and no network. The CI job has no install step, so a dependency also fails CI, and the built-in argument parser cannot be used as it is for single-dash arguments such as `-1` and `-home`.
- **C4** (`technical/assessment.md`, round 1): Test files run at the same time in separate processes. Every test uses its own data folder, home folder and working folder, and never reads or writes the real home folder of the person running the tests.
- **C6** (`technical/assessment.md`, round 1): Verification runs on Node 24 on Linux with a UTC clock in CI, and CI is the arbiter. The `engines` field is aligned to Node 24, and other operating systems are not verified.

## Observability

none — a local, offline command; its stdout/stderr lines and exit code are the whole operable signal, and the requester ruled out network (constraints.md row 3).

## Rollout

none

## Notes

- The due dates in this story's examples are far in the future so that the examples stay true after the due-dates story adds `!overdue`.
- List L uses done tasks, which this story cannot create with a command. The test writes them into `tasks.json` directly, in the layout the program uses, because that JSON layout is engineering's choice (`PD-0003` item 13).
- The wording of argument-shape errors is engineering's (`PD-0003` item 2); the criteria assert only the form `ttc: <message>`.
- `PD-0003` items 7 and 8 give the view rules and the task-line format.

> **Immutable once `status: accepted`** — in its product content. The lifecycle
> fields `status`, `readiness`, and `tickets` are advanced by the delivery roles
> under the restricted authority in `manifest.yaml`. Any content change is a new
> `REQ-` with `supersedes`.
