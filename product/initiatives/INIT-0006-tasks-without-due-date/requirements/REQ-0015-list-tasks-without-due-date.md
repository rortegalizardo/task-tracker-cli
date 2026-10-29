---
id: REQ-0015
type: requirement
title: Tasks with no due date are listed on their own in one short command
status: accepted
revision: 3
owner_role: ROLE-product-manager
created: 2026-10-29
updated: 2026-10-29
initiative: INIT-0006
outcome_element: "O1, O2 and O3 (initiative.md): one short command lists only the open tasks with no due date, shown as ttc list shows tasks today, writing nothing; nothing else changes"
acceptance:
  - "AC-1. Empty `$TTC_HOME`, then `ttc add \"Pay rent\" --due 2000-01-02 --tag bills`, `ttc add \"Call mom\" --tag home`, `ttc add \"Plan trip\" --due 2099-05-01`, `ttc add \"Fix bike\" --tag home`, `ttc add \"Water plants\" --important` and `ttc done 4`, then `ttc list --no-due` → stdout is exactly the two lines `#5 [ ] Water plants !important` and `#2 [ ] Call mom +home`, in that order, stderr is empty, exit code 0; `ttc list --open --no-due` prints the same two lines, exit code 0"
  - "AC-2. After the commands of AC-1: `ttc list --done --no-due` → stdout is exactly the line `#4 [x] Fix bike +home`, exit code 0; `ttc list --all --no-due` → stdout is exactly the three lines `#5 [ ] Water plants !important`, `#2 [ ] Call mom +home` and `#4 [x] Fix bike +home`, in that order, exit code 0"
  - "AC-3. After the commands of AC-1: `ttc list --no-due --tag home` → stdout is exactly `#2 [ ] Call mom +home`; `ttc list --tag home --all --no-due` → exactly `#2 [ ] Call mom +home` and `#4 [x] Fix bike +home`, in that order; `ttc list --search plant --no-due` → exactly `#5 [ ] Water plants !important`; `ttc list --no-due --tag bills` → exactly `No tasks.`; each with stderr empty and exit code 0"
  - "AC-4. Each `ttc list` command of AC-1 to AC-3 leaves `tasks.json` byte-for-byte unchanged. Empty `$TTC_HOME`, then `ttc add \"Pay rent\" --due 2099-10-01` and `ttc list --no-due` → stdout is exactly `No tasks.`, exit code 0. `$TTC_HOME` names a folder that does not exist, then `ttc list --no-due` → stdout is exactly `No tasks.`, stderr is empty, exit code 0, and afterwards neither `tasks.json` nor the `$TTC_HOME` folder exists"
  - "AC-5. `tasks.json` in format version 1 holding exactly `{\"nextId\":3,\"tasks\":[{\"id\":1,\"title\":\"Pay rent\",\"status\":\"open\",\"due\":\"2099-10-01\",\"tags\":[\"bills\"]},{\"id\":2,\"title\":\"Call mom\",\"status\":\"open\",\"due\":null,\"tags\":[]}]}`, then `ttc list --no-due` → stdout is exactly `#2 [ ] Call mom`, exit code 0, and `tasks.json` is byte-for-byte unchanged. `tasks.json` in format version 3 holding exactly `{\"version\":3,\"nextId\":4,\"tasks\":[{\"id\":1,\"title\":\"Call mom\",\"status\":\"open\",\"due\":null,\"tags\":[],\"note\":null},{\"id\":2,\"title\":\"Pay rent\",\"status\":\"open\",\"due\":\"2099-10-01\",\"tags\":[\"bills\"],\"note\":\"by card\"},{\"id\":3,\"title\":\"Fix bike\",\"status\":\"done\",\"due\":null,\"tags\":[\"home\"],\"note\":\"chain\"}]}`, then `ttc list --all --no-due` → stdout is exactly `#1 [ ] Call mom` and `#3 [x] Fix bike +home`, in that order, exit code 0, and `tasks.json` is byte-for-byte unchanged"
  - "AC-6. After the commands of AC-1, each of the following → stderr is exactly the line given, stdout is empty, exit code 1, and `tasks.json` is byte-for-byte unchanged: `ttc list --no-due --overdue` → `ttc: options cannot be combined: --overdue --no-due`; `ttc list --overdue --no-due` → `ttc: options cannot be combined: --overdue --no-due`; `ttc list --no-due --due-from 2026-01-01` → `ttc: options cannot be combined: --no-due --due-from`; `ttc list --due-to 2026-01-31 --no-due` → `ttc: options cannot be combined: --no-due --due-to`; `ttc list --no-due --due-from 2026-01-01 --due-to 2026-01-31` → `ttc: options cannot be combined: --no-due --due-from --due-to`; `ttc list --due-to 2026-01-31 --due-from 2026-01-01 --no-due --overdue` → `ttc: options cannot be combined: --overdue --no-due --due-from --due-to`; `ttc export --no-due --overdue` → `ttc: options cannot be combined: --overdue --no-due`; `ttc export --format csv --due-to 2026-01-31 --no-due` → `ttc: options cannot be combined: --no-due --due-to`; `ttc export <dir>/undated.json --no-due --due-from 2026-01-01` → `ttc: options cannot be combined: --no-due --due-from`, and `<dir>/undated.json` does not exist afterwards"
  - "AC-7. After the commands of AC-1, each of the following → stderr is exactly the line given, stdout is empty, exit code 1, and `tasks.json` is byte-for-byte unchanged: `ttc list --no-due --no-due` → `ttc: option given twice: --no-due`; `ttc list --no-due home` → `ttc: unexpected argument: home`; `ttc list --no-due --overdue --bogus` → `ttc: unknown option: --bogus`; `ttc list --overdue --no-due --due-from` → `ttc: option needs a value: --due-from`; `ttc export --format xml --no-due --overdue` → `ttc: invalid format: xml (use json or csv)`; `ttc list --done --overdue --no-due` → `ttc: options cannot be combined: --done --overdue`; `ttc list --no-due --tag \"a b\" --overdue` → `ttc: options cannot be combined: --overdue --no-due`; `ttc list --no-due --due-from 2026-02-30` → `ttc: options cannot be combined: --no-due --due-from`; `ttc list --no-due --due-from 2026-02-01 --due-to 2026-01-01` → `ttc: options cannot be combined: --no-due --due-from --due-to`; `ttc list --no-due --overdue --search \"\"` → `ttc: options cannot be combined: --overdue --no-due`; `ttc list --no-due --tag \"a b\"` → `ttc: invalid tag: a b`; `ttc list --no-due --search \"\"` → `ttc: --search text must not be empty`. Then `tasks.json` holding the text `not json`: `ttc list --no-due --overdue` → stderr is exactly `ttc: options cannot be combined: --overdue --no-due`; `ttc list --no-due` and `ttc export --no-due` → stderr is one line starting `ttc: cannot read `; each with stdout empty, exit code 1, and `tasks.json` byte-for-byte unchanged"
  - "AC-8. After the commands of AC-1: `ttc export --no-due` → exit code 0, and stdout parsed as JSON has `version` 4, `nextId` 6 and exactly the tasks `{\"id\":2,\"title\":\"Call mom\",\"status\":\"open\",\"due\":null,\"tags\":[\"home\"],\"note\":null,\"important\":false}`, `{\"id\":4,\"title\":\"Fix bike\",\"status\":\"done\",\"due\":null,\"tags\":[\"home\"],\"note\":null,\"important\":false}` and `{\"id\":5,\"title\":\"Water plants\",\"status\":\"open\",\"due\":null,\"tags\":[],\"note\":null,\"important\":true}`, in that order; `ttc export --format csv --no-due` → stdout is exactly the four lines `id,title,status,due,tags,note`, `2,Call mom,open,,home,`, `4,Fix bike,done,,home,` and `5,Water plants,open,,,`, exit code 0; `ttc export --open --no-due --format csv` → stdout is exactly `id,title,status,due,tags,note`, `2,Call mom,open,,home,` and `5,Water plants,open,,,`, exit code 0; `ttc export <dir>/undated.json --no-due`, `<dir>` an existing folder given as an absolute path → stdout is exactly `Exported 3 tasks to <dir>/undated.json`, exit code 0, and that file parsed equals the stdout of `ttc export --no-due` parsed; `tasks.json` is byte-for-byte unchanged after each"
  - "AC-9. After the commands of AC-1, today's views and filters are unchanged: `ttc list` → stdout is exactly `#5 [ ] Water plants !important`, `#1 [ ] Pay rent due:2000-01-02 !overdue +bills`, `#2 [ ] Call mom +home` and `#3 [ ] Plan trip due:2099-05-01`, in that order; `ttc list --all` → those four lines then `#4 [x] Fix bike +home`; `ttc list --done` → exactly `#4 [x] Fix bike +home`; `ttc list --overdue` → exactly `#1 [ ] Pay rent due:2000-01-02 !overdue +bills`; `ttc list --due-from 2000-01-01` → exactly `#1 [ ] Pay rent due:2000-01-02 !overdue +bills` and `#3 [ ] Plan trip due:2099-05-01`; `ttc list --tag home` → exactly `#2 [ ] Call mom +home`; `ttc list --search plant` → exactly `#5 [ ] Water plants !important`; `ttc export --format csv` → exactly `id,title,status,due,tags,note`, `1,Pay rent,open,2000-01-02,bills,`, `2,Call mom,open,,home,`, `3,Plan trip,open,2099-05-01,,`, `4,Fix bike,done,,home,` and `5,Water plants,open,,,`; `ttc stats` → exactly `open: 4`, `done: 1` and `overdue: 1`; each exit code 0. `ttc list --done --overdue` → stderr is exactly `ttc: options cannot be combined: --done --overdue`, exit code 1"
  - "AC-10. `ttc help` → stdout is exactly `Usage:` followed by these lines, each indented two spaces, in this order: `ttc help`; `ttc add \"<title>\" [--due YYYY-MM-DD] [--tag <t>]... [--note \"<text>\"] [--important]`; `ttc copy <id> [--due YYYY-MM-DD]`; `ttc list [--open|--done|--all|--overdue] [--no-due] [--tag <t>] [--due-from YYYY-MM-DD] [--due-to YYYY-MM-DD] [--search <text>]`; `ttc done <id>`; `ttc reopen <id>`; `ttc important <id>`; `ttc unimportant <id>`; `ttc postpone <id>`; `ttc rename <id> \"<title>\"`; `ttc delete <id>`; `ttc clean`; `ttc tag <id> +<t> | -<t>`; `ttc note <id> [\"<text>\" | --clear]`; `ttc export [<file>] [--format json|csv] [--open|--done|--all|--overdue] [--no-due] [--tag <t>] [--due-from YYYY-MM-DD] [--due-to YYYY-MM-DD] [--search <text>]`; `ttc import <file>`; `ttc stats`; exit code 0"
  - "AC-11. README.md → \"Listing and filtering tasks\" shows the new `ttc list` usage line and documents `--no-due`: that it shows only the tasks with no due date; that it narrows any status view and combines with `--tag` and `--search` by AND; that `ttc list --no-due` shows the open tasks with no due date; and that it is refused with `--overdue`, `--due-from` or `--due-to`, with one example and its exact message, as the one exception to \"All options combine with AND\". The sentence \"When `--due-from` or `--due-to` is given, tasks with no due date are left out.\" stays. \"Exporting tasks\" shows the new `ttc export` usage line and lists `--no-due` among the options that mean the same as for `ttc list`"
  - "AC-12. `npm test` runs `node:test` tests covering AC-1 to AC-10; the test oracle (`test/support/ttc-model.js`) and the argument fuzzing (`fuzz-gen.js`, `fuzz-harness.js`) cover `--no-due` on `ttc list` and `ttc export`, with every status view, `--tag` and `--search`, and its refusal and place in the check order, written from `PD-0014`, not from the new code (C6); the tests that assert the `ttc list` or `ttc export` usage line carry the new text; and the perf guard (10,000 tasks, median under 500 ms) runs → all pass; the pull request delivering this story → the CI `test` check passes"
