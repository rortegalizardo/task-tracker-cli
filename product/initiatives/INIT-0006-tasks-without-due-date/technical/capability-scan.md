---
initiative: INIT-0006
type: technical-assessment
title: Platform capability scan — Tasks with no due date are listed on their own in one short command
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
Initiative: INIT-0006
Scanned: 2026-10-29
Systems scanned: `rortegalizardo/task-tracker-cli` at head `53c39af` (last `src/` change `5b59363`, RCDEV-859 T1) — `src/filter.js`, `src/args.js`, `src/commands/list.js`, `export.js`, `help.js`, `index.js`, `src/overdue.js`, `src/storage.js`, `src/cli.js`, `test/` (unit, `test/support/` oracle and fuzz, `test/perf/`), `README.md`

All paths are relative to the repository root. ttc is one system: a single
Node.js CLI process over one local JSON file. No service, network or
third-party component exists (`project/constraints.md` rows 1–4, 8).

## Relevant platform capabilities

| Area | Verdict (exists/partial/absent) | Where it lives (source) | Gap, if partial |
| --- | --- | --- | --- |
| Listing only the tasks with no due date | absent | `src/filter.js`: the only criteria are the status view, `--tag`, `--due-from`/`--due-to` and `--search`. `--due-from`/`--due-to` drop every task with no due date; `--overdue` never matches one (`src/overdue.js`; PD-0003 item 6). `ttc list --no-due` and `ttc export --no-due` both fail today with `ttc: unknown option: --no-due`, exit 1 (checked on the CLI at head `53c39af`). | Nothing in the platform selects tasks with no due date. |
| "No due date" as stored data | exists | `src/storage.js` layout comment and read check: every task in format versions 1–4 holds a due value that is either empty (`null`) or a valid `YYYY-MM-DD` date. A task with the due key missing fails the date check and makes the file unreadable (PD-0004 item 8). | — |
| What `ttc list` shows for such a task | exists | `src/commands/list.js`: the line has no `due:` token and never `!overdue` (PD-0003 item 8, PD-0009 item 5). | — |
| One option set shared by `list` and `export` | exists | `src/filter.js` holds the option specs, the checks and the predicate; `src/commands/list.js` and `src/commands/export.js` both take the whole set. The only difference is the default status view: `--open` for list, `--all` for export. README "Exporting tasks": the options "mean the same as for `ttc list` ... and combine with AND in the same way". | — |
| Status-view group, at most one | exists | `src/filter.js`: `--open`, `--done`, `--all`, `--overdue`; two or more given is `ttc: options cannot be combined: <opts>`, the options named in group order, not argv order (PD-0003 item 7). `--overdue` is already a view that mixes status and due date (open and due before today). | — |
| AND combination of filters | exists | `src/filter.js` predicate; README "Listing and filtering tasks": a task is listed only if it passes every option given. | — |
| Check order for list and export | exists | `src/args.js` argument errors, in argv order (unknown option, option given twice, option needs a value, unexpected argument); then, for export only, `--format`; then `src/filter.js` in this order: two status views, invalid tag, invalid `--due-from`, invalid `--due-to`, `--due-from` later than `--due-to`, empty `--search`. Every check happens before the read (`src/commands/list.js`, `export.js`). | — |
| Refusing a contradiction found in the arguments alone | exists | `src/filter.js`: `--due-from` later than `--due-to` is refused before the read with `ttc: --due-from <a> is later than --due-to <b>`, rather than printing `No tasks.`. A combination that is empty only because of today's date (for example `--overdue --due-from <future date>`) is not refused. | — |
| Line format and order | exists | `src/commands/list.js`: important first, then ascending id, in every view and with every filter; `No tasks.` when nothing matches (PD-0003 items 7, 8; PD-0009 items 4, 5). | — |
| `list` never writes | exists | `src/commands/list.js` reads only; `src/storage.js` read returns an empty list for a missing `tasks.json` and creates nothing (PD-0003 item 13). A v1–v3 file is upgraded in memory only and left as it is on disk (PD-0010 item 1). | — |
| `export` writes only the file the user names | exists | `src/commands/export.js`: no file → stdout only; with a file → one atomic write of that file, `Exported <n> tasks to <file>`; `tasks.json` is never written; JSON export is format 4 (PD-0010 item 4). | — |
| Argument parser | exists | `src/args.js`: an argument starting with `--` is an option; option names match exactly (no prefixes, no `--x=value`, no `--no-` negation); an option's value may not start with `--`. | — |
| Help usage | exists | `src/commands/help.js` prints one usage line per command, in registry order (`src/commands/index.js`; PD-0003 item 12). | — |
| Tests that assert usage text exactly | exists | Whole usage, in order: `test/clean.test.js`, `copy.test.js`, `important.test.js`, `postpone.test.js`, and the oracle's usage list (`test/support/ttc-model.js`). The exact `ttc list` line also in `test/list.test.js`, `overdue.test.js`, `rename.test.js`, `stats.test.js`, `tag.test.js` (9 unit files in all). The exact `ttc export` line in `test/cli.test.js` and the four whole-usage files (5 unit files). The same lines in `README.md`. | — |
| Tests of the status-view group | exists | `test/list.test.js` (criterion 14) asserts that two views fail, without the message text. No test asserts the text of `options cannot be combined`. No test uses `--no-due`. | — |
| Model-based robustness tests | exists | `test/support/ttc-model.js` restates the shared filter (option set, view list, checks in order, predicate) from the documented rules and never requires `src/`; `test/support/fuzz-gen.js` draws list and export filter options, inserts a second status view and unknown options as mutations; its unknown-option list does not contain `--no-due`; generated lists give about half the tasks no due date, open and done. `test/support/fuzz-harness.js` compares exit status, stdout and files, and checks that stderr is one `ttc: ` line (not its text). | — |
| Perf guard | exists | `test/perf/add-list.perf.js`: 10,000 tasks, three in four with no due date; median of `ttc list`, a filtered `ttc list` and `ttc add` under 500 ms. | — |
| Counting tasks with no due date | absent | `src/commands/stats.js` counts open, done and overdue only. | Out of scope (`initiative.md` rev 2); recorded so its absence is visible. |

