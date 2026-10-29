---
initiative: INIT-0006
type: technical-assessment
title: System impact map — Tasks with no due date are listed on their own in one short command
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
Mapped: 2026-10-29
Options mapped: A (`--no-due` as a fifth status view of `ttc list`), B (`--no-due` as a filter of `ttc list`, like `--tag`)

Both options live in one system: the `ttc` CLI in `rortegalizardo/task-tracker-cli`
(head `53c39af`). "System / component" rows are components of that one
program plus the stored file and the test suite that gates CI. Sources are in
`capability-scan.md`. Rows marked "if export takes it" depend on narrowing
point N2 (`assessment.md`); the option set is shared today, so taking it is
the path of least change and keeping it out is a split.

## Per option

### Option A — `--no-due` as a status view

| System / component | Current responsibility (source) | What this option requires of it |
| --- | --- | --- |
| Shared filter (status views, checks, predicate) | Four mutually exclusive views, the AND rule, the checks before the read (`src/filter.js`) | Must accept a fifth view meaning "open and no due date", in the same at-most-one group, so any other view given with it is refused with the existing `options cannot be combined` message. Must leave the four existing views, and every combination valid today, selecting exactly the tasks they select today. With `--due-from`/`--due-to` it must either refuse or match nothing (N1). |
| `ttc list` | Reads, filters, orders, prints; never writes (`src/commands/list.js`) | No change in how it reads, orders or prints. `No tasks.` when nothing matches. |
| `ttc export` | Same option set, default view `--all`; writes stdout or the named file (`src/commands/export.js`) | If export takes it: `ttc export --no-due` selects open tasks with no due date (a view replaces the `--all` default, as `--overdue` does today), in JSON or CSV. If not: the option set must be split so export keeps today's set, and `ttc export --no-due` stays an unknown option. |
| Argument parser | Exact-name options (`src/args.js`) | Used as-is: `--no-due` is a no-value option; given twice is the existing `option given twice` error. |
| Stored list, read checks, format versions | Format 4; v1–v3 read and upgraded in memory only (`src/storage.js`, PD-0010 item 1) | No change. "No due date" is the existing empty due value, held by every task in every version. |
| Help | Usage lines from the registry (`src/commands/help.js`, `index.js`) | The `ttc list` line must show the fifth view; the `ttc export` line too if export takes it. |
| Tests that assert usage text | 9 unit files assert the exact list line, 5 the exact export line, 4 the whole usage (`capability-scan.md`) | Must gain the new line(s). |
| Test oracle and fuzz generators | Independent restatement of the filter and usage (`test/support/ttc-model.js`, `fuzz-gen.js`) | Must know the fifth view, its group membership, its predicate, any N1 rule, the new usage line(s), and (if export takes it) the export side, written from the PD text. |
| Perf guard | 10,000-task timing of list, filtered list, add (`test/perf/add-list.perf.js`) | Must keep passing; one more per-task test of an existing field. |
| README | "Listing and filtering tasks", "Exporting tasks" | Must document the view (and the export side if taken). |

| Dependency | Direction (upstream/downstream) | Kind (internal/third-party/human) | Note |
| --- | --- | --- | --- |
| `tasks.json` written by older ttc (v1–3) | upstream | human/operational | Read; every task's due value is present in every version; never rewritten by list (PD-0010 item 1) or export. |
| Missing `tasks.json` | upstream | human/operational | Read as an empty list: `No tasks.`, nothing created (PD-0003 item 13). |
| Scripts that parse `ttc help` | downstream | human/operational | The list line changes; the export line too if export takes it. |
| Scripts that run `ttc list` / `ttc export` with today's options | downstream | human/operational | Same output; the option is additive. |
| CI `test` check (Node 24, Linux) | downstream gate | internal | Unit, fuzz and perf suites must pass (constraint 7). |
| System clock and `TZ` | upstream | human/operational | Not read by this view: a task with no due date is never overdue (PD-0003 item 6). |

| Data crossing a boundary | Class | Regime note |
| --- | --- | --- |
| Lines of the user's own open tasks with no due date, on stdout | personal (the user's own task data) | Same lines `ttc list` prints today; no new datum, no network (constraint 3). |
| If export takes it: those tasks in a JSON or CSV export, to stdout or a file the user names | personal | Same as any filtered export today: default permissions on a named file (PD-0004 item 4). |

### Option B — `--no-due` as a filter

| System / component | Current responsibility (source) | What this option requires of it |
| --- | --- | --- |
| Shared filter (status views, checks, predicate) | As in A | Must accept one more AND filter, "no due date", that combines with every status view and the default. Must leave every combination valid today selecting exactly what it selects today. With `--due-from`/`--due-to`/`--overdue` it must either refuse or match nothing (N1). |
| `ttc list` | As in A | As in A; `ttc list --no-due` shows open tasks with no due date because the default view is `--open`; `--done --no-due` and `--all --no-due` show done / all ones. |
| `ttc export` | As in A | If export takes it: `ttc export --no-due` selects open **and** done tasks with no due date, because export's default view is `--all`; so the same option picks a different set in list and export without a view, exactly as `--tag` does today. If not: split, as in A. |
| Argument parser | As in A | As in A. |
| Stored list, read checks, format versions | As in A | As in A. |
| Help | As in A | The `ttc list` line must show the filter; the export line too if export takes it. |
| Tests that assert usage text | As in A | As in A. |
| Test oracle and fuzz generators | As in A | As in A, with the filter drawn with and without every view, including `--overdue`. |
| Perf guard | As in A | As in A. |
| README | As in A | As in A. |

| Dependency | Direction (upstream/downstream) | Kind (internal/third-party/human) | Note |
| --- | --- | --- | --- |
| `tasks.json` written by older ttc (v1–3) | upstream | human/operational | As in A. |
| Missing `tasks.json` | upstream | human/operational | As in A. |
| Scripts that parse `ttc help` | downstream | human/operational | As in A. |
| Scripts that run `ttc list` / `ttc export` with today's options | downstream | human/operational | As in A. |
| CI `test` check | downstream gate | internal | As in A. |
| System clock and `TZ` | upstream | human/operational | Only through `--overdue`, which never matches a task with no due date. |

| Data crossing a boundary | Class | Regime note |
| --- | --- | --- |
| Lines of the user's own tasks with no due date (open, done or all), on stdout | personal | As in A. |
| If export takes it: those tasks in a JSON or CSV export | personal | As in A. |

## Not impacted

| System | Why a reader might expect it | Why it is not impacted |
| --- | --- | --- |
| Stored format | "Does the format change?" | Both options read the existing due value only; no new field, so no new version (PD-0010 item 1). |
| Older data files | Success measure 5 | Both options only read; `ttc list` never writes, and export never writes `tasks.json`. |
| `ttc list` line format and order | O2 | Unchanged rules; the new selection feeds the same printing and ordering (PD-0003 item 8, PD-0009 items 4, 5). |
| `ttc list` with today's options | O3, success measure 4 | The option is additive; no existing view or filter changes what it selects. |
| `ttc stats` | "Count them too?" (A9) | Out of scope; it does not use the shared filter. |
| `ttc add`, `copy`, `postpone` and the changing commands | They set or move due dates | Unchanged; giving or clearing a due date is out of scope. |
| `ttc import` | Reads export files | Unchanged; a filtered JSON export was already a valid import file. |
| Write lock, atomic write, permissions | — | `ttc list` takes no lock and writes nothing; export's file write is unchanged. |
| Network, other users, other OS | — | None exist (constraints 3, 8; PD-0004 item 5). |