capabilities: [CAP-0001]
design_refs: []
decisions: [PD-0003, PD-0004, PD-0009, PD-0010, PD-0014]
depends_on: [none]
constraints: ["C1 (technical/assessment.md, round 1)", "C2 (technical/assessment.md, round 1)", "C3 (technical/assessment.md, round 1)", "C4 (technical/assessment.md, round 1)", "C5 (technical/assessment.md, round 1)", "C6 (technical/assessment.md, round 1)", "C7 (technical/assessment.md, round 1)", "C9 (technical/assessment.md, round 1)", "C10 (technical/assessment.md, round 1)"]
observability: []
rollout: none
readiness: engineering-ready
tickets: []
supersedes:
superseded_by:
---

# REQ-0015 — Tasks with no due date are listed on their own in one short command

## Requirement

A user can list only their tasks that have no due date with one short
command. With nothing else typed it shows the open tasks with no due date,
each on the line `ttc list` prints for it today and in the same order, or
`No tasks.` when there are none. It writes nothing. Every command typed as it
can be typed today behaves as before, apart from two `ttc help` usage lines.

## Scope

- `ttc list --no-due`, its rules with the other `ttc list` options, and the
  refusal of the combinations that can never match (`PD-0014`).
- `ttc export --no-due`, with the same meaning (`PD-0014` item 6).
- Working on data files written by older ttc without rewriting them.
- The `ttc help` usage lines and the README.
- Repository: `rortegalizardo/task-tracker-cli` (`project/constraints.md` row 9).

