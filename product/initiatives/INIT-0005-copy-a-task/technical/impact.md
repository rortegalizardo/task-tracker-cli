---
initiative: INIT-0005
type: technical-assessment
title: System impact map — A new task is made from an existing one without retyping it
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
Mapped: 2026-10-29
Options mapped: A (`ttc copy <id>`, no other argument or option), B (`ttc copy <id> [--due YYYY-MM-DD]`)

Both options live in one system: the `ttc` CLI in `rortegalizardo/task-tracker-cli`
(head `fdf683d`). "System / component" rows are components of that one
program plus the stored file and the test suite that gates CI. Sources are in
`capability-scan.md`.

## Per option

### Option A — `ttc copy <id>`

| System / component | Current responsibility (source) | What this option requires of it |
| --- | --- | --- |
| New copy command | — (absent) | Must take exactly one `<id>` and no option; under one hold of the lock, must read the list, find the task, refuse when no id is left, and add one open task with the next id holding the original's title, due date (or none), tags, note (or none) and important mark, raising the next id by 1, in one write; must print one line giving the new id. A refusal writes nothing. |
| Argument parser and id rules | Positionals and options by name; id digits, leading zeros, 1 to the largest id (`src/args.js`) | Used as-is. |
| The original task and every other task | Held in the stored list | Must be unchanged in every field, including a done original's status (it stays done) and its mark. |
| Stored list, read checks, format versions, serializer | Format 4; v1–v3 read and rewritten as v4 by the next changing command (`src/storage.js`, PD-0010 item 1) | No change. The copy holds only fields format 4 already has, and they already passed the read check, so no new validity rule is needed. A list with one more task and a next id one higher is already valid. |
| Lock, atomic write, write guard, failure after save | `src/lock.js`, `src/storage.js`, `bin/ttc.js`, `src/cli.js` | Used as-is. The lock's cleanup must leave no data folder when `tasks.json` is missing (it already does). |
| `list`, `stats`, `export`, `import` | Show, count and copy whatever is stored | No change; their output gains the new task only, placed by its id and mark (PD-0009 item 4). |
| Help | Usage lines from the registry | Must list the new usage line at the position the convergence decision fixes. |
| Tests that assert the whole usage | `test/important.test.js`, `clean.test.js`, `postpone.test.js` | Must gain the new line, as they did for postpone and clean. |
| Test oracle and fuzz generators | Independent statement of every rule; hard-coded usage and command set (`test/support/ttc-model.js`, `fuzz-gen.js`) | Must know the new command, its argument rule, its line, its refusals and the id rule it shares with add, written from the PD text. |
| Perf guard | 10,000-task timing of `list`, filtered `list`, `add` | Must keep passing; copy has the cost shape of `add` (one read, one write). |
| README | Usage, data format, exit codes | Must document the command. |

| Dependency | Direction (upstream/downstream) | Kind (internal/third-party/human) | Note |
| --- | --- | --- | --- |
| `tasks.json` written by older ttc (v1–3) | upstream | human/operational | Read; copied tasks from v1–v2 carry no note and from v1–v3 no mark, because those files hold none; rewritten as v4 by a successful copy (PD-0010 items 1, 3, 4); left as-is by a refused copy. |
| ttc installs that read v4 (since RCDEV-856) | downstream | human/operational | Read a file holding a copy unchanged: no new field, no new version. |
| Installs older than v4 | downstream | human/operational | Refuse the file after a successful copy, as after any changing command since PD-0010; not new. |
| Scripts that parse `ttc list`, `stats`, CSV or JSON export | downstream | human/operational | One more task; formats and keys unchanged. |
| Scripts that parse `ttc help` | downstream | human/operational | One new usage line. |
| Scripts that parse changing-command output | downstream | human/operational | One new success line, whose text the convergence decision fixes. |
| CI `test` check (Node 24, Linux) | downstream gate | internal | Unit, fuzz and perf suites must pass (constraint 7). |

