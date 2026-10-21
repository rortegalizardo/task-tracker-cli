---
id: REQ-0008
type: requirement
title: The ttc tag command adds or removes one tag on a task
status: draft
revision: 2
owner_role: ROLE-product-manager
created: 2026-10-20
updated: 2026-10-20
initiative: INIT-0001
outcome_element: "O8. The user can add a tag to an existing task and remove one from it."
acceptance:
  - "`ttc tag 1 +home` with task 1 `Buy milk` open and holding no tags → stdout is the single line `Added tag home to task 1`, stderr is empty, exit code 0; `ttc list` then prints `#1 [ ] Buy milk +home`"
  - "task 1 `Buy milk` holding the tag `home`, then `ttc tag 1 +bills` → stdout is the single line `Added tag bills to task 1`, stderr is empty, exit code 0; `ttc list` then prints `#1 [ ] Buy milk +bills +home` (the tags in alphabetical order)"
  - "task 1 `Buy milk` holding the tag `home`, then `ttc tag 1 +home` → stdout is the single line `Task 1 already has tag home`, stderr is empty, exit code 0; `ttc list --all` prints the same output as before the command"
  - "task 1 `Buy milk` holding the tags `bills` and `home`, then `ttc tag 1 -home` → stdout is the single line `Removed tag home from task 1`, stderr is empty, exit code 0; `ttc list` then prints `#1 [ ] Buy milk +bills`"
  - "task 1 `Buy milk` holding only the tag `home`, then `ttc tag 1 -home` → `ttc list` prints exactly `#1 [ ] Buy milk` (no `+` part), and `ttc list --tag home` prints the single line `No tasks.`"
  - "task 1 `Buy milk` holding the tag `home`, then `ttc tag 1 -bills` → stdout is the single line `Task 1 has no tag bills`, stderr is empty, exit code 0; `ttc list --all` prints the same output as before the command"
  - "task 1 `Buy milk` holding no tags, then `ttc tag 1 -home` → stdout is the single line `Task 1 has no tag home`, stderr is empty, exit code 0; `ttc list --all` prints the same output as before the command"
  - "task 1 `Buy milk` holding no tags, then `ttc tag 1 +home`, then `ttc list --tag home`, then `ttc tag 1 -home`, then `ttc list --tag home` → the first `ttc list --tag home` prints the single line `#1 [ ] Buy milk +home` and the second prints the single line `No tasks.`"
  - "task 1 `Buy milk` holding no tags, then `ttc tag 1 +HOME` → stdout is the single line `Added tag home to task 1`, stderr is empty, exit code 0; `ttc list` then prints `#1 [ ] Buy milk +home` (the tag is stored in lower case)"
  - "task 1 `Buy milk` holding the tag `home`, then `ttc tag 1 +HOME` → stdout is the single line `Task 1 already has tag home`, stderr is empty, exit code 0; `ttc list` then prints `#1 [ ] Buy milk +home` (one tag, not two)"
  - "task 1 `Buy milk` holding the tag `home`, then `ttc tag 1 -HOME` → stdout is the single line `Removed tag home from task 1`, stderr is empty, exit code 0; `ttc list --all` then prints `#1 [ ] Buy milk`"
  - "`ttc tag 1 +<t>` for each `<t>` in `a`, `abcdefghijklmnopqrstuvwxyzabcdef` (32 letters), `my-tag_2` and `2026`, with task 1 `Buy milk` holding no tags → stdout is the single line `Added tag <t> to task 1` and exit code 0 each time"
  - "`ttc tag 1 +<t>` and `ttc tag 1 -<t>` for each `<t>` in `abcdefghijklmnopqrstuvwxyzabcdefa` (33 letters), `two words` (one quoted argument after the sign), `café` and `a.b`, with task 1 `Buy milk` holding the tag `home` → stderr is exactly the line `ttc: invalid tag: <t>`, stdout is empty, exit code 1, and `tasks.json` unchanged"
  - "`ttc tag 1 +_x` with task 1 `Buy milk` holding the tag `home` → stderr is exactly the line `ttc: invalid tag: _x`, stdout is empty, exit code 1, and `tasks.json` unchanged"
  - "task 1 `Pay rent` stored as done with due date 2099-12-31 and the tag `bills` (written to `tasks.json` by the test, because this story does not depend on `ttc done`), then `ttc tag 1 +home` → `ttc list --all` prints exactly `#1 [x] Pay rent due:2099-12-31 +bills +home`; then `ttc tag 1 -bills` → `ttc list --all` prints exactly `#1 [x] Pay rent due:2099-12-31 +home`"
  - "tasks 1 `Buy milk`, 2 `Pay rent` (due 2099-12-31, tag `bills`) and 3 `Read`, all open and made with `ttc add`, then `ttc tag 2 +home` → `ttc list --all` prints exactly `#1 [ ] Buy milk`, `#2 [ ] Pay rent due:2099-12-31 +bills +home` and `#3 [ ] Read`"
  - "`ttc tag <arg> +home` for each `<arg>` in `abc`, `0`, `-1` and `1.5` → stderr is exactly the line `ttc: invalid task id: <arg>`, stdout is empty, exit code 1, and `tasks.json` unchanged"
  - "`ttc tag 7 +home` and `ttc tag 7 -home` with only task 1 stored → stderr is exactly the line `ttc: no task with id 7`, stdout is empty, exit code 1, and `tasks.json` unchanged; the same two commands with no `tasks.json` give the same line and create no `tasks.json`"
  - "each of `ttc tag`, `ttc tag 1`, `ttc tag 1 +a +b`, `ttc tag 1 +a -b`, `ttc tag 1 +home --force`, `ttc tag 1 home`, `ttc tag 1 --home`, `ttc tag 1 +` and `ttc tag 1 -`, with task 1 stored → stderr is one line that starts with `ttc: `, stdout is empty, exit code 1, and `tasks.json` unchanged"
  - "`tasks.json` holds the text `{` and `ttc tag 1 +home` runs, then `ttc tag 1 -home` runs → each prints on stderr exactly one line `ttc: cannot read <path>: <reason>` (`<path>` is the path of `tasks.json`, `<reason>` is not empty), stdout is empty, exit code 1, and `tasks.json` still holds `{`"
  - "`ttc help` → stdout holds the usage line `ttc tag <id> +<t> | -<t>` as well as the usage lines of the stories it depends on, exit code 0"
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

