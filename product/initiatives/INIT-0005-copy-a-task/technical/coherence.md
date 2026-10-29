Verdict: coherent
Initiative: INIT-0005
Story set reviewed: REQ-0014 (revision 2, draft)
Authorising decision: PD-0013
Assessment round relied on: 1
Reviewed: 2026-10-29
Mode: PRODUCT-DISCOVERY — story-set-technical-coherence, full pass, round 1 of 2

Evidence: `technical/assessment.md`, `impact.md`, `capability-scan.md` (round 1,
code at `fdf683d`); REQ-0014 rev 2; PD-0013 (accepted); `initiative.md` (out of
scope). Provenance: INIT-0005 DECOMPOSITION, head `927176e`. No change to
`src/`, `bin/`, `test/` or `README.md` between `7f4bddf` (the base the
Sequencing note names: RCDEV-858, INIT-0004 merged) and head; the last `src/`
change is still `452450b`, so the capability scan holds.

Checked against the real CLI at head (scratch `$TTC_HOME`; `ttc add` stood in
for the copy where the stored result is the same):

- `ttc copy 1` today gives `ttc: unknown command: copy (see ttc help)`, exit 1.
  No test or README line uses `copy` as a command, and the fuzz unknown-name
  list does not hold it, so the new command collides with nothing.
- AC-1, AC-2: the setup commands succeed as written. `ttc export before.json`
  (default view `--all`) gives `version` 4, `nextId` 3 and both tasks in stored
  order, tags stored as typed (`["home","bills"]`), the key order of AC-1's
  expected task. A third task with those fields lists as
  `#3 [ ] Pay rent due:2099-10-01 !important +bills +home` above
  `#2 [ ] Buy milk`; done task 1 is hidden by the default `--open` view.
- AC-3, AC-4, AC-5: an open task due `2020-01-01` lists with `!overdue`, one due
  `2099-11-01` without it; `--all` and `--overdue` give the stated lines and
  order (by id, none important).
- AC-6: after `ttc delete 3`, task 2 still exists, `002` parses as id 2, and the
  next id stays 4, so `Copied task 2 as task 4` then `Added task 5` hold.
- AC-7: the fixture is a valid list (`nextId` 2^53 is the stored maximum);
  `ttc add` on it gives `ttc: no task id is left`, exit 1, file unchanged. Task
  1 exists, so the lookup passes and the id limit is the reported refusal, as
  PD-0013 item 6 orders them.
- AC-8, AC-9: the parser gives `missing argument: <id>`,
  `unexpected argument: 2`, `unknown option: --tag`,
  `option needs a value: --due`, `option given twice: --due`, each before the
  lock; `invalid date: 2026-02-30` and `invalid task id: abc` are the existing
  texts. Argument, id and date checks all run before the lock, so AC-9's two
  combined cases (`abc` with a bad date → id error; `9` with a bad date → date
  error) follow PD-0013 item 6 and are reachable.
- AC-10: a changing command on a missing `$TTC_HOME` reports
  `ttc: no task with id 1` (a missing file reads as an empty list) and leaves
  no folder; the lock removes every folder it made.
- AC-11: `not json` gives `ttc: cannot read <path>: not valid JSON`, exit 1.
- AC-12: the v3 fixture is valid; a refusal (`ttc done 5`) leaves it
  byte-identical; a successful change writes `"version": 4`, and the export
  then holds `important: false` on the old task and `nextId` 3.
- AC-13: today's usage is AC-13's list without the `copy` line; help order is
  registry order, so the line can sit between `add` and `list`.
- AC-15 / C6 / C7: the CI `test` job runs lint, the unit tests (fuzz included)
  and the perf guard. The oracle's hard-coded usage is compared with
  `ttc help` output, and three unit tests assert the whole usage, so CI fails
  until those learn the new line. The rest of C6 (the oracle's own copy rule
  and the `--due` argv cases) binds through the story's Technical constraints,
  as in REQ-0012 and REQ-0013. C7 is covered because `npm test` and CI run the
  perf guard.

## Per-story checks
| REQ- id | Independently verifiable? | Sequencing note consistent? | Assumed capability | Result |
| --- | --- | --- | --- | --- |
| REQ-0014 | Yes. It is the only story, and every AC runs against this story's build alone. | Yes. `depends_on: [none]`; it builds only on shipped commands (`7f4bddf` holds INIT-0001 to INIT-0004, code unchanged since). In `impact.md` (option B), the upstreams (v1–3 files, clock/`TZ`) need no change; the downstreams (v4 readers, scripts that parse output or help, the CI gate) are only fed by this story. | Making a task from another task is `absent`, and this story creates it. Everything else it relies on is `exists`: making a task with the next id and the id-limit refusal, the five stored fields, read-time validation, id argument rules, option parsing with a date value, the date rule and its `9999-12-31` limit, the changing-command pattern, the lock and its folder cleanup, the atomic write, failure after save, list order, help from the registry, format upgrade on write, the oracle and fuzz harness (C6), the perf guard (C7). The one `partial` row (setting a due date on an existing task) is not assumed: `--due` sets only the new task's date at creation, as `add` does (C9). | pass |

Verdict drift (rule 5): none. The story is option B as PD-0013 fixes it:

- one command, `ttc copy <id> [--due YYYY-MM-DD]`, one id, at most one `--due`
  before or after it (items 2, 3; AC-3, AC-8);
- the copy holds title, due date, tags, note and mark as stored, is open, gets
  the next id; the original and every other task are unchanged (items 1, 5, 8;
  AC-1, AC-2, AC-6, AC-12);
- `--due` replaces the date or gives one to an undated original, under the
  `ttc add --due` rule, and cannot remove one (items 3; C8, C9; AC-3, AC-5,
  AC-9, Behavior);
- the success line, id-limit refusal and check order (items 4–6; AC-6 to
  AC-12);
- no format change; a v1–3 file is written as v4 only by a successful copy
  (item 10; AC-12);
- help line position and README content (items 11–13; AC-13, AC-14).

No AC implies work outside the option B rows of `impact.md`. No AC touches
anything `initiative.md` lists as out of scope (no several-task copy, no field
options other than `--due`, no date removal, no origin link, no other output
change). Every PD-0013 item and C1–C9 is covered by an AC or a Behavior bullet;
items 7 and 9 (shared lock/write rules; `ttc stats`) and the v1–2 case of
item 10 by Behavior only, which follows the precedent of the earlier stories.

## Defects
| # | REQ- id | Check failed | Blocking? | Disposition | Resolvable in decomposition? | Note |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | REQ-0014 (AC-15, C6, C8) | coverage of a C-constraint by an AC | no | open | yes | No AC names C6's oracle and fuzz work, and no AC exercises C8's edge dates for `--due` (a past date is only tested as the original's date, not as a `--due` value; `9999-12-31` accepted and `10000-01-01` refused are not tested). CI already forces the usage parts of C6 (see Evidence). The rest is stated word for word in the story's Technical constraints and `constraints:`, which bind the build. Adding a clause to AC-15 (the oracle and fuzz cover `copy` and its `--due` cases) or one `--due` edge-date case to AC-9 would make it checkable from the ACs alone. Nothing built changes either way. |

## Questions raised
| Q- id | What it blocks |
| --- | --- |
| none | — |
