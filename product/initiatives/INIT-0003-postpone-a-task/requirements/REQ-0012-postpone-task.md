---
id: REQ-0012
type: requirement
title: A task is postponed from the ttc command line in one short command
status: accepted
revision: 3
owner_role: ROLE-product-manager
created: 2026-10-27
updated: 2026-10-27
initiative: INIT-0003
outcome_element: "O1, O2 and O3 (initiative.md): postpone a task with one short command so it is due later and not overdue; the output names the new due date; nothing else changes"
acceptance:
  - "AC-1. Empty `$TTC_HOME`, then `ttc add \"Pay rent\" --due 2099-12-30` and `ttc postpone 1` → stdout is the single line `Postponed task 1 to 2099-12-31`, stderr is empty, exit code 0; `ttc list` then prints exactly `#1 [ ] Pay rent due:2099-12-31`"
  - "AC-2. Let T be today's local date where the commands run and T+1 the next calendar day, both as YYYY-MM-DD. Task 1 `Pay rent` added with `--due 2000-01-01`, then `ttc postpone 1` → stdout is the single line `Postponed task 1 to <T+1>`, exit code 0; `ttc list` then prints exactly `#1 [ ] Pay rent due:<T+1>` and `ttc list --overdue` prints exactly `No tasks.`"
  - "AC-3. With T and T+1 as in AC-2, task 1 `Pay rent` added with `--due <T>`, then `ttc postpone 1` → stdout is the single line `Postponed task 1 to <T+1>`, exit code 0"
  - "AC-4. Tasks 1–4 added with `--due 2096-02-28`, `--due 2099-02-28`, `--due 2099-12-31` and `--due 2100-02-28`, then `ttc postpone 1`, `ttc postpone 2`, `ttc postpone 3` and `ttc postpone 4` → stdout is, in turn, exactly `Postponed task 1 to 2096-02-29`, `Postponed task 2 to 2099-03-01`, `Postponed task 3 to 2100-01-01` and `Postponed task 4 to 2100-03-01`, each exit code 0"
  - "AC-5. Task 1 `Pay rent` added with `--due 2099-12-30`, then `ttc done 1` and `ttc postpone 1` → stdout is the single line `Postponed task 1 to 2099-12-31`, exit code 0; `ttc list --done` then prints exactly `#1 [x] Pay rent due:2099-12-31`"
  - "AC-6. Tasks 1 `Pay rent` (`--due 2099-12-30 --tag home --note \"by card\" --important`) and 2 `Buy milk` (`--due 2099-06-01`), then `ttc export before.json`, `ttc postpone 1` and `ttc export after.json` → the two export files are identical except that task 1's due date is `2099-12-30` in `before.json` and `2099-12-31` in `after.json`"
  - "AC-7. Task 1 `Buy milk` added with no `--due`, then `ttc postpone 1` → stderr is exactly the line `ttc: task 1 has no due date`, stdout is empty, exit code 1, and `tasks.json` is byte-for-byte unchanged"
  - "AC-8. Task 1 `Pay rent` added with `--due 9999-12-31`, then `ttc postpone 1` → stderr is exactly the line `ttc: task 1 cannot be postponed past 9999-12-31`, stdout is empty, exit code 1, and `tasks.json` is byte-for-byte unchanged"
  - "AC-9. `ttc postpone abc` → stderr is exactly the line `ttc: invalid task id: abc`, stdout is empty, exit code 1, `tasks.json` unchanged. With only task 1 stored, `ttc postpone 7` → stderr is exactly `ttc: no task with id 7`, stdout is empty, exit code 1, `tasks.json` unchanged"
  - "AC-10. With task 1 stored, each of `ttc postpone 1 2` and `ttc postpone 1 --days 2` → stderr is one line starting `ttc: `, stdout is empty, exit code 1, and `tasks.json` unchanged"
  - "AC-11. A `tasks.json` in format version 3 (the layout README \"Data file format\" documents at head `3dbf454`), holding open task 1 `Pay rent` due 2099-12-30 and next id 2 → `ttc postpone 1` → stdout is the single line `Postponed task 1 to 2099-12-31`, exit code 0; `tasks.json` now holds `\"version\": 4`, and `ttc list` prints exactly `#1 [ ] Pay rent due:2099-12-31`"
  - "AC-12. `ttc help` → stdout is exactly `Usage:` followed by these lines, each indented two spaces, in this order: `ttc help`; `ttc add \"<title>\" [--due YYYY-MM-DD] [--tag <t>]... [--note \"<text>\"] [--important]`; `ttc list [--open|--done|--all|--overdue] [--tag <t>] [--due-from YYYY-MM-DD] [--due-to YYYY-MM-DD] [--search <text>]`; `ttc done <id>`; `ttc reopen <id>`; `ttc important <id>`; `ttc unimportant <id>`; `ttc postpone <id>`; `ttc rename <id> \"<title>\"`; `ttc delete <id>`; `ttc tag <id> +<t> | -<t>`; `ttc note <id> [\"<text>\" | --clear]`; `ttc export [<file>] [--format json|csv] [--open|--done|--all|--overdue] [--tag <t>] [--due-from YYYY-MM-DD] [--due-to YYYY-MM-DD] [--search <text>]`; `ttc import <file>`; `ttc stats`; exit code 0"
  - "AC-13. README.md → documents `ttc postpone <id>`, that the new due date is one day after the later of the task's due date and today, and its two refusals: a task with no due date, and a task due 9999-12-31"
  - "AC-14. `npm test` runs `node:test` tests covering AC-1 to AC-12 → all pass; the pull request delivering this story → the CI `test` check passes"
