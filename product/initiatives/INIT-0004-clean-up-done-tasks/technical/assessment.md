---
initiative: INIT-0004
type: technical-assessment
title: Technical assessment — Finished tasks are cleaned out of the list in one short command
status: authoritative
revision: 1
owner_role: ROLE-planner
mode: PRODUCT-DISCOVERY
phase_at_assessment: SOLUTION_EXPLORATION
round: 1
assessed_on: 2026-10-28
created: 2026-10-28
updated: 2026-10-28
verdicts:
  - { option: A, verdict: feasible-with-constraints, band: contained }
  - { option: B, verdict: feasible-with-constraints, band: multi-component }
constraints: [C1, C2, C3, C4, C5, C6, C7, C8, C9]
questions: []
updated_by_role: ROLE-planner
---

Mode: PRODUCT-DISCOVERY
Initiative: INIT-0004
Phase at assessment: SOLUTION_EXPLORATION
Assessed: 2026-10-28
Round: 1

Evidence: `capability-scan.md` and `impact.md` (this folder, same date), code
at head `6a25069` (last `src/` change `56d7c10`), `project/constraints.md`
rows 1–9, PD-0003, PD-0004, PD-0008, PD-0010, PD-0011, CAP-0001, REQ-0013,
`initiative.md` rev 2, `product/state.md` Problem statement, Discovery and
Ambiguity log A1–A9.

## Verdicts

| Option | Requirements served | Verdict | Complexity band | One-line basis |
| --- | --- | --- | --- | --- |
| A — `ttc clean` removes every done task | REQ-0013 (O1–O3) | feasible-with-constraints | contained | One new command over existing, unchanged seams (no-argument parsing, lock, one atomic write, write guard, registry); no stored-format change; inherits the changing-command rules (C1) and id rule (C2); needs new fixed text (C3). |
| B — `ttc clean` removes done tasks finished more than 30 days ago | REQ-0013 (O1–O3) | feasible-with-constraints | multi-component | Everything in A, plus a new stored field, which forces format version 5 and a one-way upgrade for every user (C6, C7), changes to `done`, `reopen`, import and JSON export (C8), and a backwards calendar-day count the platform does not have (C9). |

Band basis (`impact.md`): one system in both options. A touches one new
command and the tests; no contract, schema or migration change. B adds a
stored-format change whose consumer is ttc itself (plus JSON export
readers), touching several components (format registry, `done`, `reopen`,
import, JSON export, oracle). This matches the band given to the format 4
change in INIT-0002 (`multi-component`); the one-way upgrade is the pattern
PD-0010 already accepted, not a new platform assumption, so B is not
`structural`.

Answers to the points the dispatch asked to settle:

1. **Stored format (A9).** A: no change, stays version 4. B: version 5 is
   unavoidable (C6) and the upgrade is one-way, triggered by any changing
   command, not only `clean` or `done`.
2. **Ids never reused, open tasks untouched, older files.** Hold in both
   options by construction (C1, C2). A file written by older ttc can be
   cleaned without error in both (success measure 5).
3. **Nothing to remove.** Feasible in both as a successful no-op that writes
   nothing: the file stays byte-identical, an older-version file keeps its
   version, and a missing `tasks.json` leaves no file or folder (C1).

## Constraints

