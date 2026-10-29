---
initiative: INIT-0006
type: technical-assessment
title: Technical assessment — Tasks with no due date are listed on their own in one short command
status: authoritative
revision: 1
owner_role: ROLE-planner
mode: PRODUCT-DISCOVERY
phase_at_assessment: SOLUTION_EXPLORATION
round: 1
assessed_on: 2026-10-29
created: 2026-10-29
updated: 2026-10-29
verdicts:
  - { option: A, verdict: feasible-with-constraints, band: contained }
  - { option: B, verdict: feasible-with-constraints, band: contained }
constraints: [C1, C2, C3, C4, C5, C6, C7, C8, C9, C10]
questions: []
updated_by_role: ROLE-planner
---

Mode: PRODUCT-DISCOVERY
Initiative: INIT-0006
Phase at assessment: SOLUTION_EXPLORATION
Assessed: 2026-10-29
Round: 1

Evidence: `capability-scan.md` and `impact.md` (this folder, same date), code
at head `53c39af` (last `src/` change `5b59363`), `project/constraints.md`
rows 1–9, PD-0003 items 2, 6, 7, 8, 11, 12, 13, PD-0004 items 7, 8, PD-0009
items 4, 5, PD-0010 items 1, 4, CAP-0001, REQ-0015 rev 1 (draft),
`initiative.md` rev 2, `product/state.md` Ambiguity log A1–A9 and Discovery
P1–P3, `product/sources/2026-10-29-requester-request.md`.

## Verdicts

| Option | Requirements served | Verdict | Complexity band | One-line basis |
| --- | --- | --- | --- | --- |
| A — `--no-due` as a fifth status view | REQ-0015 (O1–O3) | feasible-with-constraints | contained | One more member of an existing closed group, over a field every task already holds; no format change; read-only (C1–C2); output rules unchanged (C3); fixed text and tests to extend (C4, C6); export follows unless split (C5); view rules (C8). |
| B — `--no-due` as a filter, like `--tag` | REQ-0015 (O1–O3) | feasible-with-constraints | contained | One more AND filter over the same field; same C1–C7; combines with every view, so `--overdue` joins the never-matching combinations (C9) and export's `--all` default gives it a different set than list (C9). |

Band basis (`impact.md`): one system; no contract, schema or data-migration
change in either option; the change sits in the one shared filter that
already serves both commands. Taking export along adds tests and README
text, not components; splitting the set is also inside one component. Both
stay `contained`.

## Constraints

