---
id: REQ-0013
type: requirement
title: Finished tasks are cleaned out of the list in one short command
status: accepted
revision: 3
owner_role: ROLE-product-manager
created: 2026-10-28
updated: 2026-10-28
initiative: INIT-0004
outcome_element: "O1, O2 and O3 (initiative.md): clean finished tasks out of the list with one short command; the output gives how many were removed; nothing else changes"
acceptance:
  - "AC-1. Empty `$TTC_HOME`, then `ttc add \"Pay rent\" --important`, `ttc add \"Buy milk\"`, `ttc add \"Call mom\"`, `ttc done 1`, `ttc done 3` and `ttc clean` → stdout is the single line `Removed 2 done tasks`, stderr is empty, exit code 0; `ttc list --done` then prints exactly `No tasks.`, `ttc list --all` prints exactly `#2 [ ] Buy milk`, and `ttc stats` prints exactly `open: 1`, `done: 0`, `overdue: 0`"
  - "AC-2. Task 1 `Pay rent` added with `--due 2099-12-30 --tag home --note \"by card\" --important`, task 2 `Buy milk` added with `--due 2099-06-01 --tag shop`, task 3 `Call mom` added, then `ttc done 3`, `ttc export before.json`, `ttc clean` and `ttc export after.json` → `ttc clean` prints the single line `Removed 1 done tasks`, exit code 0; `after.json` parsed equals `before.json` parsed with task 3 taken out of `tasks`: the same `version` and `nextId`, and tasks 1 and 2 in the same order with every field unchanged"
  - "AC-3. Tasks 1–3 added, then `ttc done 1`, `ttc done 2`, `ttc done 3` and `ttc clean` → stdout is the single line `Removed 3 done tasks`, exit code 0; `ttc add \"New task\"` then prints `Added task 4`, and `ttc list --all` prints exactly `#4 [ ] New task`"
  - "AC-4. Only task 1 `Buy milk` stored, open, then `ttc clean` → stdout is the single line `Removed 0 done tasks`, stderr is empty, exit code 0, and `tasks.json` is byte-for-byte unchanged"
  - "AC-5. `$TTC_HOME` names a folder that does not exist, then `ttc clean` → stdout is the single line `Removed 0 done tasks`, exit code 0, and afterwards neither `tasks.json` nor the `$TTC_HOME` folder exists"
  - "AC-6. `tasks.json` in format version 3 holding exactly `{\"version\":3,\"nextId\":5,\"tasks\":[{\"id\":1,\"title\":\"Pay rent\",\"status\":\"done\",\"due\":null,\"tags\":[],\"note\":null},{\"id\":2,\"title\":\"Buy milk\",\"status\":\"open\",\"due\":null,\"tags\":[],\"note\":null}]}`, then `ttc clean` → stdout is the single line `Removed 1 done tasks`, exit code 0; `tasks.json` now holds `\"version\": 4`, `ttc list --all` prints exactly `#2 [ ] Buy milk`, and `ttc add \"Call mom\"` prints `Added task 5`"
  - "AC-7. `tasks.json` in format version 3 holding exactly `{\"version\":3,\"nextId\":2,\"tasks\":[{\"id\":1,\"title\":\"Buy milk\",\"status\":\"open\",\"due\":null,\"tags\":[],\"note\":null}]}`, then `ttc clean` → stdout is the single line `Removed 0 done tasks`, exit code 0, and `tasks.json` is byte-for-byte unchanged"
  - "AC-8. Task 1 open and task 2 done stored, then each of `ttc clean 2`, `ttc clean --all` and `ttc clean --done` → stderr is one line starting `ttc: `, stdout is empty, exit code 1, and `tasks.json` is byte-for-byte unchanged"
  - "AC-9. `tasks.json` holding the text `not json`, then `ttc clean` → stderr is one line starting `ttc: cannot read `, stdout is empty, exit code 1, and `tasks.json` is byte-for-byte unchanged"
  - "AC-10. `ttc help` → stdout is exactly `Usage:` followed by these lines, each indented two spaces, in this order: `ttc help`; `ttc add \"<title>\" [--due YYYY-MM-DD] [--tag <t>]... [--note \"<text>\"] [--important]`; `ttc list [--open|--done|--all|--overdue] [--tag <t>] [--due-from YYYY-MM-DD] [--due-to YYYY-MM-DD] [--search <text>]`; `ttc done <id>`; `ttc reopen <id>`; `ttc important <id>`; `ttc unimportant <id>`; `ttc postpone <id>`; `ttc rename <id> \"<title>\"`; `ttc delete <id>`; `ttc clean`; `ttc tag <id> +<t> | -<t>`; `ttc note <id> [\"<text>\" | --clear]`; `ttc export [<file>] [--format json|csv] [--open|--done|--all|--overdue] [--tag <t>] [--due-from YYYY-MM-DD] [--due-to YYYY-MM-DD] [--search <text>]`; `ttc import <file>`; `ttc stats`; exit code 0"
  - "AC-11. README.md → documents `ttc clean`: that it removes every done task for good, prints `Removed <n> done tasks`, and asks no confirmation; and that `ttc list --done` shows beforehand what will be removed, `ttc reopen <id>` keeps a task, and `ttc export <file> --done` keeps a copy"
  - "AC-12. `npm test` runs `node:test` tests covering AC-1 to AC-10 → all pass; the pull request delivering this story → the CI `test` check passes"
