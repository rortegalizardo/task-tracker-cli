Verdict: coherent
Initiative: INIT-0003
Story set reviewed: REQ-0012 (revision 2, draft)
Authorising decision: PD-0011
Assessment round relied on: 1
Reviewed: 2026-10-27
Mode: PRODUCT-DISCOVERY — story-set-technical-coherence, full pass, round 1 of 2

Evidence: `technical/assessment.md`, `impact.md`, `capability-scan.md` (round 1,
code at `c1e54fa`); REQ-0012 rev 2; PD-0011; `initiative.md` rev 3; the raw
request (`product/sources/2026-10-27-requester-request.md`). Provenance:
INIT-0003 DECOMPOSITION, head `b47e19a`. No change to `src/`, `bin/`, `test/`
or `README.md` between `c1e54fa` and `b47e19a`, so the capability scan still
holds. `ae4417c`, which the Sequencing note names, contains RCDEV-856
(`7e82f51`, the important mark and format 4).

Checked against the real CLI at `b47e19a` (run in a scratch `$TTC_HOME`):

- `ttc help` prints `Usage:` and fourteen two-space-indented lines. AC-12 is
  exactly those lines, with `ttc postpone <id>` between `ttc unimportant <id>`
  and `ttc rename <id> "<title>"` (PD-0011 item 11).
- `add --due 2000-01-01` and `add --due 9999-12-31` are accepted, so AC-2 and
  AC-8 can be set up. The list lines match AC-2, AC-5 and AC-6:
  `#1 [ ] Pay rent due:2000-01-01 !overdue`; a done task is shown as `[x]` with no
  `!overdue`; tokens come in the order `due:` `!important` `+tag`; the note is
  not shown.
- The id and argument messages match AC-9 and AC-10: `invalid task id: abc`,
  `no task with id 7`, `missing argument: <id>`, `unexpected argument: 2`,
  `unknown option: --days`. Each is one `ttc: ` stderr line, exit 1.
- The JSON export is deterministic: two exports of the same list are
  byte-identical, with no timestamp. So the "identical except the due date"
  check in AC-6 works.
- `README.md` at `3dbf454` documents format 3 as
  `{ "version": 3, "nextId", "tasks": [ { "id", "title", "status", "due", "tags", "note" } ] }`.
  AC-11's fixture can be built from it.
- The date arithmetic follows the Gregorian rule: 2099-12-30+1 = 2099-12-31;
  2099-12-31+1 = 2100-01-01; 2096-02-28+1 = 2096-02-29 (divisible by 4, not
  by 100); 2099-02-28+1 = 2099-03-01; 2100-02-28+1 = 2100-03-01 (divisible
  by 100, not by 400).
- The criteria that depend on today (AC-2, AC-3) can be checked. They define
  T as the local date where the commands run, and C7 says to test against the
  real date with `TZ` set, as `test/overdue.test.js` does. The fuzz harness
  already accepts either date when a run crosses midnight
  (`fuzz-harness.js:144-192`). AC-2 still holds if midnight passes between
  the postpone and the `list`: a task due today is not overdue.
- C8 (the perf guard) is covered by AC-14. The CI `test` job runs
  `npm run test:perf` after `test:unit` (`.github/workflows/ci.yml`).

## Per-story checks
| REQ- id | Independently verifiable? | Sequencing note consistent? | Assumed capability | Result |
| --- | --- | --- | --- | --- |
| REQ-0012 | Yes. It is the only story, and every AC runs against this story's build alone. | Yes. `depends_on: [none]`, and it builds only on shipped commands (`ae4417c` includes INIT-0001 and INIT-0002). In `impact.md` (option B), the upstreams (v1–3 files, the clock and `TZ`, Node 24's date type) need no change. The downstreams (v4 readers, scripts that parse the output, the CI gate) are only fed by this story. | The due-date change command is `absent`, and this story creates it. Calendar-day counting is `absent` in `src/`, and this story creates it under C3 (AC-1, AC-4). The date-limit refusal is not in the platform: the write guard gives only internal text. This story creates it (AC-8, C2). The oracle hard-codes the usage list and the command set, and C7 covers that. Everything else is `exists`: stored `due`, date validity, local today, the overdue rule, list order, filters and stats, the changing-command pattern, the argument parser, the id parser, the lock, atomic write, failure after save, the help registry, format upgrade, the perf guard and the TZ-controlled tests. The story assumes nothing it does not create. | pass |

Verdict drift (rule 5): none. The story is option B as PD-0011 fixes it:

- one command, `ttc postpone <id>`, with no days value; AC-10 refuses `--days 2`;
- the new date is one calendar day after the later of the due date and today;
- the success line, the two refusals and the check order are as PD-0011
  states them;
- open and done tasks are both accepted;
- there is no format change, and a v1–3 file is written as v4;
- the help line sits where PD-0011 puts it, and the README is updated.

No AC implies work outside the Option B rows of `impact.md`. No AC touches
anything `initiative.md` lists as out of scope.

## Defects
| # | REQ- id | Check failed | Blocking? | Disposition | Resolvable in decomposition? | Note |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | REQ-0012 (AC-1) | scope-excess | no | open | yes | Drop the clause "then `ttc postpone 1` again → stdout is the single line `Postponed task 1 to 2100-01-01`". It is the same step as AC-4 task 3 (2099-12-31 → 2100-01-01). A second postpone is not a separate rule: there is no no-op case, so every postpone follows the same rule (PD-0011 item 4). |
| 2 | REQ-0012 (AC-2) | scope-excess | no | open | yes | Drop the first `ttc list` clause, the one that prints `#1 [ ] Pay rent due:2000-01-01 !overdue` before the postpone. It tests the existing overdue rule (PD-0003 item 6), which `test/overdue.test.js` already covers. The checks after the postpone (`due:<T+1>` with no `!overdue`, and `--overdue` printing `No tasks.`) are what PD-0011 adds. |
| 3 | REQ-0012 (AC-6) | scope-excess | no | open | yes | Drop the `ttc list --all` clause. The export comparison already proves that every field and the other task are unchanged. The clause cannot catch a change of order: task 1 comes first both because it is important and because it has the lower id, and the due date is not used for sorting (`src/commands/list.js:30`). The rest of the line is existing rendering. |
| 4 | REQ-0012 (AC-10) | scope-excess | no | open | yes | Drop the `ttc postpone` (no id) case and the clause "(not created when it did not exist)". Both are inherited rules (C4): every argument is checked before the lock, and `test/done-reopen.test.js` and `test/important.test.js` already check that nothing is created. Once the oracle knows the command (C7), the fuzz generator makes extra-token and option cases for it. Keep `ttc postpone 1 2` and `ttc postpone 1 --days 2`: they test PD-0011 item 2 directly ("no options and takes no other argument"). |

## Questions raised
| Q- id | What it blocks |
| --- | --- |
| none | — |
