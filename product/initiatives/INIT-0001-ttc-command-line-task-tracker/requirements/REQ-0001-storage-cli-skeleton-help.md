---
id: REQ-0001
type: requirement
title: The ttc command prints its usage and keeps tasks in one atomically written file
status: draft
revision: 2
owner_role: ROLE-product-manager
created: 2026-10-20
updated: 2026-10-20
initiative: INIT-0001
outcome_element: "O1. The user can run `ttc help` to see the commands, and tasks are kept in one local JSON file that is never left half written."
acceptance:
  - "`ttc` with no arguments → stdout holds the usage line `ttc help`, stderr is empty, exit code 0"
  - "`ttc help` → stdout holds the usage line `ttc help`, stderr is empty, exit code 0"
  - "`ttc --help` → stdout holds the usage line `ttc help`, stderr is empty, exit code 0"
  - "`ttc`, `ttc help` or `ttc --help` with `TTC_HOME` naming a folder that does not exist → that folder is still not created, and no `tasks.json` exists"
  - "`ttc help extra` → stderr is one line that starts with `ttc: `, stdout is empty, exit code 1"
  - "`ttc frobnicate` → stderr is exactly the line `ttc: unknown command: frobnicate (see ttc help)`, stdout is empty, exit code 1, and no `tasks.json` or `$TTC_HOME` folder is created"
  - "`TTC_HOME` set to a folder F → a write puts the list in `F/tasks.json`, and a read returns the list stored there"
  - "`TTC_HOME` unset, and again `TTC_HOME` set to the empty string, with the user's home folder H → the list is read from and written to `H/.ttc/tasks.json`"
  - "no `tasks.json` → reading returns a list with no tasks and next id 1, and neither `tasks.json` nor its folder is created"
  - "the first write when `$TTC_HOME` and its parent folders do not exist → the folder and its missing parents are created, and `tasks.json` holds the written list as valid JSON"
  - "a write when `tasks.json` already holds a list → `tasks.json` is then valid JSON holding exactly the new list"
  - "`tasks.json` holds the text `{` (not valid JSON) → reading fails with `ttc: cannot read <path>: <reason>`, where `<path>` is the path of `tasks.json` and `<reason>` is not empty, and `tasks.json` still holds `{`"
  - "`tasks.json` holds the text `42` (valid JSON, not a task list) → reading fails with the same message form, and `tasks.json` still holds `42`"
  - "`tasks.json` is a folder, not a file → reading fails with the same message form, and the folder is unchanged"
  - "a write stopped before it finishes (the test simulates this) while `tasks.json` holds a list → `tasks.json` still holds exactly that whole list, as valid JSON"
  - "the same stopped write when no `tasks.json` existed → `tasks.json` still does not exist"
  - "`TTC_HOME` names an existing regular file, not a folder → a write fails with a message that the program prints as one line `ttc: <message>` on stderr with exit code 1, and that file has the same bytes as before"
  - "reading `package.json` → it declares no runtime dependencies (it has no entries under `dependencies`)"
  - "every source file of the program, test files excluded → imports none of `node:net`, `node:http`, `node:https`, `node:http2`, `node:dgram` or `node:tls` (nor the same module name without the `node:` prefix)"
  - "`npm test` runs `node:test` tests covering every criterion above → all pass"
  - "the pull request delivering this story → the CI `test` check passes"
capabilities: []
design_refs: []
decisions: [PD-0001, PD-0003]
depends_on: [none]
constraints: []
observability: []
rollout: none
readiness: not-assessed
tickets: []
supersedes:
superseded_by:
---

# REQ-0001 — The ttc command prints its usage and keeps tasks in one atomically written file

> A requirement **is** the engineering-ready product story. The canonical schema
> is `schemas/frontmatter.md` §"Engineering-ready product story"; its sixteen
> elements are the sections below plus the frontmatter above. Every section is
> written — an element with nothing to say carries its explicit empty form, never
> a blank.

## Requirement

The user can run `ttc help` to see the commands, and every task is kept in one local JSON file that is never left half written.

## Scope

This story covers:

- the `ttc` program entry point, which runs a command by name and prints every failure in one form;
- `ttc`, `ttc help` and `ttc --help`, and the error for an unknown command;
- the argument rules and the one-line error form that every later command follows (`PD-0003` items 2 and 11);
- the stored list: where it lives, how it is read, how it is written whole, and the next id it carries (`PD-0003` items 1 and 13);
- the rules that bind the whole program: Node 24, built-in libraries only, no network.

It stops at storage and `help`: no command that changes a task exists yet.

Code lives in the repository rortegalizardo/task-tracker-cli (~/Desktop/Projects/task-tracker-cli).

## Non-goals

- Any command other than `help` — each arrives with its own story.
- Per-command help such as `ttc help add` — not in the spec; `help` takes no argument.
- A `--version` flag — not in the spec.
- Choosing how a write is made atomic — engineering's choice (`PD-0003` item 13).
- Safe writes from two `ttc` processes at the same moment — out of scope (`PD-0003` item 16).
- Any other way to choose the data folder than `TTC_HOME` — the spec names no other.

## Behavior

**Help and usage (`PD-0003` item 12).**

- `ttc`, `ttc help` and `ttc --help` print the usage to stdout and exit 0. They print nothing to stderr.
- A usage line is a line of the usage that begins with `ttc` once leading spaces are removed. The usage has one usage line per command that exists at that point, and each story adds its own. The usage line this story adds is `ttc help`.
- `PD-0003` fixes the text of each usage line. It does not fix a heading, indentation or blank lines around them.
- `ttc help` takes no arguments. An extra argument is an error (item 2).
- An unknown command is an error: `ttc: unknown command: <cmd> (see ttc help)`, with `<cmd>` as typed.
- Printing the usage never creates `tasks.json` or its folder (item 13).

**Errors (item 11).** Every failure prints exactly one line to stderr, in the form `ttc: <message>`, prints nothing to stdout, exits with code 1 and changes no stored data. No stack trace is ever shown. In this story and every later one, "`tasks.json` unchanged" means: the file has the same bytes as before the command, or, if it did not exist, it still does not exist and its folder was not created.

**Argument rules (item 2).** Every command follows these; each later story restates the part it uses.

- A command takes exactly the arguments its usage line shows. A missing required argument, an extra argument, an option given twice (except `--tag` on `add`), an option with no value, or an unknown option is an error.
- Options may come before or after the positional arguments.
- An argument that begins with `--` is read as an option.
- `<id>` must be a positive whole number written in digits. Anything else is an error: `ttc: invalid task id: <arg>`. A valid number with no task is an error: `ttc: no task with id <id>`.
- Wording of the other messages (item 2). `PD-0003` quotes some messages exactly. Engineering words every other error message: argument errors, `<reason>` in `ttc: cannot read <path>: <reason>`, `<problem>` in `ttc: invalid import file <file>: <problem>`, a write that fails, and a missing or unreadable file. Each such message keeps the form `ttc: <message>` (item 11) and names the argument, option or path at fault. The criteria in every story assert that form, and that `<reason>` and `<problem>` are not empty.

**Storage (item 13).**

- Tasks live in `$TTC_HOME/tasks.json`. When `TTC_HOME` is unset or empty, the folder is `~/.ttc` in the user's home folder.
- The file holds the whole list: each task's id, title, status (open or done), due date (if any) and tags, and the next id to be given (items 1 and 14). A list that never held a task has next id 1.
- The JSON layout of the file, meaning its field names and value spellings, is engineering's choice (item 13). A `tasks.json` is a valid task list exactly when it passes the checks that item 14 lists for `import`.
- A missing file means no tasks. A command that does not change the list (`help`, `list`, `stats`, `export`) never creates `tasks.json` or its folder.
- The first command that writes creates the folder, with any missing parent folders, and the file.
- A file that is not valid JSON, is not a valid task list, or cannot be read as a file makes every command that reads it fail with `ttc: cannot read <path>: <reason>`, where `<path>` is the path of `tasks.json` and `<reason>` is not empty text saying why. The file is left untouched.
- `import` does not read the current `tasks.json` (item 13), so it is not one of the commands that fail this way. The import story states what that means.
- "Every write is atomic" means: after any command, or any interruption of one, `tasks.json` holds either the whole old list or the whole new list, never a mix and never a partial file. How this is achieved is engineering's choice.