| # | Option | Constraint | permanent / initiative-local | Source | PD- candidate? |
| --- | --- | --- | --- | --- | --- |
| C1 | A, B | `ttc list` stays a read-only command: every argument check before the read; never writes, never creates `tasks.json` or its folder; a missing file is an empty list (`No tasks.`); an unreadable file is `ttc: cannot read <path>: <reason>`, exit 1; a v1–v3 file is read and left exactly as it is (PD-0010 item 1). Errors are one `ttc: ` line, exit 1, nothing on stdout (PD-0003 item 11, constraint 6). If export takes the option, export keeps its rules: `tasks.json` never written, a named file written atomically as format 4 (PD-0010 item 4). | permanent | `src/commands/list.js`, `export.js`, `src/storage.js`, `src/cli.js`; PD-0003 items 11, 13; PD-0004 item 7; PD-0010 items 1, 4 | No — already decided. |
| C2 | A, B | "No due date" means the stored due value is empty: exactly the tasks `ttc list` prints with no `due:` token (A1). Every task in format versions 1–4 holds a due value, empty or a valid date; a file with one missing is unreadable (PD-0004 item 8), so the selection is total and needs no new rule. No stored-format change: no new field, version stays 4. | initiative-local | `src/storage.js` read check; PD-0003 item 13; PD-0004 item 8; PD-0010 item 1 | Fold the definition into the convergence PD. |
| C3 | A, B | The selection feeds today's line and order unchanged (PD-0003 item 8; PD-0009 items 4, 5); `No tasks.` when none match. PD-0009 item 4 names every view and every filter the order rule covers, and PD-0003 item 7 names the views that cannot be combined: the convergence PD must add `--no-due` to item 4 (both options) and, in A, to item 7's group. | permanent | `src/commands/list.js`; PD-0003 items 7, 8; PD-0009 items 4, 5 | Yes — fold into the convergence PD. |
| C4 | A, B | PD-0003 item 12 fixes usage text and tests assert it exactly. The `ttc list` line changes; it is asserted verbatim in 9 unit test files, the oracle and the README. If export takes the option, the `ttc export` line changes too: 5 unit files, the oracle, the README. Any new refusal (N1) needs its exact text and its place in the check order fixed by the PD. | initiative-local | `capability-scan.md` "Tests that assert usage text exactly"; PD-0003 items 2, 12 | Yes — the convergence PD. |
| C5 | A, B | `list` and `export` take one shared option set with one meaning (README "Exporting tasks": "mean the same as for `ttc list` ... combine with AND in the same way"). Adding `--no-due` to it gives it to export with no further rule. Keeping it list-only is the first split of that set: export must keep refusing `--no-due` as an unknown option, the oracle must model two sets, and the README must not imply full parity. Either way is `contained`; the PM fixes which (A7). | initiative-local | `src/filter.js`, `src/commands/list.js`, `export.js`; README "Exporting tasks"; `test/support/ttc-model.js` | Yes — the A7 boundary in the convergence PD. |
| C6 | A, B | The CI `test` check gates on a test-owned oracle that restates the shared filter (option set, view list, checks in order, predicate) and the usage, and on fuzz generators that draw filter options and status-view mutations. Both must gain `--no-due` written from the PD text, not from the new code: in A as a fifth view (including the "second view" mutation); in B as a filter drawn with every view. `--no-due` is not in the fuzz unknown-option list and no test asserts it is unknown, so no existing case changes meaning. Generated lists already give about half the tasks no due date, open and done. | initiative-local | `test/support/ttc-model.js`, `fuzz-gen.js`, `fuzz-harness.js`; `test/list.test.js` criterion 14 | No |
| C7 | A, B | The perf guard (10,000 tasks, median < 500 ms) is not threatened: one more test of a field already in memory per task. Its fixture gives three in four tasks no due date, and plain `ttc list` (already measured) prints more lines than `--no-due` would, so it bounds the new case; no new measurement is needed. | initiative-local | `test/perf/add-list.perf.js` | No |
| C8 | A | `--no-due` is a member of the at-most-one group: given with `--open`, `--done`, `--all` or `--overdue` it is refused with the existing `ttc: options cannot be combined: <opts>`, the options named in group order, not argv order (`ttc list --no-due --done` → `ttc: options cannot be combined: --done --no-due`). Done tasks with no due date cannot be listed on their own. If export takes it, `ttc export --no-due` exports open tasks with no due date only: a view replaces export's `--all` default, as `--overdue` does. With `--due-from`/`--due-to` it can never match (N1). | initiative-local | `src/filter.js`; PD-0003 items 6, 7; README "Exporting tasks" | Yes — fold into the convergence PD. |
| C9 | B | `--no-due` combines with every view. `ttc list --no-due` shows open tasks because list defaults to `--open`; `ttc export --no-due` (if taken) exports open **and** done ones because export defaults to `--all`, the same split `--tag` has today. With `--overdue`, `--due-from` or `--due-to` it can never match (N1): a task with no due date is never overdue (PD-0003 item 6) and the date options leave such tasks out (README). | initiative-local | `src/filter.js`, `src/overdue.js`; PD-0003 item 6; README "Listing and filtering tasks", "Exporting tasks" | Yes — fold into the convergence PD. |
| C10 | A, B | Whatever N1 decides must be stated with its place in the check order, which is test-asserted wherever a message is: argument errors in argv order (`src/args.js`), then for export `--format`, then the filter checks in this order: two status views, tag, `--due-from` date, `--due-to` date, `--due-from` later than `--due-to`, empty `--search`; all before the read. | initiative-local | `src/args.js`, `src/filter.js`, `src/commands/export.js` | Yes — fold into the convergence PD. |

