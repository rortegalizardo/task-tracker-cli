---
id: INIT-0006
type: initiative
title: Tasks with no due date are listed on their own in one short command
status: draft
revision: 3
owner_role: ROLE-product-manager
created: 2026-10-29
updated: 2026-10-29
capabilities: [CAP-0001]
requirements: [REQ-0015]
tickets: []
decisions: [PD-0014]
---

# INIT-0006 — Tasks with no due date are listed on their own in one short command

## Outcome

When this is done, a person using `ttc` can:

- **O1.** See only their open tasks that have no due date with one short
  command, typing nothing else.
- **O2.** See those tasks exactly as `ttc list` shows tasks today: the same
  line for each task, the same order (important first, then by id), and
  `No tasks.` when there are none; and nothing is written.
- **O3.** Keep everything else as it is today: every command typed as it can
  be typed today gives the same output, apart from the `ttc list` and
  `ttc export` usage lines that `ttc help` prints; and data files written by
  older ttc still work.

Source: the request (`product/sources/2026-10-29-requester-request.md`),
Discovery J1–J3 in `product/state.md`.

## Why now

The requester asked for it on 2026-10-29
(`product/sources/2026-10-29-requester-request.md`): "Tasks without a due
date get lost in my list." Today no option shows them on their own
(Discovery P1, P2).

## Scope

**In scope.**

- One short way to list only the tasks with no due date, `ttc list --no-due`;
  with nothing else typed it shows the open ones (`PD-0014`).
- How it works with the other `ttc list` options, and its refusal of the
  combinations that can never match.
- `ttc export` takes the same option with the same meaning (`PD-0014`
  item 6).
- `ttc help` lists the new usage, and the README documents it.

**Out of scope.**

- Giving, changing or clearing a task's due date (INIT-0001 out of scope
  "Changing or clearing a due date after `add`").
- Counting tasks with no due date in `ttc stats`.
- Changing how `ttc list` shows or orders tasks in the views it has today,
  for example moving tasks with no due date to the end or marking them.
- Sorting tasks by due date.
- Reminders or prompts to give a task a due date.
- Any change to the output of a command typed as it can be typed today,
  other than the `ttc list` and `ttc export` usage lines in `ttc help`.

## Success measures

1. `ttc list --no-due`, with nothing else typed, shows only open tasks with
   no due date and exits 0.
2. Every task it shows has no due date, and every open task with no due date
   is shown.
3. Each task's line and the order are those `ttc list` gives today;
   `No tasks.` when none match; `tasks.json` is not changed, and not created
   when it is missing.
4. Every command typed as it can be typed today gives the same output as
   before; `ttc help` changes only in the `ttc list` and `ttc export` usage
   lines.
5. A `tasks.json` written by older ttc works with it and is not rewritten.
6. The CI `test` check passes on the pull request that delivers the story
   (`project/constraints.md` row 7).

## Product constraints

`project/constraints.md` rows 1–9 apply unchanged.

## Requirements

- `REQ-0015` — Tasks with no due date are listed on their own in one short
  command.

## Capabilities affected

- `CAP-0001` — A person tracks their tasks locally from the ttc command line.

## Open questions

None.

## Scope log

| Date | Revision | Change | Reason |
| --- | --- | --- | --- |
| 2026-10-29 | 1 | Created at INTAKE | Triage verdict `new-initiative` |
| 2026-10-29 | 2 | Outcome O1–O3, scope, out of scope (6 items), success measures 1–6, `REQ-0015` | PRODUCT_DEFINITION |
| 2026-10-29 | 3 | `decisions: [PD-0014]`; in scope names `ttc list --no-due`, the refusal and `ttc export`; O3, success measures 1 and 4 and the last out-of-scope item name the two `ttc help` usage lines | SOLUTION_CONVERGENCE, `PD-0014` (option B; architect P1) |
