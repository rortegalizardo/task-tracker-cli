---
id: REQ-0014
type: requirement
title: A new task is made from an existing one in one short command
status: accepted
revision: 3
owner_role: ROLE-product-manager
created: 2026-10-29
updated: 2026-10-29
initiative: INIT-0005
outcome_element: "O1, O2 and O3 (initiative.md): make a new open task holding an existing task's title, due date, tags, note and important mark with one short command; the output gives the new id; nothing else changes"
acceptance:
  - "AC-1. Empty `$TTC_HOME`, then `ttc add \"Pay rent\" --due 2099-10-01 --tag home --tag bills --note \"by card\" --important`, `ttc add \"Buy milk\"`, `ttc done 1`, `ttc export before.json`, `ttc copy 1` and `ttc export after.json` → `ttc copy 1` prints the single line `Copied task 1 as task 3` to stdout, stderr is empty, exit code 0; `after.json` parsed has `version` 4 and `nextId` 4, its first two tasks equal the two tasks of `before.json` parsed, in the same order with every field unchanged (task 1 still `done`), and its third task is exactly `{\"id\":3,\"title\":\"Pay rent\",\"status\":\"open\",\"due\":\"2099-10-01\",\"tags\":[\"home\",\"bills\"],\"note\":\"by card\",\"important\":true}`"
  - "AC-2. After the commands of AC-1, `ttc list` → stdout is exactly the two lines `#3 [ ] Pay rent due:2099-10-01 !important +bills +home` and `#2 [ ] Buy milk`, in that order, exit code 0"
  - "AC-3. Empty `$TTC_HOME`, then `ttc add \"Pay rent\" --due 2020-01-01 --tag bills`, `ttc copy 1 --due 2099-11-01`, `ttc copy --due 9999-12-31 1` and `ttc copy 1 --due 2021-06-01` → the three copies print the single lines `Copied task 1 as task 2`, `Copied task 1 as task 3` and `Copied task 1 as task 4`, each exit code 0; `ttc list --all` then prints exactly `#1 [ ] Pay rent due:2020-01-01 !overdue +bills`, `#2 [ ] Pay rent due:2099-11-01 +bills`, `#3 [ ] Pay rent due:9999-12-31 +bills` and `#4 [ ] Pay rent due:2021-06-01 !overdue +bills`, in that order"
  - "AC-4. Empty `$TTC_HOME`, then `ttc add \"Pay rent\" --due 2020-01-01` and `ttc copy 1` → stdout is the single line `Copied task 1 as task 2`, exit code 0; `ttc list --overdue` then prints exactly `#1 [ ] Pay rent due:2020-01-01 !overdue` and `#2 [ ] Pay rent due:2020-01-01 !overdue`, in that order"
  - "AC-5. Empty `$TTC_HOME`, then `ttc add \"Call mom\"`, `ttc copy 1` and `ttc copy 1 --due 2099-01-01` → the two copies print the single lines `Copied task 1 as task 2` and `Copied task 1 as task 3`, each exit code 0; `ttc list` then prints exactly `#1 [ ] Call mom`, `#2 [ ] Call mom` and `#3 [ ] Call mom due:2099-01-01`, in that order"
  - "AC-6. Empty `$TTC_HOME`, then `ttc add \"Pay rent\"`, `ttc add \"Buy milk\"`, `ttc add \"Call mom\"`, `ttc delete 3` and `ttc copy 002` → stdout is the single line `Copied task 2 as task 4`, exit code 0; `ttc add \"Water plants\"` then prints `Added task 5`"
  - "AC-7. `tasks.json` holding exactly `{\"version\":4,\"nextId\":9007199254740992,\"tasks\":[{\"id\":1,\"title\":\"Pay rent\",\"status\":\"open\",\"due\":null,\"tags\":[],\"note\":null,\"important\":false}]}`, then `ttc copy 1` → stderr is exactly the line `ttc: no task id is left`, stdout is empty, exit code 1, and `tasks.json` is byte-for-byte unchanged"
  - "AC-8. Task 1 `Pay rent` stored, open, then each of `ttc copy`, `ttc copy 1 2`, `ttc copy 1 --tag x`, `ttc copy 1 --due` and `ttc copy 1 --due 2099-01-01 --due 2099-01-02` → stderr is one line starting `ttc: `, stdout is empty, exit code 1, and `tasks.json` is byte-for-byte unchanged"
  - "AC-9. Task 1 `Pay rent` stored, open, then: `ttc copy abc` → stderr is exactly `ttc: invalid task id: abc`; `ttc copy 9` → `ttc: no task with id 9`; `ttc copy 1 --due 2026-02-30` → `ttc: invalid date: 2026-02-30`; `ttc copy 1 --due 10000-01-01` → `ttc: invalid date: 10000-01-01`; `ttc copy abc --due 2026-02-30` → `ttc: invalid task id: abc`; `ttc copy 9 --due 2026-02-30` → `ttc: invalid date: 2026-02-30`; each with stdout empty, exit code 1, and `tasks.json` byte-for-byte unchanged"
  - "AC-10. `$TTC_HOME` names a folder that does not exist, then `ttc copy 1` → stderr is exactly `ttc: no task with id 1`, stdout is empty, exit code 1, and afterwards neither `tasks.json` nor the `$TTC_HOME` folder exists"
  - "AC-11. `tasks.json` holding the text `not json`, then `ttc copy 1` → stderr is one line starting `ttc: cannot read `, stdout is empty, exit code 1, and `tasks.json` is byte-for-byte unchanged"
  - "AC-12. `tasks.json` in format version 3 holding exactly `{\"version\":3,\"nextId\":2,\"tasks\":[{\"id\":1,\"title\":\"Pay rent\",\"status\":\"done\",\"due\":\"2099-10-01\",\"tags\":[\"bills\"],\"note\":\"by card\"}]}`, then `ttc copy 5` → stderr is exactly `ttc: no task with id 5`, exit code 1, and `tasks.json` is byte-for-byte unchanged; then `ttc copy 1` → stdout is the single line `Copied task 1 as task 2`, exit code 0; `tasks.json` now holds `\"version\": 4`, and `ttc export out.json` parsed has `nextId` 3 and exactly the tasks `{\"id\":1,\"title\":\"Pay rent\",\"status\":\"done\",\"due\":\"2099-10-01\",\"tags\":[\"bills\"],\"note\":\"by card\",\"important\":false}` and `{\"id\":2,\"title\":\"Pay rent\",\"status\":\"open\",\"due\":\"2099-10-01\",\"tags\":[\"bills\"],\"note\":\"by card\",\"important\":false}`, in that order"
  - "AC-13. `ttc help` → stdout is exactly `Usage:` followed by these lines, each indented two spaces, in this order: `ttc help`; `ttc add \"<title>\" [--due YYYY-MM-DD] [--tag <t>]... [--note \"<text>\"] [--important]`; `ttc copy <id> [--due YYYY-MM-DD]`; `ttc list [--open|--done|--all|--overdue] [--tag <t>] [--due-from YYYY-MM-DD] [--due-to YYYY-MM-DD] [--search <text>]`; `ttc done <id>`; `ttc reopen <id>`; `ttc important <id>`; `ttc unimportant <id>`; `ttc postpone <id>`; `ttc rename <id> \"<title>\"`; `ttc delete <id>`; `ttc clean`; `ttc tag <id> +<t> | -<t>`; `ttc note <id> [\"<text>\" | --clear]`; `ttc export [<file>] [--format json|csv] [--open|--done|--all|--overdue] [--tag <t>] [--due-from YYYY-MM-DD] [--due-to YYYY-MM-DD] [--search <text>]`; `ttc import <file>`; `ttc stats`; exit code 0"
  - "AC-14. README.md → has a \"Copying a task\" section documenting `ttc copy <id> [--due YYYY-MM-DD]`: that the new task has the original's title, due date, tags, note and important mark, is open and gets a new id; that `--due` gives it a different due date under the same rule as `ttc add --due`; that it prints `Copied task <id> as task <new-id>`; its refusals (`ttc: no task with id <id>`, `ttc: invalid date: <d>`, `ttc: no task id is left`); and that only the new task is added. It does not present copying and then deleting as a way to change a due date"
  - "AC-15. `npm test` runs `node:test` tests covering AC-1 to AC-13, and the test oracle and the argument fuzzing cover `ttc copy` and its `--due` cases (C6) → all pass; the pull request delivering this story → the CI `test` check passes"