## Architectural risks

| # | Option | Risk | What it threatens | What would resolve it |
| --- | --- | --- | --- | --- |
| R1 | A, B | The oracle is updated by reusing the new code, so the fuzz suite confirms whatever was built. | The ability to verify O1–O2 | C6: the oracle is written from the PD text. |
| R2 | A, B | The change sits in the one predicate every `list` and `export` call uses; a defect there changes what today's views and filters select (for example an undated task leaking into, or dropping out of, `--open`). | O3, success measure 4 | The existing list, export, oracle and fuzz suites stay unchanged and passing; acceptance criteria re-check today's views on a list with dated and undated, open and done tasks. |
| R3 | A | Moving from A to B later is additive for `ttc list` (`--done --no-due` goes from an error to a result; `ttc list --no-due` keeps its meaning). It is **not** additive for export if export takes the option under A: `ttc export --no-due` would change from open-only to open-and-done. | A later "show done tasks with no due date" ask | Decide A7 with the option. If A and export-takes-it, record that a later B changes export output; if A and list-only, a later B forecloses nothing. |
| R4 | A, B | Under the AND rule, `--no-due` with an option that can never match it prints `No tasks.` with exit 0, which reads as "you have no such tasks". A user who mistypes a combination gets a wrong-looking answer, not an error. | J2 "see just those"; trust in `No tasks.` | N1. |
| R5 | A, B | `--no-x` is a common convention for "turn x off". ttc's parser has no such convention, so nothing breaks today, but a later "add or copy with no due date" option would want the same spelling with a different meaning (INIT-0005 C9 recorded that copy cannot drop a date). | Naming consistency of a later due-date option | N5. |

## Security / data / compliance implications

| Option | Data class | Implication | Source row in impact.md |
| --- | --- | --- | --- |
| A | personal | The user's own task lines on stdout, a subset of what `ttc list` shows today; no new datum, no write, no network. If export takes it, a subset of what export already writes, under today's export rules. | Option A, "Data crossing a boundary", rows 1–2 |
| B | personal | As A. | Option B, "Data crossing a boundary", rows 1–2 |

## Product assumptions that conflict with the platform

| # | Assumption (and where it is stated) | Platform fact | Class (blocking/narrowing/costly) | Raised as |
| --- | --- | --- | --- | --- |
| P1 | O3 / success measure 4 "every other command give[s] the same output as before"; out of scope "Any change to the output of other commands" (`initiative.md` rev 2) | `ttc help` output changes in both options (the list line; the export line too if export takes it). Every existing invocation of `list` and `export` keeps its output. | narrowing | Recommendation to the PM (below). |
| P2 | "combines with `--tag` and `--search`" (both options) | Holds. Not stated: with `--due-from`/`--due-to` (and in B `--overdue`) it can never match (C8, C9). | narrowing | N1 below. |
| P3 | A: "Done tasks with no due date cannot be listed on their own" | Holds; also `--no-due` with another view is the existing combine error (C8), and, if export takes it, `ttc export --no-due` cannot export done ones either. | narrowing | Recommendation to the PM (below). |
| P4 | B: "`ttc list --no-due` shows open tasks with no due date" | Holds for list. If export takes it, `ttc export --no-due` gives open and done ones (C9), as `--tag` does today. | narrowing | N2 below. |
| P5 | "write nothing" (both options) | Holds for `ttc list`. `ttc export <file> --no-due` writes the named file, as every export does; `tasks.json` is never written (C1). | narrowing | N2 below. |
| P6 | "it is called `--no-due`" (A4; both options) | Accepted by the parser as-is (exact names, no negation rule); see R5. | narrowing | N5 below. |
| P7 | Usage line and README text (`initiative.md` scope) | Not fixed by any PD; the list line is asserted verbatim in 9 test files, the export line in 5 (C4). | narrowing | Recommendation to the PM (below). |

No assumption was found `blocking` or `costly`. Verified as holding in both
options: no stored-format change (C2); `tasks.json` not changed, and not
created when missing (C1); a file from older ttc read and not rewritten
(C1, success measure 5); each line and the order as `ttc list` gives today
(C3); today's `ttc list --no-due` failure (Discovery P2) is asserted by no
test, so no existing test flips (C6).