## Non-goals

- Giving, changing or clearing a due date, counting tasks with no due date in
  `ttc stats`, changing how the views `ttc list` has today show or order
  tasks, sorting by due date, reminders, any other output change: all out of
  scope in `initiative.md`.

## Behavior

The rules are `PD-0014`; this section states what the user sees.

- **No due date.** A task has no due date when its stored due date is empty:
  exactly the tasks whose `ttc list` line has no `due:` token (`PD-0014`
  item 1).
- **The option.** `ttc list --no-due` shows the open tasks with no due date.
  `--no-due` takes no value and may be given once. It narrows the status view
  the way `--tag` does: `--open --no-due` is the same as `--no-due`,
  `--done --no-due` shows the done tasks with no due date, and
  `--all --no-due` shows every task with no due date. It combines with `--tag`
  and `--search` by AND (`PD-0014` item 2).
- **What is shown.** Each task on the line `ttc list` prints for it today,
  important tasks first, then the others, each group in ascending id order;
  `No tasks.` when none match (`PD-0014` item 4).
- **Refusal.** `--no-due` with `--overdue`, `--due-from` or `--due-to` can
  never match and is refused before the list is read:
  `ttc: options cannot be combined: <opts>`, exit 1, nothing on stdout,
  nothing written. `<opts>` names `--no-due` and each of `--overdue`,
  `--due-from` and `--due-to` that was given, in the order `--overdue`,
  `--no-due`, `--due-from`, `--due-to`, separated by single spaces, whatever
  order they were typed in (`PD-0014` item 3).
