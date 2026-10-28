---
initiative: INIT-0004
type: technical-assessment
title: Platform capability scan — Finished tasks are cleaned out of the list in one short command
status: authoritative
revision: 1
owner_role: ROLE-planner
mode: PRODUCT-DISCOVERY
phase_at_assessment: SOLUTION_EXPLORATION
round: 1
assessed_on: 2026-10-28
created: 2026-10-28
updated: 2026-10-28
verdicts: []
constraints: []
questions: []
updated_by_role: ROLE-planner
---

Mode: PRODUCT-DISCOVERY
Initiative: INIT-0004
Scanned: 2026-10-28
Systems scanned: `rortegalizardo/task-tracker-cli` at head `6a25069` (last `src/` change `56d7c10`, RCDEV-857) — `bin/ttc.js`, `src/`, `test/` (unit, fuzz oracle, perf guard), `README.md`

All paths are relative to the repository root. ttc is one system: a single
Node.js CLI process over one local JSON file. No service, network or
third-party component exists (`project/constraints.md` rows 1–4, 8).

## Relevant platform capabilities

| Area | Verdict (exists/partial/absent) | Where it lives (source) | Gap, if partial |
| --- | --- | --- | --- |
| A command that removes several tasks at once | absent | `src/commands/index.js` registry: help, add, list, done, reopen, important, unimportant, postpone, rename, delete, tag, note, export, import, stats. `src/commands/delete.js` removes exactly one task by id. `REQ-0006` Non-goals "Deleting several tasks in one command" | Nothing in the platform removes more than one task per command. |
| Removing a task while keeping its id unused | exists | `src/commands/delete.js`: removes the task from the list and leaves `nextId` as it is; `src/storage.js` `validateList` accepts a list with no tasks and any `nextId` from 1 to 2^53 that is above every task id (PD-0003 item 1) | — |
| Selecting done tasks | exists | `status` is `"open"` or `"done"` on every task in every format version (`src/storage.js` `validateList`); `src/filter.js` `taskFilter` (`--done` view) | — |
| When a task was finished | absent | Task keys at format 4 are id, title, status, due, tags, note, important (`src/storage.js` layout comment, `serializeList`; README "Data file format"). `src/commands/status.js` changes `status` only. No timestamp of any kind is stored, for any event. | Nothing in the platform can tell a task finished today from one finished years ago. |
| Commands that set a task to done | exists | Only `ttc done` (`src/commands/status.js`, the one assignment to `status` in `src/`). `add` creates tasks open (`src/commands/add.js`); `import` replaces the list from a file (`src/commands/import.js`) | — |
| Local "today" | exists | `src/overdue.js` `localToday`: the process's local calendar date, respects `TZ` (PD-0003 item 6) | — |
| Calendar-day arithmetic | partial | `src/rules.js` `nextDay`: one calendar day forward, integer arithmetic on the date parts (no built-in date type, so time zones, daylight saving and the 0–99 year mapping do not apply); used by `src/commands/postpone.js` | No count of days between two dates and no step backwards; "N days before today" does not exist. |
| Date validity rule | exists | `src/rules.js` `isValidDate`: `YYYY-MM-DD`, a real Gregorian date, `0000-01-01` to `9999-12-31`; same check on read, import and input (PD-0003 item 5, PD-0004 item 8) | — |
| Format versions and upgrade | exists | `src/storage.js` `FORMATS` (v1–v4, one validator and one pure upgrade step per version), `fileVersion` refuses a newer version; every write and every JSON export uses the current version (`serializeList`); PD-0010 item 1 ("a new stored field means a new format version") | — |
| Strict per-version check, same for stored and imported files | exists | `src/storage.js` `parseList` is the one parse path for `tasks.json` and import files; `validateList` refuses an unknown or missing key per version (PD-0004 item 8, PD-0010 item 2) | — |
| Changing-command pattern | exists | `src/commands/status.js`, `important.js`, `postpone.js`, `delete.js`: arguments, then `withLock(read → change → writeList)`; a no-op returns its line without writing, so the file stays byte-identical | — |
| A command with no arguments | exists | `src/commands/stats.js`, `help.js`: `parseArgs(args, { positionals: [], options: {} })`; any argument is `unexpected argument`, any `--x` is `unknown option` (`src/args.js`) | — |
| Exclusive lock; no folder left behind by a no-op | exists | `src/lock.js` `withLock` (busy failure after 10 s); `release` removes again any data folder this call created when nothing else lives in it, so a changing command that writes nothing on a missing `tasks.json` leaves no folder (PD-0004 item 7) | — |
| Atomic whole-file write, owner-only permissions, write guard | exists | `src/storage.js` `replaceFile`, `writeList` (validates the whole list, then one atomic replace; PD-0004 items 3–4) | — |
| Failure after a saved change | exists | `bin/ttc.js` stdout error handler (exit 1, at most one stderr line); `src/cli.js` buffers stdout until the command returns (PD-0008) | — |
| Help usage from the command registry | exists | `src/commands/index.js` (registry order is usage order, PD-0003 item 12); `src/commands/help.js` | — |
| Views and counts that include done tasks | exists | `src/filter.js` (`--done`, `--all`), `src/commands/list.js`, `src/commands/stats.js` (`done:` count), `src/commands/export.js` (default view `--all`, JSON and CSV) | — |
| JSON export in the stored format | exists | `src/commands/export.js` uses `serializeList`: a JSON export is always the current stored format, all keys on every task (PD-0003 item 14 "same format as tasks.json"); `ttc import` reads it back through `parseList` | — |
| CSV export | exists | `src/csv.js`: fixed header `id,title,status,due,tags,note`; export-only (import reads JSON only) | — |
| Undo, archive, backup copy | absent | No command keeps a removed task; `replaceFile` keeps no previous copy. The only copy a user can keep is `ttc export` | Recorded because a bulk removal is permanent on this platform. |
| Perf guard | exists | `test/perf/add-list.perf.js`: 10,000 tasks, median of `list`, filtered `list`, `add` under 500 ms | No changing command other than `add` is measured. |
| Model-based robustness tests | exists | `test/support/ttc-model.js` (oracle written from the PDs, never requires `src/`; hard-codes `USAGE` and `COMMANDS`, restates the v1–v4 parse, upgrade and serialization at lines 233–311), `test/support/fuzz-gen.js` (argv cases per command label; `UNKNOWN_NAMES` does not contain `clean`), `test/support/fuzz-harness.js` | — |
| Tests that state format 4 literally | exists | 9 files reference version 4 directly: `test/storage-read`, `storage-write`, `storage-format`, `import`, `export`, `add`, `interrupted-write` tests, `test/support/fuzz-gen.js`, `test/support/ttc-model.js` | — |
| Fake clock | absent | No clock seam; tests run against the real date and set `TZ` (`test/overdue.test.js`); the harness tolerates a case that crosses local midnight | — |

