---
initiative: INIT-0005
type: technical-assessment
title: Technical assessment — A new task is made from an existing one without retyping it
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
constraints: [C1, C2, C3, C4, C5, C6, C7, C8, C9]
questions: []
updated_by_role: ROLE-planner
---

Mode: PRODUCT-DISCOVERY
Initiative: INIT-0005
Phase at assessment: SOLUTION_EXPLORATION
Assessed: 2026-10-29
Round: 1

Evidence: `capability-scan.md` and `impact.md` (this folder, same date), code
at head `fdf683d` (last `src/` change `452450b`), `project/constraints.md`
rows 1–9, PD-0003, PD-0004, PD-0008, PD-0009, PD-0010, PD-0011 (PD-0012 as
precedent), CAP-0001, REQ-0014 rev 1, `initiative.md` rev 2,
`product/product-definition-contract.md`, `product/state.md` Discovery and
Ambiguity log A1–A10.

## Verdicts

| Option | Requirements served | Verdict | Complexity band | One-line basis |
| --- | --- | --- | --- | --- |
| A — `ttc copy <id>` | REQ-0014 (O1–O3) | feasible-with-constraints | contained | One new command over existing, unchanged seams (id parsing, lock, one atomic write, the next-id rule `add` uses, registry); no stored-format change; inherits the changing-command rules (C1) and id rules (C2); needs new fixed text (C3). |
| B — `ttc copy <id> [--due YYYY-MM-DD]` | REQ-0014 (O1–O3) | feasible-with-constraints | contained | Everything in A, plus one value option checked by the date rule `ttc add --due` already uses (C8); the date goes into the existing due field, so still no format change; more argument cases to test (C6) and a set-only date (C9). |

Band basis (`impact.md`): one system, one new command, no contract, schema or
data-migration change in either option. B's extra option reuses an existing
parser feature and an existing date rule; it adds test cases, not
components, so it stays `contained`.

Answers to the points the dispatch asked to settle:

1. **Stored format (A9).** No change in either option; `tasks.json` stays
   version 4 (C4). It would change only if a link to the original were
   stored, which is out of scope.
2. **Id limit.** A copy uses up one id exactly as `add` does. When no id is
   left, the copy must be refused; PD-0004 item 2 states this for `ttc add`
   only, so the convergence PD must extend it (C2, P4).
3. **Lock and atomic write.** Read, lookup, id allocation and write happen
   under one hold of the lock, in one atomic write; an interruption leaves
   the list without the copy or with the whole copy (C1).
4. **Older-format file.** A task in a v1–v3 file is copied without error; the
   copy carries what that file holds (no note in v1–v2, no mark in v1–v3); a
   successful copy writes the file as version 4, as every changing command
   does; a refused copy leaves it as it is (C4, P6).
5. **Test oracle and fuzzing.** The oracle and fuzz generators must gain the
   command from the PD text; three unit tests that assert the whole usage
   must gain the line; `copy` does not collide with an existing
   unknown-command fuzz case (C6).
6. **Perf guard.** Not threatened: copy has the cost shape of `add` (C7).

## Constraints

