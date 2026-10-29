Verdict: coherent
Initiative: INIT-0006
Story set reviewed: REQ-0015 (rev 3, draft)
Authorising decision: PD-0014
Assessment round relied on: 1
Reviewed: 2026-10-29

Mode: PRODUCT-DISCOVERY. Check: SKILL-story-set-technical-coherence, full pass,
round 1 of 2.

Evidence: `assessment.md`, `capability-scan.md`, `impact.md` (this folder,
round 1); `PD-0014`; `product/solution-contract.md`; `initiative.md` rev 3;
code at head `5be0561`, with no change to the code, tests, README, package
scripts or CI config between `5be0561` and the current head. The CLI was run at
that head on the AC-1 task list and on the AC-5 version 1 and version 3 files.

## Per-story checks

| REQ- id | Independently verifiable? | Sequencing note consistent? | Assumed capability | Result |
| --- | --- | --- | --- | --- |
| REQ-0015 | Yes. One story, `depends_on: [none]`. Every AC sets up its own data from an empty or missing `$TTC_HOME`, or from a literal file, using commands that exist today (`add`, `add --important`, `done`). No AC needs any other story. | Yes. "On the frontier, builds on head `5be0561`" agrees with `impact.md`: one system, with no upstream change needed (stored format, older files and a missing file are read as they are). | "Listing tasks with no due date" is `absent` in the scan, and this story is the one that creates it. Everything else the ACs rely on is `exists` in the scan and works on today's code (see the table below): the shared option set, the status-view group and its error text, the AND rule, the parser's errors, the `--format` check, the order of the filter checks, the line format and order, list never writing, missing and older files, the export JSON/CSV/file output and the `Exported <n> tasks to <file>` line, the usage lines, and the oracle, fuzz and perf guard. | Pass |

### What each AC depends on, checked against today's code

| AC | What it depends on | Today's evidence | Achievable? |
| --- | --- | --- | --- |
| AC-1–AC-3 | Today's line and order (important first, then by id); `--tag` and `--search` AND-combined; default view `--open` | `ttc list --all` and `ttc list --tag home --all` on the AC-1 list print exactly the lines AC-1–AC-3 expect, in that order. The new selection only removes lines. | Yes |
| AC-4 | List never writes; a missing file reads as `No tasks.` and creates nothing | `ttc list` with a missing `$TTC_HOME` prints `No tasks.`, exit 0, and no folder is created. `tasks.json` is byte-identical after list commands. | Yes |
| AC-5 | Version 1 and 3 files read without being rewritten; the note is not shown | `ttc list --all` on the exact AC-5 files prints `#1 [ ] Pay rent due:2099-10-01 +bills` / `#2 [ ] Call mom` (v1) and `#1 [ ] Call mom` / `#2 [ ] Pay rent due:2099-10-01 +bills` / `#3 [x] Fix bike +home` (v3). Both files are byte-identical afterwards. The expected `--no-due` lines are the undated ones among these. | Yes |
| AC-6 | Refusal text `options cannot be combined: <opts>`, with the options in a fixed order whatever order they were typed in | The message form exists, and today's status-view group already names options in a fixed order rather than typed order. The refusal adds one check in a place the check order already has (C10). The export refusal happens before the named file is written: every check runs before the read. | Yes |
| AC-7 | Argument errors come first; then `--format`; then two views → refusal → tag → `--due-from` → `--due-to` → from later than to → empty `--search` | Today's texts match AC-7 exactly: `option given twice: --open`, `unexpected argument: home`, `unknown option: --bogus`, `option needs a value: --due-from`, `invalid format: xml (use json or csv)`, `options cannot be combined: --done --overdue`, `invalid tag: a b`, `--search text must not be empty`. The parser passes an empty `--search ""` value on to the filter. On a `not json` file, list and export print `ttc: cannot read <path>: not valid JSON`. The cases where the refusal must win over a bad date, a reversed range or an empty search are possible only with the refusal placed where PD-0014 item 3 puts it. | Yes |
| AC-8 | Export's default view `--all`; JSON format 4 keeps `nextId` and stored order; CSV columns; the `Exported` line | `ttc export` on the AC-1 list gives version 4, nextId 6, and tasks 2, 4 and 5 with exactly the field values AC-8 lists. `--format csv` gives the header and rows AC-8 expects (checked with `--tag home --all` and `--open`). `ttc export <abs>/x.json --tag home` prints `Exported 2 tasks to <abs>/x.json`. | Yes |
| AC-9 | Today's views are unchanged | The PM checked this at head. `ttc list --all` here matches the AC-9 lines. | Yes |
| AC-10 | Two usage lines change in place | Today's `ttc help` matches AC-10 line for line, apart from the two lines that gain `[--no-due]` right after the status-view group. | Yes |
| AC-11 | The README sections and sentences it names exist | "Listing and filtering tasks" holds "All options combine with AND" and "When `--due-from` or `--due-to` is given, tasks with no due date are left out." "Exporting tasks" holds the "mean the same as for `ttc list`" list. | Yes |
| AC-12 | The oracle, fuzz, usage-line tests and perf guard exist; `npm test` runs the unit tests and the perf guard; CI runs both | The scan's counts hold: the list line appears in 9 unit test files plus the oracle and README, the export line in 5 plus the oracle and README. No source, test or README mentions `--no-due` today, so no existing test changes meaning. | Yes |

Verdict drift: none. The story is option B as assessed (C9). It also uses the
refuse branch of N1 for the never-matching combinations, at the check-order
place the assessment recommended (C10), and the keep-the-shared-set branch of
N2 for export (C5). Both branches were assessed as `contained`. There is no
format change (C2), no write (C1), and nothing outside one system. C8 is
correctly left unbound.

## Defects

| # | REQ- id | Check failed | Blocking? | Disposition | Resolvable in decomposition? | Note |
| --- | --- | --- | --- | --- | --- | --- |
| — | — | none | — | — | — | No defect found. |

## Questions raised

| Q- id | What it blocks |
| --- | --- |
| none | — |
