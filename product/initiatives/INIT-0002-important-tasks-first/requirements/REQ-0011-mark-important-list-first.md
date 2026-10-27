---
id: REQ-0011
type: requirement
title: Important tasks are marked from the ttc command line and listed first
status: draft
revision: 2
owner_role: ROLE-product-manager
created: 2026-10-26
updated: 2026-10-26
initiative: INIT-0002
outcome_element: "O1, O2 and O3 (initiative.md): mark and unmark a task as important; ttc list shows important tasks first and shows the mark; nothing else changes"
acceptance:
  - "AC-1. Empty `$TTC_HOME`, then `ttc add \"Pay rent\" --important` → stdout is the single line `Added task 1`, stderr is empty, exit code 0; `ttc list` then prints exactly `#1 [ ] Pay rent !important`"
  - "AC-2. Tasks 1 `Buy milk`, 2 `Pay rent` and 3 `Read`, all open and made with `ttc add`, then `ttc important 3` → stdout is the single line `Marked task 3 as important`, stderr is empty, exit code 0; `ttc list` then prints exactly these lines, in this order: `#3 [ ] Read !important`, `#1 [ ] Buy milk`, `#2 [ ] Pay rent`"
  - "AC-3. After AC-2, `ttc important 3` again → stdout is the single line `Task 3 is already important`, stderr is empty, exit code 0, and `tasks.json` is byte-for-byte unchanged"
  - "AC-4. After AC-3, `ttc unimportant 3` → stdout is the single line `Removed important mark from task 3`, stderr is empty, exit code 0; `ttc list` then prints exactly `#1 [ ] Buy milk`, `#2 [ ] Pay rent`, `#3 [ ] Read`; then `ttc unimportant 3` again → stdout is the single line `Task 3 is not important`, exit code 0, and `tasks.json` is byte-for-byte unchanged"
  - "AC-5. Status views. Made with `ttc add` and `ttc done`: 1 `Alpha` (`--due 2000-01-01 --tag home`), 2 `Bravo` (`--due 2000-01-02 --tag home --important`), 3 `Charlie` (`--due 2099-12-31`), 4 `Delta` (`--tag home --important`), 5 `Echo` (`--important`, then `ttc done 5`), 6 `Foxtrot` (then `ttc done 6`). Then: `ttc list` and `ttc list --open` each print exactly `#2 [ ] Bravo due:2000-01-02 !overdue !important +home`, `#4 [ ] Delta !important +home`, `#1 [ ] Alpha due:2000-01-01 !overdue +home`, `#3 [ ] Charlie due:2099-12-31`; `ttc list --done` prints exactly `#5 [x] Echo !important`, `#6 [x] Foxtrot`; `ttc list --all` prints exactly `#2 [ ] Bravo due:2000-01-02 !overdue !important +home`, `#4 [ ] Delta !important +home`, `#5 [x] Echo !important`, `#1 [ ] Alpha due:2000-01-01 !overdue +home`, `#3 [ ] Charlie due:2099-12-31`, `#6 [x] Foxtrot`; `ttc list --overdue` prints exactly `#2 [ ] Bravo due:2000-01-02 !overdue !important +home`, `#1 [ ] Alpha due:2000-01-01 !overdue +home`; each exits 0 with empty stderr"
  - "AC-6. Filters, on the AC-5 tasks: `ttc list --all --tag home` prints exactly the lines of tasks 2, 4, 1 (as in AC-5), in that order; `ttc list --all --due-from 2000-01-01 --due-to 2000-12-31` prints exactly the lines of tasks 2, 1, in that order; `ttc list --all --search o` prints exactly the lines of tasks 2, 5, 6, in that order; `ttc list --done --search delta` prints exactly `No tasks.`; each exits 0 with empty stderr"
  - "AC-7. The six AC-5 tasks made the same way but with no `--important` → `ttc list --all` prints exactly `#1 [ ] Alpha due:2000-01-01 !overdue +home`, `#2 [ ] Bravo due:2000-01-02 !overdue +home`, `#3 [ ] Charlie due:2099-12-31`, `#4 [ ] Delta +home`, `#5 [x] Echo`, `#6 [x] Foxtrot`, the same bytes ttc at head `3dbf454` prints for the same commands"
  - "AC-8. Tasks 1 `Buy milk` (`--important`), 2 `Pay rent` (`--important`) and 3 `Read`, then in turn `ttc done 1`, `ttc reopen 1`, `ttc rename 1 \"Buy oat milk\"`, `ttc tag 1 +shop`, `ttc note 1 \"two litres\"`, `ttc tag 3 +fun` → each prints its usual success line and exits 0; `ttc list --all` after `ttc done 1` prints `#1 [x] Buy milk !important` first; after the last command `ttc list --all` prints exactly `#1 [ ] Buy oat milk !important +shop`, `#2 [ ] Pay rent !important`, `#3 [ ] Read +fun`; then `ttc delete 2` → `ttc list --all` prints exactly `#1 [ ] Buy oat milk !important +shop`, `#3 [ ] Read +fun`"
  - "AC-9. Tasks 1 `Buy milk` (`--important`), 2 `Pay rent`, 3 `Read` (`--important`, then `ttc done 3`), then `ttc export backup.json` → stdout `Exported 3 tasks to backup.json`; `ttc unimportant 1`; `ttc import backup.json` → stdout `Imported 3 tasks from backup.json`, exit 0; `ttc list --all` then prints exactly `#1 [ ] Buy milk !important`, `#3 [x] Read !important`, `#2 [ ] Pay rent`. Then `ttc export done.json --done` and `ttc import done.json` → `ttc list --all` prints exactly `#3 [x] Read !important`"
  - "AC-10. Tasks 1 `Buy milk` (`--important`) and 2 `Pay rent` → `ttc export --format csv` prints exactly the bytes `id,title,status,due,tags,note\\r\\n1,Buy milk,open,,,\\r\\n2,Pay rent,open,,,\\r\\n`; `ttc stats` prints exactly `open: 2`, `done: 0`, `overdue: 0`; `ttc note 1` prints exactly `Task 1 has no note`; each exits 0"
  - "AC-11. A `tasks.json` in format version 3 (the layout README \"Data file format\" documents at head `3dbf454`), holding task 1 `Buy milk` (open), task 2 `Pay rent` (done) and next id 3 → `ttc list --all` prints exactly `#1 [ ] Buy milk`, `#2 [x] Pay rent`, exit 0, and `tasks.json` is byte-for-byte unchanged; then `ttc important 1` → `Marked task 1 as important`, and `tasks.json` now holds `\"version\": 4`. The same two tasks in a version 2 file (the version 3 layout with `\"version\": 2` and no `note` field) and in a version 1 file (the version 2 layout with no `\"version\"` field) give the same `ttc list --all` output. Each of the version 1, 2 and 3 files given to `ttc import` → `Imported 2 tasks from <file>`, exit 0, and `ttc list --all` prints exactly `#1 [ ] Buy milk`, `#2 [x] Pay rent`"
  - "AC-12. A `tasks.json` made by ttc, then edited so `\"version\"` is 5 → `ttc list` prints on stderr exactly one line starting `ttc: cannot read <path>: ` (`<path>` is the path of `tasks.json`), stdout is empty, exit code 1, and `tasks.json` is unchanged; the same file given to `ttc import` → stderr is exactly one line starting `ttc: invalid import file <file>: `, exit code 1, and the current `tasks.json` is unchanged"
  - "AC-13. A version 4 file made with `ttc export`, then edited so that one task's important mark (the field README \"Data file format\" names) holds the string `\"yes\"`, and a second copy with that field removed from one task: as `tasks.json`, `ttc list` → stderr is exactly one line starting `ttc: cannot read <path>: `, stdout is empty, exit code 1, the file unchanged; given to `ttc import`, each → stderr is exactly one line starting `ttc: invalid import file <file>: `, exit code 1, and the current `tasks.json` unchanged"
  - "AC-14. `ttc important <arg>` and `ttc unimportant <arg>` for each `<arg>` in `abc`, `0`, `-1`, `1.5` and `9007199254740992` → stderr is exactly the line `ttc: invalid task id: <arg>`, stdout is empty, exit code 1, `tasks.json` unchanged. With only task 1 stored, `ttc important 7` and `ttc unimportant 7` → stderr is exactly `ttc: no task with id 7`, exit 1, `tasks.json` unchanged; with no `tasks.json`, the same commands give the same line and create no `tasks.json`. With task 7 stored, `ttc important 007` → stdout `Marked task 7 as important`"
  - "AC-15. Each of `ttc important`, `ttc unimportant`, `ttc important 1 2`, `ttc unimportant 1 2`, `ttc important 1 --force`, `ttc add \"Buy milk\" --important --important` and `ttc add \"Buy milk\" --important yes` → stderr is one line starting `ttc: `, stdout is empty, exit code 1, and `tasks.json` unchanged (not created when it did not exist). A `tasks.json` holding the text `{`, then `ttc important 1` and `ttc unimportant 1` → each prints on stderr exactly one line `ttc: cannot read <path>: <reason>` (`<reason>` not empty), exit code 1, and `tasks.json` still holds `{`"
  - "AC-16. `ttc help` → stdout is exactly `Usage:` followed by these lines, each indented two spaces, in this order: `ttc help`; `ttc add \"<title>\" [--due YYYY-MM-DD] [--tag <t>]... [--note \"<text>\"] [--important]`; `ttc list [--open|--done|--all|--overdue] [--tag <t>] [--due-from YYYY-MM-DD] [--due-to YYYY-MM-DD] [--search <text>]`; `ttc done <id>`; `ttc reopen <id>`; `ttc important <id>`; `ttc unimportant <id>`; `ttc rename <id> \"<title>\"`; `ttc delete <id>`; `ttc tag <id> +<t> | -<t>`; `ttc note <id> [\"<text>\" | --clear]`; `ttc export [<file>] [--format json|csv] [--open|--done|--all|--overdue] [--tag <t>] [--due-from YYYY-MM-DD] [--due-to YYYY-MM-DD] [--search <text>]`; `ttc import <file>`; `ttc stats`; exit code 0"
  - "AC-17. README.md → documents `ttc add --important`, `ttc important <id>`, `ttc unimportant <id>` with their four messages, the `ttc list` order and the `!important` token, and in \"Data file format\" format version 4 with the mark's field and values, that versions 1–3 are read with no task important, and that after the first change an older ttc can no longer read the file or new JSON exports"
  - "AC-18. `npm test` runs `node:test` tests covering AC-1 to AC-16 → all pass; the pull request delivering this story → the CI `test` check passes"