capabilities: [CAP-0001]
design_refs: []
decisions: [PD-0003, PD-0004, PD-0008, PD-0009, PD-0010, PD-0011, PD-0013]
depends_on: [none]
constraints: ["C1 (technical/assessment.md, round 1)", "C2 (technical/assessment.md, round 1)", "C3 (technical/assessment.md, round 1)", "C4 (technical/assessment.md, round 1)", "C5 (technical/assessment.md, round 1)", "C6 (technical/assessment.md, round 1)", "C7 (technical/assessment.md, round 1)", "C8 (technical/assessment.md, round 1)", "C9 (technical/assessment.md, round 1)"]
observability: []
rollout: none
readiness: not-assessed
tickets: []
supersedes:
superseded_by:
---

# REQ-0014 — A new task is made from an existing one in one short command

## Requirement

A user can make a new task from an existing one with one short command that
needs only the existing task's id. The new task has the original's title, due
date, tags, note and important mark, is open, and gets a new id, which the
command prints; one option gives it a different due date. The original task
and every other task are unchanged.

## Scope

- The new `ttc copy <id> [--due YYYY-MM-DD]` command, its argument rules, its
  confirmation line and its errors.
- What the new task holds, and the `--due` option.
- Keeping the original and every other task unchanged, giving the next id, and
  working on data files written by older ttc.
