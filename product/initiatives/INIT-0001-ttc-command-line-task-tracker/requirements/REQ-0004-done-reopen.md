---
id: REQ-0004
type: requirement
title: The ttc done and ttc reopen commands change a task's status
status: draft
revision: 5
owner_role: ROLE-product-manager
created: 2026-10-20
updated: 2026-10-20
initiative: INIT-0001
outcome_element: "O4. The user can mark a task done and reopen it."
acceptance:
  - "`ttc done 1` with `Buy milk` as the only task (task 1, open) → stdout is the single line `Completed task 1`, stderr is empty, exit code 0; `ttc list --all` then prints `#1 [x] Buy milk`, and `ttc list` prints `No tasks.`"
  - "`ttc done 1` run again on the now-done task 1 → stdout is the single line `Task 1 is already done`, exit code 0; `ttc list --all` prints the same output as before the command"
  - "`ttc reopen 1` with task 1 `Buy milk` done → stdout is the single line `Reopened task 1`, stderr is empty, exit code 0; `ttc list` then prints `#1 [ ] Buy milk`"
  - "`ttc reopen 1` on an open task 1 → stdout is the single line `Task 1 is already open`, exit code 0; `ttc list --all` prints the same output as before the command"
  - "tasks 1 `Buy milk`, 2 `Pay rent` (due 2099-12-31, tag `bills`) and 3 `Read`, all open and made with `ttc add`, then `ttc done 2` → `ttc list --all` prints exactly `#1 [ ] Buy milk`, `#2 [x] Pay rent due:2099-12-31 +bills` and `#3 [ ] Read`; then `ttc reopen 2` → `ttc list --all` prints exactly `#1 [ ] Buy milk`, `#2 [ ] Pay rent due:2099-12-31 +bills` and `#3 [ ] Read`"
  - "`ttc done <arg>` and `ttc reopen <arg>` for each `<arg>` in `abc`, `0`, `-1` and `1.5` → stderr is exactly the line `ttc: invalid task id: <arg>`, stdout is empty, exit code 1, and `tasks.json` unchanged"
  - "`tasks.json` written by the test holds task 7 `Buy milk` (open) and a next id of 8, then `ttc done 007` → stdout is the single line `Completed task 7`, stderr is empty, exit code 0; `ttc list --all` then prints `#7 [x] Buy milk`"
  - "`ttc done 9007199254740992` and `ttc reopen 9007199254740992` → for each, stderr is exactly the line `ttc: invalid task id: 9007199254740992`, stdout is empty, exit code 1, and `tasks.json` unchanged"
  - "`ttc done 7` and `ttc reopen 7` with only task 1 stored → stderr is exactly the line `ttc: no task with id 7`, stdout is empty, exit code 1, and `tasks.json` unchanged; the same two commands with no `tasks.json` give the same line and create no `tasks.json`"
  - "each of `ttc done`, `ttc reopen`, `ttc done 1 2`, `ttc reopen 1 2`, `ttc done 1 --force` and `ttc reopen 1 --force` → stderr is one line that starts with `ttc: `, stdout is empty, exit code 1, and `tasks.json` unchanged"
  - "`tasks.json` holds the text `{` and `ttc done 1` runs, then `ttc reopen 1` runs → each prints on stderr exactly one line `ttc: cannot read <path>: <reason>` (`<path>` is the path of `tasks.json`, `<reason>` is not empty), stdout is empty, exit code 1, and `tasks.json` still holds `{`"
  - "`ttc help` → stdout holds the usage lines `ttc done <id>` and `ttc reopen <id>` as well as a usage line for each command that the stories it depends on add, exit code 0"
  - "`npm test` runs `node:test` tests covering every criterion above → all pass"
  - "the pull request delivering this story → the CI `test` check passes"
capabilities: [CAP-0001]
design_refs: []
decisions: [PD-0001, PD-0003, PD-0004, PD-0005]
depends_on: [REQ-0001, REQ-0002, REQ-0003]
constraints: ["C1 (technical/assessment.md, round 1)", "C2 (technical/assessment.md, round 1)", "C4 (technical/assessment.md, round 1)", "C5 (technical/assessment.md, round 1)", "C6 (technical/assessment.md, round 1)", "C7 (technical/assessment.md, round 1)"]
observability: []
rollout: none
readiness: not-assessed
tickets: []
supersedes:
superseded_by:
---

# REQ-0004 — The ttc done and ttc reopen commands change a task's status

