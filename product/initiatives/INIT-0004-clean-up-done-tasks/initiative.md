---
id: INIT-0004
type: initiative
title: Finished tasks are cleaned out of the list in one short command
status: draft
revision: 2
owner_role: ROLE-product-manager
created: 2026-10-28
updated: 2026-10-28
capabilities: [CAP-0001]
requirements: [REQ-0013]
tickets: []
decisions: []
---

# INIT-0004 — Finished tasks are cleaned out of the list in one short command

## Outcome

When this is done, a person using `ttc` can:

- **O1.** Clean finished tasks out of their list with one short command that
  needs nothing else typed, after which the tasks they finished long ago no
  longer show under `ttc list --done` or `--all`, in `ttc stats`, or in
  `ttc export`.
- **O2.** See in that command's output how many tasks it removed, without
  listing.
- **O3.** Keep everything else as it is today: every open task with its id and
  fields, ids that are never given again, the order and format of `ttc list`,
  and data files written by older ttc.

Source: the request (`product/sources/2026-10-28-requester-request.md`),
Discovery J1–J3 in `product/state.md`.

## Why now

The requester asked for it on 2026-10-28
(`product/sources/2026-10-28-requester-request.md`). Today a finished task can
only be removed one at a time with `ttc delete <id>`; INIT-0001 left
"Deleting several tasks in one command" out of `REQ-0006` because its usage
line takes one id. That was a story boundary, not a rejected decision: no
`PD-` rejects removing several tasks at once.

## Scope

**In scope.**

- One command that removes finished (done) tasks from the list in one go.
- Which finished tasks it removes (decided at SOLUTION_CONVERGENCE).
- The command's confirmation line, which gives the number of tasks removed,
  the case where there is nothing to remove, and its errors.
- `ttc help` lists the new usage, and the README documents it.

**Out of scope.**

- Removing open tasks.
- An archive, an undo, or an "are you sure?" prompt ("No command asks for
  confirmation", `PD-0003` item 10).
- Choosing which finished tasks to remove by tag, date, id or search text.
- Automatic or scheduled clean-ups.
- Showing when a task was finished.
- Giving a removed task's id to a new task.
- Any change to the output of `ttc list`, `ttc stats` or `ttc export` other
  than the removed tasks no longer being there.

## Success measures

1. `ttc <command>`, with nothing else typed, removes the finished tasks and
   exits 0.
2. Afterwards the removed tasks no longer show under `ttc list --done` or
   `--all`, in the `ttc stats` done count, or in `ttc export`.
3. The command's one confirmation line gives the number of tasks removed.
4. Every open task, with its id and fields, is unchanged, and the next task
   added gets a higher id than any task ever created.
5. A `tasks.json` written by older ttc can be cleaned without error.
6. The CI `test` check passes on the pull request that delivers the story
   (`project/constraints.md` row 7).

## Product constraints

`project/constraints.md` rows 1–9 apply unchanged.

## Requirements

- `REQ-0013` — Finished tasks are cleaned out of the list in one short command.

## Capabilities affected

- `CAP-0001` — A person tracks their tasks locally from the ttc command line.

## Open questions

None.

## Scope log

| Date | Revision | Change | Reason |
| --- | --- | --- | --- |
| 2026-10-28 | 1 | Created at INTAKE | Triage verdict `new-initiative` |
| 2026-10-28 | 2 | Outcome O1–O3, scope, out of scope (7 items), success measures 1–6, `REQ-0013` | PRODUCT_DEFINITION |