- **Check order.** Argument errors first, as today (unknown option, missing
  value, an option given twice, an unexpected argument), then for
  `ttc export` the `--format` check, then: two status views given; the
  `--no-due` refusal; the tag; the `--due-from` date; the `--due-to` date;
  `--due-from` later than `--due-to`; an empty `--search`. All before the list
  is read. The first failing check is reported (`PD-0014` item 3).
- **Nothing is written.** `ttc list --no-due` never writes `tasks.json` and
  never creates it or its folder; with no `tasks.json` it prints `No tasks.`
  and exits 0. A file written by older ttc (format versions 1–3) is read and
  left exactly as it is. A file that cannot be read fails as today, after the
  argument checks (`PD-0014` item 5).
- **Export.** `ttc export` takes `--no-due` with the same meaning, the same
  refusals and the same check order. Its default view stays `--all`, so
  `ttc export --no-due` exports every task with no due date, open and done.
  Every other export rule is unchanged: JSON or CSV, standard output or a
  file, a JSON export keeps the list's next id and the tasks' stored order,
  and `tasks.json` is never written (`PD-0014` item 6).
- **Help.** The `ttc list` and `ttc export` usage lines gain `[--no-due]`
  right after the status views, in place; no other line and no line order
  changes (`PD-0014` item 7).
