---
id: INIT-0001
type: initiative
title: Tasks are tracked locally from the ttc command line
status: draft
revision: 4
owner_role: ROLE-product-manager
created: 2026-10-20
updated: 2026-10-20
capabilities: [CAP-0001]
requirements: [REQ-0001, REQ-0002, REQ-0003, REQ-0004, REQ-0005, REQ-0006, REQ-0007, REQ-0008, REQ-0009, REQ-0010]
tickets: []
decisions: [PD-0001, PD-0003, PD-0004, PD-0005, PD-0006]
---

# INIT-0001 — Tasks are tracked locally from the ttc command line

## Outcome

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

## Why now

The repository holds an empty Node project: `package.json`, a placeholder test and a CI job named `test`. The requester asked for the `ttc` command-line task tracker on 2026-10-20 ([raw request](product/sources/2026-10-20-requester-spec.md)).

## Scope

**In scope.**

- The ten command groups of the requester's spec, one per outcome element:
  - storage, the CLI skeleton and `ttc help` (O1);
  - `ttc add` (O2);
  - `ttc list` with `--open`, `--done`, `--all` and `--tag` (O3);
  - `ttc done` and `ttc reopen` (O4);
  - `ttc rename` (O5);
  - `ttc delete` (O6);
  - overdue marking in `list` and `ttc list --overdue` (O7);
  - `ttc tag` (O8);
  - `ttc export` and `ttc import` (O9);
  - `ttc stats` (O10).
- The rules that bind every command:
  - tasks live in one JSON file at `$TTC_HOME/tasks.json` (default `~/.ttc`), and every write is atomic;
  - every failure is one line on stderr, with exit code 1 and no stored data changed;
  - the fixed message texts, argument rules, id rules and output formats in `PD-0003`, `PD-0004` and `PD-0006`;
  - Node 24, built-in libraries only, no network;
  - `node:test` tests for every command, and a passing CI `test` check.

**Out of scope.**

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
- Windows: `ttc` supports Linux and macOS (`PD-0004` item 5).
- Keeping a symlinked `tasks.json` or export target as a link (`PD-0004` item 3).

## Success measures

Each is observable (source: `product/state.md`, Discovery, success signals).

1. From an empty `$TTC_HOME`, each of the ten command groups does what its story says, and each has `node:test` tests that run in `npm test`.
2. The CI `test` check passes on every pull request that delivers a story.
3. A write interrupted at any point leaves `tasks.json` either as it was or as intended, never unreadable.
4. Every failure prints exactly one line on stderr and exits non-zero.
5. A list exported and then imported is the same list, and a file that fails validation changes nothing.
6. No command opens a network connection.

## Product constraints

From `project/constraints.md`, one line per row.

- Row 1: Node.js, built-in libraries only.
- Row 2: Node 24 is the runtime.
- Row 3: no network, in every command.
- Row 4: all task data lives in one JSON file at `$TTC_HOME/tasks.json` (default `~/.ttc`).
- Row 5: every write is atomic.
- Row 6: errors print one line to stderr and exit non-zero.
- Row 7: every command has `node:test` tests, and the CI `test` check must pass.
- Row 8: CLI only, no UI.
- Row 9: code lives in `rortegalizardo/task-tracker-cli` (`~/Desktop/Projects/task-tracker-cli`), and every ticket names its repo.

## Requirements

- [REQ-0001](requirements/REQ-0001-storage-cli-skeleton-help.md) — The ttc command prints its usage and keeps tasks in one atomically written file
- [REQ-0002](requirements/REQ-0002-add-task.md) — The ttc add command records a task with an optional due date and tags
- [REQ-0003](requirements/REQ-0003-list-tasks.md) — The ttc list command shows tasks by status and tag, one line each, in id order
- [REQ-0004](requirements/REQ-0004-done-reopen.md) — The ttc done and ttc reopen commands change a task's status
- [REQ-0005](requirements/REQ-0005-rename-task.md) — The ttc rename command changes a task's title
- [REQ-0006](requirements/REQ-0006-delete-task.md) — The ttc delete command removes a task and its id is never reused
- [REQ-0007](requirements/REQ-0007-overdue-due-dates.md) — The ttc list command marks overdue tasks and can show only them
- [REQ-0008](requirements/REQ-0008-tag-untag.md) — The ttc tag command adds or removes one tag on a task
- [REQ-0009](requirements/REQ-0009-export-import.md) — The ttc export and ttc import commands copy the whole list to and from a file, and a file that fails validation changes nothing
- [REQ-0010](requirements/REQ-0010-stats.md) — The ttc stats command prints the totals of open, done and overdue tasks

## Capabilities affected

- `CAP-0001` — A person tracks their tasks locally from the ttc command line (created by this initiative; `draft` until it ships). Every story `REQ-0001`…`REQ-0010` builds part of it.

## Open questions

None.

## Scope log

| Date | Revision | Change | Reason |
| --- | --- | --- | --- |
| 2026-10-20 | 1 | Created at INTAKE as a draft | Triage verdict `new-initiative` |
| 2026-10-20 | 2 | Outcome, scope, success measures and requirements written | PRODUCT_DEFINITION |
| 2026-10-20 | 3 | Rules of PD-0004 and the chosen option PD-0005 applied; two out-of-scope items added | SOLUTION_CONVERGENCE |
| 2026-10-20 | 4 | Rules of PD-0006 applied (coherence round 1, D5 and D6) | DECOMPOSITION |
