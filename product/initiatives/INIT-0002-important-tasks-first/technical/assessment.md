---
initiative: INIT-0002
type: technical-assessment
title: Technical assessment — Important tasks are marked and listed first
status: authoritative
revision: 1
owner_role: ROLE-planner
mode: PRODUCT-DISCOVERY
phase_at_assessment: SOLUTION_EXPLORATION
round: 1
assessed_on: 2026-10-26
created: 2026-10-26
updated: 2026-10-26
verdicts:
  - { option: A, verdict: feasible-with-constraints, band: multi-component }
  - { option: B, verdict: feasible-with-constraints, band: multi-component }
constraints: [C1, C2, C3, C4, C5, C6, C7, C8]
questions: []
updated_by_role: ROLE-planner
---

Mode: PRODUCT-DISCOVERY
Initiative: INIT-0002
Phase at assessment: SOLUTION_EXPLORATION
Assessed: 2026-10-26
Round: 1

Evidence: `capability-scan.md` and `impact.md` (this folder, same date), code
at `main` head `9731f42`, `project/constraints.md` rows 1–9, PD-0003, PD-0004,
PD-0006, PD-0008, CAP-0001.

## Verdicts

| Option | Requirements served | Verdict | Complexity band | One-line basis |
| --- | --- | --- | --- | --- |
| A — one on/off important mark | REQ-0011 (O1–O3) | feasible-with-constraints | multi-component | Every part has an existing seam (format registry, changing-command pattern, list token, command registry); the mark needs a new stored format version (C1, C2) and amendments to fixed PD-0003 rules (C3). |
| B — three levels high/normal/low | REQ-0011 (O1–O3) | feasible-with-constraints | multi-component | Same seams and the same format change as A, plus a closed level vocabulary on an option and a command, and a no-op rule the option text does not define (C8). |

Band basis (`impact.md`): one system; several components (stored format,
read/import checks, serializer, `add`, a new command or two, `list`, help,
test oracle); a stored-format change whose one consumer is ttc itself. Not
`structural`: the upgrade is additive and lossless (every v1–3 task maps to a
v4 task with no mark / level normal), it runs through the existing, tested
upgrade seam that already took v1→v2→v3, and it changes no platform
assumption (single user, single file, consistency model).

## Constraints