## CAP- reconciliation

| CAP- id | Registry says | System says | Agrees? | Note |
| --- | --- | --- | --- | --- |
| CAP-0001 | `draft`, rev 1; "Behavior today: None yet"; Boundaries exclude priorities, notes, text search and safe concurrent writes | The CLI ships, with `--search`, notes, the important mark, postpone, clean, copy and the write lock (`src/filter.js`, `src/commands/note.js`, `important.js`, `postpone.js`, `clean.js`, `copy.js`, `src/lock.js`). No option lists tasks with no due date (agrees: none claimed). | No | Same contradictions as reported in the INIT-0002 to INIT-0005 scans, plus copy. Reported to the PM; not corrected here. |

## Extension points

| Seam | What it accepts today | Source |
| --- | --- | --- |
| Shared filter | Option specs, checks and one AND predicate, used by both list and export; a default status view passed in by each command | `src/filter.js` |
| Status-view group | A closed list of mutually exclusive views, each a predicate on status and, for `--overdue`, the due date | `src/filter.js` |
| Argument parser | Named options with value / no-value / repeat flags, exact-name match | `src/args.js` |
| Command registry | Usage lines in registry order | `src/commands/index.js` |
| Test oracle and fuzz generators | Independent restatement of the filter and usage; per-command argv generators | `test/support/ttc-model.js`, `fuzz-gen.js` |

## Data already held

| Data class | Where | Sensitivity (none/personal/financial/regulated) |
| --- | --- | --- |
| Task titles, notes, tags, due dates (or none), status, important mark, ids, next id | `$TTC_HOME/tasks.json` (default `~/.ttc`), owner-only | personal (the user's own task data) |
| Exported copies (JSON / CSV) | Paths the user names; default permissions | personal |
