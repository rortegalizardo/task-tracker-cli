---
initiative: INIT-0003
type: technical-assessment
title: System impact map — A task is postponed from the ttc command line in one short command
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
Mapped: 2026-10-27
Options mapped: A (`ttc postpone <id> [<days>]`, N defaults to 1), B (`ttc postpone <id>`, N always 1)

Both options live in one system: the `ttc` CLI in `rortegalizardo/task-tracker-cli`
(head `c1e54fa`). "System / component" rows are components of that one
program plus the stored file and the test suite that gates CI. Sources are in
`capability-scan.md`.

## Per option

### Option A — `ttc postpone <id> [<days>]`

| System / component | Current responsibility (source) | What this option requires of it |
| --- | --- | --- |
| New postpone command | — (absent) | Must take one id and an optional count of days; must refuse a task with no due date, and a postpone whose new date would be after `9999-12-31`, writing nothing; otherwise must set the task's due date to (later of due date and today) + N calendar days, write once, and print one confirmation line. Works on open and done tasks. |
| Argument parser | Positionals and options by name; anything not starting `--` is a positional (`src/args.js`) | Must be used as-is; a rule for reading the days value exactly (digits, no rounding, a lower and an upper bound) must exist beside the id rule. |
| Date rules and local today | Date validity and the local date (`src/rules.js`, `src/overdue.js`) | Must be the basis of the new date: the result must pass ttc's own date validity rule, and "today" must be the same local date the overdue rule uses. |
| Calendar-day counting | — (absent in `src/`) | Must count calendar days independent of time zone and daylight saving, with month, year and leap-day rollover, and must detect a result beyond `9999-12-31` before it is stored. |
| Stored list, read checks, serializer, export | `due` is `YYYY-MM-DD` or `null` on every task (`src/storage.js`) | No change. The new value is an ordinary valid due date. |
| Lock, atomic write, write guard, failure after save | `src/lock.js`, `src/storage.js` `writeList`, `bin/ttc.js`, `src/cli.js` | Used as-is. |
| Help | Usage lines from the registry (`src/commands/help.js`) | Must list the new usage line, at the position the convergence decision fixes. |
| Test oracle and fuzz generators | Independent statement of every rule with `today` as input (`test/support/*`) | Must know the new command, its usage line, its argument rules, its messages, and an independent calendar-day count; must generate valid and invalid days values. |
| Perf guard | 10,000-task timing of `list`, filtered `list`, `add` | Must keep passing; does not measure any per-id changing command today. |
| README | Usage, data format, exit codes | Must document the command. |

| Dependency | Direction (upstream/downstream) | Kind (internal/third-party/human) | Note |
| --- | --- | --- | --- |
| `tasks.json` written by older ttc (v1–3) | upstream | human/operational | Read and, on a postpone, rewritten as v4 (PD-0010 item 1, standing rule). |
| ttc installs that read v4 (since RCDEV-856) | downstream | human/operational | Read a file written by postpone with no change: no new field, no new version. |
| ttc installs older than v4 | downstream | human/operational | Already refuse a file after any change by v4 ttc (PD-0010 item 4); postpone adds nothing new. |
| System clock and `TZ` | upstream | human/operational | Decide "today"; the new date depends on it. |
| Scripts that parse `ttc list`, `stats`, CSV or JSON export | downstream | human/operational | Only the postponed task's due value changes, plus what follows from it: `!overdue`, `--overdue` and `--due-from/--due-to` membership, the `stats` overdue count. |
| Scripts that parse `ttc help` | downstream | human/operational | One new usage line. |
| CI `test` check (Node 24, Linux) | downstream gate | internal | Unit, fuzz and perf suites must pass (constraint 7). |
| Node 24 built-in date type | upstream | internal | Sufficient for calendar-day counting within its documented limits (`capability-scan.md` "Platform facts"); no third-party library (constraint 1). |

| Data crossing a boundary | Class | Regime note |
| --- | --- | --- |
| The new due date, inside `tasks.json` and JSON/CSV exports | personal (the user's own task data) | No regime beyond the existing owner-only file permissions (PD-0004 item 4); no network (constraint 3). |
| The confirmation line naming the task id and new date, on stdout | personal | Printed to the user's own terminal, as other confirmations are. |

### Option B — `ttc postpone <id>`

| System / component | Current responsibility (source) | What this option requires of it |
| --- | --- | --- |
| New postpone command | — (absent) | As in A with N fixed at 1 and exactly one positional. Must still refuse a task with no due date, and a task whose new date would be after `9999-12-31` (a task due `9999-12-31`). |
| Argument parser | As in A | Used as-is with one required positional; no new value rule. |
| Date rules and local today | As in A | As in A. |
| Calendar-day counting | As in A | As in A, for one day only (still crosses month, year and leap-day boundaries, and still meets the upper limit). |
| Stored list, read checks, serializer, export | As in A | No change. |
| Lock, atomic write, write guard, failure after save | As in A | Used as-is. |
| Help | As in A | Must list `ttc postpone <id>`, at the fixed position. |
| Test oracle and fuzz generators | As in A | As in A, without a days value. |
| Perf guard | As in A | As in A. |
| README | As in A | As in A. |

| Dependency | Direction (upstream/downstream) | Kind (internal/third-party/human) | Note |
| --- | --- | --- | --- |
| `tasks.json` written by older ttc (v1–3) | upstream | human/operational | As in A. |
| ttc installs that read v4 | downstream | human/operational | As in A. |
| ttc installs older than v4 | downstream | human/operational | As in A. |
| System clock and `TZ` | upstream | human/operational | As in A. |
| Scripts that parse `ttc list`, `stats`, CSV or JSON export | downstream | human/operational | As in A. |
| Scripts that parse `ttc help` | downstream | human/operational | As in A. |
| CI `test` check | downstream gate | internal | As in A. |
| Node 24 built-in date type | upstream | internal | As in A. |

| Data crossing a boundary | Class | Regime note |
| --- | --- | --- |
| The new due date, inside `tasks.json` and exports | personal | As in A. |
| The confirmation line on stdout | personal | As in A. |

## Not impacted

| System | Why a reader might expect it | Why it is not impacted |
| --- | --- | --- |
| Stored format version, validators, upgrade steps | "Does the format change?" | The new date is held in the existing `due` field, valid in every version; no new field, so no new version (PD-0010 item 1). Version stays 4. |
| Import | Data files | Import checks due dates as today; a postponed date is an ordinary valid date. |
| `ttc list` order | "The order does not change" | Order is important first, then ascending id (`src/commands/list.js:30`); the due date is not a sort key. |
| `ttc list` line format | New date shown | The `due:` token already shows whatever date is stored (PD-0003 item 8). |
| Filters and `stats` code | Their output can change | They read the stored due date as today; only their inputs change. |
| JSON and CSV export | Exports carry the date | Columns, keys and order unchanged; only the value differs. |
| `add`, `done`, `reopen`, `important`, `unimportant`, `rename`, `tag`, `note`, `delete` | "Nothing else about the task changes" | Each changes only its own field and writes through the shared serializer, which already carries `due`. |
| Write lock (`src/lock.js`) | A new changing command | Used as-is. |
| Atomic write and permissions | A new write | Used as-is through the shared write path. |
| Failure-after-save handling | A new confirmation line | Generic to every command. |
| Network, other users, other OS | — | None exist (constraints 3, 8; PD-0004 item 5). |