> A requirement **is** the engineering-ready product story. The canonical schema
> is `schemas/frontmatter.md` §"Engineering-ready product story"; its sixteen
> elements are the sections below plus the frontmatter above. Every section is
> written — an element with nothing to say carries its explicit empty form, never
> a blank.

## Requirement

The user can mark a task done and reopen it.

## Scope

This story covers `ttc done <id>` and `ttc reopen <id>` and nothing else:

- changing one task's status between open and done;
- the repeated-action messages, the id errors and the argument rules for these two commands;
- the two new usage lines.

It changes only the status of the named task.

Code lives in the repository rortegalizardo/task-tracker-cli (~/Desktop/Projects/task-tracker-cli).

## Non-goals

- Marking several tasks done in one command — the usage line takes one id.
- Recording when a task was completed — the spec stores no completion date.
- Marking every task done at once — not in the spec.
- Naming a task by its title instead of its id — `<id>` is the only way (`PD-0003` item 2).
- Showing overdue tasks — the due-dates story.

## Behavior

**Commands.** `ttc done <id>` and `ttc reopen <id>`.

- **`done` (`PD-0003` items 9 and 10).** On an open task it makes the task done and prints `Completed task <id>`. On a done task it succeeds, changes nothing and prints `Task <id> is already done`. Exit code 0 both times.
- **`reopen` (items 9 and 10).** On a done task it makes the task open and prints `Reopened task <id>`. On an open task it succeeds, changes nothing and prints `Task <id> is already open`. Exit code 0 both times.
- **Only the status changes.** The task keeps its id, title, due date and tags, and every other task is unchanged. The commands ask for no confirmation (item 10).
- **Task id (item 2; `PD-0004` item 2).** `<id>` must be a positive whole number written in digits. Anything else is an error: `ttc: invalid task id: <arg>`, with `<arg>` as typed. The largest id is 9007199254740991: an `<id>` above it is an error: `ttc: invalid task id: <arg>`. Leading zeros are allowed: `007` names task 7, and messages print the id without them: `Completed task 7`. A valid number with no task is an error: `ttc: no task with id <id>`. This holds when `tasks.json` does not exist, and no file is created.
- **Argument rules (item 2).** A missing id, an extra argument and any option are errors, because the usage lines show no options. An argument that begins with a single `-`, such as `-1`, is not an option. Each error prints one line `ttc: <message>` (item 11).
- **Unreadable list.** When `tasks.json` cannot be read, both commands fail with `ttc: cannot read <path>: <reason>` (item 13; `PD-0004` item 8).
- **Atomic write.** A command that changes the status writes atomically (item 13; `PD-0004` items 3 and 4). A no-op writes nothing that changes the list.
- **Usage lines this story adds (item 12).** `ttc done <id>` and `ttc reopen <id>`

## Acceptance criteria