The criteria below describe stored content by meaning (id, title, status, due date, tags, next id), not by field name.

**Ids (item 1).** Each task gets a positive whole number, given in order from 1. An id is never reused. The next id stored with the list is what keeps this true. No command gives an id yet.

**Whole-program rules.** The program runs on Node 24, uses built-in libraries only and opens no network connection. In this story that means `package.json` declares no runtime dependencies, and no source file of the program imports a network module.

## Acceptance criteria

- [ ] `ttc` with no arguments → stdout holds the usage line `ttc help`, stderr is empty, exit code 0
- [ ] `ttc help` → stdout holds the usage line `ttc help`, stderr is empty, exit code 0
- [ ] `ttc --help` → stdout holds the usage line `ttc help`, stderr is empty, exit code 0
- [ ] `ttc`, `ttc help` or `ttc --help` with `TTC_HOME` naming a folder that does not exist → that folder is still not created, and no `tasks.json` exists
- [ ] `ttc help extra` → stderr is one line that starts with `ttc: `, stdout is empty, exit code 1
- [ ] `ttc frobnicate` → stderr is exactly the line `ttc: unknown command: frobnicate (see ttc help)`, stdout is empty, exit code 1, and no `tasks.json` or `$TTC_HOME` folder is created
- [ ] `TTC_HOME` set to a folder F → a write puts the list in `F/tasks.json`, and a read returns the list stored there
- [ ] `TTC_HOME` unset, and again `TTC_HOME` set to the empty string, with the user's home folder H → the list is read from and written to `H/.ttc/tasks.json`
- [ ] no `tasks.json` → reading returns a list with no tasks and next id 1, and neither `tasks.json` nor its folder is created
- [ ] the first write when `$TTC_HOME` and its parent folders do not exist → the folder and its missing parents are created, and `tasks.json` holds the written list as valid JSON
- [ ] a write when `tasks.json` already holds a list → `tasks.json` is then valid JSON holding exactly the new list
- [ ] `tasks.json` holds the text `{` (not valid JSON) → reading fails with `ttc: cannot read <path>: <reason>`, where `<path>` is the path of `tasks.json` and `<reason>` is not empty, and `tasks.json` still holds `{`
- [ ] `tasks.json` holds the text `42` (valid JSON, not a task list) → reading fails with the same message form, and `tasks.json` still holds `42`
- [ ] `tasks.json` is a folder, not a file → reading fails with the same message form, and the folder is unchanged
- [ ] a write stopped before it finishes (the test simulates this) while `tasks.json` holds a list → `tasks.json` still holds exactly that whole list, as valid JSON
- [ ] the same stopped write when no `tasks.json` existed → `tasks.json` still does not exist
- [ ] `TTC_HOME` names an existing regular file, not a folder → a write fails with a message that the program prints as one line `ttc: <message>` on stderr with exit code 1, and that file has the same bytes as before
- [ ] reading `package.json` → it declares no runtime dependencies (it has no entries under `dependencies`)
- [ ] every source file of the program, test files excluded → imports none of `node:net`, `node:http`, `node:https`, `node:http2`, `node:dgram` or `node:tls` (nor the same module name without the `node:` prefix)
- [ ] `npm test` runs `node:test` tests covering every criterion above → all pass
- [ ] the pull request delivering this story → the CI `test` check passes

## Sequencing

none — on the frontier. Every other story depends on this one, because each needs the stored list and the command skeleton.

## Technical constraints

None yet — filled at DECOMPOSITION from the architect's assessment (technical/assessment.md).

## Observability

none — a local, offline command; its stdout/stderr lines and exit code are the whole operable signal, and the requester ruled out network (constraints.md row 3).

## Rollout

none

## Notes

- `package.json` declares `engines >=22` while the spec says Node 24. The spec governs; aligning `engines` is engineering's (`product/state.md`, ambiguity log row 1; `project/constraints.md` rows 1 and 2).
- No command writes yet, so the storage criteria are shown by this story's `node:test` tests on the stored file, not by a command.

> **Immutable once `status: accepted`** — in its product content. The lifecycle
> fields `status`, `readiness`, and `tickets` are advanced by the delivery roles
> under the restricted authority in `manifest.yaml`. Any content change is a new
> `REQ-` with `supersedes`.
