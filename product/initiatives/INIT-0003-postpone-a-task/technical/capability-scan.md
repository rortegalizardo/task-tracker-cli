---
initiative: INIT-0003
type: technical-assessment
title: Platform capability scan — A task is postponed from the ttc command line in one short command
status: authoritative
revision: 1
owner_role: ROLE-planner
mode: PRODUCT-DISCOVERY
phase_at_assessment: SOLUTION_EXPLORATION
round: 1
assessed_on: 2026-10-27
created: 2026-10-27
updated: 2026-10-27
verdicts: []
constraints: []
questions: []
updated_by_role: ROLE-planner
---

Mode: PRODUCT-DISCOVERY
Initiative: INIT-0003
Scanned: 2026-10-27
Systems scanned: `rortegalizardo/task-tracker-cli` at head `c1e54fa` (last `src/` change `7e82f51`, RCDEV-856) — `bin/ttc.js`, `src/`, `test/` (unit, fuzz oracle, perf guard), `README.md`, `.github/workflows/ci.yml`

All paths are relative to the repository root. ttc is one system: a single
Node.js CLI process over one local JSON file. No service, network or
third-party component exists (`project/constraints.md` rows 1–4, 8).

## Relevant platform capabilities

| Area | Verdict (exists/partial/absent) | Where it lives (source) | Gap, if partial |
| --- | --- | --- | --- |
| A command that changes a task's due date after `add` | absent | `src/commands/index.js` registry: help, add, list, done, reopen, important, unimportant, rename, delete, tag, note, export, import, stats. Only `src/commands/add.js` sets `due`; no other command assigns it. PD-0003 Consequences "No way to change a due date" | Nothing in the platform moves a due date. |
| Stored due date | exists | `src/storage.js` format 4 layout comment and `validateList` (`due` is `"YYYY-MM-DD"` or `null` on every task, from version 1); `serializeList` writes it on every write and JSON export; README "Data file format" | — |
| Due-date validity rule | exists | `src/rules.js` `isValidDate`: exactly four year digits, two month, two day; a real Gregorian date (leap rule 4/100/400). Range `0000-01-01` to `9999-12-31`. Same check on read, import and `add --due` (PD-0003 item 5, PD-0004 item 8) | — |
| Calendar arithmetic on dates (add N days) | absent in `src/` | No source file adds days to a date. The only day-counting code is in a test: `test/overdue.test.js:49` (built-in UTC date, `d + days`) | Node 24's built-in date type is available (constraint 1); its behaviour near the limits is recorded under "Platform facts" below. |
| Local "today" | exists | `src/overdue.js` `localToday`: the process's local calendar date (respects `TZ`), not the UTC date (PD-0003 item 6) | — |
| Overdue rule | exists | `src/overdue.js` `isOverdue`: open, has a due date, due date before today (string compare of `YYYY-MM-DD`) | — |
| `list` order independent of due date | exists | `src/commands/list.js:30`: important first, then ascending id (PD-0009 item 4). The due date only adds the `due:` and `!overdue` tokens | — |
| Filters and counts that read the due date | exists | `src/filter.js` (`--overdue`, `--due-from`, `--due-to`); `src/commands/stats.js` (overdue count) | — |
| Changing-command pattern on one task by id, open and done tasks alike | exists | `src/commands/important.js`, `src/commands/status.js`: parse arguments, parse id, then under the lock read, look up the task (`no task with id <id>`), change, write; a no-op returns its message without writing | — |
| Optional second positional after `<id>` | exists | `src/args.js` (a bracketed positional name may be omitted); used by `src/commands/note.js` (`<id> [<text>]`) and `src/commands/export.js` (`[<file>]`) | — |
| Reading a whole-number argument exactly | exists, for ids only | `src/args.js` `parseId`: ASCII digits only, leading zeros allowed, read exactly (no rounding), 1 to 9007199254740991, else `invalid task id: <arg>` | No rule exists for a count of days. |
| Argument rules | exists | `src/args.js` `parseArgs`: an argument starting `--` is an option; every other argument (including `-1`, `+3`) is a positional; an extra positional is `unexpected argument`; an unknown option is `unknown option` (PD-0003 item 2) | — |
| Write guard against an invalid list | exists | `src/storage.js` `writeList` checks the whole list before writing and refuses with `cannot write a list that is not valid: <problem>`; nothing is written | — |
| Atomic whole-file write, owner-only permissions | exists | `src/storage.js` `replaceFile`, `writeList` (PD-0004 items 3–4) | — |
| Exclusive lock around read-change-write | exists | `src/lock.js` (RCDEV-835): `busy` failure after 10 s | — |
| Failure after a saved change | exists | `bin/ttc.js` stdout error handler (exit 1, at most one stderr line); `src/cli.js` buffers stdout until the command returns (PD-0008) | — |
| One-line errors, no stack trace | exists | `src/errors.js` `failureLine`; `src/cli.js` catches every error, including non-ttc errors, as one `ttc: <message>` line | A non-ttc error prints the runtime's own message text. |
| Help usage from the command registry | exists | `src/commands/index.js` (registry order is usage order, PD-0003 item 12); `src/commands/help.js` | — |
| Format versions and upgrade | exists | `src/storage.js` `FORMATS` (v1–v4), `fileVersion` refuses newer versions; PD-0010 item 1 ("a new stored field means a new format version") | — |
| Perf guard | exists | `test/perf/add-list.perf.js`: 10,000 tasks, median of 5 runs of `list`, filtered `list`, `add`, limit 500 ms; CI step `npm run test:perf` | No per-id changing command (`done`, `important`, ...) is measured. |
| Model-based robustness tests | exists | `test/support/ttc-model.js` (oracle written from the PDs, never requires `src/`; takes `today` as an input), `test/support/fuzz-gen.js` (≥100 argv cases per command label), `test/support/fuzz-harness.js:144-192` (reads today before and after each case and accepts either when midnight passes) | The oracle hard-codes the usage list and the command set. |
| Stored dates at the edges in generated data | exists | `test/support/fuzz-gen.js` `validDate`: `0000-01-01`, `9999-12-31`, `2024-02-29`, `2000-02-29`, `2100-02-28`, `0000-02-29`, years 0–9999; `BAD_DATES` includes `10000-01-01` | — |
| Time-zone controlled tests | exists | `test/overdue.test.js` runs the CLI with an explicit `TZ` | No fake-clock seam: tests run against the real current date. |