# REQ-0008 — The ttc tag command adds or removes one tag on a task

> A requirement **is** the engineering-ready product story. The canonical schema
> is `schemas/frontmatter.md` §"Engineering-ready product story"; its sixteen
> elements are the sections below plus the frontmatter above. Every section is
> written — an element with nothing to say carries its explicit empty form, never
> a blank.

## Requirement

The user can add one tag to, or remove one tag from, an existing task.

## Scope

This story covers `ttc tag <id> +<t> | -<t>` and nothing else:

- adding one tag to a task (`+<t>`) and removing one tag from a task (`-<t>`);
- the messages for a tag that is added, removed, already there or not there;
- the tag rules, the id errors and the argument rules for this command;
- the one new usage line.

It changes only the tags of the named task.

Code lives in the repository rortegalizardo/task-tracker-cli (~/Desktop/Projects/task-tracker-cli).

## Non-goals

- Adding or removing several tags in one command — the usage line takes one id and one signed tag.
- Renaming a tag, or removing every tag from a task at once — not in the spec.
- A command that lists all the tags in use — not in the spec.
- Changing a task's due date — the spec has no such command (`PD-0003` Consequences).
- Showing tags — `ttc list` shows them, and the list story owns that.

## Behavior

**Command.** `ttc tag <id> +<t>` adds the tag `<t>` to task `<id>`. `ttc tag <id> -<t>` removes it. The tag argument is a sign, `+` or `-`, followed by the tag.