capabilities: [CAP-0001]
design_refs: []
decisions: [PD-0003, PD-0004, PD-0008, PD-0009, PD-0010]
depends_on: [none]
constraints: ["C1 (technical/assessment.md, round 1)", "C2 (technical/assessment.md, round 1)", "C3 (technical/assessment.md, round 1)", "C4 (technical/assessment.md, round 1)", "C5 (technical/assessment.md, round 1)", "C6 (technical/assessment.md, round 1)", "C7 (technical/assessment.md, round 1)"]
observability: []
rollout: migration
readiness: not-assessed
tickets: []
supersedes:
superseded_by:
---

# REQ-0011 — Important tasks are marked from the ttc command line and listed first

## Requirement

A user can mark a task as important and remove the mark, and `ttc list` shows
every important task before every other task and shows which tasks are
important, while everything else about ttc stays as it is.

## Scope

- `ttc add --important`, and the new commands `ttc important <id>` and
  `ttc unimportant <id>`, with their messages and errors.
- The order and the line format of `ttc list`, in every status view and with
  every filter.
- Storing the mark in `tasks.json` (format version 4), keeping it through every
  other command, and carrying it through JSON `ttc export` and `ttc import`.
- Reading data files and import files of format versions 1–3, with no task
  important.
- The `ttc help` usage lines and the README.