capabilities: [CAP-0001]
design_refs: []
decisions: [PD-0003, PD-0004, PD-0008, PD-0010, PD-0012]
depends_on: [none]
constraints: ["C1 (technical/assessment.md, round 1)", "C2 (technical/assessment.md, round 1)", "C3 (technical/assessment.md, round 1)", "C4 (technical/assessment.md, round 1)", "C5 (technical/assessment.md, round 1)"]
observability: []
rollout: none
readiness: engineering-ready
tickets: []
supersedes:
superseded_by:
---

# REQ-0013 — Finished tasks are cleaned out of the list in one short command

## Requirement

A user can remove every finished (done) task from their list with one short
command that needs nothing else typed. The command prints how many tasks it
removed. Open tasks are untouched, and a removed task's id is never given
again.

## Scope

- The new `ttc clean` command, its argument rules, its confirmation line and
  its errors.
- Removing every done task in one atomic write, and the nothing-to-remove case.
- Keeping every open task and its fields unchanged, keeping the next id, and
  working on data files written by older ttc.
- The `ttc help` usage lines and the README.
- Repository: `rortegalizardo/task-tracker-cli` (`project/constraints.md` row 9).

## Non-goals

- Removing open tasks, keeping recently finished tasks while removing older
  ones, an archive, an undo, an "are you sure?" prompt, narrowing by tag,
  date, id or search, automatic clean-ups, showing when a task was finished,
  reusing ids, any other output change: all out of scope in `initiative.md`.

## Behavior

Rules are `PD-0012`; this section states what the user sees.

- **Clean.** `ttc clean` removes every task whose status is done, for good,
  prints `Removed <n> done tasks` (`<n>` is the number removed; the same form
  for every number, 0 and 1 included) and exits 0. It asks no confirmation.
- **Nothing to remove.** With no done task stored, it prints
  `Removed 0 done tasks`, exits 0 and writes nothing: `tasks.json` stays
  byte-identical, and a missing `tasks.json` stays missing, with no file or
  folder created.
- **Arguments.** It takes no argument and no option; any argument or option is
  an error under the existing argument rules (`PD-0003` item 2).
- **Shared rules.** Arguments are checked first; then, under the lock, the
  list is read and every done task is removed in one atomic write, so an
  interruption leaves all of them or none of them removed. The lock, its busy
  failure, the atomic write, the file permissions, a failure before the save
  writing nothing and a failure after the save exiting 1 with the removal
  kept are as for every changing command (`PD-0003` item 11, `PD-0004`
  items 3–4 and 7, `PD-0008`). An unreadable `tasks.json` gives the existing
  `ttc: cannot read <path>: <reason>` error (`PD-0003` item 13).