## CAP- reconciliation

| CAP- id | Registry says | System says | Agrees? | Note |
| --- | --- | --- | --- | --- |
| CAP-0001 | `draft`, rev 1; "Behavior today: None yet"; delete is one task at a time; Boundaries exclude priorities, notes, text search and safe concurrent writes | The CLI ships. Delete is one task at a time (agrees). No bulk removal and no finish date exist (agrees: none claimed). Notes, `--search`, the important mark, postpone and the write lock all exist (`src/commands/note.js`, `src/filter.js`, `src/commands/important.js`, `src/commands/postpone.js`, `src/lock.js`) | No | Same contradictions as reported in the INIT-0002 and INIT-0003 scans, plus postpone. Reported to the PM; not corrected here. |

## Extension points

| Seam | What it accepts today | Source |
| --- | --- | --- |
| Command registry | A command object with a name, a usage line and a run step; registry order sets help order | `src/commands/index.js` |
| Changing-command pattern | Argument checks, then read → change → one write under the lock; a no-op returns its line without writing | `src/commands/status.js`, `delete.js`, `important.js` |
| Format registry | One entry per stored version: a validator and a pure upgrade step from the previous version; the parse path walks it unchanged | `src/storage.js` "Formats" section |
| Single serializer | The one current-format serialization, used by every write and by JSON export | `src/storage.js` `serializeList` |
| Date rules and local today | Pure checks on `YYYY-MM-DD` text; one-day forward step; the local date | `src/rules.js`, `src/overdue.js` |
| Test oracle and harness | Independent restatement of every rule with `today` as an input; midnight-tolerant comparison | `test/support/ttc-model.js`, `fuzz-harness.js` |

## Data already held

| Data class | Where | Sensitivity (none/personal/financial/regulated) |
| --- | --- | --- |
| Task titles, notes, tags, due dates, status, important mark, ids, next id | `$TTC_HOME/tasks.json` (default `~/.ttc`), owner-only | personal (the user's own task data) |
| Exported copies (JSON / CSV) | Paths the user names; default permissions | personal |
| Lock file (holder pid) and stray temp files | `$TTC_HOME/tasks.json.lock`, `.tasks.json.<pid>.<hex>.tmp` | none |
