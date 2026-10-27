---
initiative: INIT-0003
type: technical-assessment
title: Technical assessment — A task is postponed from the ttc command line in one short command
status: authoritative
revision: 1
owner_role: ROLE-planner
mode: PRODUCT-DISCOVERY
phase_at_assessment: SOLUTION_EXPLORATION
round: 1
assessed_on: 2026-10-27
created: 2026-10-27
updated: 2026-10-27
verdicts:
  - { option: A, verdict: feasible-with-constraints, band: contained }
  - { option: B, verdict: feasible-with-constraints, band: contained }
constraints: [C1, C2, C3, C4, C5, C6, C7, C8]
questions: []
updated_by_role: ROLE-planner
---

Mode: PRODUCT-DISCOVERY
Initiative: INIT-0003
Phase at assessment: SOLUTION_EXPLORATION
Assessed: 2026-10-27
Round: 1

Evidence: `capability-scan.md` and `impact.md` (this folder, same date), code
at head `c1e54fa`, `project/constraints.md` rows 1–9, PD-0003, PD-0004,
PD-0006, PD-0008, PD-0009, PD-0010, CAP-0001, `product/state.md` Ambiguity
log A1–A11.

## Verdicts

| Option | Requirements served | Verdict | Complexity band | One-line basis |
| --- | --- | --- | --- | --- |
| A — `ttc postpone <id> [<days>]` | REQ-0012 (O1–O3) | feasible-with-constraints | contained | Fits the existing changing-command pattern and the existing `due` field with no format change (C1); needs the date-limit refusal (C2), correct calendar counting (C3), new fixed text (C5) and a rule for the days value (C6). |
| B — `ttc postpone <id>` | REQ-0012 (O1–O3) | feasible-with-constraints | contained | Same as A without the days value: C1–C5, C7, C8 apply; C6 does not. B still needs the date-limit refusal (C2) for a task due `9999-12-31`. |

Band basis (`impact.md`): one system; no stored-format, schema or migration
change (C1); one new command over existing, unchanged seams (argument parser,
lock, write path, write guard, command registry, local today); the tests move
with it. The CLI surface grows by one command, as every earlier command did;
no existing contract changes. A is not a higher band than B: the days value
adds one argument rule, not a component.

Answers to the three points the dispatch asked to settle:

1. **Stored format.** No change. The existing `due` field carries the new
   date; `tasks.json` stays version 4 (C1).
2. **Date arithmetic.** Feasible with built-ins only, under C2 and C3. Month
   and year rollover and leap days are correct when days are counted on the
   calendar date; counting 24-hour periods in local time loses a day at the
   end of daylight saving; the latest storable date is `9999-12-31`, and the
   built-in date type does not stop there by itself. Option A needs no
   maximum of its own beyond the date limit, but needs a fixed rule for what
   a days value is (C6, P2).
3. **Inherited rules.** C4 (arguments, ids, lock, atomic write, refusals write
   nothing, failure after save, open and done tasks), C5 (fixed text through
   a new PD), C7 (oracle) and C8 (perf guard).

## Constraints