- **Nothing else changes.** Every open task keeps its id, title, due date,
  tags, note and important mark; the order and format of `ttc list` and the
  next id do not change, so a new task always gets a higher id than any task
  ever created (`PD-0003` item 1). Afterwards `ttc list --done` prints
  `No tasks.`, `ttc stats` prints `done: 0`, and `ttc export` no longer
  includes the removed tasks (`PD-0012` item 9).
- **Data file.** No format change; `tasks.json` stays version 4. When at least
  one task is removed, a version 1–3 file is written as version 4, as by every
  changing command (`PD-0010`).
- **Help.** `ttc clean` comes right after `ttc delete <id>`.

## Acceptance criteria

- [ ] AC-1. Empty `$TTC_HOME`, then `ttc add "Pay rent" --important`, `ttc add "Buy milk"`, `ttc add "Call mom"`, `ttc done 1`, `ttc done 3` and `ttc clean` → stdout is the single line `Removed 2 done tasks`, stderr is empty, exit code 0; `ttc list --done` then prints exactly `No tasks.`, `ttc list --all` prints exactly `#2 [ ] Buy milk`, and `ttc stats` prints exactly `open: 1`, `done: 0`, `overdue: 0`
- [ ] AC-2. Task 1 `Pay rent` added with `--due 2099-12-30 --tag home --note "by card" --important`, task 2 `Buy milk` added with `--due 2099-06-01 --tag shop`, task 3 `Call mom` added, then `ttc done 3`, `ttc export before.json`, `ttc clean` and `ttc export after.json` → `ttc clean` prints the single line `Removed 1 done tasks`, exit code 0; `after.json` parsed equals `before.json` parsed with task 3 taken out of `tasks`: the same `version` and `nextId`, and tasks 1 and 2 in the same order with every field unchanged
- [ ] AC-3. Tasks 1–3 added, then `ttc done 1`, `ttc done 2`, `ttc done 3` and `ttc clean` → stdout is the single line `Removed 3 done tasks`, exit code 0; `ttc add "New task"` then prints `Added task 4`, and `ttc list --all` prints exactly `#4 [ ] New task`
- [ ] AC-4. Only task 1 `Buy milk` stored, open, then `ttc clean` → stdout is the single line `Removed 0 done tasks`, stderr is empty, exit code 0, and `tasks.json` is byte-for-byte unchanged
- [ ] AC-5. `$TTC_HOME` names a folder that does not exist, then `ttc clean` → stdout is the single line `Removed 0 done tasks`, exit code 0, and afterwards neither `tasks.json` nor the `$TTC_HOME` folder exists
- [ ] AC-6. `tasks.json` in format version 3 holding exactly `{"version":3,"nextId":5,"tasks":[{"id":1,"title":"Pay rent","status":"done","due":null,"tags":[],"note":null},{"id":2,"title":"Buy milk","status":"open","due":null,"tags":[],"note":null}]}`, then `ttc clean` → stdout is the single line `Removed 1 done tasks`, exit code 0; `tasks.json` now holds `"version": 4`, `ttc list --all` prints exactly `#2 [ ] Buy milk`, and `ttc add "Call mom"` prints `Added task 5`
- [ ] AC-7. `tasks.json` in format version 3 holding exactly `{"version":3,"nextId":2,"tasks":[{"id":1,"title":"Buy milk","status":"open","due":null,"tags":[],"note":null}]}`, then `ttc clean` → stdout is the single line `Removed 0 done tasks`, exit code 0, and `tasks.json` is byte-for-byte unchanged
- [ ] AC-8. Task 1 open and task 2 done stored, then each of `ttc clean 2`, `ttc clean --all` and `ttc clean --done` → stderr is one line starting `ttc: `, stdout is empty, exit code 1, and `tasks.json` is byte-for-byte unchanged
- [ ] AC-9. `tasks.json` holding the text `not json`, then `ttc clean` → stderr is one line starting `ttc: cannot read `, stdout is empty, exit code 1, and `tasks.json` is byte-for-byte unchanged
- [ ] AC-10. `ttc help` → stdout is exactly `Usage:` followed by these lines, each indented two spaces, in this order: `ttc help`; `ttc add "<title>" [--due YYYY-MM-DD] [--tag <t>]... [--note "<text>"] [--important]`; `ttc list [--open|--done|--all|--overdue] [--tag <t>] [--due-from YYYY-MM-DD] [--due-to YYYY-MM-DD] [--search <text>]`; `ttc done <id>`; `ttc reopen <id>`; `ttc important <id>`; `ttc unimportant <id>`; `ttc postpone <id>`; `ttc rename <id> "<title>"`; `ttc delete <id>`; `ttc clean`; `ttc tag <id> +<t> | -<t>`; `ttc note <id> ["<text>" | --clear]`; `ttc export [<file>] [--format json|csv] [--open|--done|--all|--overdue] [--tag <t>] [--due-from YYYY-MM-DD] [--due-to YYYY-MM-DD] [--search <text>]`; `ttc import <file>`; `ttc stats`; exit code 0
- [ ] AC-11. README.md → documents `ttc clean`: that it removes every done task for good, prints `Removed <n> done tasks`, and asks no confirmation; and that `ttc list --done` shows beforehand what will be removed, `ttc reopen <id>` keeps a task, and `ttc export <file> --done` keeps a copy
- [ ] AC-12. `npm test` runs `node:test` tests covering AC-1 to AC-10 → all pass; the pull request delivering this story → the CI `test` check passes

