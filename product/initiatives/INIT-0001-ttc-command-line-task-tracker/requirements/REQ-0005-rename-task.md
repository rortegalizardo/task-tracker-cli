---
id: REQ-0005
type: requirement
title: The ttc rename command changes a task's title
status: draft
revision: 3
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
  - "with task 1 stored, `ttc rename 1 <title>` for each `<title>` in: `Buy milk` followed by a line feed (U+000A); `Buy milk` followed by a carriage return (U+000D); `Buy`, a space, a line separator (U+2028), a space and `milk` → stderr is exactly the line `ttc: title must be one non-empty line`, stdout is empty, exit code 1, and `tasks.json` unchanged"
  - "with task 1 stored, `ttc rename 1 <title>` for each `<title>` in: `Buy`, a space, a tab (U+0009), a space and `milk`; `Buy milk` followed by the bell character (U+0007) → stderr is exactly the line `ttc: title must not contain control characters`, stdout is empty, exit code 1, and `tasks.json` unchanged"
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
- **Title (item 3; `PD-0004` item 1).** The title is one argument. Only the space character (U+0020) is removed from both ends: a tab or any other character at either end is kept. A title that is empty after that, or that contains a line break anywhere, is an error: `ttc: title must be one non-empty line`. A line break is any of LF, CR, U+0085, U+2028 or U+2029. Any other control character in a title also makes it invalid: `ttc: title must not contain control characters`. Control characters are U+0000–U+001F (tab included) and U+007F–U+009F. Any other text, including non-English text, is kept as given.
- **Same title (item 9).** Renaming a task to the title it already has succeeds like any rename: it prints `Renamed task <id>` and exits 0.
- **Only the title changes.** The task keeps its id, status, due date and tags, so a done task stays done. Every other task is unchanged.
- **Task id (item 2; `PD-0004` item 2).** `<id>` must be a positive whole number written in digits. Anything else is an error: `ttc: invalid task id: <arg>`, with `<arg>` as typed. The largest id is 9007199254740991: an `<id>` above it is an error: `ttc: invalid task id: <arg>`. Leading zeros are allowed: `007` names task 7, and messages print the id without them: `Renamed task 7`. A valid number with no task is an error: `ttc: no task with id <id>`. This holds when `tasks.json` does not exist, and no file is created.
- **Argument rules (item 2).** A missing id, a missing title, an extra argument and any option are errors, because the usage line shows no options. An argument that begins with `--` is read as an option, so a title that begins with `--` is an unknown option. Each error prints one line `ttc: <message>` (item 11).
- **Unreadable list.** When `tasks.json` cannot be read, `rename` fails with `ttc: cannot read <path>: <reason>` (item 13; `PD-0004` item 8).
- **Atomic write.** The write is atomic (item 13; `PD-0004` items 3 and 4).
- **Usage line this story adds (item 12).** `ttc rename <id> "<title>"`

## Acceptance criteria

- [ ] `ttc rename 1 'Buy oat milk'` with task 1 `Buy milk` open → stdout is the single line `Renamed task 1`, stderr is empty, exit code 0; `ttc list` then prints `#1 [ ] Buy oat milk`
- [ ] `ttc rename 1 'Buy milk'` with task 1 already titled `Buy milk` → stdout is the single line `Renamed task 1`, exit code 0; `ttc list --all` prints the same output as before the command
- [ ] `ttc rename 1 '  Buy oat milk  '` with task 1 `Buy milk` → stdout is the single line `Renamed task 1`, exit code 0; `ttc list` then prints `#1 [ ] Buy oat milk`
- [ ] `ttc rename 1 'Café  au lait 牛乳'` with task 1 `Buy milk` → exit code 0; `ttc list` then prints `#1 [ ] Café  au lait 牛乳` (the double space inside and the non-English characters kept)
- [ ] `ttc rename 1 ''`, `ttc rename 1 '   '` and `ttc rename 1` followed by a title argument that contains a line break, with task 1 `Buy milk` stored → each prints on stderr exactly the line `ttc: title must be one non-empty line`, stdout is empty, exit code 1, and `tasks.json` unchanged
- [ ] with task 1 stored, `ttc rename 1 <title>` for each `<title>` in: `Buy milk` followed by a line feed (U+000A); `Buy milk` followed by a carriage return (U+000D); `Buy`, a space, a line separator (U+2028), a space and `milk` → stderr is exactly the line `ttc: title must be one non-empty line`, stdout is empty, exit code 1, and `tasks.json` unchanged
- [ ] with task 1 stored, `ttc rename 1 <title>` for each `<title>` in: `Buy`, a space, a tab (U+0009), a space and `milk`; `Buy milk` followed by the bell character (U+0007) → stderr is exactly the line `ttc: title must not contain control characters`, stdout is empty, exit code 1, and `tasks.json` unchanged
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
- `PD-0003` item 3 gives the title rules and item 9 the same-title rule; `PD-0004` item 1 adds to the title rules and item 2 to the id rules.

> **Immutable once `status: accepted`** — in its product content. The lifecycle
> fields `status`, `readiness`, and `tickets` are advanced by the delivery roles
> under the restricted authority in `manifest.yaml`. Any content change is a new
> `REQ-` with `supersedes`.