- The `ttc help` usage line and the README.
- Repository: `rortegalizardo/task-tracker-cli` (`project/constraints.md` row 9).

## Non-goals

- Copying several tasks at once, changing the copy's title, tags, note or mark
  in the copy command, changing or clearing an existing task's due date
  (including removing the date from a copy), recurring or automatic copies,
  templates, recording which task a copy came from, copying into another list
  or file, any other output change: all out of scope in `initiative.md`.

## Behavior

The rules are `PD-0013`; this section states what the user sees.

- **Copy.** `ttc copy <id>` adds one new task with the original's title, due
  date, tags, note and important mark, as stored, and status open, whatever
  the original's status. It prints `Copied task <id> as task <new-id>` (both
  ids without leading zeros) and exits 0. An original with no due date, no
  tags or no note gives a copy with none. A copy of an overdue original is
  overdue at once unless `--due` is given (`PD-0013` items 1, 4).
- **`--due`.** `ttc copy <id> --due <d>` gives the new task the due date `<d>`
  instead of the original's, under the `ttc add --due` rule: `YYYY-MM-DD`, a
  real calendar date, a past date allowed, nothing later than `9999-12-31`,
  else `ttc: invalid date: <d>`. It also gives a date to the copy of an undated
  original. It cannot remove a date. `--due` may come before or after the id
  (`PD-0013` items 2, 3).
- **Arguments.** Exactly one id and at most one `--due`. A missing id, an extra
  argument, any other option, `--due` with no value, or `--due` given twice is
  an error under the existing argument rules (`PD-0003` item 2).
- **Ids.** The new task gets the next id and the next id rises by one, as for
  `ttc add`; ids are never reused (`PD-0003` item 1). When no id is left:
  `ttc: no task id is left` (`PD-0013` item 5).
- **Errors and check order.** Before the lock: the arguments, then the id
  (`ttc: invalid task id: <arg>`), then the `--due` date. Under the lock: read
  the list (`ttc: cannot read <path>: <reason>`), find the task
  (`ttc: no task with id <id>`), then the id limit. The first failing check is
  reported. Every refusal prints one line to stderr, exits 1 and writes
  nothing: `tasks.json` stays byte-identical, a file written by older ttc keeps
  its version, and a missing `tasks.json` stays missing, with no file or
  folder created (`PD-0013` item 6).
- **Shared rules.** The lock and its busy failure, one atomic write (an
  interruption leaves the list either without the copy or with the whole
  copy), the file permissions, and a failure after the save exiting 1 with the
  copy kept are as for every changing command (`PD-0004` items 3–4,
  `PD-0008`; `PD-0013` item 7).
