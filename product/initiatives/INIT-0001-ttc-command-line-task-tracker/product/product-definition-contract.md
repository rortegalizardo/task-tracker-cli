---
initiative: INIT-0001
type: product-definition-contract
title: Product definition contract — Tasks are tracked locally from the ttc command line
status: draft
revision: 2
owner_role: ROLE-product-manager
drafted_by: sonnet-drafting-child
validated_by: ROLE-product-manager
created: 2026-10-20
updated: 2026-10-20
requirements: [REQ-0001, REQ-0002, REQ-0003, REQ-0004, REQ-0005, REQ-0006, REQ-0007, REQ-0008, REQ-0009, REQ-0010]
open_questions: []
decisions: [PD-0001, PD-0003]
raw_sources: [initiatives/INIT-0001-ttc-command-line-task-tracker/product/sources/2026-10-20-requester-spec.md]
---

# Product definition contract — INIT-0001

## Problem

The requester asked for "a `ttc` command-line task tracker. Node 24, built-in libraries only, no network." The spec states that the data "lives in one JSON file at $TTC_HOME/tasks.json (default ~/.ttc)", that "Every write is atomic", that "Errors print one line to stderr and exit non-zero", and that "Every command has node:test tests; the CI `test` check must pass."

In the requester's terms, one person wants to keep a to-do list from the terminal. They add tasks with an optional due date and tags, list and filter them, mark them done and open again, rename, delete and retag them, see which are overdue, move the whole list in and out of a file, and read totals. The spec gives ten stories, one each, in a stated dependency order.

The requester also said: "The spec is complete. Decide everything inside it yourself." Details the spec leaves open are decided by the product manager in `PD-0003`.

## Actors

- **The user.** One person who works in a terminal and keeps their own to-do list on one machine, with no account, server or network. No second user and no shared list appear in the spec.
- **A script that runs `ttc`.** It reads the one stderr line and the exit code of a failed command (Discovery job J12).

## Current behavior

None — no current capability covers this. `capabilities/index.md` has no rows.

The repository holds an empty Node project and no product code:

- `package.json`, with the test script `node --test` and `engines >=22`;
- `test/placeholder.test.js`;
- `.github/workflows/ci.yml`, whose job named `test` runs `npm test` on Node 24 for every pull request.

No `tasks.json` exists.

## Desired outcomes

When this initiative is done, one person can keep a to-do list from the terminal with the `ttc` command, on their own machine, on Node 24 with built-in libraries only and no network, and each of these is true:

O1. The user can run `ttc help` to see the commands, and tasks are kept in one local JSON file that is never left half written.

O2. The user can record a task in one command, with an optional due date and tags.

O3. The user can list open, done or all tasks, optionally only those holding one tag.

O4. The user can mark a task done and reopen it.

O5. The user can change a task's title.

O6. The user can remove a task.

O7. The user can see which open tasks are past their due date and list only those.

O8. The user can add a tag to an existing task and remove one from it.

O9. The user can copy the whole list to a file and restore it from a file, and a file that fails validation changes nothing.

O10. The user can read the totals of open, done and overdue tasks.

## Requirements

| REQ- id | Status | One-line statement |
| --- | --- | --- |
| REQ-0001 | draft | The user can run `ttc help` to see the commands, and every task is kept in one local JSON file that is never left half written. |
| REQ-0002 | draft | The user can record a task in one command, with an optional due date and tags. |
| REQ-0003 | draft | The user can list open, done or all tasks, optionally only those holding one tag, one line per task in id order. |
| REQ-0004 | draft | The user can mark a task done and reopen it. |
| REQ-0005 | draft | The user can change a task's title. |
| REQ-0006 | draft | The user can remove a task, and its id is never given to another task. |
| REQ-0007 | draft | The user can see which open tasks are past their due date, and list only those. |
| REQ-0008 | draft | The user can add one tag to, or remove one tag from, an existing task. |
| REQ-0009 | draft | The user can copy the whole list to a file and replace the list from a file, and a file that fails validation changes nothing. |
| REQ-0010 | draft | The user can read the totals of open, done and overdue tasks. |

## Constraints

From `project/constraints.md`:

- Row 1: Node.js, built-in libraries only.
- Row 2: Node 24 is the runtime.
- Row 3: no network, in every command.
- Row 4: all task data lives in one JSON file at `$TTC_HOME/tasks.json` (default `~/.ttc`).
- Row 5: every write is atomic.
- Row 6: errors print one line to stderr and exit non-zero.
- Row 7: every command has `node:test` tests, and the CI `test` check must pass.
- Row 8: CLI only, no UI.
- Row 9: code lives in `rortegalizardo/task-tracker-cli` (`~/Desktop/Projects/task-tracker-cli`), and every ticket names its repo.

From accepted decisions:

- `PD-0001`: the spec is complete and the product manager decides every detail inside it; the initiative has no user-facing visual surface.
- `PD-0003`: the user-visible behaviour rules and the exact message texts that bind every command.

## Known facts

`S` is the requester's spec, `initiatives/INIT-0001-ttc-command-line-task-tracker/product/sources/2026-10-20-requester-spec.md`. `R` is the repository `~/Desktop/Projects/task-tracker-cli` at head `4e5a324`.