## Non-goals

- Importance levels, a list filter by importance, a count in `ttc stats`, a CSV
  column, any other sort order: out of scope in `initiative.md`, to keep it
  simple as the request asks.
- Showing the mark in `ttc note` output: the request is about listing.
- A way for an older ttc to read a version 4 file: `PD-0010` accepts the
  one-way upgrade.

## Behavior

Rules are `PD-0009` and `PD-0010`; this section states what the user sees.

- **Default.** A new task is not important. `ttc add ... --important` adds it
  important; the success line stays `Added task <id>`.
- **Mark.** `ttc important <id>` prints `Marked task <id> as important`. On a
  task already important it prints `Task <id> is already important`, exits 0
  and writes nothing.
- **Unmark.** `ttc unimportant <id>` prints
  `Removed important mark from task <id>`. On a task that is not important it
  prints `Task <id> is not important`, exits 0 and writes nothing.
- Both commands work on open and done tasks, take exactly one `<id>`, and have
  the same id, argument, error, lock and atomic-write behaviour as `ttc done`
  (`PD-0003` items 2 and 11, `PD-0004` items 2–4 and 7, `PD-0008`).
- **Order.** In every status view and with every filter, `ttc list` prints
  the matching important tasks first, ascending id, then the other matching
  tasks, ascending id. When no shown task is important, the output is exactly
  today's. `No tasks.` is unchanged.