## Recommendations to the PM (not decided here)

- **N1 — never-matching combinations.** Refuse, before the read, with the
  existing message form `ttc: options cannot be combined: <opts>`, naming
  `--no-due` and each such option given, in usage order (A:
  `ttc list --due-to 2026-01-31 --no-due` → `ttc: options cannot be combined: --no-due --due-to`;
  B adds `--overdue`: `ttc list --no-due --overdue` → `ttc: options cannot be combined: --overdue --no-due`).
  Place it right after the existing two-status-views check and before the
  tag, date and search checks (C10), so all "cannot be combined" refusals
  come first and win over a bad date in the same command. Basis: the
  platform already refuses a contradiction visible in the arguments alone
  (`--due-from` later than `--due-to`) instead of printing `No tasks.`; it
  avoids R4. Cost: one new rule in the PD, its check-order position, exact
  unit tests, the oracle rule, a README sentence. The alternative (AND,
  `No tasks.`) costs nothing new, needs only a README sentence, and keeps
  "all options combine with AND" without exception, but carries R4.
- **N2 — `ttc export`.** Platform view: let export take it with the same
  meaning (keep the one shared set). It is the smaller change, keeps the
  README promise true by adding `--no-due` to its list of options, and adds
  no second option set to model. Cost: the export usage line (5 test files,
  oracle, README), export cases in JSON and CSV, and the export-side
  consequence of the option chosen (A: open only, and R3; B: open and done
  under `--all`, P4). Keeping it list-only is also `contained`: export
  keeps `unknown option: --no-due`, help changes in one line only, but the
  shared set splits for the first time. "Keep it simple" may favour either;
  the choice is the PM's.
- **N3 — storage.** No change (C2). Missing `tasks.json`: `No tasks.`,
  exit 0, nothing created. Files from older ttc (v1–3): read, never
  rewritten by `list` (or by export); every task in them already holds a
  due value. A file that cannot be read fails as today, after the argument
  checks.
- **N4 — tests.** The oracle and fuzz generators gain the option from the
  PD text (C6); the list usage line changes in 9 unit files plus the oracle
  (4 of them assert the whole usage), the export line in 5 more if export
  takes it (C4); the perf guard needs no new case (C7).
- **N5 — the name.** `--no-due` is safe in the parser: no clash with
  `--due`, `--due-from` or `--due-to` (exact names), not used anywhere, and
  no test treats it as unknown. `--undated` is safer only against a later
  "add or copy with no due date" option wanting `--no-due` (R5); not
  material today. Keep `--no-due` unless the PM foresees that option.
- **Usage line (P7).** A: `ttc list [--open|--done|--all|--overdue|--no-due] [--tag <t>] [--due-from YYYY-MM-DD] [--due-to YYYY-MM-DD] [--search <text>]`.
  B: `ttc list [--open|--done|--all|--overdue] [--no-due] [--tag <t>] [--due-from YYYY-MM-DD] [--due-to YYYY-MM-DD] [--search <text>]`.
  If export takes it, its line changes in the same place.
- **`ttc help` (P1).** State in the PD that `ttc help` changes in the list
  line (and the export line if taken), and that every existing invocation
  of every command keeps its output.
- **Option choice, platform view only.** Both are `contained`, need no
  format change, and carry C1–C7 and C10. A adds C8 and R3; B adds C9 and
  one more never-matching combination (`--overdue`). B accepts a superset
  of A's commands with the same meaning where they overlap, so a later B
  after a list-only A forecloses nothing. The choice is the PM's.
- **Registry note.** CAP-0001 (`draft`) still says "Behavior today: None
  yet" and excludes notes, search and safe concurrent writes, all of which
  now exist, as do the important mark, postpone, clean and copy
  (`capability-scan.md` CAP- reconciliation). Reported for the PM's
  registry upkeep, as in INIT-0002 to INIT-0005.

## Open questions raised

| Q- id | What it blocks |
| --- | --- |
| none | — |