- **Add (`PD-0003` items 9 and 10).** If the task does not hold the tag, the tag is added and `Added tag <t> to task <id>` is printed. If the task already holds it, nothing changes and `Task <id> already has tag <t>` is printed. Exit code 0 both times.
- **Remove (items 9 and 10).** If the task holds the tag, the tag is removed and `Removed tag <t> from task <id>` is printed. If the task does not hold it, nothing changes and `Task <id> has no tag <t>` is printed. Exit code 0 both times. Removing the last tag leaves a task with no tags.
- **Tag rules (item 4).** A tag is 1 to 32 characters. The first is an English letter or a digit; each of the others is an English letter, a digit, `-` or `_`. So `-x` and `_x` are not tags, and every tag can be removed with `ttc tag <id> -<t>`. Tags are case-insensitive and stored in lower case, so `+HOME` and `+home` are the same tag, and `-HOME` removes `home`. A task never holds the same tag twice. A task's tags are always shown in alphabetical order. Any other tag is an error, for `+` and for `-`: `ttc: invalid tag: <t>`, with `<t>` as typed, without the sign.
- **The tag in the messages (item 9).** In every message that names a tag, which are the four messages above, `<t>` is the tag as stored, in lower case: `ttc tag 1 +HOME` prints `Added tag home to task 1`, `ttc tag 1 +HOME` on a task that holds `home` prints `Task 1 already has tag home`, and `ttc tag 1 -HOME` on a task that holds `home` prints `Removed tag home from task 1`. Only the error message shows `<t>` as typed.
- **Only the tags change.** The task keeps its id, title, status and due date, so a done task stays done. The command works on an open task and on a done task. Every other task is unchanged. The command asks for no confirmation (item 10).
- **Task id (item 2).** `<id>` must be a positive whole number written in digits. Anything else is an error: `ttc: invalid task id: <arg>`, with `<arg>` as typed. A valid number with no task is an error: `ttc: no task with id <id>`. This holds when `tasks.json` does not exist, and no file is created.
- **Argument rules (item 2).** The command takes exactly an id and one signed tag. A missing id, a missing tag, an extra argument, any option and a tag argument that starts with neither `+` nor `-` are errors. An argument that begins with `--` is read as an option. An argument that begins with a single `-`, such as `-1` or `-home`, is not an option. A sign with nothing after it (`+` or `-`) is an error. Each error prints one line `ttc: <message>` (item 11).
- **Unreadable list.** When `tasks.json` cannot be read, the command fails with `ttc: cannot read <path>: <reason>` (item 13).
- **Atomic write.** A command that changes the tags writes atomically (item 13). A no-op writes nothing that changes the list.
- **Usage line this story adds (item 12).** `ttc tag <id> +<t> | -<t>`

## Acceptance criteria

- [ ] `ttc tag 1 +home` with task 1 `Buy milk` open and holding no tags → stdout is the single line `Added tag home to task 1`, stderr is empty, exit code 0; `ttc list` then prints `#1 [ ] Buy milk +home`
- [ ] task 1 `Buy milk` holding the tag `home`, then `ttc tag 1 +bills` → stdout is the single line `Added tag bills to task 1`, stderr is empty, exit code 0; `ttc list` then prints `#1 [ ] Buy milk +bills +home` (the tags in alphabetical order)
- [ ] task 1 `Buy milk` holding the tag `home`, then `ttc tag 1 +home` → stdout is the single line `Task 1 already has tag home`, stderr is empty, exit code 0; `ttc list --all` prints the same output as before the command
- [ ] task 1 `Buy milk` holding the tags `bills` and `home`, then `ttc tag 1 -home` → stdout is the single line `Removed tag home from task 1`, stderr is empty, exit code 0; `ttc list` then prints `#1 [ ] Buy milk +bills`
- [ ] task 1 `Buy milk` holding only the tag `home`, then `ttc tag 1 -home` → `ttc list` prints exactly `#1 [ ] Buy milk` (no `+` part), and `ttc list --tag home` prints the single line `No tasks.`
- [ ] task 1 `Buy milk` holding the tag `home`, then `ttc tag 1 -bills` → stdout is the single line `Task 1 has no tag bills`, stderr is empty, exit code 0; `ttc list --all` prints the same output as before the command
- [ ] task 1 `Buy milk` holding no tags, then `ttc tag 1 -home` → stdout is the single line `Task 1 has no tag home`, stderr is empty, exit code 0; `ttc list --all` prints the same output as before the command
- [ ] task 1 `Buy milk` holding no tags, then `ttc tag 1 +home`, then `ttc list --tag home`, then `ttc tag 1 -home`, then `ttc list --tag home` → the first `ttc list --tag home` prints the single line `#1 [ ] Buy milk +home` and the second prints the single line `No tasks.`
- [ ] task 1 `Buy milk` holding no tags, then `ttc tag 1 +HOME` → stdout is the single line `Added tag home to task 1`, stderr is empty, exit code 0; `ttc list` then prints `#1 [ ] Buy milk +home` (the tag is stored in lower case)
- [ ] task 1 `Buy milk` holding the tag `home`, then `ttc tag 1 +HOME` → stdout is the single line `Task 1 already has tag home`, stderr is empty, exit code 0; `ttc list` then prints `#1 [ ] Buy milk +home` (one tag, not two)
- [ ] task 1 `Buy milk` holding the tag `home`, then `ttc tag 1 -HOME` → stdout is the single line `Removed tag home from task 1`, stderr is empty, exit code 0; `ttc list --all` then prints `#1 [ ] Buy milk`
- [ ] `ttc tag 1 +<t>` for each `<t>` in `a`, `abcdefghijklmnopqrstuvwxyzabcdef` (32 letters), `my-tag_2` and `2026`, with task 1 `Buy milk` holding no tags → stdout is the single line `Added tag <t> to task 1` and exit code 0 each time
- [ ] `ttc tag 1 +<t>` and `ttc tag 1 -<t>` for each `<t>` in `abcdefghijklmnopqrstuvwxyzabcdefa` (33 letters), `two words` (one quoted argument after the sign), `café` and `a.b`, with task 1 `Buy milk` holding the tag `home` → stderr is exactly the line `ttc: invalid tag: <t>`, stdout is empty, exit code 1, and `tasks.json` unchanged
- [ ] `ttc tag 1 +_x` with task 1 `Buy milk` holding the tag `home` → stderr is exactly the line `ttc: invalid tag: _x`, stdout is empty, exit code 1, and `tasks.json` unchanged
- [ ] task 1 `Pay rent` stored as done with due date 2099-12-31 and the tag `bills` (written to `tasks.json` by the test, because this story does not depend on `ttc done`), then `ttc tag 1 +home` → `ttc list --all` prints exactly `#1 [x] Pay rent due:2099-12-31 +bills +home`; then `ttc tag 1 -bills` → `ttc list --all` prints exactly `#1 [x] Pay rent due:2099-12-31 +home`
- [ ] tasks 1 `Buy milk`, 2 `Pay rent` (due 2099-12-31, tag `bills`) and 3 `Read`, all open and made with `ttc add`, then `ttc tag 2 +home` → `ttc list --all` prints exactly `#1 [ ] Buy milk`, `#2 [ ] Pay rent due:2099-12-31 +bills +home` and `#3 [ ] Read`
- [ ] `ttc tag <arg> +home` for each `<arg>` in `abc`, `0`, `-1` and `1.5` → stderr is exactly the line `ttc: invalid task id: <arg>`, stdout is empty, exit code 1, and `tasks.json` unchanged
- [ ] `ttc tag 7 +home` and `ttc tag 7 -home` with only task 1 stored → stderr is exactly the line `ttc: no task with id 7`, stdout is empty, exit code 1, and `tasks.json` unchanged; the same two commands with no `tasks.json` give the same line and create no `tasks.json`
- [ ] each of `ttc tag`, `ttc tag 1`, `ttc tag 1 +a +b`, `ttc tag 1 +a -b`, `ttc tag 1 +home --force`, `ttc tag 1 home`, `ttc tag 1 --home`, `ttc tag 1 +` and `ttc tag 1 -`, with task 1 stored → stderr is one line that starts with `ttc: `, stdout is empty, exit code 1, and `tasks.json` unchanged
- [ ] `tasks.json` holds the text `{` and `ttc tag 1 +home` runs, then `ttc tag 1 -home` runs → each prints on stderr exactly one line `ttc: cannot read <path>: <reason>` (`<path>` is the path of `tasks.json`, `<reason>` is not empty), stdout is empty, exit code 1, and `tasks.json` still holds `{`
- [ ] `ttc help` → stdout holds the usage line `ttc tag <id> +<t> | -<t>` as well as the usage lines of the stories it depends on, exit code 0
- [ ] `npm test` runs `node:test` tests covering every criterion above → all pass
- [ ] the pull request delivering this story → the CI `test` check passes

