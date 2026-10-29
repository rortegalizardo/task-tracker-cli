---
initiative: INIT-0005
type: technical-assessment
title: Platform capability scan — A new task is made from an existing one without retyping it
status: authoritative
revision: 1
owner_role: ROLE-planner
mode: PRODUCT-DISCOVERY
phase_at_assessment: SOLUTION_EXPLORATION
round: 1
assessed_on: 2026-10-29
created: 2026-10-29
updated: 2026-10-29
verdicts: []
constraints: []
questions: []
updated_by_role: ROLE-planner
---

Mode: PRODUCT-DISCOVERY
Initiative: INIT-0005
Scanned: 2026-10-29
Systems scanned: `rortegalizardo/task-tracker-cli` at head `fdf683d` (last `src/` change `452450b`, RCDEV-858) — `bin/ttc.js`, `src/`, `test/` (unit, fuzz oracle, perf guard), `README.md`

All paths are relative to the repository root. ttc is one system: a single
Node.js CLI process over one local JSON file. No service, network or
third-party component exists (`project/constraints.md` rows 1–4, 8).

## Relevant platform capabilities

| Area | Verdict (exists/partial/absent) | Where it lives (source) | Gap, if partial |
| --- | --- | --- | --- |
| A command that makes a task from another task | absent | `src/commands/index.js` registry (16 commands): help, add, list, done, reopen, important, unimportant, postpone, rename, delete, clean, tag, note, export, import, stats. None reads one task and writes a new one from it. | Nothing in the platform copies a task. |
| Making a new task with the next id | exists | `src/commands/add.js`: under the lock, read the list, refuse when the next id is above the largest id (`ttc: no task id is left`), append an open task with the next id, raise the next id by 1, one write; prints `Added task <id>` (PD-0003 items 1, 10; PD-0004 item 2) | — |
| The five fields a copy would carry, held on every task | exists | Format 4 task keys: id, title, status, due, tags, note, important (`src/storage.js` layout comment and `serializeList`; README "Data file format"). Title, due, tags, note and important mark are all stored per task; no other per-task field exists. | — |
| Stored fields already valid on read | exists | `src/storage.js` `validateList` applies the full title, tag, date, note and mark checks to every stored task on every read (PD-0004 item 8). A task read from `tasks.json` therefore already satisfies every rule a new task must meet. | — |
| Ids never reused, id limit | exists | `src/storage.js` holds `nextId` apart from the tasks and refuses a list whose `nextId` is not above every id, or above 2^53; `src/args.js` `MAX_ID` = 9007199254740991; the "no id left" refusal exists only in `src/commands/add.js` (PD-0003 item 1, PD-0004 item 2) | — |
| Id argument rules | exists | `src/args.js` `parseId`: digits only, leading zeros allowed, 1 to `MAX_ID`, else `invalid task id: <arg>`; `no task with id <id>` is raised by each command after the read (`src/commands/postpone.js`, `status.js`, `important.js`) | — |
| Option parsing with a date value | exists | `src/args.js` `parseArgs`: options before or after positionals, a value option refuses a missing value and a second use; `src/commands/add.js` validates `--due` with `src/rules.js` `isValidDate` before the lock | — |
| Date validity and the latest date | exists | `src/rules.js` `isValidDate`: `YYYY-MM-DD`, a real Gregorian date, `0000-01-01` to `9999-12-31`; a past date is allowed (PD-0003 item 5); nothing later than `9999-12-31` passes, which is PD-0011 item 6's standing rule | — |
| Setting a due date on an existing task | partial | `src/commands/postpone.js`: one calendar day after the later of the due date and today; refuses a task with no due date (PD-0011 items 3, 5). No other command sets, changes or clears `due` after `add`. | An overdue task moves to tomorrow in one `postpone`; every further day needs one more. No command sets an arbitrary date or clears one. |
| Changing the other fields after creation | exists | `src/commands/rename.js` (title), `tag.js` (tags), `note.js` (note, `--clear`), `important.js` (mark on/off), `status.js` (done/reopen) | — |
| Format versions and upgrade | exists | `src/storage.js` `FORMATS` (v1–v4, one validator and one pure upgrade step each); older files are upgraded in memory on read (v1–v2 tasks get no note; v1–v3 tasks get no mark) and written as v4 by the next write; a newer version is refused (PD-0010 items 1, 3, 4) | — |
| Changing-command pattern | exists | `src/commands/postpone.js`, `status.js`, `important.js`, `delete.js`, `clean.js`: argument checks before the lock, then `withLock(read → change → writeList)`; every refusal throws before the write, so the file stays byte-identical | — |
| Exclusive lock; no folder left behind by a refusal | exists | `src/lock.js` `withLock` (busy failure after 10 s); `release` removes again any data folder this call created when nothing else lives in it (PD-0004 item 7) | — |
| Atomic whole-file write, owner-only permissions, write guard | exists | `src/storage.js` `writeList` (validates the whole list, then one atomic replace; PD-0004 items 3–4) | — |
| Failure after a saved change | exists | `bin/ttc.js` stdout error handler (exit 1, at most one stderr line); `src/cli.js` buffers stdout until the command returns (PD-0008) | — |
| List order and stored order | exists | `src/commands/list.js` sorts important first, then id (PD-0009 item 4); JSON export uses stored order (`src/commands/export.js`), which is ascending id because tasks are only ever appended with a higher id | — |
| Help usage from the command registry | exists | `src/commands/index.js` (registry order is usage order, PD-0003 item 12); `src/commands/help.js` | — |
| Tests that assert the whole usage text | exists | `test/important.test.js`, `test/clean.test.js`, `test/postpone.test.js` list every usage line in order; `test/support/ttc-model.js` hard-codes `USAGE` | — |
| Model-based robustness tests | exists | `test/support/ttc-model.js` (oracle written from the PDs, never requires `src/`; hard-codes `USAGE` and `COMMANDS`, restates add's id rule and the v1–v4 parse and serialization), `test/support/fuzz-gen.js` (`COMMANDS` list, argv cases per command label; `UNKNOWN_NAMES` does not contain `copy`, so the name does not collide with an existing unknown-command case), `test/support/fuzz-harness.js` | — |
| Perf guard | exists | `test/perf/add-list.perf.js`: 10,000 tasks, median of `list`, filtered `list` and `add` under 500 ms | No command other than `add` among the changing commands is measured. |
| Record of where a task came from | absent | No per-task key beyond the seven above (`src/storage.js` layout) | Out of scope (`initiative.md` rev 2); recorded so its cost is visible: a new key means a new format version (PD-0010 item 1). |

## CAP- reconciliation

| CAP- id | Registry says | System says | Agrees? | Note |
| --- | --- | --- | --- | --- |
| CAP-0001 | `draft`, rev 1; "Behavior today: None yet"; Boundaries exclude priorities, notes, text search and safe concurrent writes | The CLI ships. No command copies a task (agrees: none claimed). Notes, `--search`, the important mark, postpone, clean and the write lock all exist (`src/commands/note.js`, `src/filter.js`, `src/commands/important.js`, `postpone.js`, `clean.js`, `src/lock.js`) | No | Same contradictions as reported in the INIT-0002, INIT-0003 and INIT-0004 scans, plus clean. Reported to the PM; not corrected here. |

## Extension points

| Seam | What it accepts today | Source |
| --- | --- | --- |
| Command registry | A command object with a name, a usage line and a run step; registry order sets help order | `src/commands/index.js` |
| Changing-command pattern | Argument checks, then read → change → one write under the lock; a refusal throws before the write | `src/commands/postpone.js`, `add.js` |
| Argument parser | Named positionals and options, with value / no-value / repeat flags | `src/args.js` |
| Date rule | Pure check on `YYYY-MM-DD` text, shared by input, read and import | `src/rules.js` |
| Single serializer | The one current-format serialization, used by every write and by JSON export | `src/storage.js` `serializeList` |
| Test oracle and harness | Independent restatement of every rule; per-command argv generators | `test/support/ttc-model.js`, `fuzz-gen.js`, `fuzz-harness.js` |

## Data already held

| Data class | Where | Sensitivity (none/personal/financial/regulated) |
| --- | --- | --- |
| Task titles, notes, tags, due dates, status, important mark, ids, next id | `$TTC_HOME/tasks.json` (default `~/.ttc`), owner-only | personal (the user's own task data) |
| Exported copies (JSON / CSV) | Paths the user names; default permissions | personal |
| Lock file (holder pid) and stray temp files | `$TTC_HOME/tasks.json.lock`, `.tasks.json.<pid>.<hex>.tmp` | none |
