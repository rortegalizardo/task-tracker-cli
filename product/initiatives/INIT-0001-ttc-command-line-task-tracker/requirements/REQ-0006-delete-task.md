---
id: REQ-0006
type: requirement
title: The ttc delete command removes a task and its id is never reused
status: draft
revision: 4
owner_role: ROLE-product-manager
created: 2026-10-20
updated: 2026-10-20
initiative: INIT-0001
outcome_element: "O6. The user can remove a task."
acceptance:
  - "tasks 1 `Buy milk`, 2 `Pay rent` and 3 `Read`, all open and made with `ttc add`, then `ttc delete 2` → stdout is the single line `Deleted task 2`, stderr is empty, exit code 0; `ttc list --all` prints exactly `#1 [ ] Buy milk` and `#3 [ ] Read` (the ids are not renumbered)"
  - "tasks 1, 2 and 3 stored with task 2 `Pay rent` done (written to `tasks.json` by the test, because this story does not depend on `ttc done`), then `ttc delete 2` → stdout is the single line `Deleted task 2`, exit code 0; `ttc list --all` prints no line for task 2 and still prints the lines of tasks 1 and 3"
  - "`ttc delete 2` run twice with tasks 1, 2 and 3 stored → the second run prints on stderr exactly the line `ttc: no task with id 2`, stdout is empty, exit code 1, and leaves `tasks.json` unchanged"
  - "tasks 1, 2 and 3 made with `ttc add`, then `ttc delete 3`, then `ttc add 'New'` → stdout of `ttc add` is the single line `Added task 4`, and `ttc list --all` prints the lines of tasks 1, 2 and 4, in that order (the id of the deleted highest-id task is not reused)"
  - "task 1 `Buy milk` as the only task, then `ttc delete 1`, then `ttc list --all`, then `ttc add 'Fresh'` → `ttc list --all` prints the single line `No tasks.`, and `ttc add` prints the single line `Added task 2`"
  - "`ttc delete 1` run with standard input closed and task 1 stored → stdout is the single line `Deleted task 1` with no prompt text, exit code 0 (no confirmation is asked)"
  - "`ttc delete <arg>` for each `<arg>` in `abc`, `0`, `-1` and `1.5` → stderr is exactly the line `ttc: invalid task id: <arg>`, stdout is empty, exit code 1, and `tasks.json` unchanged"
  - "`ttc delete 7` with only task 1 stored → stderr is exactly the line `ttc: no task with id 7`, stdout is empty, exit code 1, and `tasks.json` unchanged; the same command with no `tasks.json` gives the same line and creates no `tasks.json`"
  - "each of `ttc delete`, `ttc delete 1 2` and `ttc delete 1 --force`, with task 1 stored → stderr is one line that starts with `ttc: `, stdout is empty, exit code 1, and `tasks.json` unchanged"
  - "`tasks.json` holds the text `{` and `ttc delete 1` runs → stderr is exactly one line `ttc: cannot read <path>: <reason>` (`<path>` is the path of `tasks.json`, `<reason>` is not empty), stdout is empty, exit code 1, and `tasks.json` still holds `{`"
  - "`ttc help` → stdout holds the usage line `ttc delete <id>` as well as the usage lines of the stories it depends on, exit code 0"
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

# REQ-0006 — The ttc delete command removes a task and its id is never reused

> A requirement **is** the engineering-ready product story. The canonical schema
> is `schemas/frontmatter.md` §"Engineering-ready product story"; its sixteen
> elements are the sections below plus the frontmatter above. Every section is
> written — an element with nothing to say carries its explicit empty form, never
> a blank.

## Requirement

The user can remove a task, and its id is never given to another task.

## Scope

This story covers `ttc delete <id>` and nothing else:

- removing one task, open or done, from the stored list;
- the guarantee that the removed task's id is never given to a later task;
- the id errors and the argument rules for this command;
- the one new usage line.

Code lives in the repository rortegalizardo/task-tracker-cli (~/Desktop/Projects/task-tracker-cli).

## Non-goals

- Undoing a delete or restoring a deleted task — not in the spec, and no command lists deleted tasks.
- Deleting several tasks in one command — the usage line takes one id.
- Deleting every done task at once — not in the spec.
- Asking "are you sure?" first — no command asks for confirmation (`PD-0003` item 10).
- Renumbering the remaining tasks — ids are stable (`PD-0003` item 1).

## Behavior

**Command.** `ttc delete <id>`