## Sequencing

- `REQ-0001` comes first: `tag` reads and writes the stored list, runs inside the command skeleton, prints errors in the one-line form and adds its line to `ttc help`.
- `REQ-0002` comes before it: a task must exist, and `add` is the only command that creates one, before a tag can be added to it or removed from it. The tests also give a task its starting tags with `add --tag`.
- `REQ-0003` comes before it: the tests of this story read a task's tags through `ttc list`, which shows `+<tag>` and filters with `--tag`.

## Technical constraints

None yet — filled at DECOMPOSITION from the architect's assessment (technical/assessment.md).

## Observability

none — a local, offline command; its stdout/stderr lines and exit code are the whole operable signal, and the requester ruled out network (constraints.md row 3).

## Rollout

none

## Notes

- A done task is set up by writing `tasks.json` directly in the test, because this story does not depend on `ttc done`; the file's JSON layout is engineering's choice (`PD-0003` item 13).
- The wording of argument-shape errors is engineering's (`PD-0003` item 2). The criteria for a missing tag, an extra argument, a tag with no sign and a sign with no tag assert only the form `ttc: <message>`.
- `PD-0003` item 4 gives the tag rules, item 9 the repeated-action messages and item 10 the success messages.

> **Immutable once `status: accepted`** — in its product content. The lifecycle
> fields `status`, `readiness`, and `tickets` are advanced by the delivery roles
> under the restricted authority in `manifest.yaml`. Any content change is a new
> `REQ-` with `supersedes`.