capabilities: [CAP-0001]
design_refs: []
decisions: [PD-0003, PD-0004, PD-0008, PD-0010, PD-0011]
depends_on: [none]
constraints: ["C1 (technical/assessment.md, round 1)", "C2 (technical/assessment.md, round 1)", "C3 (technical/assessment.md, round 1)", "C4 (technical/assessment.md, round 1)", "C5 (technical/assessment.md, round 1)", "C7 (technical/assessment.md, round 1)", "C8 (technical/assessment.md, round 1)"]
observability: []
rollout: none
readiness: engineering-ready
tickets: []
supersedes:
superseded_by:
---

# REQ-0012 — A task is postponed from the ttc command line in one short command

## Requirement

A user can postpone a task by id with one short command. Its due date moves
one day later, counting from the later of its due date and today, so the task
is not overdue afterwards, and the command prints the new due date. A task with
no due date is refused and nothing changes.

## Scope

- The new `ttc postpone <id>` command, its argument rules, its confirmation
  line and its errors.
- The new-date rule, the refusal of a task with no due date, and the refusal
  of a task due `9999-12-31`.
- Keeping every other field of the task and every other task unchanged, and
  working on data files written by older ttc.
- The `ttc help` usage lines and the README.
- Repository: `rortegalizardo/task-tracker-cli` (`project/constraints.md` row 9).

## Non-goals

- Choosing how far to postpone, snoozing, setting or clearing a due date at
  will, a first due date for a task that has none, several tasks at once, a
  postpone count, weekends and holidays, reminders, recurring tasks: all out
  of scope in `initiative.md`.

## Behavior

Rules are `PD-0011`; this section states what the user sees.

- **Postpone.** `ttc postpone <id>` sets the task's due date to one calendar
  day after the later of its due date and today ("today" is the local date,
  `PD-0003` item 6), prints `Postponed task <id> to <YYYY-MM-DD>` and exits 0.
  A task due in the future moves one day; a task due today or overdue moves to
  tomorrow. Months, years and leap days roll over by the calendar.
- It works on open and done tasks, takes exactly one `<id>` and no options,
  and has the same id, argument, error, lock and atomic-write behaviour as
  `ttc important` (`PD-0003` items 2 and 11, `PD-0004` items 2–4 and 7,
  `PD-0008`).