| # | Option | Constraint | permanent / initiative-local | Source | PD- candidate? |
| --- | --- | --- | --- | --- | --- |
| C1 | A, B | Copy is a changing command and inherits, unchanged: exact arguments — one `<id>` (and in B only `--due`), so an extra argument is an error and any other `--x` an unknown option, checked before the lock (PD-0003 item 2); id rules — digits, leading zeros allowed and dropped in messages, the largest id, `ttc: invalid task id: <arg>`, `ttc: no task with id <id>` (PD-0003 item 2, PD-0004 item 2); the exclusive lock with its `busy` failure; read, lookup and write under one hold of the lock, in one atomic write (constraint 5, PD-0004 item 3); owner-only permissions (PD-0004 item 4); a refusal writes nothing — the file stays byte-identical, an older-version file is not upgraded, and a missing `tasks.json` stays missing with no folder created (PD-0003 item 11, PD-0004 item 7); a failure after the save exits 1 and keeps the copy (PD-0008). Every accepted copy writes: there is no no-op case. | permanent | `src/args.js`, `src/lock.js` `withLock`/`release`, `src/storage.js` `writeList`, `src/commands/postpone.js` and `add.js` pattern, `bin/ttc.js`, `src/cli.js`; PD-0003 items 2, 11, 13; PD-0004 items 2, 3, 4, 7; PD-0008 | No — already decided. |
| C2 | A, B | The copy's id is the stored next id, and the next id rises by 1, exactly as for `add`; ids are never reused (PD-0003 item 1). When the next id is above 9007199254740991 the copy must be refused and change nothing. PD-0004 item 2 words that refusal for `ttc add` only, so applying it to copy needs the convergence PD (P4). | permanent | `src/commands/add.js`; `src/storage.js` `validateList`; `src/args.js` `MAX_ID`; PD-0003 item 1; PD-0004 item 2 | Fold the extension into the convergence PD. |
| C3 | A, B | PD-0003 is changed only by a new PD, and tests assert fixed text exactly. The convergence PD must fix: the success line (adds to item 10), the usage line and its position (item 12), the id-limit refusal for copy (C2), the check order, and in B the `--due` rules (C8, C9). No other new message is needed: the copied fields were validated on read, so no field error can arise from them (C5). | initiative-local | PD-0003 items 10, 12 and its closing rule; PD-0011 items 4, 7, 11 and PD-0012 items 4, 8, 11 (precedent) | Yes — the convergence PD. |
| C4 | A, B | No stored-format change: the copy holds only fields format 4 already has, and stays version 4. This holds only while "recording which task a copy came from" stays out of scope; storing it would be a new field, which forces format 5 and a one-way upgrade for every user (PD-0010 item 1). Older files are read, copied without error, and written as version 4 by a successful copy (PD-0010 items 1, 3, 4); an install older than format 4 then refuses the file, as after any changing command today. | initiative-local | `src/storage.js` `FORMATS`, `serializeList`; PD-0010 items 1, 3, 4; `initiative.md` out of scope | No |
| C5 | A, B | The copy is made from the original's stored form, which already passed the full read check (PD-0004 item 8): title, due date (or none), tags (stored lower case, sorted on display), note (or none) and important mark are taken as stored, the status is open, and nothing else is copied. The original and every other task keep every field and their stored order; the copy is placed by its id and mark in `ttc list` (PD-0009 item 4). A done original stays done. | initiative-local | `src/storage.js` `validateList`; `src/commands/add.js`; PD-0004 item 8; PD-0009 item 4; `initiative.md` O1, O3 | Yes — fold into the convergence PD (P5). |
| C6 | A, B | The CI `test` check gates on a test-owned oracle that restates every rule and hard-codes the usage list and the command set; the fuzz generator draws argv cases per command. Both must gain copy, written from the PD text, not from the new code, including the id rule copy shares with `add`. Three unit tests list the whole usage and must gain the new line (`test/important.test.js`, `clean.test.js`, `postpone.test.js`). `copy` is not in the fuzz unknown-command names, so no existing case changes meaning. In B the generators must also draw `--due` cases: valid, invalid, past, `9999-12-31`, missing value, given twice, before and after the id, on an original with and without a due date. | initiative-local | `test/support/ttc-model.js` (`USAGE`, `COMMANDS`), `fuzz-gen.js` (`COMMANDS`, `UNKNOWN_NAMES`), `fuzz-harness.js`; the three tests named | No |
| C7 | A, B | The perf guard (10,000 tasks, median < 500 ms) is not threatened: copy is one read, one lookup and one write, the shape of `add`. The guard measures `list`, filtered `list` and `add` only, so as written it does not measure copy. | initiative-local | `test/perf/add-list.perf.js` | No |
| C8 | B | `--due` must follow the `ttc add --due` rule exactly: `YYYY-MM-DD`, a real calendar date, a past date allowed, `ttc: invalid date: <d>` otherwise (PD-0003 item 5), and no date later than `9999-12-31` (PD-0011 item 6, which the existing check already enforces); one value, before or after the id, refused when given twice or with no value (PD-0003 item 2); checked before the lock, as `add` does. | permanent | `src/rules.js` `isValidDate`; `src/args.js`; `src/commands/add.js`; PD-0003 items 2, 5; PD-0011 item 6 | No — already decided; cite in the convergence PD. |
| C9 | B | `--due` can only set a date: there is no value meaning "no due date" (an empty value is an invalid date), so a copy of a dated original always carries a date, and "removing the due date from a copy" stays out of scope as the initiative states. With `--due`, a copy of an original with no due date gets one. | initiative-local | `src/rules.js` `isValidDate`; `initiative.md` out of scope | Yes — fold into the convergence PD (P7). |

