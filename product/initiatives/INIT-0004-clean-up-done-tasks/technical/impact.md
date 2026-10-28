---
initiative: INIT-0004
type: technical-assessment
title: System impact map — Finished tasks are cleaned out of the list in one short command
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
Mapped: 2026-10-28
Options mapped: A (`ttc clean` removes every done task, no new stored data), B (`ttc clean` removes done tasks finished more than 30 days ago; `ttc done` records the local finish date, `ttc reopen` clears it, format version 5)

Both options live in one system: the `ttc` CLI in `rortegalizardo/task-tracker-cli`
(head `6a25069`). "System / component" rows are components of that one
program plus the stored file and the test suite that gates CI. Sources are in
`capability-scan.md`.

## Per option

### Option A — `ttc clean` removes every done task

| System / component | Current responsibility (source) | What this option requires of it |
| --- | --- | --- |
| New clean command | — (absent) | Must take no argument and no option; under the lock, must remove every task whose status is done in one write, keep the next id as it is, and print one line giving the count; when no task is done, must write nothing and still succeed. |
| Argument parser | Positionals and options by name; no-argument commands exist (`stats`, `help`) | Used as-is. |
| Stored list, read checks, format versions, serializer | Format 4; v1–v3 read and rewritten as v4 by the next changing command (`src/storage.js`, PD-0010 item 1) | No change. A list with fewer (or no) tasks and the same next id is already valid. |
| Lock, atomic write, write guard, failure after save | `src/lock.js`, `src/storage.js`, `bin/ttc.js`, `src/cli.js` | Used as-is. The lock's cleanup must leave no data folder when `tasks.json` is missing (it already does). |
| `list`, `stats`, `export`, `import` | Show, count and copy whatever is stored | No change; their output loses the removed tasks only. |
| Help | Usage lines from the registry | Must list the new usage line at the position the convergence decision fixes. |
| Test oracle and fuzz generators | Independent statement of every rule; hard-coded usage and command set | Must know the new command, its argument rule, its lines and its no-write case. |
| Perf guard | 10,000-task timing of `list`, filtered `list`, `add` | Must keep passing; clean has the cost shape of `delete` (one read, one write). |
| README | Usage, data format, exit codes | Must document the command. |

| Dependency | Direction (upstream/downstream) | Kind (internal/third-party/human) | Note |
| --- | --- | --- | --- |
| `tasks.json` written by older ttc (v1–3) | upstream | human/operational | Read; rewritten as v4 only when clean removes at least one task (PD-0010 item 1); left as-is when nothing is removed. |
| ttc installs that read v4 (since RCDEV-856) | downstream | human/operational | Read a cleaned file unchanged: no new field, no new version. |
| Scripts that parse `ttc list --done/--all`, `stats`, CSV or JSON export | downstream | human/operational | Removed tasks disappear; the `done:` count drops to 0. Formats and keys unchanged. |
| Scripts that parse `ttc help` | downstream | human/operational | One new usage line. |
| CI `test` check (Node 24, Linux) | downstream gate | internal | Unit, fuzz and perf suites must pass (constraint 7). |
| The user's own copies (`ttc export`) | downstream | human/operational | The only way to keep a removed task; the platform has no undo or archive. |

| Data crossing a boundary | Class | Regime note |
| --- | --- | --- |
| Removal of the user's done tasks from `tasks.json` | personal (the user's own task data) | Permanent removal; no regime beyond the existing owner-only permissions (PD-0004 item 4); no network (constraint 3). |
| The confirmation line giving the count, on stdout | none | A number only. |

### Option B — `ttc clean` removes done tasks finished more than 30 days ago