- **No due date.** `ttc: task <id> has no due date`, exit 1, nothing written.
- **Latest date.** A task due `9999-12-31`:
  `ttc: task <id> cannot be postponed past 9999-12-31`, exit 1, nothing
  written.
- **Check order.** Arguments, then the id, then: no such task, no due date,
  the date limit.
- **Nothing else changes.** Only the task's due date changes. What follows
  from it follows from the new date: the `!overdue` token, the `--overdue`,
  `--due-from` and `--due-to` views, the `ttc stats` overdue count and the due
  value in `ttc export` (`PD-0011` item 9). The `ttc list` order does not
  change.
- **Data file.** No format change; `tasks.json` stays version 4. A version
  1–3 file is written as version 4 by the postpone, as by every changing
  command (`PD-0010`).
- **Help.** `ttc postpone <id>` comes right after `ttc unimportant <id>`.

## Acceptance criteria

- [ ] AC-1. Empty `$TTC_HOME`, then `ttc add "Pay rent" --due 2099-12-30` and `ttc postpone 1` → stdout is the single line `Postponed task 1 to 2099-12-31`, stderr is empty, exit code 0; `ttc list` then prints exactly `#1 [ ] Pay rent due:2099-12-31`
- [ ] AC-2. Let T be today's local date where the commands run and T+1 the next calendar day, both as YYYY-MM-DD. Task 1 `Pay rent` added with `--due 2000-01-01`, then `ttc postpone 1` → stdout is the single line `Postponed task 1 to <T+1>`, exit code 0; `ttc list` then prints exactly `#1 [ ] Pay rent due:<T+1>` and `ttc list --overdue` prints exactly `No tasks.`
- [ ] AC-3. With T and T+1 as in AC-2, task 1 `Pay rent` added with `--due <T>`, then `ttc postpone 1` → stdout is the single line `Postponed task 1 to <T+1>`, exit code 0
- [ ] AC-4. Tasks 1–4 added with `--due 2096-02-28`, `--due 2099-02-28`, `--due 2099-12-31` and `--due 2100-02-28`, then `ttc postpone 1`, `ttc postpone 2`, `ttc postpone 3` and `ttc postpone 4` → stdout is, in turn, exactly `Postponed task 1 to 2096-02-29`, `Postponed task 2 to 2099-03-01`, `Postponed task 3 to 2100-01-01` and `Postponed task 4 to 2100-03-01`, each exit code 0
- [ ] AC-5. Task 1 `Pay rent` added with `--due 2099-12-30`, then `ttc done 1` and `ttc postpone 1` → stdout is the single line `Postponed task 1 to 2099-12-31`, exit code 0; `ttc list --done` then prints exactly `#1 [x] Pay rent due:2099-12-31`
- [ ] AC-6. Tasks 1 `Pay rent` (`--due 2099-12-30 --tag home --note "by card" --important`) and 2 `Buy milk` (`--due 2099-06-01`), then `ttc export before.json`, `ttc postpone 1` and `ttc export after.json` → the two export files are identical except that task 1's due date is `2099-12-30` in `before.json` and `2099-12-31` in `after.json`
- [ ] AC-7. Task 1 `Buy milk` added with no `--due`, then `ttc postpone 1` → stderr is exactly the line `ttc: task 1 has no due date`, stdout is empty, exit code 1, and `tasks.json` is byte-for-byte unchanged
- [ ] AC-8. Task 1 `Pay rent` added with `--due 9999-12-31`, then `ttc postpone 1` → stderr is exactly the line `ttc: task 1 cannot be postponed past 9999-12-31`, stdout is empty, exit code 1, and `tasks.json` is byte-for-byte unchanged
- [ ] AC-9. `ttc postpone abc` → stderr is exactly the line `ttc: invalid task id: abc`, stdout is empty, exit code 1, `tasks.json` unchanged. With only task 1 stored, `ttc postpone 7` → stderr is exactly `ttc: no task with id 7`, stdout is empty, exit code 1, `tasks.json` unchanged
- [ ] AC-10. With task 1 stored, each of `ttc postpone 1 2` and `ttc postpone 1 --days 2` → stderr is one line starting `ttc: `, stdout is empty, exit code 1, and `tasks.json` unchanged
- [ ] AC-11. A `tasks.json` in format version 3 (the layout README "Data file format" documents at head `3dbf454`), holding open task 1 `Pay rent` due 2099-12-30 and next id 2 → `ttc postpone 1` → stdout is the single line `Postponed task 1 to 2099-12-31`, exit code 0; `tasks.json` now holds `"version": 4`, and `ttc list` prints exactly `#1 [ ] Pay rent due:2099-12-31`
- [ ] AC-12. `ttc help` → stdout is exactly `Usage:` followed by these lines, each indented two spaces, in this order: `ttc help`; `ttc add "<title>" [--due YYYY-MM-DD] [--tag <t>]... [--note "<text>"] [--important]`; `ttc list [--open|--done|--all|--overdue] [--tag <t>] [--due-from YYYY-MM-DD] [--due-to YYYY-MM-DD] [--search <text>]`; `ttc done <id>`; `ttc reopen <id>`; `ttc important <id>`; `ttc unimportant <id>`; `ttc postpone <id>`; `ttc rename <id> "<title>"`; `ttc delete <id>`; `ttc tag <id> +<t> | -<t>`; `ttc note <id> ["<text>" | --clear]`; `ttc export [<file>] [--format json|csv] [--open|--done|--all|--overdue] [--tag <t>] [--due-from YYYY-MM-DD] [--due-to YYYY-MM-DD] [--search <text>]`; `ttc import <file>`; `ttc stats`; exit code 0
- [ ] AC-13. README.md → documents `ttc postpone <id>`, that the new due date is one day after the later of the task's due date and today, and its two refusals: a task with no due date, and a task due 9999-12-31
- [ ] AC-14. `npm test` runs `node:test` tests covering AC-1 to AC-12 → all pass; the pull request delivering this story → the CI `test` check passes