- **Nothing else changes.** The original and every other task keep their id,
  title, status, due date, tags, note and important mark, and their stored
  order. The new task is listed like any task, by its important mark and then
  by id, and shows in `ttc stats`, `ttc export` and every filter it matches
  (`PD-0009` item 4; `PD-0013` items 8, 9).
- **Data file.** No format change; `tasks.json` stays version 4. A task in a
  version 1–3 file is copied without error and the copy holds what that file
  holds; a successful copy writes the file as version 4, as every changing
  command does (`PD-0010` items 1, 4; `PD-0013` item 10).
- **Help.** The usage line `ttc copy <id> [--due YYYY-MM-DD]` comes right after
  the `ttc add` line and before the `ttc list` line (`PD-0013` item 11).
- **README.** A "Copying a task" section, which does not present copying and
  then deleting as a way to change a due date (`PD-0013` items 12, 13).

## Acceptance criteria

- [ ] AC-1. Empty `$TTC_HOME`, then `ttc add "Pay rent" --due 2099-10-01 --tag home --tag bills --note "by card" --important`, `ttc add "Buy milk"`, `ttc done 1`, `ttc export before.json`, `ttc copy 1` and `ttc export after.json` → `ttc copy 1` prints the single line `Copied task 1 as task 3` to stdout, stderr is empty, exit code 0; `after.json` parsed has `version` 4 and `nextId` 4, its first two tasks equal the two tasks of `before.json` parsed, in the same order with every field unchanged (task 1 still `done`), and its third task is exactly `{"id":3,"title":"Pay rent","status":"open","due":"2099-10-01","tags":["home","bills"],"note":"by card","important":true}`
- [ ] AC-2. After the commands of AC-1, `ttc list` → stdout is exactly the two lines `#3 [ ] Pay rent due:2099-10-01 !important +bills +home` and `#2 [ ] Buy milk`, in that order, exit code 0
- [ ] AC-3. Empty `$TTC_HOME`, then `ttc add "Pay rent" --due 2020-01-01 --tag bills`, `ttc copy 1 --due 2099-11-01`, `ttc copy --due 9999-12-31 1` and `ttc copy 1 --due 2021-06-01` → the three copies print the single lines `Copied task 1 as task 2`, `Copied task 1 as task 3` and `Copied task 1 as task 4`, each exit code 0; `ttc list --all` then prints exactly `#1 [ ] Pay rent due:2020-01-01 !overdue +bills`, `#2 [ ] Pay rent due:2099-11-01 +bills`, `#3 [ ] Pay rent due:9999-12-31 +bills` and `#4 [ ] Pay rent due:2021-06-01 !overdue +bills`, in that order
- [ ] AC-4. Empty `$TTC_HOME`, then `ttc add "Pay rent" --due 2020-01-01` and `ttc copy 1` → stdout is the single line `Copied task 1 as task 2`, exit code 0; `ttc list --overdue` then prints exactly `#1 [ ] Pay rent due:2020-01-01 !overdue` and `#2 [ ] Pay rent due:2020-01-01 !overdue`, in that order
- [ ] AC-5. Empty `$TTC_HOME`, then `ttc add "Call mom"`, `ttc copy 1` and `ttc copy 1 --due 2099-01-01` → the two copies print the single lines `Copied task 1 as task 2` and `Copied task 1 as task 3`, each exit code 0; `ttc list` then prints exactly `#1 [ ] Call mom`, `#2 [ ] Call mom` and `#3 [ ] Call mom due:2099-01-01`, in that order
- [ ] AC-6. Empty `$TTC_HOME`, then `ttc add "Pay rent"`, `ttc add "Buy milk"`, `ttc add "Call mom"`, `ttc delete 3` and `ttc copy 002` → stdout is the single line `Copied task 2 as task 4`, exit code 0; `ttc add "Water plants"` then prints `Added task 5`
- [ ] AC-7. `tasks.json` holding exactly `{"version":4,"nextId":9007199254740992,"tasks":[{"id":1,"title":"Pay rent","status":"open","due":null,"tags":[],"note":null,"important":false}]}`, then `ttc copy 1` → stderr is exactly the line `ttc: no task id is left`, stdout is empty, exit code 1, and `tasks.json` is byte-for-byte unchanged
- [ ] AC-8. Task 1 `Pay rent` stored, open, then each of `ttc copy`, `ttc copy 1 2`, `ttc copy 1 --tag x`, `ttc copy 1 --due` and `ttc copy 1 --due 2099-01-01 --due 2099-01-02` → stderr is one line starting `ttc: `, stdout is empty, exit code 1, and `tasks.json` is byte-for-byte unchanged
- [ ] AC-9. Task 1 `Pay rent` stored, open, then: `ttc copy abc` → stderr is exactly `ttc: invalid task id: abc`; `ttc copy 9` → `ttc: no task with id 9`; `ttc copy 1 --due 2026-02-30` → `ttc: invalid date: 2026-02-30`; `ttc copy 1 --due 10000-01-01` → `ttc: invalid date: 10000-01-01`; `ttc copy abc --due 2026-02-30` → `ttc: invalid task id: abc`; `ttc copy 9 --due 2026-02-30` → `ttc: invalid date: 2026-02-30`; each with stdout empty, exit code 1, and `tasks.json` byte-for-byte unchanged
- [ ] AC-10. `$TTC_HOME` names a folder that does not exist, then `ttc copy 1` → stderr is exactly `ttc: no task with id 1`, stdout is empty, exit code 1, and afterwards neither `tasks.json` nor the `$TTC_HOME` folder exists
- [ ] AC-11. `tasks.json` holding the text `not json`, then `ttc copy 1` → stderr is one line starting `ttc: cannot read `, stdout is empty, exit code 1, and `tasks.json` is byte-for-byte unchanged
- [ ] AC-12. `tasks.json` in format version 3 holding exactly `{"version":3,"nextId":2,"tasks":[{"id":1,"title":"Pay rent","status":"done","due":"2099-10-01","tags":["bills"],"note":"by card"}]}`, then `ttc copy 5` → stderr is exactly `ttc: no task with id 5`, exit code 1, and `tasks.json` is byte-for-byte unchanged; then `ttc copy 1` → stdout is the single line `Copied task 1 as task 2`, exit code 0; `tasks.json` now holds `"version": 4`, and `ttc export out.json` parsed has `nextId` 3 and exactly the tasks `{"id":1,"title":"Pay rent","status":"done","due":"2099-10-01","tags":["bills"],"note":"by card","important":false}` and `{"id":2,"title":"Pay rent","status":"open","due":"2099-10-01","tags":["bills"],"note":"by card","important":false}`, in that order
- [ ] AC-13. `ttc help` → stdout is exactly `Usage:` followed by these lines, each indented two spaces, in this order: `ttc help`; `ttc add "<title>" [--due YYYY-MM-DD] [--tag <t>]... [--note "<text>"] [--important]`; `ttc copy <id> [--due YYYY-MM-DD]`; `ttc list [--open|--done|--all|--overdue] [--tag <t>] [--due-from YYYY-MM-DD] [--due-to YYYY-MM-DD] [--search <text>]`; `ttc done <id>`; `ttc reopen <id>`; `ttc important <id>`; `ttc unimportant <id>`; `ttc postpone <id>`; `ttc rename <id> "<title>"`; `ttc delete <id>`; `ttc clean`; `ttc tag <id> +<t> | -<t>`; `ttc note <id> ["<text>" | --clear]`; `ttc export [<file>] [--format json|csv] [--open|--done|--all|--overdue] [--tag <t>] [--due-from YYYY-MM-DD] [--due-to YYYY-MM-DD] [--search <text>]`; `ttc import <file>`; `ttc stats`; exit code 0
- [ ] AC-14. README.md → has a "Copying a task" section documenting `ttc copy <id> [--due YYYY-MM-DD]`: that the new task has the original's title, due date, tags, note and important mark, is open and gets a new id; that `--due` gives it a different due date under the same rule as `ttc add --due`; that it prints `Copied task <id> as task <new-id>`; its refusals (`ttc: no task with id <id>`, `ttc: invalid date: <d>`, `ttc: no task id is left`); and that only the new task is added. It does not present copying and then deleting as a way to change a due date
- [ ] AC-15. `npm test` runs `node:test` tests covering AC-1 to AC-13, and the test oracle and the argument fuzzing cover `ttc copy` and its `--due` cases (C6) → all pass; the pull request delivering this story → the CI `test` check passes