- **Line.** `#<id> [ ]|[x] <title> [due:YYYY-MM-DD] [!overdue] [!important] [+<tag>]...`.
  A task that is not important prints the same line as today.
- **The mark stays** through `done`, `reopen`, `rename`, `tag` and `note`.
  `delete` removes the task; `import` replaces the list with the file's,
  marks included.
- **Export and import.** JSON exports (whole, filtered or to stdout) hold the
  mark; import restores it. CSV columns, export order, `ttc stats` and
  `ttc note` output do not change.
- **Data file.** Format version 4. Versions 1–3 are read with no task
  important and left as they are until the next change, which writes
  version 4. A newer version, or a version 4 file whose mark is missing or not
  one of the two values ttc writes, is `ttc: cannot read <path>: <reason>` (as
  `tasks.json`) or `ttc: invalid import file <file>: <problem>` (as an import
  file). After the first change, an older ttc cannot read the file.
- **Help.** `[--important]` ends the `ttc add` usage line; `ttc important <id>`
  and `ttc unimportant <id>` come right after `ttc reopen <id>`.

## Acceptance criteria

- [ ] AC-1. Empty `$TTC_HOME`, then `ttc add "Pay rent" --important` → stdout is the single line `Added task 1`, stderr is empty, exit code 0; `ttc list` then prints exactly `#1 [ ] Pay rent !important`
- [ ] AC-2. Tasks 1 `Buy milk`, 2 `Pay rent` and 3 `Read`, all open and made with `ttc add`, then `ttc important 3` → stdout is the single line `Marked task 3 as important`, stderr is empty, exit code 0; `ttc list` then prints exactly these lines, in this order: `#3 [ ] Read !important`, `#1 [ ] Buy milk`, `#2 [ ] Pay rent`
- [ ] AC-3. After AC-2, `ttc important 3` again → stdout is the single line `Task 3 is already important`, stderr is empty, exit code 0, and `tasks.json` is byte-for-byte unchanged
- [ ] AC-4. After AC-3, `ttc unimportant 3` → stdout is the single line `Removed important mark from task 3`, stderr is empty, exit code 0; `ttc list` then prints exactly `#1 [ ] Buy milk`, `#2 [ ] Pay rent`, `#3 [ ] Read`; then `ttc unimportant 3` again → stdout is the single line `Task 3 is not important`, exit code 0, and `tasks.json` is byte-for-byte unchanged
- [ ] AC-5. Status views. Made with `ttc add` and `ttc done`: 1 `Alpha` (`--due 2000-01-01 --tag home`), 2 `Bravo` (`--due 2000-01-02 --tag home --important`), 3 `Charlie` (`--due 2099-12-31`), 4 `Delta` (`--tag home --important`), 5 `Echo` (`--important`, then `ttc done 5`), 6 `Foxtrot` (then `ttc done 6`). Then: `ttc list` and `ttc list --open` each print exactly `#2 [ ] Bravo due:2000-01-02 !overdue !important +home`, `#4 [ ] Delta !important +home`, `#1 [ ] Alpha due:2000-01-01 !overdue +home`, `#3 [ ] Charlie due:2099-12-31`; `ttc list --done` prints exactly `#5 [x] Echo !important`, `#6 [x] Foxtrot`; `ttc list --all` prints exactly `#2 [ ] Bravo due:2000-01-02 !overdue !important +home`, `#4 [ ] Delta !important +home`, `#5 [x] Echo !important`, `#1 [ ] Alpha due:2000-01-01 !overdue +home`, `#3 [ ] Charlie due:2099-12-31`, `#6 [x] Foxtrot`; `ttc list --overdue` prints exactly `#2 [ ] Bravo due:2000-01-02 !overdue !important +home`, `#1 [ ] Alpha due:2000-01-01 !overdue +home`; each exits 0 with empty stderr
- [ ] AC-6. Filters, on the AC-5 tasks: `ttc list --all --tag home` prints exactly the lines of tasks 2, 4, 1 (as in AC-5), in that order; `ttc list --all --due-from 2000-01-01 --due-to 2000-12-31` prints exactly the lines of tasks 2, 1, in that order; `ttc list --all --search o` prints exactly the lines of tasks 2, 5, 6, in that order; `ttc list --done --search delta` prints exactly `No tasks.`; each exits 0 with empty stderr
- [ ] AC-7. The six AC-5 tasks made the same way but with no `--important` → `ttc list --all` prints exactly `#1 [ ] Alpha due:2000-01-01 !overdue +home`, `#2 [ ] Bravo due:2000-01-02 !overdue +home`, `#3 [ ] Charlie due:2099-12-31`, `#4 [ ] Delta +home`, `#5 [x] Echo`, `#6 [x] Foxtrot`, the same bytes ttc at head `3dbf454` prints for the same commands
- [ ] AC-8. Tasks 1 `Buy milk` (`--important`), 2 `Pay rent` (`--important`) and 3 `Read`, then in turn `ttc done 1`, `ttc reopen 1`, `ttc rename 1 "Buy oat milk"`, `ttc tag 1 +shop`, `ttc note 1 "two litres"`, `ttc tag 3 +fun` → each prints its usual success line and exits 0; `ttc list --all` after `ttc done 1` prints `#1 [x] Buy milk !important` first; after the last command `ttc list --all` prints exactly `#1 [ ] Buy oat milk !important +shop`, `#2 [ ] Pay rent !important`, `#3 [ ] Read +fun`; then `ttc delete 2` → `ttc list --all` prints exactly `#1 [ ] Buy oat milk !important +shop`, `#3 [ ] Read +fun`
- [ ] AC-9. Tasks 1 `Buy milk` (`--important`), 2 `Pay rent`, 3 `Read` (`--important`, then `ttc done 3`), then `ttc export backup.json` → stdout `Exported 3 tasks to backup.json`; `ttc unimportant 1`; `ttc import backup.json` → stdout `Imported 3 tasks from backup.json`, exit 0; `ttc list --all` then prints exactly `#1 [ ] Buy milk !important`, `#3 [x] Read !important`, `#2 [ ] Pay rent`. Then `ttc export done.json --done` and `ttc import done.json` → `ttc list --all` prints exactly `#3 [x] Read !important`
- [ ] AC-10. Tasks 1 `Buy milk` (`--important`) and 2 `Pay rent` → `ttc export --format csv` prints exactly the bytes `id,title,status,due,tags,note\r\n1,Buy milk,open,,,\r\n2,Pay rent,open,,,\r\n`; `ttc stats` prints exactly `open: 2`, `done: 0`, `overdue: 0`; `ttc note 1` prints exactly `Task 1 has no note`; each exits 0
- [ ] AC-11. A `tasks.json` in format version 3 (the layout README "Data file format" documents at head `3dbf454`), holding task 1 `Buy milk` (open), task 2 `Pay rent` (done) and next id 3 → `ttc list --all` prints exactly `#1 [ ] Buy milk`, `#2 [x] Pay rent`, exit 0, and `tasks.json` is byte-for-byte unchanged; then `ttc important 1` → `Marked task 1 as important`, and `tasks.json` now holds `"version": 4`. The same two tasks in a version 2 file (the version 3 layout with `"version": 2` and no `note` field) and in a version 1 file (the version 2 layout with no `"version"` field) give the same `ttc list --all` output. Each of the version 1, 2 and 3 files given to `ttc import` → `Imported 2 tasks from <file>`, exit 0, and `ttc list --all` prints exactly `#1 [ ] Buy milk`, `#2 [x] Pay rent`
- [ ] AC-12. A `tasks.json` made by ttc, then edited so `"version"` is 5 → `ttc list` prints on stderr exactly one line starting `ttc: cannot read <path>: ` (`<path>` is the path of `tasks.json`), stdout is empty, exit code 1, and `tasks.json` is unchanged; the same file given to `ttc import` → stderr is exactly one line starting `ttc: invalid import file <file>: `, exit code 1, and the current `tasks.json` is unchanged
- [ ] AC-13. A version 4 file made with `ttc export`, then edited so that one task's important mark (the field README "Data file format" names) holds the string `"yes"`, and a second copy with that field removed from one task: as `tasks.json`, `ttc list` → stderr is exactly one line starting `ttc: cannot read <path>: `, stdout is empty, exit code 1, the file unchanged; given to `ttc import`, each → stderr is exactly one line starting `ttc: invalid import file <file>: `, exit code 1, and the current `tasks.json` unchanged
- [ ] AC-14. `ttc important <arg>` and `ttc unimportant <arg>` for each `<arg>` in `abc`, `0`, `-1`, `1.5` and `9007199254740992` → stderr is exactly the line `ttc: invalid task id: <arg>`, stdout is empty, exit code 1, `tasks.json` unchanged. With only task 1 stored, `ttc important 7` and `ttc unimportant 7` → stderr is exactly `ttc: no task with id 7`, exit 1, `tasks.json` unchanged; with no `tasks.json`, the same commands give the same line and create no `tasks.json`. With task 7 stored, `ttc important 007` → stdout `Marked task 7 as important`
- [ ] AC-15. Each of `ttc important`, `ttc unimportant`, `ttc important 1 2`, `ttc unimportant 1 2`, `ttc important 1 --force`, `ttc add "Buy milk" --important --important` and `ttc add "Buy milk" --important yes` → stderr is one line starting `ttc: `, stdout is empty, exit code 1, and `tasks.json` unchanged (not created when it did not exist). A `tasks.json` holding the text `{`, then `ttc important 1` and `ttc unimportant 1` → each prints on stderr exactly one line `ttc: cannot read <path>: <reason>` (`<reason>` not empty), exit code 1, and `tasks.json` still holds `{`
- [ ] AC-16. `ttc help` → stdout is exactly `Usage:` followed by these lines, each indented two spaces, in this order: `ttc help`; `ttc add "<title>" [--due YYYY-MM-DD] [--tag <t>]... [--note "<text>"] [--important]`; `ttc list [--open|--done|--all|--overdue] [--tag <t>] [--due-from YYYY-MM-DD] [--due-to YYYY-MM-DD] [--search <text>]`; `ttc done <id>`; `ttc reopen <id>`; `ttc important <id>`; `ttc unimportant <id>`; `ttc rename <id> "<title>"`; `ttc delete <id>`; `ttc tag <id> +<t> | -<t>`; `ttc note <id> ["<text>" | --clear]`; `ttc export [<file>] [--format json|csv] [--open|--done|--all|--overdue] [--tag <t>] [--due-from YYYY-MM-DD] [--due-to YYYY-MM-DD] [--search <text>]`; `ttc import <file>`; `ttc stats`; exit code 0
- [ ] AC-17. README.md → documents `ttc add --important`, `ttc important <id>`, `ttc unimportant <id>` with their four messages, the `ttc list` order and the `!important` token, and in "Data file format" format version 4 with the mark's field and values, that versions 1–3 are read with no task important, and that after the first change an older ttc can no longer read the file or new JSON exports
- [ ] AC-18. `npm test` runs `node:test` tests covering AC-1 to AC-16 → all pass; the pull request delivering this story → the CI `test` check passes