| # | Option | Constraint | permanent / initiative-local | Source | PD- candidate? |
| --- | --- | --- | --- | --- | --- |
| C1 | A, B | No stored-format change. The new date is held in the existing `due` field, which every format version holds as `YYYY-MM-DD` or `null`; no new field, so no new version under PD-0010 item 1. `tasks.json` stays version 4. A file written by postpone is read unchanged by every ttc that reads version 4. As for every changing command, postponing in a version 1–3 file writes it as version 4 (PD-0010 items 1, 4, already accepted). JSON and CSV exports change only in the postponed task's due value. | initiative-local | `src/storage.js` layout comment, `validateList`, `serializeList`; README "Data file format"; PD-0010 items 1, 4 | No — state it in the convergence PD so A11 is closed. |
| C2 | A, B | The latest due date ttc can store is `9999-12-31`: a due date has exactly four year digits (PD-0003 item 5; `isValidDate`), and the same check runs on read and import (PD-0004 item 8). A postpone whose new date would be later must be refused before anything is written. The built-in date type does not refuse it by itself: past `9999-12-31` it yields a five-digit year, and far enough out it fails with the runtime's own `Invalid time value` text. The write guard would stop a five-digit year from being stored, but with an internal message (`cannot write a list that is not valid: ...`), not product text. So the refusal and its message are product text. In B this reaches only a task due `9999-12-31`; in A it reaches any task once N is large enough. | permanent | `src/rules.js` `isValidDate`; `src/storage.js` `writeList`; `test/support/fuzz-gen.js` (`9999-12-31` and `10000-01-01` are generated); `capability-scan.md` "Platform facts" | Yes — "the latest due date is `9999-12-31`; a command that would set a later one refuses and changes nothing" binds every later date-setting command. Fold into the convergence PD. |
| C3 | A, B | The new date is (the later of the stored due date and today) + N calendar days, and must: count calendar days, not 24-hour periods, so it is the same in every time zone and across daylight-saving changes; roll months, years and leap days by the same Gregorian rule ttc's date check uses (so 2028-02-28 + 1 = 2028-02-29, 2100-02-28 + 1 = 2100-03-01); take "today" as the same local date the overdue rule uses (PD-0003 item 6). Comparing the two dates as `YYYY-MM-DD` text already gives date order. The built-in date type meets all of this when used on the calendar date; its known traps are 24-hour steps in local time and its 0–99 year mapping. | initiative-local | `src/overdue.js` `localToday`, `isOverdue`; `src/rules.js` `isValidDate` and its comment; `capability-scan.md` "Platform facts" | No — A9 already states "calendar days". |
| C4 | A, B | The command is a changing command and inherits, unchanged: exact arguments (an extra argument, or any argument starting `--`, is an error — the command has no options; PD-0003 item 2); id rules (digits, leading zeros, 1 to 9007199254740991, `invalid task id`, `no task with id`; PD-0004 item 2), the id printed without leading zeros; every argument check before the lock; the exclusive lock with its `busy` failure; atomic replace with owner-only permissions (PD-0004 items 3–4); each refusal (no such task, no due date, beyond the date limit) prints one stderr line, exits 1 and leaves `tasks.json` byte-identical (PD-0003 item 11, PD-0004 item 7); a failure after the save exits 1 and keeps the change (PD-0008); open and done tasks alike (as PD-0009 item 3). Every accepted postpone changes the date, so there is no no-op case and no no-op message. The existing changing-command pattern gives all of this by construction. | permanent | `src/args.js`, `src/lock.js`, `src/storage.js`, `src/commands/important.js`, `bin/ttc.js`, `src/cli.js`; PD-0003 items 2, 11; PD-0004 items 2–4, 7; PD-0008; PD-0009 item 3 | No — already decided. |
| C5 | A, B | PD-0003 is accepted and changed only by a new PD, and tests assert fixed text exactly. The convergence PD must fix: the success line (adds to item 10; e.g. `Postponed task <id> to <date>`), the no-due-date error text, the date-limit error text (C2), the usage line and its position in `ttc help` (item 12), and — for A — the invalid-days error text (C6). It should also state the effect on views (P4). | initiative-local | PD-0003 items 9–12 and its closing rule; PD-0009 items 3, 7 (precedent) | Yes — the convergence PD. |
| C6 | A | The days value is user-typed text. The parser passes every argument not starting `--` to the command as-is, so `-1`, `+3`, `0`, `1.5`, `3d`, `１` (full-width) and a 25-digit number all arrive as the days value and must each be accepted or refused by one stated rule; `--3` is already an unknown option. A plain number loses precision past 2^53 − 1, so the value must be read exactly, as ids are. Whether leading zeros are allowed (`007`) must be fixed. The largest useful N is bounded by C2 (2,912,143 on 2026-10-27, one less each day); a separate maximum is a product choice with no platform need. When the id and the days value are both invalid, which error shows is user-visible and must be fixed (the existing commands report arguments, then id, then the stored list). | initiative-local | `src/args.js` `parseArgs`, `parseId`; `capability-scan.md` "Platform facts"; `src/commands/important.js` check order | Folded into the C5 PD. |
| C7 | A, B | The CI `test` check gates on a test-owned oracle that restates every rule with `today` as an input and compares stdout and file bytes exactly; it hard-codes the usage list and the command set. The oracle must gain the command and its own calendar-day count, written from the PD text, not from the new code. The harness already tolerates a case that crosses local midnight, which a today-dependent result needs; no fake-clock seam exists, so tests run against the real date and set `TZ`, as the overdue tests do. Generated data already includes `9999-12-31`, leap days and year `0000`. | initiative-local | `test/support/ttc-model.js`, `fuzz-gen.js`, `fuzz-harness.js:144-192`; `test/overdue.test.js` | No |
| C8 | A, B | The perf guard (10,000 tasks, median < 500 ms) is not threatened: postpone has the shape of `important` (read, find one task, write), whose median on 10,000 tasks is 58.8 ms at head (local Node 26.11.1; CI Node 24 is the arbiter). The guard measures `list`, filtered `list` and `add` only, so as written it does not measure postpone. | initiative-local | `test/perf/add-list.perf.js`; `capability-scan.md` "Platform facts" | No |

## Architectural risks

| # | Option | Risk | What it threatens | What would resolve it |
| --- | --- | --- | --- | --- |
| R1 | A, B | Date counting done in local 24-hour steps, or through the built-in's 0–99 year mapping, gives a wrong date in some time zones or on some days, with no error. Because ttc's write guard checks dates before writing, an out-of-range result cannot damage `tasks.json`; a wrong but valid date can be stored. | O1 "due later than it was and not overdue" | C3, plus an oracle with its own calendar count checked across time zones, month and year ends, leap days and the date limit (C7). |
| R2 | A, B | The oracle is updated by reusing the new code's date counting, so the fuzz suite confirms whatever was built. | The ability to verify O1 and O2 | C7: the oracle's count is written from the PD text. |
| R3 | A | Id and days are both bare whole numbers, told apart only by position. `ttc postpone 7 3` meant as "task 3 by 7 days" is a valid command that moves task 7 instead. | O3 "every other task unchanged", in practice | A PM decision on P3. |
| R4 | A, B | "Today" comes from the clock and `TZ` of each process. Two commands run under different `TZ` settings can see dates up to two days apart, so a task postponed by 1 day can show `!overdue` at once in another time zone. | O1 "not overdue afterwards", in that case | Nothing in the platform; the PD-0003 item 6 local-date rule already accepts this. See P4. |
| R5 | B | Adding an optional days value later is additive: `ttc postpone <id>` keeps its meaning. B does not block A later. | A later "postpone by N" ask | Nothing now; recorded so a later A is costed as additive (same band). |

