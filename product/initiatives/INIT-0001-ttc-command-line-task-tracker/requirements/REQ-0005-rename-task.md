---
id: REQ-0005
type: requirement
title: The ttc rename command changes a task's title
status: draft
revision: 2
owner_role: ROLE-product-manager
created: 2026-10-20
updated: 2026-10-20
initiative: INIT-0001
outcome_element: "O5. The user can change a task's title."
acceptance:
  - "`ttc rename 1 'Buy oat milk'` with task 1 `Buy milk` open → stdout is the single line `Renamed task 1`, stderr is empty, exit code 0; `ttc list` then prints `#1 [ ] Buy oat milk`"
  - "`ttc rename 1 'Buy milk'` with task 1 already titled `Buy milk` → stdout is the single line `Renamed task 1`, exit code 0; `ttc list --all` prints the same output as before the command"
  - "`ttc rename 1 '  Buy oat milk  '` with task 1 `Buy milk` → stdout is the single line `Renamed task 1`, exit code 0; `ttc list` then prints `#1 [ ] Buy oat milk`"
  - "`ttc rename 1 'Café  au lait 牛乳'` with task 1 `Buy milk` → exit code 0; `ttc list` then prints `#1 [ ] Café  au lait 牛乳` (the double space inside and the non-English characters kept)"
  - "`ttc rename 1 ''`, `ttc rename 1 '   '` and `ttc rename 1` followed by a title argument that contains a line break, with task 1 `Buy milk` stored → each prints on stderr exactly the line `ttc: title must be one non-empty line`, stdout is empty, exit code 1, and `tasks.json` unchanged"
  - "tasks 1 `Buy milk` (open), 2 `Pay rent` (done, due 2099-12-31, tags `bills` and `home`) and 3 `Read` (open), written to `tasks.json` by the test because this story does not depend on `ttc done`, then `ttc rename 2 'Pay landlord'` → `ttc list --all` prints exactly `#1 [ ] Buy milk`, `#2 [x] Pay landlord due:2099-12-31 +bills +home` and `#3 [ ] Read`"
  - "`ttc rename <arg> 'New'` for each `<arg>` in `abc`, `0`, `-1` and `1.5` → stderr is exactly the line `ttc: invalid task id: <arg>`, stdout is empty, exit code 1, and `tasks.json` unchanged"
  - "`ttc rename 7 'New'` with only task 1 stored → stderr is exactly the line `ttc: no task with id 7`, stdout is empty, exit code 1, and `tasks.json` unchanged; the same command with no `tasks.json` gives the same line and creates no `tasks.json`"
  - "each of `ttc rename`, `ttc rename 1`, `ttc rename 1 a b`, `ttc rename 1 'New' --force` and `ttc rename 1 '--new'`, with task 1 stored → stderr is one line that starts with `ttc: `, stdout is empty, exit code 1, and `tasks.json` unchanged"
  - "`tasks.json` holds the text `{` and `ttc rename 1 'New'` runs → stderr is exactly one line `ttc: cannot read <path>: <reason>` (`<path>` is the path of `tasks.json`, `<reason>` is not empty), stdout is empty, exit code 1, and `tasks.json` still holds `{`"
  - "`ttc help` → stdout holds the usage line `ttc rename <id> \"<title>\"` as well as the usage lines of the stories it depends on, exit code 0"
  - "`npm test` runs `node:test` tests covering every criterion above → all pass"
  - "the pull request delivering this story → the CI `test` check passes"
capabilities: []
design_refs: []
decisions: [PD-0001, PD-0003]
depends_on: [REQ-0001, REQ-0002, REQ-0003]
constraints: []
observability: []
rollout: none
readiness: not-assessed
tickets: []
supersedes:
superseded_by:
---

# REQ-0005 — The ttc rename command changes a task's title

> A requirement **is** the engineering-ready product story. The canonical schema
> is `schemas/frontmatter.md` §"Engineering-ready product story"; its sixteen
> elements are the sections below plus the frontmatter above. Every section is
> written — an element with nothing to say carries its explicit empty form, never
> a blank.

## Requirement

The user can change a task's title.

## Scope

This story covers `ttc rename <id> "<title>"` and nothing else:

- replacing the title of one task;
- the title rules, the id errors and the argument rules for this command;
- the one new usage line.

It changes only the title of the named task.

Code lives in the repository rortegalizardo/task-tracker-cli (~/Desktop/Projects/task-tracker-cli).

## Non-goals

- Renaming several tasks in one command — the usage line takes one id and one title.
- Changing a due date or tags through `rename` — the spec has no command to change a due date, and tags have their own command (`PD-0003` Consequences).
- A title that begins with `--` — an argument that begins with `--` is read as an option (`PD-0003` item 2).
- Keeping a history of earlier titles — not in the spec.

## Behavior

**Command.** `ttc rename <id> "<title>"`

