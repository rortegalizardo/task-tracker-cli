Verdict: coherent
Initiative: INIT-0004
Story set reviewed: REQ-0013 (revision 2, draft)
Authorising decision: PD-0012
Assessment round relied on: 1
Reviewed: 2026-10-28
Mode: PRODUCT-DISCOVERY — story-set-technical-coherence, full pass, round 1 of 2

Evidence: `technical/assessment.md`, `impact.md`, `capability-scan.md` (round 1,
code at `6a25069`); REQ-0013 rev 2; PD-0012 (and PD-0003, PD-0004, PD-0008,
PD-0010 as cited by it); `product/solution-contract.md` rev 1; `initiative.md`
rev 3; `project/constraints.md` rev 2. Provenance: INIT-0004 DECOMPOSITION,
head `0dee64f`. No change to `src/`, `bin/`, `test/`, `README.md`,
`package.json` or `.github/` between `21e02ed` (the base the Sequencing note
names: RCDEV-857, INIT-0003 merged), `6a25069` (the scan) and `0dee64f`, so the
capability scan still holds.

Checked against the real CLI at `0dee64f` (run in a scratch `$TTC_HOME`; the
removal itself was stood in for with `ttc delete`, which has the same effect on
the stored list):

- `ttc clean` today gives `ttc: unknown command: clean (see ttc help)`, exit 1.
  No source, test or README line mentions `clean`, and the fuzz generator's
  unknown-name list does not hold it, so adding the command collides with
  nothing.
- AC-1: after tasks 1 and 3 go, `ttc list --done` prints `No tasks.`,
  `ttc list --all` prints `#2 [ ] Buy milk`, `ttc stats` prints `open: 1`,
  `done: 0`, `overdue: 0`. The setup commands all succeed as written.
- AC-2: the setup commands succeed; `ttc export before.json` writes the list in
  stored order as format 4 with `version`, `nextId` (4) and every field, and is
  deterministic, so the parsed comparison in AC-2 works. Removing task 3 leaves
  `nextId` 4, so the clause "the same `nextId`" can tell a kept next id from a
  recomputed one (3).
- AC-3: with every task removed, `ttc add "New task"` prints `Added task 4` and
  `ttc list --all` prints `#4 [ ] New task`; a list with no tasks and a next id
  above 1 is valid.
- AC-4, AC-7: an existing no-op (`ttc reopen 1` on an open task) leaves a
  version 3 `tasks.json` byte-identical; the changing-command pattern supports
  a successful no-op that writes nothing.
- AC-5: a successful read under the lock with `$TTC_HOME` two levels deep and
  missing leaves no folder at all, and so does a failing changing command; the
  lock removes every folder it made.
- AC-6, AC-7: both fixtures are valid version 3 lists (`ttc list --all` reads
  them). After a change, the file holds `"version": 4`; AC-6's list line and
  `Added task 3` hold.
- AC-8: the no-argument parser gives `unexpected argument: 2`,
  `unknown option: --all` and `unknown option: --done`, each one `ttc: ` line,
  exit 1, before any read.
- AC-9: a `tasks.json` holding `not json` gives
  `ttc: cannot read <path>: not valid JSON`, exit 1, file unchanged, no lock
  file left.
- AC-10: `ttc help` prints `Usage:` and fifteen two-space-indented lines; AC-10
  is exactly those lines with `ttc clean` added between `ttc delete <id>` and
  `ttc tag <id> +<t> | -<t>` (PD-0012 item 11). Help order comes from the
  command registry.
- AC-11: `ttc export copy.json --done` works as the README text will describe
  (`Exported 1 tasks to copy.json`).
- AC-12 / C4 / C5: the CI `test` job runs lint, the unit tests (fuzz included)
  and the perf guard. The fuzz suite compares `ttc help` with the oracle's
  hard-coded usage list, so CI itself fails until the oracle knows the new
  usage line; the rest of C4 (the oracle's own clean rule and generated argv
  cases) binds through the story's constraints, as C7 did in REQ-0012. C5 is
  covered because `npm test` runs the perf guard.

## Per-story checks
| REQ- id | Independently verifiable? | Sequencing note consistent? | Assumed capability | Result |
| --- | --- | --- | --- | --- |
| REQ-0013 | Yes. It is the only story, and every AC runs against this story's build alone. | Yes. `depends_on: [none]`; it builds only on shipped commands (`21e02ed` holds INIT-0001 to INIT-0003). In `impact.md` (option A), the upstream (v1–3 files) needs no change; the downstreams (v4 readers, scripts that parse output or help, the CI gate, the user's own exports) are only fed by this story. | Removing several tasks in one command is `absent`, and this story creates it. Everything else it relies on is `exists`: removal that keeps the next id, selecting done tasks, the no-argument parser, the changing-command pattern with its no-write no-op, the lock and its folder cleanup, the atomic write and write guard, failure after save, help from the registry, format upgrade on write, deterministic JSON export, the oracle and fuzz harness (C4), the perf guard (C5). No finish date, undo, archive or day arithmetic is assumed. The story assumes nothing it does not create. | pass |

Verdict drift (rule 5): none. The story is option A as PD-0012 fixes it:

- one command, `ttc clean`, with no argument and no option; AC-8 refuses a
  positional and two options;
- every done task is removed, every open task kept with all its fields
  (AC-1, AC-2, AC-3);
- the success line `Removed <n> done tasks`, one form for 0, 1 and more
  (AC-1 to AC-7), no prompt;
- the next id is kept, even when every task goes (AC-2, AC-3);
- nothing to remove writes nothing, keeps an older version, creates no file or
  folder (AC-4, AC-5, AC-7);
- no format change; a v1–3 file is written as v4 only when a task is removed
  (AC-6, AC-7);
- the help line sits where PD-0012 puts it, and the README says what item 12
  asks (AC-10, AC-11).

No AC implies work outside the option A rows of `impact.md`. No AC touches
anything `initiative.md` lists as out of scope.

## Defects
| # | REQ- id | Check failed | Blocking? | Disposition | Resolvable in decomposition? | Note |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | REQ-0013 (AC-6) | non-discriminating check | no | open | yes | The clause "and `ttc add \"Call mom\"` prints `Added task 3`" cannot tell a kept next id from a recomputed one: the fixture has `"nextId":3` and the highest task left is 2, so both give 3. The clause therefore adds nothing over "`ttc list --all` prints exactly `#2 [ ] Buy milk`". C2 is already proved by AC-2 (same `nextId` 4 where a recompute gives 3) and AC-3 (`Added task 4` with no task left). Either drop the clause or give the fixture a next id above 3. Nothing built changes either way. |

## Questions raised
| Q- id | What it blocks |
| --- | --- |
| none | — |
