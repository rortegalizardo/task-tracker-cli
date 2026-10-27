---
initiative: INIT-0002
type: technical-assessment
title: System impact map — Important tasks are marked and listed first
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
Mapped: 2026-10-26
Options mapped: A (one on/off important mark), B (three levels high/normal/low)

Both options live in one system: the `ttc` CLI in `rortegalizardo/task-tracker-cli`
(head `9731f42`). "System / component" rows below are components of that one
program plus the stored file and the test suite that gates CI. Sources are in
`capability-scan.md`.

## Per option

### Option A — one on/off "important" mark

| System / component | Current responsibility (source) | What this option requires of it |
| --- | --- | --- |
| Stored list format | Strict, versioned task shape (v1–v3); refuses unknown keys and newer versions (`src/storage.js`) | Must hold one more per-task fact, under a new format version; must read v1–3 files as "no task important"; must still refuse a file newer than itself. |
| Read and import checks (one parse path) | Same checks on `tasks.json` and import files (`src/storage.js` `parseList`; PD-0004 item 8) | Must check the mark strictly, identically on read and import, never changing a value it is given. |
| Canonical write and JSON export | One serializer for every write and JSON export (`src/storage.js`) | Must carry the mark on every write and every JSON export, so it survives every other command and a round trip. |
| `add` | Creates a task from title and options (`src/commands/add.js`) | Must accept a value-less option that creates the task already marked. |
| New mark / unmark commands | — (absent) | Must set and clear the mark on an existing task, with the existing id rules, lock, atomic write, no-op-without-write and failure-after-save rules. |
| `list` ordering and line | Filters, then ascending id; fixed line format (`src/commands/list.js`, PD-0003 items 7–8) | Must order marked before unmarked inside whatever the view and filters keep, ascending id inside each group; must add one token to a marked task's line. |
| Help | Usage lines from the command registry (`src/commands/help.js`, PD-0003 item 12) | Must list the new usage. |
| Test oracle and fuzz generators | Independent statement of every rule; byte-exact comparison (`test/support/*`) | Must know the new version, the mark, the new commands and option, the order and the token, and generate valid and damaged v4 files. |
| Unit tests on format-3 bytes | 8 test files assert version 3 output | Must reflect the new written version. |
| Perf guard | 10,000-task timing of `list`, filtered `list`, `add` (`test/perf/add-list.perf.js`) | Must keep passing; as written it holds no marked task. |

| Dependency | Direction (upstream/downstream) | Kind (internal/third-party/human) | Note |
| --- | --- | --- | --- |
| `tasks.json` written by older ttc (v1–3) | upstream (input to new ttc) | human/operational | Read as "no task important"; upgraded on the next changing command. |
| Older ttc installs reading a file or export written by new ttc | downstream | human/operational | Refused as "written by a newer ttc" once the file is v4 — even with no task marked. |
| JSON export files kept as backups | downstream | human/operational | New exports are v4; restorable only by new ttc. |
| Scripts that parse `ttc list` stdout | downstream | human/operational | Order and line text change only when at least one shown task is marked. |
| Scripts that parse CSV export or `stats` | downstream | human/operational | Unchanged. |
| CI `test` check (Node 24, Linux) | downstream gate | internal | Unit, fuzz and perf suites must pass (constraint 7). |
| Node 24 built-ins | upstream | internal | No new capability needed. |

| Data crossing a boundary | Class | Regime note |
| --- | --- | --- |
| The mark, inside `tasks.json` and JSON exports | personal (part of the user's own task data) | No regime beyond the existing owner-only file permissions (PD-0004 item 4); no network (constraint 3). |
| The mark token on `list` stdout | personal | Printed to the user's own terminal, as today. |

### Option B — three levels (high / normal / low)

| System / component | Current responsibility (source) | What this option requires of it |
| --- | --- | --- |
| Stored list format | As in A | Must hold one per-task level from a closed set of three, under a new format version; must read v1–3 files as "every task normal"; must refuse newer files. |
| Read and import checks | As in A | Must refuse any level outside the closed set, identically on read and import, never changing a value. |
| Canonical write and JSON export | As in A | Must carry the level on every write and JSON export. |
| `add` | As in A | Must accept an option that takes a level value, check it against the closed set, default to normal. |
| New set-level command | — (absent) | Must take an id and a level; must define a no-op (same level) that does not write; existing id, lock, atomic-write and failure-after-save rules. |
| `list` ordering and line | As in A | Must order high, normal, low inside whatever the view and filters keep, ascending id inside each level; must add a token for high and for low, none for normal. |
| Help | As in A | Must list the new usage. |
| Test oracle and fuzz generators | As in A | As in A, plus level values (valid and invalid) in argument and data generation. |
| Unit tests on format-3 bytes | As in A | As in A. |
| Perf guard | As in A | As in A. |

| Dependency | Direction (upstream/downstream) | Kind (internal/third-party/human) | Note |
| --- | --- | --- | --- |
| `tasks.json` written by older ttc (v1–3) | upstream | human/operational | Read as "every task normal"; upgraded on the next changing command. |
| Older ttc installs reading new files or exports | downstream | human/operational | Refused once v4, as in A. |
| JSON export files kept as backups | downstream | human/operational | As in A. |
| Scripts that parse `ttc list` stdout | downstream | human/operational | Change only when a shown task is high or low. |
| Scripts that parse CSV export or `stats` | downstream | human/operational | Unchanged. |
| CI `test` check | downstream gate | internal | As in A. |
| Node 24 built-ins | upstream | internal | No new capability needed. |

| Data crossing a boundary | Class | Regime note |
| --- | --- | --- |
| The level, inside `tasks.json` and JSON exports | personal | As in A. |
| The level token on `list` stdout | personal | As in A. |

## Not impacted

| System | Why a reader might expect it | Why it is not impacted |
| --- | --- | --- |
| CSV export | Export "carries the mark" | CSV picks its columns by name and sorts by id (`src/csv.js`); both options keep its columns and order (initiative out of scope). |
| `ttc stats` | Counts per task property | Counts open/done/overdue only (`src/commands/stats.js`); out of scope. |
| JSON export order | List order changes | Export keeps stored order, independent of `list` sorting (`src/commands/export.js`). |
| Filters (`src/filter.js`) | "Every view and filter" | Filters choose which tasks show; ordering is applied after them. No filter on the mark is in scope. |
| `done`, `reopen`, `rename`, `tag`, `note`, `delete` | "Survives every other command" | They change one field of a task in place and write through the shared serializer; they need no change of their own, provided the serializer carries the new field. |
| Write lock (`src/lock.js`) | New changing commands | Used as-is by any changing command; no change to the lock. |
| Atomic write and permissions | New writes | Used as-is through the shared write path. |
| Failure-after-save handling (`bin/ttc.js`, `src/cli.js`) | New changing commands | Generic to every command. |
| `ttc note` output | Shows a task | Prints only the note; showing the mark there is out of scope. |
| Network, other users, other OS | — | None exist (constraints 3, 8; PD-0004 item 5). |