## Sequencing

none — on the frontier. One story; `depends_on: [none]`. It builds on the
commands shipped at head `21e02ed` (INIT-0001, INIT-0002, INIT-0003).

## Technical constraints

From `technical/assessment.md`, round 1 (C6–C9 applied to option B only):

- **C1**: `ttc clean` is a changing command and inherits, unchanged: exact arguments (no positional, no option; checked before the lock, `PD-0003` item 2); the exclusive lock and its busy failure; every done task removed in one atomic write, so an interruption leaves the whole old list or the whole new list (`project/constraints.md` row 5, `PD-0004` item 3); owner-only permissions (`PD-0004` item 4); a failure before the save writes nothing (`PD-0003` item 11, `PD-0004` item 7); a failure after the save exits 1 and keeps the removal (`PD-0008`). Nothing to remove writes nothing: the file stays byte-identical, a version 1–3 file is not upgraded (`PD-0010` item 1), and a missing `tasks.json` leaves no file or data folder.
- **C2**: the next id is stored apart from the tasks and the clean leaves it as it is, even when every task is removed; the clean never lowers or recomputes it (`PD-0003` item 1).
- **C3**: the success line, its form for every number and the usage line and its position are fixed text (`PD-0012` items 4, 5, 11); tests assert them exactly.
- **C4**: the test oracle (`test/support/ttc-model.js`) and the argument fuzzing (`fuzz-gen.js`, `fuzz-harness.js`) gain `clean`, written from `PD-0012`, not from the new code.
- **C5**: the perf guard (10,000 tasks, median < 500 ms) must still pass.

## Observability

none — a local, offline command; its stdout/stderr lines and exit code are the
whole operable signal, and the requester ruled out network
(`project/constraints.md` row 3).

## Rollout

`none`. No format change (C1); upgrading a version 1–3 file on its first
change is existing behaviour (`PD-0010`).

## Notes

- Raw request: `product/sources/2026-10-28-requester-request.md`.
- Recently finished tasks are removed too; keeping them would need a stored
  finish date and a format change, left out for "Keep it simple"
  (`PD-0012` Options considered).