- **README.** "Listing and filtering tasks" and "Exporting tasks" document
  the option (`PD-0014` item 8).
- **Everything else is unchanged.** Every command typed as it can be typed
  today gives the same output and exit code as before, except the two
  `ttc help` lines. `ttc stats` is unchanged. No stored-format change:
  `tasks.json` stays version 4 (`PD-0014` item 9).

## Acceptance criteria

- [ ] AC-1. Empty `$TTC_HOME`, then `ttc add "Pay rent" --due 2000-01-02 --tag bills`, `ttc add "Call mom" --tag home`, `ttc add "Plan trip" --due 2099-05-01`, `ttc add "Fix bike" --tag home`, `ttc add "Water plants" --important` and `ttc done 4`, then `ttc list --no-due` → stdout is exactly the two lines `#5 [ ] Water plants !important` and `#2 [ ] Call mom +home`, in that order, stderr is empty, exit code 0; `ttc list --open --no-due` prints the same two lines, exit code 0
- [ ] AC-2. After the commands of AC-1: `ttc list --done --no-due` → stdout is exactly the line `#4 [x] Fix bike +home`, exit code 0; `ttc list --all --no-due` → stdout is exactly the three lines `#5 [ ] Water plants !important`, `#2 [ ] Call mom +home` and `#4 [x] Fix bike +home`, in that order, exit code 0
- [ ] AC-3. After the commands of AC-1: `ttc list --no-due --tag home` → stdout is exactly `#2 [ ] Call mom +home`; `ttc list --tag home --all --no-due` → exactly `#2 [ ] Call mom +home` and `#4 [x] Fix bike +home`, in that order; `ttc list --search plant --no-due` → exactly `#5 [ ] Water plants !important`; `ttc list --no-due --tag bills` → exactly `No tasks.`; each with stderr empty and exit code 0
- [ ] AC-4. Each `ttc list` command of AC-1 to AC-3 leaves `tasks.json` byte-for-byte unchanged. Empty `$TTC_HOME`, then `ttc add "Pay rent" --due 2099-10-01` and `ttc list --no-due` → stdout is exactly `No tasks.`, exit code 0. `$TTC_HOME` names a folder that does not exist, then `ttc list --no-due` → stdout is exactly `No tasks.`, stderr is empty, exit code 0, and afterwards neither `tasks.json` nor the `$TTC_HOME` folder exists
- [ ] AC-5. `tasks.json` in format version 1 holding exactly `{"nextId":3,"tasks":[{"id":1,"title":"Pay rent","status":"open","due":"2099-10-01","tags":["bills"]},{"id":2,"title":"Call mom","status":"open","due":null,"tags":[]}]}`, then `ttc list --no-due` → stdout is exactly `#2 [ ] Call mom`, exit code 0, and `tasks.json` is byte-for-byte unchanged. `tasks.json` in format version 3 holding exactly `{"version":3,"nextId":4,"tasks":[{"id":1,"title":"Call mom","status":"open","due":null,"tags":[],"note":null},{"id":2,"title":"Pay rent","status":"open","due":"2099-10-01","tags":["bills"],"note":"by card"},{"id":3,"title":"Fix bike","status":"done","due":null,"tags":["home"],"note":"chain"}]}`, then `ttc list --all --no-due` → stdout is exactly `#1 [ ] Call mom` and `#3 [x] Fix bike +home`, in that order, exit code 0, and `tasks.json` is byte-for-byte unchanged
- [ ] AC-6. After the commands of AC-1, each of the following → stderr is exactly the line given, stdout is empty, exit code 1, and `tasks.json` is byte-for-byte unchanged: `ttc list --no-due --overdue` → `ttc: options cannot be combined: --overdue --no-due`; `ttc list --overdue --no-due` → `ttc: options cannot be combined: --overdue --no-due`; `ttc list --no-due --due-from 2026-01-01` → `ttc: options cannot be combined: --no-due --due-from`; `ttc list --due-to 2026-01-31 --no-due` → `ttc: options cannot be combined: --no-due --due-to`; `ttc list --no-due --due-from 2026-01-01 --due-to 2026-01-31` → `ttc: options cannot be combined: --no-due --due-from --due-to`; `ttc list --due-to 2026-01-31 --due-from 2026-01-01 --no-due --overdue` → `ttc: options cannot be combined: --overdue --no-due --due-from --due-to`; `ttc export --no-due --overdue` → `ttc: options cannot be combined: --overdue --no-due`; `ttc export --format csv --due-to 2026-01-31 --no-due` → `ttc: options cannot be combined: --no-due --due-to`; `ttc export <dir>/undated.json --no-due --due-from 2026-01-01` → `ttc: options cannot be combined: --no-due --due-from`, and `<dir>/undated.json` does not exist afterwards
- [ ] AC-7. After the commands of AC-1, each of the following → stderr is exactly the line given, stdout is empty, exit code 1, and `tasks.json` is byte-for-byte unchanged: `ttc list --no-due --no-due` → `ttc: option given twice: --no-due`; `ttc list --no-due home` → `ttc: unexpected argument: home`; `ttc list --no-due --overdue --bogus` → `ttc: unknown option: --bogus`; `ttc list --overdue --no-due --due-from` → `ttc: option needs a value: --due-from`; `ttc export --format xml --no-due --overdue` → `ttc: invalid format: xml (use json or csv)`; `ttc list --done --overdue --no-due` → `ttc: options cannot be combined: --done --overdue`; `ttc list --no-due --tag "a b" --overdue` → `ttc: options cannot be combined: --overdue --no-due`; `ttc list --no-due --due-from 2026-02-30` → `ttc: options cannot be combined: --no-due --due-from`; `ttc list --no-due --due-from 2026-02-01 --due-to 2026-01-01` → `ttc: options cannot be combined: --no-due --due-from --due-to`; `ttc list --no-due --overdue --search ""` → `ttc: options cannot be combined: --overdue --no-due`; `ttc list --no-due --tag "a b"` → `ttc: invalid tag: a b`; `ttc list --no-due --search ""` → `ttc: --search text must not be empty`. Then `tasks.json` holding the text `not json`: `ttc list --no-due --overdue` → stderr is exactly `ttc: options cannot be combined: --overdue --no-due`; `ttc list --no-due` and `ttc export --no-due` → stderr is one line starting `ttc: cannot read `; each with stdout empty, exit code 1, and `tasks.json` byte-for-byte unchanged
- [ ] AC-8. After the commands of AC-1: `ttc export --no-due` → exit code 0, and stdout parsed as JSON has `version` 4, `nextId` 6 and exactly the tasks `{"id":2,"title":"Call mom","status":"open","due":null,"tags":["home"],"note":null,"important":false}`, `{"id":4,"title":"Fix bike","status":"done","due":null,"tags":["home"],"note":null,"important":false}` and `{"id":5,"title":"Water plants","status":"open","due":null,"tags":[],"note":null,"important":true}`, in that order; `ttc export --format csv --no-due` → stdout is exactly the four lines `id,title,status,due,tags,note`, `2,Call mom,open,,home,`, `4,Fix bike,done,,home,` and `5,Water plants,open,,,`, exit code 0; `ttc export --open --no-due --format csv` → stdout is exactly `id,title,status,due,tags,note`, `2,Call mom,open,,home,` and `5,Water plants,open,,,`, exit code 0; `ttc export <dir>/undated.json --no-due`, `<dir>` an existing folder given as an absolute path → stdout is exactly `Exported 3 tasks to <dir>/undated.json`, exit code 0, and that file parsed equals the stdout of `ttc export --no-due` parsed; `tasks.json` is byte-for-byte unchanged after each
- [ ] AC-9. After the commands of AC-1, today's views and filters are unchanged: `ttc list` → stdout is exactly `#5 [ ] Water plants !important`, `#1 [ ] Pay rent due:2000-01-02 !overdue +bills`, `#2 [ ] Call mom +home` and `#3 [ ] Plan trip due:2099-05-01`, in that order; `ttc list --all` → those four lines then `#4 [x] Fix bike +home`; `ttc list --done` → exactly `#4 [x] Fix bike +home`; `ttc list --overdue` → exactly `#1 [ ] Pay rent due:2000-01-02 !overdue +bills`; `ttc list --due-from 2000-01-01` → exactly `#1 [ ] Pay rent due:2000-01-02 !overdue +bills` and `#3 [ ] Plan trip due:2099-05-01`; `ttc list --tag home` → exactly `#2 [ ] Call mom +home`; `ttc list --search plant` → exactly `#5 [ ] Water plants !important`; `ttc export --format csv` → exactly `id,title,status,due,tags,note`, `1,Pay rent,open,2000-01-02,bills,`, `2,Call mom,open,,home,`, `3,Plan trip,open,2099-05-01,,`, `4,Fix bike,done,,home,` and `5,Water plants,open,,,`; `ttc stats` → exactly `open: 4`, `done: 1` and `overdue: 1`; each exit code 0. `ttc list --done --overdue` → stderr is exactly `ttc: options cannot be combined: --done --overdue`, exit code 1
- [ ] AC-10. `ttc help` → stdout is exactly `Usage:` followed by these lines, each indented two spaces, in this order: `ttc help`; `ttc add "<title>" [--due YYYY-MM-DD] [--tag <t>]... [--note "<text>"] [--important]`; `ttc copy <id> [--due YYYY-MM-DD]`; `ttc list [--open|--done|--all|--overdue] [--no-due] [--tag <t>] [--due-from YYYY-MM-DD] [--due-to YYYY-MM-DD] [--search <text>]`; `ttc done <id>`; `ttc reopen <id>`; `ttc important <id>`; `ttc unimportant <id>`; `ttc postpone <id>`; `ttc rename <id> "<title>"`; `ttc delete <id>`; `ttc clean`; `ttc tag <id> +<t> | -<t>`; `ttc note <id> ["<text>" | --clear]`; `ttc export [<file>] [--format json|csv] [--open|--done|--all|--overdue] [--no-due] [--tag <t>] [--due-from YYYY-MM-DD] [--due-to YYYY-MM-DD] [--search <text>]`; `ttc import <file>`; `ttc stats`; exit code 0
- [ ] AC-11. README.md → "Listing and filtering tasks" shows the new `ttc list` usage line and documents `--no-due`: that it shows only the tasks with no due date; that it narrows any status view and combines with `--tag` and `--search` by AND; that `ttc list --no-due` shows the open tasks with no due date; and that it is refused with `--overdue`, `--due-from` or `--due-to`, with one example and its exact message, as the one exception to "All options combine with AND". The sentence "When `--due-from` or `--due-to` is given, tasks with no due date are left out." stays. "Exporting tasks" shows the new `ttc export` usage line and lists `--no-due` among the options that mean the same as for `ttc list`
- [ ] AC-12. `npm test` runs `node:test` tests covering AC-1 to AC-10; the test oracle (`test/support/ttc-model.js`) and the argument fuzzing (`fuzz-gen.js`, `fuzz-harness.js`) cover `--no-due` on `ttc list` and `ttc export`, with every status view, `--tag` and `--search`, and its refusal and place in the check order, written from `PD-0014`, not from the new code (C6); the tests that assert the `ttc list` or `ttc export` usage line carry the new text; and the perf guard (10,000 tasks, median under 500 ms) runs → all pass; the pull request delivering this story → the CI `test` check passes

