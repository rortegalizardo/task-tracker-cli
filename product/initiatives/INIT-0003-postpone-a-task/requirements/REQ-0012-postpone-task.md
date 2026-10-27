---
id: REQ-0012
type: requirement
title: A task is postponed from the ttc command line in one short command
status: draft
revision: 1
owner_role: ROLE-product-manager
created: 2026-10-27
updated: 2026-10-27
initiative: INIT-0003
outcome_element: "O1, O2 and O3 (initiative.md): postpone a task with one short command so it is due later and not overdue; the output names the new due date; nothing else changes"
acceptance: []
capabilities: [CAP-0001]
design_refs: []
decisions: []
depends_on: [none]
constraints: []
observability: []
rollout: none
readiness: not-assessed
tickets: []
supersedes:
superseded_by:
---

# REQ-0012 — A task is postponed from the ttc command line in one short command

> **Draft (PRODUCT_DEFINITION).** Requirement, scope and non-goals only.
> Behavior and acceptance criteria are written at DECOMPOSITION, after the
> chosen-option decision.

## Requirement

A user can postpone a task by id with one short command. Its due date moves
later, counting from the later of its due date and today, so the task is not
overdue afterwards, and the command prints the new due date. A task with no
due date is refused and nothing changes.

## Scope

- The new postpone command, its argument rules, its confirmation line and its
  errors.
- The new-date rule, and the refusal of a task with no due date.
- Keeping every other field of the task and every other task unchanged, and
  working on data files written by older ttc.
- The `ttc help` usage lines.
- Repository: `rortegalizardo/task-tracker-cli` (`project/constraints.md` row 9).

## Non-goals

- Snoozing, setting or clearing a due date at will, a first due date for a task
  that has none, several tasks at once, a postpone count, weekends and
  holidays, reminders, recurring tasks: all out of scope in `initiative.md`.

## Behavior

_Written at DECOMPOSITION._

## Acceptance criteria

_Written at DECOMPOSITION._

## Sequencing

none — on the frontier.

## Technical constraints

_Written at DECOMPOSITION, from `technical/assessment.md`._

## Observability

none.

## Rollout

`none`.

## Notes

none.