## Sequencing

none — on the frontier. One story; `depends_on: [none]`. It builds on the
commands INIT-0001 and RCDEV-839..841 shipped at head `3dbf454`.

## Technical constraints

From `technical/assessment.md`, round 1:

- **C1**: every stored and imported file is checked against the exact fields of its format version, so the mark needs format version 4; versions 1–3 are read with no task important, and the next change writes version 4 (`PD-0010` items 1–3).
- **C2**: the upgrade is one-way; an older ttc refuses a version 4 file and new JSON exports, even with no task marked (accepted by `PD-0010` item 4).
- **C3**: the new rules add to `PD-0003` items 7–10, 12 and 14; they are fixed in `PD-0009`, and tests assert the fixed text exactly.
- **C4**: `ttc important`, `ttc unimportant` and `ttc add --important` inherit the id, option, lock, atomic-write, no-op and failure-after-save rules of the existing changing commands (`PD-0003` item 2, `PD-0004` items 2–4 and 7, `PD-0008`).
- **C5**: `tasks.json` and import files share one parse path; the mark is checked strictly and the same way in both, never coerced, and "exported then imported is the same list" includes it, also for a filtered JSON export.
- **C6**: the test oracle (`test/support/ttc-model.js`, `fuzz-gen.js`) and the unit tests that assert format 3 output move with the change; the oracle is changed from the text of `PD-0009` and `PD-0010`, not from the new code.
- **C7**: the perf guard (10,000 tasks, median < 500 ms) must still pass; ordering by group then id is the same cost class as today's sort.

## Observability

none — a local, offline command; its stdout/stderr lines and exit code are the
whole operable signal, and the requester ruled out network
(`project/constraints.md` row 3).

## Rollout

`migration`. The first changing command after upgrade rewrites `tasks.json`
from version 1–3 to version 4, in place and atomically, with no step for the
user (`PD-0010`). It is one-way: an older ttc cannot read the file afterwards.
The README "Data file format" section says so.

## Notes

- Raw request: `product/sources/2026-10-26-requester-request.md`.
- `!important` in a title looks like a mark, as `!overdue` already does
  (`PD-0009` Consequences).