- **Result (`PD-0003` item 10).** It removes task `<id>` and prints `Deleted task <id>` to stdout, then exits 0. It works on an open task and on a done task alike. The command asks for no confirmation.
- **Ids are never reused (item 1; `PD-0004` item 2).** Each task gets a positive whole number, given in order from 1. After a delete, the next task still gets a higher number than any task ever created. This holds when the deleted task had the highest id and when the list becomes empty. The remaining tasks keep their ids; nothing is renumbered.
- **Deleting a task that is not there.** A valid id with no task is an error, not a repeated action that succeeds: `ttc: no task with id <id>` (item 2; the repeated actions that succeed are only those listed in item 9). This holds for an id that was deleted earlier, and when `tasks.json` does not exist, and no file is created.
- **Task id (item 2; `PD-0004` item 2).** `<id>` must be a positive whole number written in digits. Anything else is an error: `ttc: invalid task id: <arg>`, with `<arg>` as typed. The largest id is 9007199254740991: an `<id>` above it is an error: `ttc: invalid task id: <arg>`. Leading zeros are allowed: `007` names task 7, and messages print the id without them: `Deleted task 7`.
- **Argument rules (item 2).** A missing id, an extra argument and any option are errors, because the usage line shows no options. Each error prints one line `ttc: <message>` (item 11).
- **Unreadable list.** When `tasks.json` cannot be read, `delete` fails with `ttc: cannot read <path>: <reason>` (item 13; `PD-0004` item 8).
- **Atomic write.** The write is atomic (item 13; `PD-0004` items 3 and 4).
- **Usage line this story adds (item 12).** `ttc delete <id>`

## Acceptance criteria

- [ ] tasks 1 `Buy milk`, 2 `Pay rent` and 3 `Read`, all open and made with `ttc add`, then `ttc delete 2` → stdout is the single line `Deleted task 2`, stderr is empty, exit code 0; `ttc list --all` prints exactly `#1 [ ] Buy milk` and `#3 [ ] Read` (the ids are not renumbered)
- [ ] tasks 1, 2 and 3 stored with task 2 `Pay rent` done (written to `tasks.json` by the test, because this story does not depend on `ttc done`), then `ttc delete 2` → stdout is the single line `Deleted task 2`, exit code 0; `ttc list --all` prints no line for task 2 and still prints the lines of tasks 1 and 3
- [ ] `ttc delete 2` run twice with tasks 1, 2 and 3 stored → the second run prints on stderr exactly the line `ttc: no task with id 2`, stdout is empty, exit code 1, and leaves `tasks.json` unchanged
- [ ] tasks 1, 2 and 3 made with `ttc add`, then `ttc delete 3`, then `ttc add 'New'` → stdout of `ttc add` is the single line `Added task 4`, and `ttc list --all` prints the lines of tasks 1, 2 and 4, in that order (the id of the deleted highest-id task is not reused)
- [ ] task 1 `Buy milk` as the only task, then `ttc delete 1`, then `ttc list --all`, then `ttc add 'Fresh'` → `ttc list --all` prints the single line `No tasks.`, and `ttc add` prints the single line `Added task 2`
- [ ] `ttc delete 1` run with standard input closed and task 1 stored → stdout is the single line `Deleted task 1` with no prompt text, exit code 0 (no confirmation is asked)
- [ ] `ttc delete <arg>` for each `<arg>` in `abc`, `0`, `-1` and `1.5` → stderr is exactly the line `ttc: invalid task id: <arg>`, stdout is empty, exit code 1, and `tasks.json` unchanged
- [ ] `ttc delete 7` with only task 1 stored → stderr is exactly the line `ttc: no task with id 7`, stdout is empty, exit code 1, and `tasks.json` unchanged; the same command with no `tasks.json` gives the same line and creates no `tasks.json`
- [ ] each of `ttc delete`, `ttc delete 1 2` and `ttc delete 1 --force`, with task 1 stored → stderr is one line that starts with `ttc: `, stdout is empty, exit code 1, and `tasks.json` unchanged
- [ ] `tasks.json` holds the text `{` and `ttc delete 1` runs → stderr is exactly one line `ttc: cannot read <path>: <reason>` (`<path>` is the path of `tasks.json`, `<reason>` is not empty), stdout is empty, exit code 1, and `tasks.json` still holds `{`
- [ ] `ttc help` → stdout holds the usage line `ttc delete <id>` as well as the usage lines of the stories it depends on, exit code 0
- [ ] `npm test` runs `node:test` tests covering every criterion above → all pass
- [ ] the pull request delivering this story → the CI `test` check passes

## Sequencing

- `REQ-0001` comes first: `delete` reads and writes the stored list, relies on the next id the list carries, runs inside the command skeleton, prints errors in the one-line form and adds its line to `ttc help`.
- `REQ-0002` comes before it: a task must exist before it can be deleted, and the never-reused rule is shown by adding a task after a delete.
- `REQ-0003` comes before it: the tests of this story read the remaining tasks through `ttc list`.

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

- A done task is set up by writing `tasks.json` directly in the test, because this story does not depend on `ttc done`; the file's JSON layout is engineering's choice (`PD-0003` item 13).
- The wording of argument-shape errors is engineering's (`PD-0003` item 2); the criteria assert only the form `ttc: <message>`.
- Why ids are never reused: `PD-0003` Options considered (a script or the user's memory could act on the wrong task); `PD-0004` item 2 sets the largest id.

> **Immutable once `status: accepted`** — in its product content. The lifecycle
> fields `status`, `readiness`, and `tickets` are advanced by the delivery roles
> under the restricted authority in `manifest.yaml`. Any content change is a new
> `REQ-` with `supersedes`.