## Security / data / compliance implications

| Option | Data class | Implication | Source row in impact.md |
| --- | --- | --- | --- |
| A | personal | The new due date is part of the user's own task data, in the owner-only `tasks.json` and in exports the user places. No new data class, no network, no new permission rule. | Option A, "Data crossing a boundary", both rows |
| B | personal | As A. | Option B, "Data crossing a boundary", both rows |

## Product assumptions that conflict with the platform

| # | Assumption (and where stated) | Platform fact | blocking / narrowing / costly | Raised as |
| --- | --- | --- | --- | --- |
| P1 | "afterwards the task is due later than it was" for every task with a due date (initiative.md O1, success measure 2; REQ-0012 Requirement) | No due date after `9999-12-31` can be stored (C2). A task due `9999-12-31` cannot be postponed in either option; in A, any task cannot be postponed by an N that passes that date. A third refusal, besides "no task" and "no due date", is needed. | narrowing | Recommendation to the PM (below) — no `Q-` written: this dispatch's write list is the three technical files. |
| P2 | Option A: "an optional positive whole number of days" | The dispatch does not say whether leading zeros are allowed, what the largest value is, or what the error says; each is user-visible and test-asserted (C5, C6). | narrowing | Recommendation to the PM (below). |
| P3 | Option A: `ttc postpone <id> [<days>]` | Two bare whole numbers side by side are told apart only by position; a swapped pair is valid and changes the wrong task (R3). The confirmation line names the task and the new date, so the user sees the result. | narrowing | Recommendation to the PM (below). |
| P4 | "Nothing else about the task, the other tasks or the `ttc list` order changes" (initiative.md O3, out of scope "Any change to the output of `ttc list`, `ttc stats` or `ttc export` other than the postponed task's new due date"); "never overdue afterwards" | Holds for the order (the due date is not a sort key) and for every other field. But the new date also changes what follows from it: the task's `!overdue` token, whether it appears under `--overdue`, `--due-from` and `--due-to`, and the `stats` overdue count. "Not overdue afterwards" holds for the local date of the command and survives one midnight (a task due tomorrow is not overdue tomorrow); it does not hold across a `TZ` change (R4). | narrowing | Recommendation to the PM (below). |

No assumption was found `blocking`. Verified as holding: no format change
(C1); files written by older ttc keep working (read, then written as version
4, as for every changing command since PD-0010); the `ttc list` order is
unchanged; a done task can be postponed with the same rules as `ttc
important`; a postpone never has a no-op case (C4).

## Recommendations to the PM (not decided here)

- **P1 — the date limit.** (a) Refuse a postpone whose new date would be after
  `9999-12-31`, with one fixed error naming the limit, the same in A and B.
  (b) Clamp the new date to `9999-12-31`. *Recommend (a)*: (b) would let a
  task due `9999-12-31` "succeed" without moving, which contradicts O1, and
  it hides a typing mistake in A. Record C2 as a standing rule in the PD.
- **P2 — the days value (A only).** Use the id's shape: ASCII digits, leading
  zeros allowed, at least 1, read exactly; no separate maximum, because the
  date limit (P1) already bounds it. One fixed error for any other value
  (e.g. `ttc: invalid number of days: <arg>`). Alternative: a fixed maximum
  (a round number of years) with its own error — more text to learn, with no
  platform reason.
- **P3 — two bare numbers (A only).** (a) Accept: the confirmation line names
  the task, and "Keep it simple" favours the positional form. (b) Take the
  amount as an option with a value instead of a positional. *Recommend (a)*
  if A is chosen; B removes the risk entirely.
- **P4 — what "nothing else changes" means.** State in the PD that the
  postponed task's `!overdue`, its membership in `--overdue`, `--due-from` and
  `--due-to`, and the `stats` overdue count follow from its new date, and that
  "not overdue" is judged on the local date (PD-0003 item 6). This keeps a
  reviewer from reading those changes as a breach of O3.
- **Option choice, platform view only.** Both options are the same band. B is
  smaller in product text (no days rule, no invalid-days error, no R3) and
  can grow into A later at no extra cost (R5). The choice is the PM's.
- **Registry note.** CAP-0001 (`draft`) still says "Behavior today: None yet"
  and excludes priorities, notes, search and safe concurrent writes, all of
  which now exist (`capability-scan.md` CAP- reconciliation). Reported for the
  PM's registry upkeep, as in INIT-0002.

## Open questions raised

| Q- id | What it blocks |
| --- | --- |
| none | — |