| System / component | Current responsibility (source) | What this option requires of it |
| --- | --- | --- |
| New clean command | — (absent) | As in A, but must remove only done tasks whose finish date is more than 30 calendar days before the local today, or that have no finish date; must count days on the calendar date; when nothing qualifies (including when done tasks remain), must write nothing and still succeed. |
| `ttc done` | Sets status to done; a no-op on a done task (`src/commands/status.js`) | Must also record the local date of the change on the task; the no-op must keep the existing date. |
| `ttc reopen` | Sets status to open | Must also clear the finish date. |
| Every other changing command (`add`, `rename`, `tag`, `note`, `important`, `unimportant`, `postpone`, `delete`) | Each changes its own field and writes through the shared serializer | Must carry the finish date through unchanged; `add` creates a task with none. |
| Stored list, read checks, format versions | Format 4 strict check; one upgrade step per version (`src/storage.js`) | Must gain format version 5 with the finish date held on every task, a strict validity rule for it (present on every task; none on an open task; a valid date or none on a done task), and an upgrade from v4 in which every task has none. Files of versions 1–4 keep being read. |
| Serializer and JSON export | One current-format serialization for writes and JSON export | Must write version 5, with the finish date on every task, for every write and every JSON export, whether or not the user ever runs clean. |
| Import | Accepts versions 1–4 through the one parse path | Must accept versions 1–5 and apply the same finish-date check as on read. Tasks from a v1–v4 file have no finish date. |
| CSV export | Fixed header and columns | No change, if the PM keeps "showing when a task was finished" out of scope. |
| Calendar-day arithmetic | One day forward only (`src/rules.js`) | Must be able to decide "more than 30 calendar days before today" on the calendar date, independent of time zone and daylight saving, with month, year and leap-day rules. |
| Lock, atomic write, write guard, failure after save | As in A | Used as-is. |
| `list`, `stats` | Show and count stored tasks | No change, if the finish date is not shown. |
| Help | As in A | As in A. |
| Test oracle and fuzz generators | As in A; the oracle restates v1–v4 parse, upgrade and serialization independently | As in A, plus: an independent restatement of version 5 and its upgrade, of the finish-date lifecycle across `done`, `reopen` and every other command, and of the 30-day count; generated v5 data with finish dates (past, today, future, none). The 9 test files that state version 4 literally move to version 5. |
| Perf guard | As in A | As in A; the date check adds a constant per task. |
| README | As in A, plus "Data file format" | Must document the command, format 5, and that the upgrade is one-way. |

| Dependency | Direction (upstream/downstream) | Kind (internal/third-party/human) | Note |
| --- | --- | --- | --- |
| `tasks.json` written by older ttc (v1–4) | upstream | human/operational | Read; done tasks in it have no finish date and count as finished long ago; rewritten as v5 by the next changing command of any kind (PD-0010 item 1). |
| Import files written by older ttc (v1–4) | upstream | human/operational | Accepted; their done tasks have no finish date, so the next clean removes them all. |
| ttc installs that read v4 (the ttc shipped today) | downstream | human/operational | Refuse `tasks.json` after the first change by new ttc, and refuse every new JSON export, even for a user who never runs clean (PD-0010 item 4 pattern). |
| System clock and `TZ` | upstream | human/operational | Decide the recorded finish date at `done` time and "today" at clean time. |
| Scripts that parse JSON export | downstream | human/operational | Version number and a new key on every task change for every user. |
| Scripts that parse `ttc list`, `stats`, CSV | downstream | human/operational | As in A, for the tasks clean removes. |
| Scripts that parse `ttc help` | downstream | human/operational | As in A. |
| CI `test` check | downstream gate | internal | As in A. |
| The user's own copies (`ttc export`) | downstream | human/operational | As in A; a v5 export keeps finish dates, a v4 one loses them. |

| Data crossing a boundary | Class | Regime note |
| --- | --- | --- |
| The finish date of each done task, inside `tasks.json` and JSON exports | personal (a record of when the user completed their own task) | New datum, date only (no time of day); no regime beyond the existing owner-only file permissions (PD-0004 item 4); export files get default permissions where the user puts them, as today; no network (constraint 3). |
| Removal of the user's old done tasks from `tasks.json` | personal | As in A. |
| The confirmation line giving the count, on stdout | none | As in A. |

## Not impacted

| System | Why a reader might expect it | Why it is not impacted |
| --- | --- | --- |
| Id allocation | "Removed ids never come back" | The next id is stored apart from the tasks and kept as is by any removal (`src/commands/delete.js` precedent); both options keep it. |
| `ttc list` order and line format | "Nothing else changes" | Order is important first, then id; the line shows no date of finishing in either option. Only removed tasks disappear. |
| `stats` open and overdue counts | Counts change | Clean removes done tasks only; a done task is never overdue (PD-0003 item 6). Only the `done:` count changes. |
| Open tasks | "Open tasks untouched" | Neither option selects an open task; in B an open task never holds a finish date. |
| Stored format (option A only) | "Does the format change?" | A uses the existing status field only; version stays 4. |
| Write lock, atomic write, permissions, failure-after-save handling | A new changing command | Generic; used as-is. |
| `ttc delete` | The other removal command | Unchanged in both options. |
| Network, other users, other OS | — | None exist (constraints 3, 8; PD-0004 item 5). |