## Architectural risks

| # | Option | Risk | What it threatens | What would resolve it |
| --- | --- | --- | --- | --- |
| R1 | A, B | The oracle is updated by reusing the new code, so the fuzz suite confirms whatever was built. | The ability to verify O1–O3 | C6: the oracle is written from the PD text. |
| R2 | A, B | A defect that changes the original instead of only the new task (a done original reopened, or a field shared and later altered) passes any test that checks only the copy. | O3 "the original task ... as it is today" | Acceptance criteria that check the original and every other task after the copy, for a done, important, tagged, noted and dated original; the oracle compares the whole list. |
| R3 | A | A copy of a task whose due date has passed is overdue at once. One `ttc postpone` moves it to tomorrow (PD-0011 item 3); each further day needs one more postpone; no command sets an arbitrary date or clears one. | J2 "without retyping everything" for tasks with an old due date; the value of A for dated tasks | The PM's option choice, weighed on this fact (P8). Not a platform defect. |
| R4 | B | `ttc copy <id> --due <d>` followed by `ttc delete <id>` gives a user a task with a new date and a new id: a way to "change" a due date that the product has kept out of scope since INIT-0001. Scripts that track a task by id see it vanish and a new one appear. | The out-of-scope line "Changing or clearing the due date of a task that already exists" in spirit; id-tracking scripts | PM acceptance in the convergence PD (P9). |
| R5 | A | Adding `--due` later is additive: an option that is an error today becomes valid, and no existing output changes. The reverse, removing it after B ships, breaks scripts that use it. Choosing A forecloses nothing technical. | A later "copy with a new date" ask | Nothing now; recorded so a later B is costed as `contained`. |

## Security / data / compliance implications

| Option | Data class | Implication | Source row in impact.md |
| --- | --- | --- | --- |
| A | personal | A second copy of the user's own task data in the same owner-only file; no new datum, no new permission rule, no network. The confirmation line prints no title or note. | Option A, "Data crossing a boundary", rows 1–2 |
| B | personal | As A; the given due date is the user's own input, stored in the existing field. | Option B, "Data crossing a boundary", rows 1–2 |

## Product assumptions that conflict with the platform

| # | Assumption (and where it is stated) | Platform fact | Class (blocking/narrowing/costly) | Raised as |
| --- | --- | --- | --- | --- |
| P1 | "prints one confirmation line naming the new id" (dispatch; O2; A7; success measure 3) | The exact line is fixed, test-asserted text that PD-0003 item 10 does not hold (C3). | narrowing | Recommendation to the PM (below). |
| P2 | "`ttc help` lists the new usage" (`initiative.md` scope) | The usage line and its position are fixed and asserted in full by three tests and the oracle (C3, C6). | narrowing | Recommendation to the PM (below). |
| P3 | Errors "under the existing rules" (dispatch; REQ-0014 scope) | Which refusal wins when several apply is test-asserted; it is not stated for copy (PD-0011 item 7 and PD-0012 item 8 set the precedent of stating it). | narrowing | Recommendation to the PM (below). |
| P4 | "makes a new task with the next id" (dispatch); A3 "already decided" | PD-0004 item 2 words the "no task id is left" refusal for `ttc add` only (C2). | narrowing | Recommendation to the PM (below). |
| P5 | "the original's title, due date, tags, note and important mark", "status open" (dispatch; O1; A1, A2) | Holds as stated (C5). Not stated: a done original stays done; an overdue original gives an overdue copy (A, and B without `--due`); an important copy is listed with the important tasks; a copy from a v1–v3 file carries no note (v1–v2) and no mark (v1–v3), because the file holds none. | narrowing | Recommendation to the PM (below). |
| P6 | O3 "data files written by older ttc" kept as they are | They are read and copied without error (success measure 5 holds), but a successful copy writes them as version 4, after which an install older than format 4 cannot read them (C4). Same as every changing command today. | narrowing | Recommendation to the PM (below). |
| P7 | B: "that due date instead of the original's, under the same date rules as `ttc add --due`" (dispatch) | Holds (C8). Not stated: `--due` cannot mean "no due date" (C9), and it gives a date to a copy of an undated original. | narrowing | Recommendation to the PM (below). |
| P8 | Discovery P3 and A5: an overdue copy "could only be postponed day by day" (`product/state.md`) | One `ttc postpone` moves an overdue task to tomorrow in one step (PD-0011 item 3; README "Postponing a task"). Reaching a date N days after tomorrow takes N more postpones. The stated basis of the A/B trade-off is partly wrong (R3). | narrowing | Recommendation to the PM (below). |
| P9 | Out of scope "Changing or clearing the due date of a task that already exists" (`initiative.md` rev 2) | Holds literally in both options. In B, copy with `--due` plus delete reaches the same end with a new id (R4). | narrowing | Recommendation to the PM (below). |
| P10 | "the README documents it" (`initiative.md` scope) | What the README section says is not fixed; precedent PD-0011 item 12, PD-0012 item 12. | narrowing | Recommendation to the PM (below). |