## Sequencing

none — on the frontier. One story; `depends_on: [none]`. It builds on the
commands at head `5be0561` (INIT-0001 to INIT-0005, including `ttc copy`).

## Technical constraints

From `technical/assessment.md`, round 1 (C8 does not apply: it is option A
only, `PD-0014` item 12):

- **C1**: `ttc list` stays a read-only command: every argument check before the read; it never writes and never creates `tasks.json` or its folder; a missing file is an empty list (`No tasks.`); an unreadable file is `ttc: cannot read <path>: <reason>`, exit 1; a version 1–3 file is read and left exactly as it is (`PD-0010` item 1). Errors are one `ttc: ` line, exit 1, nothing on stdout (`PD-0003` item 11). `ttc export` keeps its rules: `tasks.json` never written, a named file written atomically as format 4 (`PD-0010` item 4).
- **C2**: "No due date" means the stored due value is empty: exactly the tasks `ttc list` prints with no `due:` token. Every task in format versions 1–4 holds a due value, empty or a valid date, so the selection is total and needs no new rule. No stored-format change: no new field, the version stays 4.
- **C3**: the selection feeds today's line and order unchanged (`PD-0003` item 8; `PD-0009` items 4, 5); `No tasks.` when none match. `PD-0014` item 4 adds `--no-due` to the filters `PD-0009` item 4's order rule covers.
- **C4**: usage text is fixed and tests assert it exactly (`PD-0003` item 12). The `ttc list` line is asserted in 9 unit test files, the oracle and the README; the `ttc export` line in 5 unit test files, the oracle and the README. All carry the new text. The refusal's exact text and its place in the check order are fixed by `PD-0014` item 3.
- **C5**: `list` and `export` keep one shared option set with one meaning (README "Exporting tasks"); `--no-due` joins it, so export takes it with no further rule (`PD-0014` item 6).
- **C6**: the CI `test` check gates on a test-owned oracle that restates the shared filter (option set, views, checks in order, predicate) and the usage, and on fuzz generators that draw filter options and status-view mutations. Both gain `--no-due` written from `PD-0014`, not from the new code: a filter drawn with every view, and the refusal with its place in the check order. `--no-due` is not in the fuzz unknown-option list and no test asserts it is unknown, so no existing case changes meaning.
- **C7**: the perf guard (10,000 tasks, median < 500 ms) must still pass; it needs no new case.
- **C9**: `--no-due` combines with every view. `ttc list --no-due` shows open tasks because list defaults to `--open`; `ttc export --no-due` exports open and done tasks because export defaults to `--all`, the same split `--tag` has today. With `--overdue`, `--due-from` or `--due-to` it can never match, and is refused (`PD-0014` item 3).
- **C10**: the check order is test-asserted wherever a message is: argument errors in argument order (`src/args.js`), then for export `--format`, then the filter checks in this order: two status views, the `--no-due` refusal, tag, `--due-from` date, `--due-to` date, `--due-from` later than `--due-to`, empty `--search`; all before the read.

## Observability

none — a local, offline command; its stdout/stderr lines and exit code are the
whole operable signal, and the requester ruled out network
(`project/constraints.md` row 3).

## Rollout

`none`. No format change (C2); nothing is written.

## Notes

- Raw request: `product/sources/2026-10-29-requester-request.md`.
- `ttc export --no-due` exports open and done tasks while `ttc list --no-due`
  lists open ones: the same split `--tag` has today (`PD-0014` item 6,
  Consequences).
- `ttc export <file>` prints `Exported <n> tasks to <file>` for every `<n>`,
  including 1; that is today's text and is unchanged.
