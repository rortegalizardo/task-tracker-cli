---
id: CAP-0001
type: capability
title: A person tracks their tasks locally from the ttc command line
status: draft
revision: 1
owner_role: ROLE-product-manager
created: 2026-10-20
updated: 2026-10-20
surfaces: [the ttc command]
implemented_by: [INIT-0001]
decisions: [PD-0001, PD-0003, PD-0004, PD-0005]
---

# CAP-0001 — A person tracks their tasks locally from the ttc command line

> **Draft.** No release has shipped this yet. `INIT-0001` creates it, and its
> stories `REQ-0001`…`REQ-0010` name it. `SKILL-close-initiative` makes this
> record `authoritative` and rewrites "Behavior today" when the initiative
> ships. Until then, nothing here describes behaviour that exists.

## Behavior today

None yet. When `INIT-0001` ships, a person can:

- add, list, complete, reopen, rename and delete tasks;
- give tasks due dates and see which are overdue;
- tag tasks;
- export and import the whole list;
- read totals.

All of this runs from the `ttc` command, with tasks kept in one local JSON
file, under the rules of `PD-0003` and `PD-0004`.

## Surfaces

- The `ttc` command, and its `help` output.
- The data file `$TTC_HOME/tasks.json` (default `~/.ttc`).
- Export files the user names.

## Boundaries

None of the following, all excluded by `initiatives/INIT-0001-ttc-command-line-task-tracker/initiative.md` (out of scope):

- No graphical or full-screen interface.
- No network and no sync.
- No more than one user.
- No reminders.
- No recurring tasks, priorities or notes.
- No text search.
- No merging on import.
- No safe concurrent writes.
- No Windows.

No other capability covers adjacent behaviour.

## Constraints

- `project/constraints.md` rows 1–9.
- `PD-0005`, which accepts the architect's constraints C1–C7 (`initiatives/INIT-0001-ttc-command-line-task-tracker/technical/assessment.md`, round 1).