- **Result.** It replaces the title of task `<id>` and prints `Renamed task <id>` to stdout, then exits 0 (`PD-0003` item 10). The command asks for no confirmation.
- **Title (item 3).** The title is one argument. Spaces at both ends are removed. A title that is empty after that, or that contains a line break, is an error: `ttc: title must be one non-empty line`. Any other text, including non-English text, is kept as given.
- **Same title (item 9).** Renaming a task to the title it already has succeeds like any rename: it prints `Renamed task <id>` and exits 0.
- **Only the title changes.** The task keeps its id, status, due date and tags, so a done task stays done. Every other task is unchanged.
- **Task id (item 2).** `<id>` must be a positive whole number written in digits. Anything else is an error: `ttc: invalid task id: <arg>`, with `<arg>` as typed. A valid number with no task is an error: `ttc: no task with id <id>`. This holds when `tasks.json` does not exist, and no file is created.
- **Argument rules (item 2).** A missing id, a missing title, an extra argument and any option are errors, because the usage line shows no options. An argument that begins with `--` is read as an option, so a title that begins with `--` is an unknown option. Each error prints one line `ttc: <message>` (item 11).
- **Unreadable list.** When `tasks.json` cannot be read, `rename` fails with `ttc: cannot read <path>: <reason>` (item 13).
- **Atomic write.** The write is atomic (item 13).
- **Usage line this story adds (item 12).** `ttc rename <id> "<title>"`

## Acceptance criteria

- [ ] `ttc rename 1 'Buy oat milk'` with task 1 `Buy milk` open → stdout is the single line `Renamed task 1`, stderr is empty, exit code 0; `ttc list` then prints `#1 [ ] Buy oat milk`
- [ ] `ttc rename 1 'Buy milk'` with task 1 already titled `Buy milk` → stdout is the single line `Renamed task 1`, exit code 0; `ttc list --all` prints the same output as before the command
- [ ] `ttc rename 1 '  Buy oat milk  '` with task 1 `Buy milk` → stdout is the single line `Renamed task 1`, exit code 0; `ttc list` then prints `#1 [ ] Buy oat milk`
- [ ] `ttc rename 1 'Café  au lait 牛乳'` with task 1 `Buy milk` → exit code 0; `ttc list` then prints `#1 [ ] Café  au lait 牛乳` (the double space inside and the non-English characters kept)
- [ ] `ttc rename 1 ''`, `ttc rename 1 '   '` and `ttc rename 1` followed by a title argument that contains a line break, with task 1 `Buy milk` stored → each prints on stderr exactly the line `ttc: title must be one non-empty line`, stdout is empty, exit code 1, and `tasks.json` unchanged
- [ ] tasks 1 `Buy milk` (open), 2 `Pay rent` (done, due 2099-12-31, tags `bills` and `home`) and 3 `Read` (open), written to `tasks.json` by the test because this story does not depend on `ttc done`, then `ttc rename 2 'Pay landlord'` → `ttc list --all` prints exactly `#1 [ ] Buy milk`, `#2 [x] Pay landlord due:2099-12-31 +bills +home` and `#3 [ ] Read`
- [ ] `ttc rename <arg> 'New'` for each `<arg>` in `abc`, `0`, `-1` and `1.5` → stderr is exactly the line `ttc: invalid task id: <arg>`, stdout is empty, exit code 1, and `tasks.json` unchanged
- [ ] `ttc rename 7 'New'` with only task 1 stored → stderr is exactly the line `ttc: no task with id 7`, stdout is empty, exit code 1, and `tasks.json` unchanged; the same command with no `tasks.json` gives the same line and creates no `tasks.json`
- [ ] each of `ttc rename`, `ttc rename 1`, `ttc rename 1 a b`, `ttc rename 1 'New' --force` and `ttc rename 1 '--new'`, with task 1 stored → stderr is one line that starts with `ttc: `, stdout is empty, exit code 1, and `tasks.json` unchanged
- [ ] `tasks.json` holds the text `{` and `ttc rename 1 'New'` runs → stderr is exactly one line `ttc: cannot read <path>: <reason>` (`<path>` is the path of `tasks.json`, `<reason>` is not empty), stdout is empty, exit code 1, and `tasks.json` still holds `{`
- [ ] `ttc help` → stdout holds the usage line `ttc rename <id> "<title>"` as well as the usage lines of the stories it depends on, exit code 0
- [ ] `npm test` runs `node:test` tests covering every criterion above → all pass
- [ ] the pull request delivering this story → the CI `test` check passes

## Sequencing

- `REQ-0001` comes first: `rename` reads and writes the stored list, runs inside the command skeleton, prints errors in the one-line form and adds its line to `ttc help`.
- `REQ-0002` comes before it: a task must exist before it can be renamed, and `add` is the only command that creates one.
- `REQ-0003` comes before it: the tests of this story read a task's title through `ttc list`.

## Technical constraints

None yet — filled at DECOMPOSITION from the architect's assessment (technical/assessment.md).

## Observability

none — a local, offline command; its stdout/stderr lines and exit code are the whole operable signal, and the requester ruled out network (constraints.md row 3).

## Rollout

none

## Notes

- A done task is set up by writing `tasks.json` directly in the test, because this story does not depend on `ttc done`; the file's JSON layout is engineering's choice (`PD-0003` item 13).
- The wording of argument-shape errors is engineering's (`PD-0003` item 2); the criteria assert only the form `ttc: <message>`.
- `PD-0003` item 3 gives the title rules and item 9 the same-title rule.

> **Immutable once `status: accepted`** — in its product content. The lifecycle
> fields `status`, `readiness`, and `tickets` are advanced by the delivery roles
> under the restricted authority in `manifest.yaml`. Any content change is a new
> `REQ-` with `supersedes`.