## Sequencing

none — on the frontier. One story; `depends_on: [none]`. It builds on the
commands shipped at head `7f4bddf` (INIT-0001 to INIT-0004).

## Technical constraints

From `technical/assessment.md`, round 1 (C8 and C9 apply because option B is
chosen, `PD-0013` item 15):

- **C1**: `ttc copy` is a changing command and inherits, unchanged: exact arguments (one `<id>` and at most one `--due`; an extra argument is an error and any other option is unknown; checked before the lock, `PD-0003` item 2); the id rules (digits, leading zeros allowed and dropped in messages, the largest id, `ttc: invalid task id: <arg>`, `ttc: no task with id <id>`; `PD-0003` item 2, `PD-0004` item 2); the exclusive lock and its busy failure; read, lookup and write under one hold of the lock, in one atomic write (`project/constraints.md` row 5, `PD-0004` item 3); owner-only permissions (`PD-0004` item 4); a refusal writes nothing — the file stays byte-identical, an older-version file is not upgraded, and a missing `tasks.json` stays missing with no folder created (`PD-0003` item 11, `PD-0004` item 7); a failure after the save exits 1 and keeps the copy (`PD-0008`). Every accepted copy writes: there is no no-op case.
- **C2**: the copy's id is the stored next id, and the next id rises by 1, exactly as for `add`; ids are never reused (`PD-0003` item 1). When the next id is above 9007199254740991 the copy is refused with `ttc: no task id is left` and changes nothing (`PD-0013` item 5).
- **C3**: the success line, the usage line and its position, the id-limit refusal, the check order and the `--due` rules are fixed text (`PD-0013` items 2–6, 11); tests assert them exactly. No other new message is needed: the copied fields were validated on read.
- **C4**: no stored-format change: the copy holds only fields format 4 already has, and the file stays version 4. Older files are read, copied without error, and written as version 4 by a successful copy (`PD-0010` items 1, 3, 4).
- **C5**: the copy is made from the original's stored form: title, due date (or none), tags (as stored, lower case), note (or none) and important mark are taken as stored, the status is open, and nothing else is copied. The original and every other task keep every field and their stored order; a done original stays done (`PD-0004` item 8, `PD-0009` item 4).
- **C6**: the test oracle (`test/support/ttc-model.js`, its `USAGE` and `COMMANDS`) and the argument fuzzing (`fuzz-gen.js`, `fuzz-harness.js`) gain `copy`, written from `PD-0013`, not from the new code, including the id rule copy shares with `add` and the `--due` cases: valid, invalid, past, `9999-12-31`, missing value, given twice, before and after the id, on an original with and without a due date. The three unit tests that list the whole usage (`test/important.test.js`, `test/clean.test.js`, `test/postpone.test.js`) gain the new line.
- **C7**: the perf guard (10,000 tasks, median < 500 ms) must still pass.
- **C8**: `--due` follows the `ttc add --due` rule exactly: `YYYY-MM-DD`, a real calendar date, a past date allowed, `ttc: invalid date: <d>` otherwise (`PD-0003` item 5), nothing later than `9999-12-31` (`PD-0011` item 6); one value, before or after the id, refused when given twice or with no value (`PD-0003` item 2); checked before the lock, as `add` does.
- **C9**: `--due` can only set a date; there is no value meaning "no due date" (an empty value is an invalid date), so a copy of a dated original always has a date. With `--due`, a copy of an original with no due date gets one.

## Observability

none — a local, offline command; its stdout/stderr lines and exit code are the
whole operable signal, and the requester ruled out network
(`project/constraints.md` row 3).

## Rollout

`none`. No format change (C4); upgrading a version 1–3 file on its first
change is existing behaviour (`PD-0010`).

## Notes

- Raw request: `product/sources/2026-10-29-requester-request.md`.
- Copying and then deleting can stand in for a reschedule with a new id. This
  is accepted and not documented as a way to change a due date (`PD-0013`
  item 13, Consequences).
