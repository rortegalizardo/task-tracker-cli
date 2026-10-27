---
initiative: INIT-0002
type: technical-assessment
title: Platform capability scan — Important tasks are marked and listed first
status: authoritative
revision: 1
owner_role: ROLE-planner
mode: PRODUCT-DISCOVERY
phase_at_assessment: SOLUTION_EXPLORATION
round: 1
assessed_on: 2026-10-26
created: 2026-10-26
updated: 2026-10-26
verdicts: []
constraints: []
questions: []
updated_by_role: ROLE-planner
---

Mode: PRODUCT-DISCOVERY
Initiative: INIT-0002
Scanned: 2026-10-26
Systems scanned: `rortegalizardo/task-tracker-cli` at `main` head `9731f42` — `bin/ttc.js`, `src/`, `test/` (unit, fuzz oracle, perf guard), `README.md`, `.github/workflows/ci.yml`, `docs/engineering-log.md`

All paths are relative to the repository root. ttc is one system: a single
Node.js CLI process over one local JSON file. No service, network or
third-party component exists (`project/constraints.md` rows 1–4, 8).

## Relevant platform capabilities

| Area | Verdict (exists/partial/absent) | Where it lives (source) | Gap, if partial |
| --- | --- | --- | --- |
| A stored importance mark or priority level on a task | absent | `src/storage.js` (task keys `id,title,status,due,tags,note` only); `grep -ri "important\|priority" src README.md` finds nothing. The only hit in the repo is `test/add.test.js:199`, which uses `--priority` as an example of a bad `add` argument | Nothing in the platform marks a task. |
| `ttc list` ordering | partial | `src/commands/list.js:30` — one sort key, ascending id, after filtering | Orders by id only; no second ordering key exists. |
| A flag token in the list line | exists | `src/commands/list.js:11-17` — `#<id> [ ]/[x] <title> [due:<date>] [!overdue] [+<tag>]...`; fixed by PD-0003 item 8 | — |
| Status views and filters shared by `list` and `export` | exists | `src/filter.js` (`--open/--done/--all/--overdue`, `--tag`, `--due-from`, `--due-to`, `--search`, AND-combined); used by `list.js` and `export.js` | Filters only choose which tasks show; they do not order them. |
| Commands that set and clear one task property, with a no-op message and no write on a no-op | exists | `src/commands/status.js` (`done`/`reopen`, one shared builder, comment "A no-op never writes"); `src/commands/tag.js` (`+<t>`/`-<t>`) | — |
| `add` options, including a value-less flag | exists | `src/commands/add.js` (`--due`, `--tag` repeatable, `--note`); value-less options are supported by `src/args.js` (`value: false`, used by the status options in `src/filter.js`) | `add` has no value-less option today. |
| Argument and id rules | exists | `src/args.js` — `--`-prefixed args are options; unknown, repeated (unless `repeat`) or valueless options fail; `parseId` accepts digits with leading zeros, 1 to 2^53−1 (PD-0003 item 2, PD-0004 item 2) | — |
| Stored-format versions and in-place upgrade | exists | `src/storage.js:106-175` — `FORMATS` registry (v1, v2, v3), each with a strict validator and an upgrade step; header says a future format "is added ... by registering one FORMATS entry"; `fileVersion` refuses a version above the current one with "written by a newer ttc (format version N; this ttc reads up to version 3)" | — |
| Strict task shape on read and import | exists | `src/storage.js:53-104` `validateList` — `onlyKeys` refuses any unknown key on the list or a task; one parse path `parseList` serves `readList` and `import` (PD-0004 item 8) | — |
| One canonical serializer | exists | `src/storage.js:191-198` `serializeList` — names every task key explicitly; used by every write and by JSON export | A key not named there is dropped on every write. |
| Atomic whole-file write, owner-only permissions | exists | `src/storage.js` `replaceFile`, `writeList` (0600 file, 0700 folder) — PD-0004 items 3–4 | — |
| Exclusive lock around read-change-write | exists | `src/lock.js` (RCDEV-835): lock file next to `tasks.json`, stale-owner takeover, `busy` failure after 10 s; README "Exit codes" | — |
| Failure after a saved change | exists | `bin/ttc.js` (stdout error handler sets exit 1, at most one stderr line); `src/cli.js` buffers stdout until the command returns — PD-0008 | — |
| JSON export / import of the whole stored shape | exists | `src/commands/export.js` (stored order, `serializeList`, filters default `--all`); `src/commands/import.js` (whole-file check, replace under lock, never reads `tasks.json`) | — |
| CSV export with fixed columns | exists | `src/csv.js` — header `id,title,status,due,tags,note`, fields picked by name, ascending id | — |
| `stats` counts | exists | `src/commands/stats.js` — counts open, done, overdue only | — |
| Help usage from the command registry | exists | `src/commands/index.js` (registry order is usage order, PD-0003 item 12); `src/commands/help.js` | — |
| Perf guard | exists | `test/perf/add-list.perf.js`: 10,000 tasks, median of 5 whole-process runs of `list`, filtered `list`, `add`, limit 500 ms; CI step `npm run test:perf` (`.github/workflows/ci.yml`). Measured at head on this machine (Node 26.11.1, not CI's Node 24): `list` 67.5 ms, filtered `list` 65.5 ms, `add` 89.9 ms | The fixture holds no marked task (none can exist). |
| Model-based robustness tests | exists | `test/support/ttc-model.js` (test-owned oracle written from the PDs; never requires `src/`), `test/support/fuzz-gen.js`, `test/fuzz-args.test.js` (≥100 cases per command label, byte-exact stdout and files), `test/fuzz-data.test.js` (damaged stored and import files) | The oracle hard-codes format versions 1–3, the v3 key set and canonical bytes, the usage list, id-order sort and the line format. |
| Tests asserting format-3 bytes | exists | `add`, `export`, `interrupted-write`, `list`, `import`, `storage-format`, `storage-write`, `storage-read` `.test.js` reference `"version": 3` / `CURRENT_VERSION` | — |

## CAP- reconciliation

| CAP- id | Registry says | System says | Agrees? | Note |
| --- | --- | --- | --- | --- |
| CAP-0001 | `draft`; "Behavior today: None yet"; Boundaries exclude notes, text search and safe concurrent writes | The CLI ships (all INIT-0001 commands present); notes (`src/commands/note.js`, format v3), `--search` (`src/filter.js`) and an exclusive write lock with a busy failure (`src/lock.js`, README "Exit codes") all exist | No | Already noted for notes/search in `product/state.md` Discovery S2. The lock is a further contradiction: CAP-0001 Boundaries and PD-0003 item 16 put concurrent writes out of scope, but the platform now serializes writers. Reported to the PM; not corrected here. |

## Extension points

| Seam | What it accepts today | Source |
| --- | --- | --- |
| Format registry | One entry per stored version: a strict validator plus a pure upgrade from the previous version; the parse path walks it unchanged | `src/storage.js:106-175` |
| Command registry | A command object with `name`, `usage`, `run`; registry order sets help order | `src/commands/index.js` |
| Changing-command pattern | Parse and check everything, then `withLock(read → change → writeList)`; a no-op returns a message without writing | `src/commands/status.js`, `tag.js`, `add.js` |
| Argument parser | Positionals by name, options with or without a value, repeatable options | `src/args.js` |
| List line builder | An ordered list of tokens per task | `src/commands/list.js` `formatTask` |
| Test oracle | Independent restatement of every user-visible rule, compared byte-for-byte with the real CLI | `test/support/ttc-model.js`, `fuzz-gen.js` |

## Data already held

| Data class | Where | Sensitivity (none/personal/financial/regulated) |
| --- | --- | --- |
| Task titles, notes, tags, due dates, status, ids, next id | `$TTC_HOME/tasks.json` (default `~/.ttc`), owner-only | personal (the user's own free text) |
| Exported copies (JSON / CSV) | Paths the user names; default permissions | personal |
| Lock file (holder pid) and stray temp files | `$TTC_HOME/tasks.json.lock`, `.tasks.json.<pid>.<hex>.tmp` | none |