| # | Option | Constraint | permanent / initiative-local | Source | PD- candidate? |
| --- | --- | --- | --- | --- | --- |
| C1 | A, B | ttc checks every stored and imported file against an exact key set per format version and refuses an unknown key or a newer version. A stored mark or level therefore requires a new format version (4). Files of versions 1–3 — as `tasks.json` and as `ttc import` files — are read with no task important (A) / every task normal (B). Read-only commands and no-ops leave such a file as it is; the next command that changes the list writes version 4. | permanent | `src/storage.js` `validateList`, `FORMATS`, `fileVersion`; README "Data file format"; precedent v2→v3 for notes (`docs/engineering-log.md`, RCDEV-841) | Yes — "a new stored field means a new format version; older versions are read and upgraded; a newer version is refused" is stated only in README and code, never in a PD, yet it decides what users of every later initiative see. |
| C2 | A, B | The upgrade is one-way for the user. Once new ttc has changed the list, an older ttc fails on every command with `ttc: cannot read <path>: it was written by a newer ttc (format version 4; this ttc reads up to version 3)`, and refuses to import any JSON export from new ttc (`invalid import file`). This holds even when no task is marked. No shipped command writes an older version. | initiative-local | `src/storage.js:161-174`; `src/commands/import.js`; README "Data file format" | No — but see conflict P1. |
| C3 | A, B | PD-0003 is accepted and is changed only by a new PD. The chosen option changes items 7 (list order: "ascending id"), 8 (line tokens), 9 and 10 (fixed no-op and success messages for the new command(s)), 12 (usage lines and their order) and 14 (the import checks list, which gains the mark/level check). These must be fixed in a PD before stories get acceptance criteria; tests assert fixed text exactly. | initiative-local | PD-0003 items 7–10, 12, 14 and its closing rule; PD-0004 item 8 | Yes — the convergence PD. |
| C4 | A, B | The new mark/level command(s) and the new `add` option are changing commands and inherit, unchanged: id rules (digits, leading zeros, 1 to 9007199254740991, `invalid task id`, `no task with id`; PD-0003 item 2, PD-0004 item 2); option rules (an option given twice is an error — only `--tag` repeats; an argument starting `--` is an option); every check before the lock; the exclusive write lock, with its `busy` failure after 10 s; atomic whole-file replace with owner-only permissions (PD-0004 items 3–4); a no-op writes nothing and leaves bytes and folder as they were (PD-0004 item 7); a failure after the save exits 1 and keeps the change (PD-0008). The existing changing-command pattern gives all of these by construction. | permanent | `src/args.js`, `src/lock.js`, `src/storage.js`, `src/commands/status.js`, `bin/ttc.js`; PD-0003 item 2; PD-0004 items 2–4, 7; PD-0008 | No — already decided. |
| C5 | A, B | One parse path serves `tasks.json` and import files (PD-0004 item 8). The mark/level must be checked strictly and identically in both, and never coerced or defaulted when present but invalid (as PD-0003 item 14 and PD-0006 item 1 rule for tags and titles); an invalid value is `cannot read <path>` or `invalid import file <file>`. "Exported then imported is the same list" (PD-0003 item 14) must include the mark/level, also for a filtered JSON export. | permanent | `src/storage.js` `parseList`; `src/commands/import.js`, `export.js`; PD-0003 item 14; PD-0004 item 8; PD-0006 item 1 | No — already decided. |
| C6 | A, B | The CI `test` check (constraint 7) gates on a test-owned oracle that restates every rule and compares stdout and file bytes exactly. It hard-codes format versions 1–3, their key sets, the v3 bytes, the usage list, the id-order sort and the line tokens; eight unit test files assert version-3 output. The oracle and those tests must move with the change, and the oracle must be written from the PD text, not from the new code. | initiative-local | `test/support/ttc-model.js`, `fuzz-gen.js`; `test/fuzz-args.test.js`, `fuzz-data.test.js`; capability-scan row "Tests asserting format-3 bytes" | No |
| C7 | A, B | The perf guard (10,000 tasks, median < 500 ms) is not threatened: medians at head are 65–90 ms (local Node 26.11.1; CI on Node 24 is the arbiter), and ordering by group then id is the same cost class as today's sort. Its fixture holds no marked task, so as written it does not exercise the new ordering or the larger stored file. | initiative-local | `test/perf/add-list.perf.js`; run of `npm run test:perf` at `9731f42` | No |
| C8 | B | The level is user-typed text on an `add` option and on a command positional. The parser takes both as-is (a missing value or a value starting `--` is an error), so the closed set, its spelling and its letter case are fixed user-visible text (compare `--format json|csv`, case-sensitive). `normal` is both the default and the only way to clear a level, and setting the level a task already has is a no-op that must not write — its message is not defined by the option text. | initiative-local | `src/args.js`; `src/commands/export.js` (`--format` rule); PD-0003 items 9–10 | Folded into the C3 PD. |

## Architectural risks