- The product is a `ttc` command-line task tracker for Node 24, with built-in libraries only and no network (S, first line of the spec).
- There are exactly ten stories, one per numbered item, in a stated dependency order, with story 1 before all the others (S, "Stories").
- All tasks live in one JSON file, `$TTC_HOME/tasks.json`, and `~/.ttc` is the folder when `TTC_HOME` is not set (S).
- Every write is atomic; every failure is one line on stderr with a non-zero exit; every command has `node:test` tests and the CI `test` check must pass (S).
- The requester delegated every detail inside the spec to the product manager, and asks for escalation only if the spec contradicts itself (S, requester instructions; `PD-0001` item 1).
- The initiative has no user-facing visual surface: "CLI only, no UI" (S, requester instructions; `PD-0001` item 3).
- Every ticket names the repository `rortegalizardo/task-tracker-cli` (S, requester instructions; `PD-0001` item 4).
- The repository holds `package.json` (test script `node --test`, `engines >=22`), `test/placeholder.test.js` and `.github/workflows/ci.yml`, with a job named `test` that runs `npm test` on Node 24 for every pull request (R).
- No `tasks.json` and no product code exist today, so no list holds real data (R).
- `package.json` declares `engines >=22` while the spec says Node 24. The spec governs, and aligning `engines` is engineering's (`PD-0001` item 2; `product/state.md` ambiguity log, row 1).
- The spec states no expected list size (S).

## Rejected assumptions

- **"The details the spec leaves open should go back to the requester."** Rejected: the requester said to decide everything inside the spec and to escalate only a contradiction (`PD-0001` Options considered).
- **"Each story's implementer can choose the open details."** Rejected: ten stories built in parallel would each choose differently, for example tags shown in one order by `list` and another after `import` (`PD-0003` Options considered).
- **"A deleted task's id can be given to a new task."** Rejected: a script, or the user's memory, could act on the wrong task after a delete (`PD-0003` Options considered).
- **"`import` merges the file into the current list."** Rejected: merging needs rules for clashing ids that the spec never mentions, and "all or nothing" reads most simply as replacing the whole list (`PD-0003` Options considered).
- **"`list` shows every task by default."** Rejected: an open task is the one a person acts on, and `--all` stays available (`PD-0003` Options considered).
- **"Design work is needed for the terminal output."** Rejected: the requester excluded design work, and the stories specify the printed text (`PD-0001` Options considered).
- **"`package.json` `engines >=22` sets the runtime."** Rejected: the spec says Node 24 and governs (`PD-0001` item 2).
- **"A tag can start with `-`, and `ttc tag` can stop reading `--x` as an option."** Rejected: it breaks the one argument rule every other command follows, for a kind of tag no story needs (`PD-0003` Options considered).
- **"Every argument error needs fixed wording."** Rejected: it adds about a dozen fixed strings that change nothing a user decides, and the one-line form that names what is at fault is enough to act on (`PD-0003` Options considered).
- **"A message about a tag shows the tag as typed."** Rejected: `+HOME` would then print `HOME` while `list` shows `+home`, so two outputs would disagree about one tag (`PD-0003` Options considered).
- **"`import` fails when `tasks.json` cannot be read."** Rejected: it leaves a user with a damaged list and a good export no way back except editing the file by hand (`PD-0003` Options considered).
- **"`import` lowers the case of the tags in a file."** Rejected: import would then change data, and a file `ttc` never wrote would pass as valid, so refusing keeps "validate first" simple (`PD-0003` Options considered).

## Open questions

none

## Decisions already made

- `PD-0001` — treats the spec as complete, records its hard rules as constraints 2–9, fixes that there is no visual surface, and fixes that every ticket names its repository.
- `PD-0003` — supersedes `PD-0002`, which stays on record as superseded. It holds the complete set of user-visible behaviour rules the spec leaves open, with the same item numbers: ids; arguments, including who words the messages it does not quote; titles; tags, whose first character is a letter or a digit; due dates; overdue; `list`; the task line; repeated actions, with the tag shown as stored; success output; errors; help; storage, where the JSON layout is engineering's and `import` does not read the current `tasks.json`; export and import, whose paths are relative to the current folder and whose file may hold only lower-case tags; `stats`; and one process at a time.

## Raw-source citations

- `initiatives/INIT-0001-ttc-command-line-task-tracker/product/sources/2026-10-20-requester-spec.md` — the requester's spec and instructions, 2026-10-20 (committed verbatim).
- `~/Desktop/Projects/task-tracker-cli/package.json`, `~/Desktop/Projects/task-tracker-cli/test/placeholder.test.js` and `~/Desktop/Projects/task-tracker-cli/.github/workflows/ci.yml` — the repository files that Current behavior and Known facts cite (head `4e5a324`).

## Non-goals

This restates the out-of-scope section of `initiative.md`.

- More than one user, or a shared list: nothing in the spec asks for it.
- Sync between machines.
- Any graphical or full-screen terminal interface, and any other visual surface: "CLI only, no UI" (`PD-0001` item 3).
- Reminders or notifications.
- Recurring tasks.
- Priorities, subtasks or notes.
- Text search.
- Changing or clearing a due date after `add`: the spec has no command for it (`PD-0003` Consequences).
- Merging on import: import replaces the whole list (`PD-0003` item 14).
- Safe concurrent writes from two `ttc` processes at once (`PD-0003` item 16).
- Publishing the package to a registry.
