---
id: INIT-0005
type: initiative
title: A new task is made from an existing one without retyping it
status: active
revision: 3
owner_role: ROLE-product-manager
created: 2026-10-29
updated: 2026-10-29
capabilities: [CAP-0001]
requirements: [REQ-0014]
tickets: []
decisions: [PD-0013]
---

# INIT-0005 — A new task is made from an existing one without retyping it

## Outcome

When this is done, a person using `ttc` can:

- **O1.** Make a new task like an existing one with one short command that
  needs only the existing task's id. The new task holds the existing task's
  title, due date, tags, note and important mark, so none of them has to be
  typed again, and it is open.
- **O2.** See in that command's output the new task's id, without listing, so
  they can change the copy next.
- **O3.** Keep everything else as it is today: the original task and every
  other task with their ids and fields, ids that are never given again, the
  order and format of `ttc list`, and data files written by older ttc.

Source: the request (`product/sources/2026-10-29-requester-request.md`),
Discovery J1–J3 in `product/state.md`.

## Why now

The requester asked for it on 2026-10-29
(`product/sources/2026-10-29-requester-request.md`): "I often need another
task like an existing one." Today every such task is typed again in full with
`ttc add` (Discovery P1, P2).

## Scope

**In scope.**

- One command that makes a new open task from an existing one in one go.
- What the new task holds: the original's title, due date, tags, note and
  important mark; a new id; status open.
- The command's one option, `--due`, which gives the copy a different due
  date (`PD-0013`).
- The command's confirmation line, which gives the new task's id, and its
  errors.
- `ttc help` lists the new usage, and the README documents it.

**Out of scope.**

- Copying several tasks in one command.
- Changing the copy's title, tags, note or important mark in the copy
  command: `ttc rename`, `ttc tag`, `ttc note`, `ttc important` and
  `ttc unimportant` do it afterwards.
- Changing or clearing the due date of a task that already exists (INIT-0001
  out of scope), including removing the due date from a copy.
- Recurring tasks, or copies made automatically or on a schedule.
- Templates or saved task presets.
- Recording which task a copy came from.
- Copying a task into another list or file.
- Any change to the output of other commands, other than the new task being
  there.

## Success measures

1. `ttc copy <id>`, with nothing else typed, makes a new task and exits 0.
2. The task it makes has the original's title, due date, tags, note and
   important mark, is open, and has a higher id than any task ever created.
3. The command's one confirmation line gives the new task's id.
4. The original task and every other task are unchanged.
5. A task in a `tasks.json` written by older ttc can be copied without error.
6. The CI `test` check passes on the pull request that delivers the story
   (`project/constraints.md` row 7).

## Product constraints

`project/constraints.md` rows 1–9 apply unchanged.

## Requirements

- `REQ-0014` — A new task is made from an existing one in one short command.

## Capabilities affected

- `CAP-0001` — A person tracks their tasks locally from the ttc command line.

## Open questions

None.

## Scope log

| Date | Revision | Change | Reason |
| --- | --- | --- | --- |
| 2026-10-29 | 1 | Created at INTAKE | Triage verdict `new-initiative` |
| 2026-10-29 | 2 | Outcome O1–O3, scope, out of scope (8 items), success measures 1–6, `REQ-0014` | PRODUCT_DEFINITION |
| 2026-10-29 | 3 | `decisions: [PD-0013]`; in scope names the `--due` option; success measure 1 names `ttc copy <id>` | SOLUTION_CONVERGENCE, `PD-0013` (option B) |
