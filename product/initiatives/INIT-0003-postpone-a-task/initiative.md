---
id: INIT-0003
type: initiative
title: A task is postponed from the ttc command line in one short command
status: draft
revision: 2
owner_role: ROLE-product-manager
created: 2026-10-27
updated: 2026-10-27
capabilities: [CAP-0001]
requirements: [REQ-0012]
tickets: []
decisions: []
---

# INIT-0003 — A task is postponed from the ttc command line in one short command

## Outcome

When this is done, a person using `ttc` can:

- **O1.** Postpone a task with one short command that needs nothing but the
  task, and afterwards the task is due later than it was and is not overdue.
- **O2.** See the task's new due date in that command's output, without
  listing.
- **O3.** Keep everything else as it is today: the task's title, status, tags,
  note, important mark and id, every other task, the order of `ttc list`, and
  data files written by older ttc.

Source: the request (`product/sources/2026-10-27-requester-request.md`),
Discovery J1–J3 in `product/state.md`.

## Why now

The requester asked for it on 2026-10-27
(`product/sources/2026-10-27-requester-request.md`). INIT-0001 left
"Changing or clearing a due date after `add`" out of its scope because the
spec had no command for it (`PD-0003` Consequences). That was a scope
boundary, not a rejected decision: no `PD-` rejects it.

## Scope

**In scope.**

- One command that postpones one task, by id, by moving its due date later.
- The rule for the new date: it counts from the later of the task's due date
  and today, so a postponed task is never overdue.
- What happens when the task has no due date (refused, nothing changes).
- The command's confirmation line, which names the new due date, and its
  errors.
- `ttc help` lists the new usage.

**Out of scope.**

- Hiding or snoozing a task until a later date: the task stays listed as it is
  today, with its new due date.
- Setting a task's due date to any chosen date, or clearing it.
- Giving a due date to a task that has none.
- Postponing several tasks in one command.
- Counting, storing or showing how often a task was postponed.
- Skipping weekends or holidays, or any time of day: postponing counts
  calendar days.
- Reminders or notifications.
- Recurring tasks.
- Any change to the output of `ttc list`, `ttc stats` or `ttc export` other
  than the postponed task's new due date.

## Success measures

1. `ttc <command> <id>`, with nothing else typed, postpones the task and exits 0.
2. Afterwards the task's due date is later than before and after today, and
   `ttc list` shows the new `due:` date with no `!overdue` on its line.
3. The command's one confirmation line names the task and its new due date.
4. Every other field of the task, every other task, and the `ttc list` order
   are unchanged.
5. A `tasks.json` written by older ttc can be postponed in without error.
6. The CI `test` check passes on the pull request that delivers the story
   (`project/constraints.md` row 7).

## Product constraints

`project/constraints.md` rows 1–9 apply unchanged.

## Requirements

- `REQ-0012` — A task is postponed from the ttc command line in one short command.

## Capabilities affected

- `CAP-0001` — A person tracks their tasks locally from the ttc command line.

## Open questions

None.

## Scope log

| Date | Revision | Change | Reason |
| --- | --- | --- | --- |
| 2026-10-27 | 1 | Created at INTAKE | Triage verdict `new-initiative` |
| 2026-10-27 | 2 | Outcome O1–O3, scope, out of scope (9 items), success measures 1–6, `REQ-0012` | PRODUCT_DEFINITION |
