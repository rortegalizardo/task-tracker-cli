---
id: INIT-0002
type: initiative
title: Important tasks are marked and listed first
status: draft
revision: 2
owner_role: ROLE-product-manager
created: 2026-10-26
updated: 2026-10-26
capabilities: [CAP-0001]
requirements: [REQ-0011]
tickets: []
decisions: []
---

# INIT-0002 — Important tasks are marked and listed first

## Outcome

When this is done, a person using `ttc` can:

- **O1.** Mark a task as important, and remove the mark again.
- **O2.** Run `ttc list` and see every important task before every other task,
  in every view and with every filter, and see which tasks are important.
- **O3.** Keep everything else as it is today: a list with no important task
  prints exactly what it prints now, data files written by older ttc keep
  working, and the mark survives the other commands and an export/import round
  trip.

Source: the request (`product/sources/2026-10-26-requester-request.md`),
Discovery J1–J3 in `product/state.md`.

## Why now

The requester asked for it on 2026-10-26. INIT-0001 left "Priorities" out of
its scope. That was a scope boundary, not a rejected decision: no `PD-` rejects
it.

## Scope

**In scope.**

- A way to mark a task as important when adding it, and to mark or unmark an
  existing task.
- `ttc list` order: important tasks first, then the rest; today's order
  (ascending id) inside each group. This applies to every status view and
  filter.
- A visible sign on the list line of an important task.
- Keeping the mark in the data file, through the other commands, and through
  JSON export and import.
- Reading data files written by older ttc, with no task marked.
- `ttc help` lists the new usage.

**Out of scope.**

- More than one level of importance (for example high, medium, low): "Keep it
  simple" (request).
- A list option that shows only important tasks, or hides them.
- Counting important tasks in `ttc stats`.
- An importance column in the CSV export: its columns stay
  `id,title,status,due,tags,note`.
- Changing the order of `ttc export` output (JSON keeps stored order; CSV keeps
  ascending id).
- Any other sort order or sort option for `ttc list`.
- Showing the mark in `ttc note` output.
- Reminders or notifications for important tasks.
- Making a task important automatically (for example because it is overdue or
  due soon).

## Success measures

1. With tasks marked, `ttc list` in each view (`--open`, `--done`, `--all`,
   `--overdue`) and with each filter prints every marked task before every
   unmarked one, ascending id inside each group.
2. A marked task's line shows that it is marked; an unmarked task's line is
   unchanged.
3. With no task marked, `ttc list` output is byte-identical to today's.
4. A `tasks.json` written by older ttc (format versions 1–3) lists without
   error, with no task marked.
5. The CI `test` check passes on the pull request that delivers the story
   (`project/constraints.md` row 7).

## Product constraints

`project/constraints.md` rows 1–9 apply unchanged.

## Requirements

- `REQ-0011` — Important tasks are marked from the ttc command line and listed first.

## Capabilities affected

- `CAP-0001` — A person tracks their tasks locally from the ttc command line.

## Open questions

None.

## Scope log

| Date | Revision | Change | Reason |
| --- | --- | --- | --- |
| 2026-10-26 | 1 | Created at INTAKE | Triage verdict `new-initiative` |
| 2026-10-26 | 2 | Outcome O1–O3, scope, out of scope, success measures, `REQ-0011` | PRODUCT_DEFINITION |
