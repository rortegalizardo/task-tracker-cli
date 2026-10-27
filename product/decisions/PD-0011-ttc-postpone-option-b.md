---
id: PD-0011
type: decision
title: Build INIT-0003 as option B, ttc postpone moves a task's due date one day later, counting from today when it is overdue
status: accepted
revision: 1
owner_role: ROLE-product-manager
created: 2026-10-27
updated: 2026-10-27
decided_on: 2026-10-27
affects: [INIT-0003, REQ-0012, CAP-0001]
supersedes:
superseded_by:
---

# PD-0011 — Build INIT-0003 as option B, ttc postpone moves a task's due date one day later, counting from today when it is overdue

## Context

The requester said: "I keep pushing tasks back. Give me a quick way to
postpone a task. Keep it simple."
(`initiatives/INIT-0003-postpone-a-task/product/sources/2026-10-27-requester-request.md`).
Today a due date is set only by `ttc add --due` and no command changes it
(`PD-0003` Consequences). The ambiguity log in
`initiatives/INIT-0003-postpone-a-task/product/state.md` (A1–A11) is all
`pm-resolvable`. The architect found both options `feasible-with-constraints`,
band `contained`, with constraints C1–C8 and narrowing points P1–P4
(`initiatives/INIT-0003-postpone-a-task/technical/assessment.md`, round 1).

The choice between A and B is settled by the request itself
(escalation-policy §3 route 2): "a quick way to postpone a task" is one
command naming only the task, and "Keep it simple" rules out an amount the
requester did not ask for.

## Decision

1. **Postponing moves the due date (A1).** The task stays listed as it is
   today, with its new due date. Nothing is hidden.
2. **The command (A2, A6).** `ttc postpone <id>` postpones one task. It has no
   options and takes no other argument; an extra argument or an option is an
   error under the existing argument rules (`PD-0003` item 2, C4).
3. **The new date (A3, C3).** The new due date is one calendar day after the
   later of the task's due date and today. "Today" is the local date of the
   user's machine (`PD-0003` item 6). Days are calendar days, with the
   Gregorian month, year and leap-day rules ttc's date check already uses.
   With today 2026-10-27:
   - due 2026-10-30 → 2026-10-31;
   - due 2026-10-27 → 2026-10-28;
   - due 2026-10-20 (overdue) → 2026-10-28.
   Also 2026-12-31 → 2027-01-01 and 2028-02-28 → 2028-02-29 when that date is
   the later of the two.
4. **Success line (adds to `PD-0003` item 10).** `Postponed task <id> to <date>`,
   where `<date>` is the new due date as `YYYY-MM-DD`, then exit 0. Every
   accepted postpone changes the date, so there is no "nothing to do" case.
5. **No due date (A4).** `ttc: task <id> has no due date`, exit 1, and
   `tasks.json` stays byte-identical. A postpone never gives a task its first
   due date.
6. **The latest due date (C2, P1 option (a)).** The latest due date ttc can
   store is `9999-12-31`. **Standing rule:** any command that would set a due
   date later than `9999-12-31` refuses and changes nothing. For postpone, a
   task due `9999-12-31` gets `ttc: task <id> cannot be postponed past 9999-12-31`,
   exit 1, and `tasks.json` stays byte-identical.
7. **Check order and shared rules (C4).** Arguments, then the id, then under
   the lock: read the list, find the task (`ttc: no task with id <id>`), then
   the no-due-date check, then the date limit. Every existing changing-command
   rule applies unchanged: id rules (`PD-0004` item 2), the lock and its busy
   failure, atomic write (`PD-0004` items 3–4), a refusal writes nothing, and
   a failure after the save exits 1 and keeps the change (`PD-0008`).
8. **Open and done tasks (A5).** Both can be postponed, with the same rules,
   as with `ttc important` (`PD-0009` item 3).
9. **What changes and what does not (O3, P4).** Only the postponed task's due
   date changes. Its title, status, tags, note, important mark and id, every
   other task, and the order of `ttc list` stay as they are. What follows from
   the due date follows from the new one: the task's `!overdue` token, whether
   it shows under `ttc list --overdue`, `--due-from` and `--due-to`, the
   `ttc stats` overdue count, and the due value in `ttc export`. "Not overdue
   afterwards" is judged on the local date (`PD-0003` item 6).
10. **Storage (A11, C1).** No format change: the existing `due` field holds the
    new date and `tasks.json` stays version 4. A file written by older ttc is
    read and then written as version 4, as by every changing command
    (`PD-0010` items 1, 4).
11. **Help (adds to `PD-0003` item 12).** The usage gains the line
    `ttc postpone <id>`, after `ttc unimportant <id>` and before
    `ttc rename <id> "<title>"`.
12. **README.** The README documents `ttc postpone`, its new-date rule and its
    two refusals.
13. **No visual surface.** ttc is "CLI only, no UI" (`project/constraints.md`
    row 8; `PD-0001` item 3). No design role is dispatched and no `DES-` is
    made; the story carries `design_refs: []`, and its acceptance criteria
    state the exact command output and exit codes.
14. **The architect's constraints.** C1–C5, C7 and C8 of
    `technical/assessment.md` (round 1) bind the story. C6 applied only to
    option A and does not apply.
15. **How this record relates to `PD-0003`.** It adds to `PD-0003` items 10,
    11 and 12 and changes nothing already decided there.

## Options considered

| Option | Why not |
| --- | --- |
| A — `ttc postpone <id> [<days>]` (one day by default, an optional number of days) | Adds an amount the requester did not ask for, one more rule and error (C6), and a swapped-number trap that moves the wrong task (R3). "Keep it simple" decides it. It stays open as an additive later change (R5) |
| Count the day from the old due date even when the task is overdue | A task due last week, postponed, would still be overdue, which is not pushing it back (A3) |
| Count the day from today for every task | A task due next week would move earlier, which is the opposite of postponing |
| Hide the task until a later date ("snooze") | A new idea to learn; the task's only date is its due date (A1) |
| Give a task with no due date a first due date of tomorrow | That is setting a due date, which is out of scope (A4) |
| Clamp the new date to `9999-12-31` | A task due `9999-12-31` would "succeed" without moving, contradicting O1 (P1 option (b)) |

## Consequences

**Costs.**

- **A longer push takes several runs.** Moving a task a week out takes up to
  seven `ttc postpone` runs; an overdue task needs only one to reach
  tomorrow.
- **One more command** to learn, and **fixed text**: the success line, the two
  refusals and the usage line are fixed; changing one later needs a record
  that supersedes this one. Tests assert them.
- **Time zones.** "Today" follows the machine's local date, so a task
  postponed to tomorrow can show `!overdue` at once if the next command runs
  under a time zone a day or more ahead (assessment R4). The `PD-0003` item 6
  rule already accepts this.
- **Tests move.** The test oracle gains the command and its own calendar-day
  count, written from this record, not from the new code (C7).

**Benefits.**

- The smallest change that does what was asked: one command, one rule.
- No format change, no migration, and no change to any other command's output
  beyond what follows from the new date.
- The command behaves like the existing changing commands, so no new kind of
  rule is needed.

## Provenance

Decided by `ROLE-product-manager` at SOLUTION_CONVERGENCE of INIT-0003;
`context_digest` `444a288e2444d5ce`, head `d4280a8`.

> Once `status: accepted`, this body is never rewritten. A change of mind is a
> new decision with `supersedes: PD-0011`.