| Data crossing a boundary | Class | Regime note |
| --- | --- | --- |
| A second copy of one task's title, note, tags, due date and mark, inside `tasks.json` | personal (the user's own task data) | Same file, same owner-only permissions (PD-0004 item 4); no new datum, no network (constraint 3). |
| The confirmation line giving the new id, on stdout | none | Numbers and fixed words only; no title or note is printed. |

### Option B — `ttc copy <id> [--due YYYY-MM-DD]`

| System / component | Current responsibility (source) | What this option requires of it |
| --- | --- | --- |
| New copy command | — (absent) | As in A; with `--due`, the copy holds the given date instead of the original's, including when the original has none. The date must be checked before the lock with the rule `ttc add --due` uses; an invalid date is a refusal that writes nothing. |
| Argument parser and id rules | As in A | Used as-is: `--due` before or after the id, refused when given twice or with no value (PD-0003 item 2). |
| Date rule | `YYYY-MM-DD`, real Gregorian date, `0000-01-01` to `9999-12-31`, past allowed (`src/rules.js`, PD-0003 item 5) | Used as-is. PD-0011 item 6's limit holds because no later date passes the check. |
| The original task and every other task | As in A | As in A: the original keeps its own due date. |
| Stored list, read checks, format versions, serializer | As in A | No change: the given date goes into the existing due field. |
| Lock, atomic write, write guard, failure after save | As in A | Used as-is. |
| `list`, `stats`, `export`, `import` | As in A | As in A; what follows from the copy's due date (overdue token, `--overdue`, `--due-from`/`--due-to`, the `stats` overdue count) follows from the given one. |
| Help | As in A | As in A, with the option in the usage line. |
| Tests that assert the whole usage | As in A | As in A. |
| Test oracle and fuzz generators | As in A | As in A, plus `--due` argv cases: valid, invalid, past, `9999-12-31`, missing value, given twice, before and after the id, and on an original with and without a due date. |
| Perf guard | As in A | As in A. |
| README | As in A | As in A, plus the option and its date rule. |

| Dependency | Direction (upstream/downstream) | Kind (internal/third-party/human) | Note |
| --- | --- | --- | --- |
| `tasks.json` written by older ttc (v1–3) | upstream | human/operational | As in A. |
| ttc installs that read v4 | downstream | human/operational | As in A. |
| Installs older than v4 | downstream | human/operational | As in A. |
| Scripts that parse `ttc list`, `stats`, CSV or JSON export | downstream | human/operational | As in A. |
| Scripts that parse `ttc help` | downstream | human/operational | As in A. |
| Scripts that parse changing-command output | downstream | human/operational | As in A. |
| CI `test` check | downstream gate | internal | As in A. |
| System clock and `TZ` | upstream | human/operational | Only through what is already date-dependent (overdue); `--due` itself does not read the clock, since a past date is allowed. |

| Data crossing a boundary | Class | Regime note |
| --- | --- | --- |
| As in A | personal | As in A. |
| The confirmation line, on stdout | none | As in A. |

## Not impacted

| System | Why a reader might expect it | Why it is not impacted |
| --- | --- | --- |
| Stored format | "Does the format change?" (A9) | Both options use only fields format 4 holds; the version stays 4. A link to the original would need a new version (PD-0010 item 1), and it is out of scope. |
| Id allocation rule | "Ids never reused" | The copy takes the stored next id and raises it by 1, exactly as `add` does (`src/commands/add.js`). |
| Validation of the copied fields | "The copy might hold an invalid title or tag" | Every stored task passed the full read check (PD-0004 item 8), so its fields are valid for a new task; no new error message arises from them. |
| `ttc list` order and line format | "Nothing else changes" (O3) | Unchanged rules; the copy is placed by its id and mark like any task. |
| `ttc add` | The other creating command | Unchanged in both options. |
| `ttc postpone` and the other per-field commands | Used to adjust a copy afterwards | Unchanged; they act on the copy as on any task. |
| Write lock, atomic write, permissions, failure-after-save handling | A new changing command | Generic; used as-is. |
| Network, other users, other OS | — | None exist (constraints 3, 8; PD-0004 item 5). |