| # | Option | Constraint | permanent / initiative-local | Source | PD- candidate? |
| --- | --- | --- | --- | --- | --- |
| C1 | A, B | Clean is a changing command and inherits, unchanged: exact arguments — no positional and no option, so any argument is an error and any `--x` an unknown option, checked before the lock (PD-0003 item 2); the exclusive lock with its `busy` failure; all qualifying tasks removed in one atomic write, so an interruption leaves the whole old list or the whole new list, never some tasks removed (constraint 5, PD-0004 item 3); owner-only permissions (PD-0004 item 4); a failure before the save writes nothing (PD-0003 item 11, PD-0004 item 7); a failure after the save exits 1 and keeps the removal (PD-0008). Nothing to remove writes nothing: the file stays byte-identical, a v1–v3 (in B, v1–v4) file is not upgraded (PD-0010 item 1), and a missing `tasks.json` leaves no file or data folder (the lock already removes a folder it created). | permanent | `src/args.js`, `src/lock.js` `withLock`/`release`, `src/storage.js` `writeList`, `src/commands/status.js` no-op, `bin/ttc.js`, `src/cli.js`; PD-0003 items 2, 11, 13; PD-0004 items 3, 4, 7; PD-0008; PD-0010 item 1 | No — already decided. |
| C2 | A, B | Ids are never reused because the next id is stored apart from the tasks and a removal leaves it as is, even when every task is removed (a list with no tasks and a next id above 1 is already valid). Clean must not lower or recompute it. | permanent | `src/commands/delete.js`; `src/storage.js` `validateList`; PD-0003 item 1 | No — already decided. |
| C3 | A, B | PD-0003 is changed only by a new PD, and tests assert fixed text exactly. The convergence PD must fix: the success line with the count (adds to item 10), its form for 1 task (precedent: `Exported <n> tasks` and `Imported <n> tasks` use one form for every n), the nothing-to-remove line (the same count line with 0, or its own line in item 9's style), the usage line and its position (item 12). | initiative-local | PD-0003 items 9, 10, 12 and its closing rule; PD-0011 items 4, 11 (precedent) | Yes — the convergence PD. |
| C4 | A, B | The CI `test` check gates on a test-owned oracle that restates every rule and hard-codes the usage list and the command set; the fuzz generator draws argv cases per command. Both must gain clean, written from the PD text, not from the new code. In B the oracle must also restate format 5 and its upgrade, the finish-date lifecycle, and its own 30-day count, and generated data must include v5 files with finish dates (past, today, after today, none); the 9 test files that state version 4 literally move to version 5. No fake clock exists: B's age tests write dated files directly and run against the real date with `TZ` set, as the overdue tests do. | initiative-local | `test/support/ttc-model.js` (lines 233–311 restate formats), `fuzz-gen.js`, `fuzz-harness.js`; `test/overdue.test.js`; `capability-scan.md` "Tests that state format 4 literally" | No |
| C5 | A, B | The perf guard (10,000 tasks, median < 500 ms) is not threatened: clean is one read, one pass over the tasks and at most one write, the shape of `delete`. The guard measures `list`, filtered `list` and `add` only, so as written it does not measure clean. | initiative-local | `test/perf/add-list.perf.js` | No |
| C6 | B | A stored finish date is a new stored field, so it requires format version 5 (PD-0010 item 1, a standing rule); a second file would break constraint 4, and a field without a new version would break the strict per-version check. Consequences, all fixed by the platform: every write and every JSON export becomes version 5 with the field on every task, from the first changing command of any kind after the upgrade, for every user, including one who never runs clean; the ttc shipped today (reads up to version 4) then refuses `tasks.json` and every new JSON export; import accepts versions 1–5; no command writes an older version. | permanent | `src/storage.js` `FORMATS`, `fileVersion`, `serializeList`; `src/commands/export.js`; PD-0010 items 1, 4; `project/constraints.md` row 4 | Yes — a format-5 PD in the shape of PD-0010. |
| C7 | B | The finish date's validity rule must be strict and identical for `tasks.json` and import files (PD-0004 item 8, PD-0010 item 2): present on every task in a v5 file; never on an open task; on a done task, a valid `YYYY-MM-DD` date or none. "Done with no date" must stay valid permanently, because tasks finished before the upgrade, and tasks imported from v1–v4 files, have no recoverable date. Whether a date after today is valid must be fixed; refusing it would make a file written under one `TZ` unreadable under another (R3). | permanent | `src/storage.js` `validateList`, `parseList`; `src/rules.js` `isValidDate`; PD-0004 item 8; PD-0010 item 2 | Yes — fold into the C6 PD. |
| C8 | B | The date's lifecycle touches commands outside clean: `ttc done` on an open task records the local date (PD-0003 item 6); `done` on a done task stays a no-op and keeps its date (PD-0003 item 9); `reopen` clears it; `add` creates a task with none; `import` takes it from the file; every other changing command keeps it. `done` is the only command that sets a task done today, so no other path needs it. JSON export carries the date (PD-0003 item 14: the export is the stored format, and export-then-import must give the same list); CSV, `list` and `stats` need not show it. | initiative-local | `src/commands/status.js`, `add.js`, `import.js`, `export.js`; `src/csv.js`; PD-0003 items 6, 9, 14 | Yes — fold into the convergence PD. |
| C9 | B | "Finished more than 30 days ago" must be counted in calendar days on the local date, the same in every time zone and across daylight saving, with month, year and leap-day rules. The platform can step one day forward only; it has no day difference and no step backwards (`capability-scan.md` "Calendar-day arithmetic": partial). The built-in date type's known traps (24-hour steps in local time, the 0–99 year mapping) apply as in INIT-0003 C3. The exact boundary (is a task finished exactly 30 days ago kept?) is product text (P4). | initiative-local | `src/rules.js` `nextDay`; `src/overdue.js` `localToday`; INIT-0003 `technical/assessment.md` C3 | No — the boundary goes in the convergence PD (P4). |

## Architectural risks

| # | Option | Risk | What it threatens | What would resolve it |
| --- | --- | --- | --- | --- |
| R1 | B | Every task already done when B ships has no finish date and counts as finished long ago, so the first clean after the upgrade removes all of them, including one finished yesterday. The same happens to every done task in any v1–v4 file imported later (an old export restored). Until a user's done tasks were all finished after the upgrade, B behaves like A. | J1 "tasks I finished ages ago" in B's first run; the difference between A and B | A PM decision on P2. |
| R2 | B | A finish date that becomes "none" (hand edit, a script, a damaged file) still passes the strict check (C7), so the task is silently treated as old and removed by the next clean. It is the one damage the strict check cannot catch. | "Only old tasks removed" | Nothing in the platform; accepted with C7, or documented in the README. |
| R3 | B | The recorded date comes from the clock and `TZ` of the `ttc done` process. A wrong clock makes a task look old (removed early) or new (kept); two `TZ` settings can disagree by a day, so a recorded date can be after today. | "Finished more than 30 days ago" | Nothing in the platform; PD-0003 item 6's local-date rule already accepts this. C7 must accept a date after today (P4). |
| R4 | B | The one-way upgrade is triggered by any changing command, not by clean: a user who upgrades and runs `ttc add` can no longer use the ttc shipped today on that file or its new exports (two machines sharing `$TTC_HOME`, a downgrade). | O3 for a user with two ttc versions | PM acceptance, as for format 4 (PD-0010 item 4, risk R2 of INIT-0002). |
| R5 | A, B | The oracle is updated by reusing the new code (B: its day count and v5 parsing), so the fuzz suite confirms whatever was built. | The ability to verify O1–O3 | C4: the oracle is written from the PD text. |
| R6 | A | Adding an age rule later changes what `ttc clean` does (it would remove fewer tasks), needs C6–C9 then, and has the same unknown dates for tasks finished before it ships (R1). The reverse, B now and "remove all" later, is additive. Choosing A forecloses nothing technical. | A later "only old tasks" ask | Nothing now; recorded so a later B is costed as `multi-component` plus a change to fixed behaviour. |

## Security / data / compliance implications

| Option | Data class | Implication | Source row in impact.md |
| --- | --- | --- | --- |
| A | personal | Removal is permanent: the platform keeps no undo, archive or previous copy; a user's own `ttc export` is the only copy. Less personal data is held afterwards. No network, no new permission rule. | Option A, "Data crossing a boundary", row 1 |
| B | personal | As A for removal. Adds a new personal datum (the date each task was finished) to `tasks.json` and to every JSON export; export files get default permissions where the user puts them, as today. No regime beyond the existing owner-only file. | Option B, "Data crossing a boundary", rows 1–2 |

## Product assumptions that conflict with the platform

| # | Assumption (and where it is stated) | Platform fact | Class (blocking/narrowing/costly) | Raised as |
| --- | --- | --- | --- | --- |
| P1 | "prints how many it removed"; "nothing-to-remove is a successful no-op" (dispatch; initiative.md scope; A7, A8) | The exact lines, the form for 1 task, and the usage line position are fixed, test-asserted text that PD-0003 does not hold (C3). | narrowing | Recommendation to the PM (below). |
| P2 | B: "tasks finished before the upgrade carry no date and count as finished long ago" against J1 "tasks I finished ages ago" (`product/state.md` Discovery) | No finish date exists before B ships (capability scan: absent). The first clean after the upgrade removes every task already done, however recent; so does a clean after importing any v1–v4 file (R1). | narrowing | Recommendation to the PM (below). |
| P3 | Out of scope "Showing when a task was finished" and "Any change to the output of ... `ttc export` other than the removed tasks no longer being there" (`initiative.md` rev 2) | Under B a JSON export is the stored format (PD-0003 item 14), so it shows the finish date of every done task, and its version and keys change for every user, even one who never runs clean (C6, C8). Both lines cannot hold as worded under B; they hold under A. CSV, `list` and `stats` can stay unchanged. | narrowing | Recommendation to the PM (below). |
| P4 | B: "finished more than 30 days ago" | The boundary day, the basis (local calendar date), and how a recorded date after today is treated are not stated, and each is test-asserted (C7, C9, R3). | narrowing | Recommendation to the PM (below). |
| P5 | B: "a stored-format change to version 5" (dispatch); O3 "data files written by older ttc" | O3 holds (v1–v4 are read). The reverse does not: after any change by new ttc, the ttc shipped today refuses the file and new JSON exports (C6, R4). | costly | Recommendation to the PM (below). |
| P6 | B: nothing to remove is a no-op that "says nothing was removed" (A8) | Under B, nothing is removed while recent done tasks remain, so the line says 0 while `ttc list --done` still shows tasks. | narrowing | Recommendation to the PM (below). |
| P7 | A: "removes every done task" against J1 "finished ages ago" | A also removes a task marked done a minute ago, and the platform has no undo or archive (capability scan: absent). The user's protection is `ttc list --done` and `ttc reopen` before cleaning, or `ttc export` (A3, A4). | narrowing | Recommendation to the PM (below); already weighed in A2. |

No assumption was found `blocking`. Verified as holding in both options: ids
are never reused (C2); open tasks, their ids and fields, and the order and
format of `ttc list` are unchanged; files written by older ttc are cleaned
without error (success measure 5); the removal is all-or-nothing (C1);
nothing to remove writes nothing and creates nothing (C1). In A, no format
change: the file stays version 4.

## Recommendations to the PM (not decided here)

- **P1 — fixed text.** One count line for every n, including 0, in the
  `Exported <n> tasks` / `Imported <n> tasks` style, so scripts read one
  shape and no second message is added. Alternative: a separate
  nothing-to-remove line in PD-0003 item 9's style. Place the usage line next
  to `ttc delete <id>`.
- **P2 — tasks done before the upgrade (B only).** (a) Accept and say so in
  the PD and README: the first clean after the upgrade removes every task
  already done. (b) The upgrade gives those tasks the upgrade date, so they go
  30 days later — this stores a date that is not when the task was finished
  and changes the option's stated rule. *Recommend (a)* if B is chosen; note
  that it makes B's first run identical to A.
- **P3 — scope wording (B only).** If B is chosen, amend the two out-of-scope
  lines to: the finish date is not shown by `list`, `stats` or CSV export;
  JSON export carries it, and its version changes.
- **P4 — the 30-day boundary (B only).** State it on the local calendar date
  with an example (e.g. today 2026-10-28: finished 2026-09-27 or earlier is
  removed, 2026-09-28 is kept, or the other way), and that a recorded date
  after today is valid and counts as recent.
- **P5 — one-way upgrade (B only).** Accept as for format 4 and restate it in
  a format-5 PD (C6, C7), or choose A, which needs no format change.
- **P6 — zero removed while done tasks remain (B only).** Decide whether the
  line says anything about the tasks kept. *Recommend* the plain count line
  (P1); a second line would add text to learn, against "Keep it simple".
- **P7 — A removes recent done tasks.** No platform remedy exists; a README
  caution pointing at `ttc export` and `ttc list --done` before cleaning
  costs nothing.
- **Option choice, platform view only.** A is `contained`, needs no format
  change and carries C1–C5. B is `multi-component`, carries C1–C9 and a
  one-way upgrade for every user, and its difference from A appears only from
  the second clean after the upgrade (R1). A later age rule stays possible
  after A (R6). The choice is the PM's.
- **Registry note.** CAP-0001 (`draft`) still says "Behavior today: None yet"
  and excludes priorities, notes, search and safe concurrent writes, all of
  which now exist, as does postpone (`capability-scan.md` CAP- reconciliation).
  Reported for the PM's registry upkeep, as in INIT-0002 and INIT-0003.

## Open questions raised

| Q- id | What it blocks |
| --- | --- |
| none | — |