### Platform facts (built-in date type, measured on Node 26.11.1 locally; CI runs Node 24)

| Fact | Evidence |
| --- | --- |
| Counting days on a UTC calendar date rolls months, years and leap days correctly: 2028-02-28 + 1 = 2028-02-29; 2100-02-28 + 1 = 2100-03-01; 2026-12-31 + 1 = 2027-01-01. | Run on 2026-10-27 |
| Adding 24 hours to a local midnight does not always reach the next calendar day: in `America/New_York`, 2026-11-01 00:00 + 24 h is 2026-11-01 23:00 (end of daylight saving). | Run on 2026-10-27 |
| The built-in maps years 0–99 to 1900–1999 when a date is built from its parts. | `src/rules.js` comment on `isValidDate`; run: year 50 → 1950 |
| Past 9999-12-31 the built-in silently produces a five-digit year (9999-12-31 + 1 → `+010000-01-01`); past about 100,000,000 days from 1970 it fails with `Invalid time value`. | Run on 2026-10-27 |
| A 25-digit number read as a plain number loses precision (`1e+25`). | Run on 2026-10-27 |
| From 2026-10-27 to 9999-12-31 is 2,912,143 days. | Run on 2026-10-27 |
| Medians on a 10,000-task v4 file, 5 runs each: `important` 58.8 ms, `unimportant` 58.9 ms, `done` 60.5 ms, `reopen` 58.6 ms, `list` 66.7 ms. | Run on 2026-10-27 at `c1e54fa`, Node 26.11.1, on a generated 10,000-task v4 list (reproducible by the perf guard's own fixture shape); CI's Node 24 is the arbiter |

## CAP- reconciliation

| CAP- id | Registry says | System says | Agrees? | Note |
| --- | --- | --- | --- | --- |
| CAP-0001 | `draft`; "Behavior today: None yet"; due dates given and overdue shown; Boundaries exclude priorities, notes, text search and safe concurrent writes | The CLI ships; due dates are set only at `add` (agrees: no due-date change exists). Notes, `--search`, the important mark and the write lock all exist (`src/commands/note.js`, `src/filter.js`, `src/commands/important.js`, `src/lock.js`) | No | Same contradictions as reported in INIT-0002's scan, plus the important mark against "No ... priorities". Reported to the PM; not corrected here. |

## Extension points

| Seam | What it accepts today | Source |
| --- | --- | --- |
| Command registry | A command object with `name`, `usage`, `run`; registry order sets help order | `src/commands/index.js` |
| Changing-command pattern | Parse and check arguments, then `withLock(read → look up → change → writeList)`; a no-op returns a message without writing | `src/commands/important.js`, `status.js` |
| Argument parser | Required and optional positionals by name, options with or without a value | `src/args.js` |
| Date validity and local today | Pure checks on `YYYY-MM-DD` text; the local date | `src/rules.js`, `src/overdue.js` |
| Write guard | Any list; refuses an invalid one before writing | `src/storage.js` `writeList` |
| Test oracle and harness | Independent restatement of every rule with `today` as an input; midnight-tolerant comparison | `test/support/ttc-model.js`, `fuzz-harness.js` |

## Data already held

| Data class | Where | Sensitivity (none/personal/financial/regulated) |
| --- | --- | --- |
| Task titles, notes, tags, due dates, status, important mark, ids, next id | `$TTC_HOME/tasks.json` (default `~/.ttc`), owner-only | personal (the user's own task data) |
| Exported copies (JSON / CSV) | Paths the user names; default permissions | personal |
| Lock file (holder pid) and stray temp files | `$TTC_HOME/tasks.json.lock`, `.tasks.json.<pid>.<hex>.tmp` | none |