## Sequencing

none — on the frontier. One story; `depends_on: [none]`. It builds on the
commands shipped at head `ae4417c` (INIT-0001, INIT-0002).

## Technical constraints

From `technical/assessment.md`, round 1 (C6 applied to option A only):

- **C1**: no stored-format change; the new date is held in the existing `due` field and `tasks.json` stays version 4; a version 1–3 file is written as version 4 by the postpone, as by every changing command (`PD-0010` items 1, 4).
- **C2**: the latest storable due date is `9999-12-31`; a postpone past it is refused with fixed product text before anything is written, never left to the write guard or the runtime's own error (`PD-0011` item 6).
- **C3**: the new date counts calendar days, not 24-hour periods, so it is the same in every time zone and across daylight-saving changes; it rolls months, years and leap days by the Gregorian rule ttc's date check uses; "today" is the same local date the overdue rule uses.
- **C4**: the command inherits, unchanged, the argument, id, lock, atomic-write, refusal-writes-nothing and failure-after-save rules of the existing changing commands (`PD-0003` items 2 and 11, `PD-0004` items 2–4 and 7, `PD-0008`); there is no no-op case.
- **C5**: the success line, the two refusals and the usage line are fixed text (`PD-0011`); tests assert them exactly.
- **C7**: the test oracle (`test/support/ttc-model.js`, `fuzz-gen.js`) gains the command and its own calendar-day count, written from `PD-0011`, not from the new code; tests run against the real date with `TZ` set, as the overdue tests do.
- **C8**: the perf guard (10,000 tasks, median < 500 ms) must still pass.

## Observability

none — a local, offline command; its stdout/stderr lines and exit code are the
whole operable signal, and the requester ruled out network
(`project/constraints.md` row 3).

## Rollout

`none`. No format change (C1); upgrading a version 1–3 file on its first
change is existing behaviour (`PD-0010`).

## Notes

- Raw request: `product/sources/2026-10-27-requester-request.md`.
- A longer push takes several runs; an amount was left out for "Keep it
  simple" and can be added later without changing `ttc postpone <id>`
  (`PD-0011` Options considered).