- [ ] `ttc done 1` with `Buy milk` as the only task (task 1, open) → stdout is the single line `Completed task 1`, stderr is empty, exit code 0; `ttc list --all` then prints `#1 [x] Buy milk`, and `ttc list` prints `No tasks.`
- [ ] `ttc done 1` run again on the now-done task 1 → stdout is the single line `Task 1 is already done`, exit code 0; `ttc list --all` prints the same output as before the command
- [ ] `ttc reopen 1` with task 1 `Buy milk` done → stdout is the single line `Reopened task 1`, stderr is empty, exit code 0; `ttc list` then prints `#1 [ ] Buy milk`
- [ ] `ttc reopen 1` on an open task 1 → stdout is the single line `Task 1 is already open`, exit code 0; `ttc list --all` prints the same output as before the command
- [ ] tasks 1 `Buy milk`, 2 `Pay rent` (due 2099-12-31, tag `bills`) and 3 `Read`, all open and made with `ttc add`, then `ttc done 2` → `ttc list --all` prints exactly `#1 [ ] Buy milk`, `#2 [x] Pay rent due:2099-12-31 +bills` and `#3 [ ] Read`; then `ttc reopen 2` → `ttc list --all` prints exactly `#1 [ ] Buy milk`, `#2 [ ] Pay rent due:2099-12-31 +bills` and `#3 [ ] Read`
- [ ] `ttc done <arg>` and `ttc reopen <arg>` for each `<arg>` in `abc`, `0`, `-1` and `1.5` → stderr is exactly the line `ttc: invalid task id: <arg>`, stdout is empty, exit code 1, and `tasks.json` unchanged
- [ ] `tasks.json` written by the test holds task 7 `Buy milk` (open) and a next id of 8, then `ttc done 007` → stdout is the single line `Completed task 7`, stderr is empty, exit code 0; `ttc list --all` then prints `#7 [x] Buy milk`
- [ ] `ttc done 9007199254740992` and `ttc reopen 9007199254740992` → for each, stderr is exactly the line `ttc: invalid task id: 9007199254740992`, stdout is empty, exit code 1, and `tasks.json` unchanged
- [ ] `ttc done 7` and `ttc reopen 7` with only task 1 stored → stderr is exactly the line `ttc: no task with id 7`, stdout is empty, exit code 1, and `tasks.json` unchanged; the same two commands with no `tasks.json` give the same line and create no `tasks.json`
- [ ] each of `ttc done`, `ttc reopen`, `ttc done 1 2`, `ttc reopen 1 2`, `ttc done 1 --force` and `ttc reopen 1 --force` → stderr is one line that starts with `ttc: `, stdout is empty, exit code 1, and `tasks.json` unchanged
- [ ] `tasks.json` holds the text `{` and `ttc done 1` runs, then `ttc reopen 1` runs → each prints on stderr exactly one line `ttc: cannot read <path>: <reason>` (`<path>` is the path of `tasks.json`, `<reason>` is not empty), stdout is empty, exit code 1, and `tasks.json` still holds `{`
- [ ] `ttc help` → stdout holds the usage lines `ttc done <id>` and `ttc reopen <id>` as well as a usage line for each command that the stories it depends on add, exit code 0
- [ ] `npm test` runs `node:test` tests covering every criterion above → all pass
- [ ] the pull request delivering this story → the CI `test` check passes

## Sequencing

- `REQ-0001` comes first: both commands read and write the stored list, run inside the command skeleton, print errors in the one-line form and add their lines to `ttc help`.
- `REQ-0002` comes before it: a task must exist, and `add` is the only command that creates one, before it can be completed or reopened.
- `REQ-0003` comes before it: the tests of this story read a task's status through `ttc list`, which shows `[ ]` and `[x]`.

## Technical constraints

- **C1** (`technical/assessment.md`, round 1): The runtime is Node 24 with built-in modules only, and no network. The CI job has no install step, so a dependency also fails CI, and the built-in argument parser cannot be used as it is for single-dash arguments such as `-1` and `-home`.
- **C2** (`technical/assessment.md`, round 1): "Atomic" holds at process level: after a crash, kill or error at any step of a write, `tasks.json` (and an export target) holds the whole old content or the whole new content. A power cut or operating-system crash cannot be tested in CI, and a replaced symlink becomes a regular file (`PD-0004` item 3).
- **C4** (`technical/assessment.md`, round 1): Test files run at the same time in separate processes. Every test uses its own data folder, home folder and working folder, and never reads or writes the real home folder of the person running the tests.
- **C5** (`technical/assessment.md`, round 1): Ids are exact only up to 9007199254740991. Id parsing and the import checks need that upper bound (`PD-0004` item 2).
- **C6** (`technical/assessment.md`, round 1): Verification runs on Node 24 on Linux with a UTC clock in CI, and CI is the arbiter. The `engines` field is aligned to Node 24, and other operating systems are not verified.
- **C7** (`technical/assessment.md`, round 1): Stories after `REQ-0003` merge one at a time, in `depends_on` order, because they share the command list, the usage text and the argument rules. The stored-file layout is the one `REQ-0001` fixes.

## Observability

none — a local, offline command; its stdout/stderr lines and exit code are the whole operable signal, and the requester ruled out network (constraints.md row 3).

## Rollout

none

## Notes

- A due date set with `add` stays on a done task. `PD-0003` item 6 makes a done task never overdue; the marker itself arrives with the due-dates story.
- The wording of argument-shape errors is engineering's (`PD-0003` item 2); the criteria assert only the form `ttc: <message>`.
- `PD-0003` item 9 lists the repeated-action messages and item 10 the success messages. `PD-0004` item 2 adds the id bound and the leading-zero rule to the id rules of item 2.

> **Immutable once `status: accepted`** — in its product content. The lifecycle
> fields `status`, `readiness`, and `tickets` are advanced by the delivery roles
> under the restricted authority in `manifest.yaml`. Any content change is a new
> `REQ-` with `supersedes`.