No assumption was found `blocking` or `costly`. Verified as holding in both
options: no stored-format change (C4); ids are never reused (C2); the
original and every other task, their ids and fields, and the order and
format of `ttc list` are unchanged (C5); a task in a file written by older
ttc is copied without error (success measure 5); the copy is all-or-nothing
(C1); a refusal writes nothing and creates nothing (C1).

## Recommendations to the PM (not decided here)

- **P1 — success line.** `Copied task <id> as task <new-id>`, ids without
  leading zeros (`ttc copy 007` → `Copied task 7 as task 12`): names both
  ids, and "as" avoids reading as "copied into task 12". Alternative:
  `Added task <new-id>`, the existing `add` line, so a script that reads
  `add` output reads this too, but it does not say a copy was made.
- **P2 — usage line and position.** A: `ttc copy <id>`. B:
  `ttc copy <id> [--due YYYY-MM-DD]`. Place it right after the `ttc add`
  line and before `ttc list`, next to the other command that makes a task.
  Alternative: after `ttc clean`.
- **P3 — check order.** Before the lock: arguments, then the id, then (B)
  the `--due` date. Under the lock: read the list, find the task
  (`ttc: no task with id <id>`), then the id limit (P4). A user's typo is
  then reported before a condition they cannot fix.
- **P4 — id limit.** Extend PD-0004 item 2's refusal to copy, with the same
  condition and the same message, `ttc: no task id is left`, exit 1, nothing
  changed.
- **P5 — what the copy holds.** State in the PD, with one example: the five
  fields as stored, status open always (a done original's copy is open and
  the original stays done), a new id, nothing else; an overdue original gives
  an overdue copy (A, and B without `--due`); the copy is listed by its mark
  and id like any task; a copy from a v1–v3 file holds what that file holds.
- **P6 — older files.** Word O3's promise as: read and copied without error,
  written as version 4 by a successful copy as by every changing command,
  left as they are by a refused copy.
- **P7 — `--due` (B only).** If B is chosen, state: the same rule and message
  as `ttc add --due` (C8), a past date allowed, nothing later than
  `9999-12-31`; it gives a date to a copy of an undated original; it cannot
  remove a date.
- **P8 — the overdue-copy fact.** Correct Discovery P3 / A5 in the
  convergence PD's basis: one postpone brings an overdue copy to tomorrow;
  only a date further out needs one postpone per day. This changes the
  weight of the A/B trade-off, not either option's feasibility.
- **P9 — copy as a reschedule (B only).** If B is chosen, say in the PD that
  a copy is a new task with a new id, so the out-of-scope line stays true,
  and keep the README from presenting copy-then-delete as a way to change a
  due date.
- **P10 — README.** A "Copying a task" section in the style of "Postponing a
  task": the usage, the fields copied, status open, the success line, the
  refusals, that only the new task is added, and in B the option.
- **Option choice, platform view only.** Both are `contained`, need no format
  change and carry C1–C7. B adds C8–C9, more argument cases to test, and R4.
  A carries R3 for originals with an old due date. A later `--due` stays
  possible after A (R5). The choice is the PM's.
- **Registry note.** CAP-0001 (`draft`) still says "Behavior today: None yet"
  and excludes priorities, notes, search and safe concurrent writes, all of
  which now exist, as do postpone and clean (`capability-scan.md` CAP-
  reconciliation). Reported for the PM's registry upkeep, as in INIT-0002 to
  INIT-0004.

## Open questions raised

| Q- id | What it blocks |
| --- | --- |
| none | — |