| # | Option | Risk | What it threatens | What would resolve it |
| --- | --- | --- | --- | --- |
| R1 | A, B | The stored task shape is listed explicitly in several places (validator key set per version, canonical serializer, upgrade step, the oracle's checker and serializer). A missed place drops or refuses the mark silently on some path, e.g. on every write by `rename` or `tag`. | O3 "the mark survives the other commands and an export/import round trip" | Oracle-driven coverage of every changing command and of export→import on lists that hold marked tasks (C6). |
| R2 | A, B | The one-way upgrade (C2) strands a user who runs two ttc versions on one file — two machines on a synced `$TTC_HOME`, or a downgrade — after one change, with no task marked. | O3 "nothing else changes", if the PM reads it to include downgrade | A PM decision on P1. |
| R3 | A, B | The oracle is updated from the new implementation instead of from the PD, so the fuzz suite confirms whatever was built. | The ability to verify O2 "every view and every filter" | C6: the oracle is written from the PD text. |
| R4 | A | Moving later from one mark to levels needs another format version and an upgrade rule (important → a level, the rest → another). The mapping is lossless, so A does not block B later. | A future levels initiative | Nothing now; recorded so a later B is costed as additive. |

## Security / data / compliance implications

| Option | Data class | Implication | Source row in impact.md |
| --- | --- | --- | --- |
| A | personal | The mark is part of the user's own task data. It lives in the owner-only `tasks.json` and in exports the user places; no new data class, no network, no new permission rule. | Option A, "Data crossing a boundary", both rows |
| B | personal | As A, for the level. | Option B, "Data crossing a boundary", both rows |

## Product assumptions that conflict with the platform

| # | Assumption (and where stated) | Platform fact | blocking / narrowing / costly | Raised as |
| --- | --- | --- | --- | --- |
| P1 | "Keep everything else as it is today" (initiative.md O3), with "data files written by older ttc keep working" | True for older files read by new ttc. Not true in the other direction: after new ttc's first change, `tasks.json` and every new JSON export are refused by older ttc, and JSON export bytes differ from today's (version 4, plus the mark/level as stored) even with no task marked (C1, C2). `list` output with no marked task stays byte-identical. | narrowing | Recommendation to the PM (below) — no `Q-` written: this dispatch's write list is the three technical files. |
| P2 | Option B: "`ttc priority <id> <level>`" with "same ... rules as A" (dispatch text for B) | Option B defines no success message and no no-op message for setting the level a task already has; PD-0003 items 9–10 require both as fixed text, and a no-op must not write (C4, C8). | narrowing | Recommendation to the PM (below). |
| P3 | "an important task's line gets a `!important` token" (Option A; `!high` / `!low` in B) | A title may contain any text, including `!important` (`src/rules.js` allows `!`), so an unmarked task titled `Call mom !important` prints the same line as a marked task titled `Call mom`. The same holds today for `!overdue` and `due:` in a title. | narrowing | Noted; accept the existing precedent unless the PM wants otherwise. |

No assumption was found `blocking`. Verified as holding: a list with no marked
task (A) / no high or low task (B) prints exactly today's output, because
grouping then ascending id equals ascending id when there is one group; CSV
columns, JSON export order and `stats` need no change (`impact.md` "Not
impacted").

## Recommendations to the PM (not decided here)

- **P1 — downgrade after upgrade.** (a) Accept the one-way upgrade and say so
  in the decision and the README, as format 3 did for notes. (b) Keep writing
  format 3 while no task is marked, and write format 4 only once one is —
  older ttc keeps working until the first mark, at the cost of two written
  shapes and a harder-to-explain rule. *Recommend (a)*: it matches the
  precedent and the README's existing rule, and C1 is a PD candidate either way.
- **P2 — Option B messages.** If B is chosen, the decision must fix the
  success line for `ttc priority`, the no-op line for an unchanged level, and
  the case rule for level values.
- **Scope note, not a platform finding.** Option B contradicts the
  initiative's own out-of-scope item "More than one level of importance" and
  Ambiguity A1's resolution ("Keep it simple"). Choosing B means revising
  `initiative.md` first. The platform cost of B over A is small (same band).
- **Registry note.** CAP-0001 (`draft`) lists "No safe concurrent writes" in
  its Boundaries, and PD-0003 item 16 puts concurrent writes out of scope, but
  the platform now has an exclusive write lock with a `busy` failure
  (`src/lock.js`, README "Exit codes"). Reported for the PM's registry upkeep.

## Open questions raised

| Q- id | What it blocks |
| --- | --- |
| none | — |
