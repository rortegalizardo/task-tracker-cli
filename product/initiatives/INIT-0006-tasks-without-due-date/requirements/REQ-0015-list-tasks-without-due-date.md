---
id: REQ-0015
type: requirement
title: Tasks with no due date are listed on their own in one short command
status: draft
revision: 2
owner_role: ROLE-product-manager
created: 2026-10-29
updated: 2026-10-29
initiative: INIT-0006
outcome_element: "O1, O2 and O3 (initiative.md): one short command lists only the open tasks with no due date, shown as ttc list shows tasks today, writing nothing; nothing else changes"
acceptance: []
capabilities: [CAP-0001]
design_refs: []
decisions: [PD-0014]
depends_on: [none]
constraints: []
observability: []
rollout: none
readiness: not-assessed
tickets: []
supersedes:
superseded_by:
---

# REQ-0015 — Tasks with no due date are listed on their own in one short command

> **Draft (PRODUCT_DEFINITION).** Requirement, scope and non-goals only.
> Behavior and acceptance criteria are written at DECOMPOSITION, after the
> chosen-option decision.

## Requirement

A user can list only their tasks that have no due date with one short
command. With nothing else typed it shows the open tasks with no due date,
each on the line `ttc list` prints for it today and in the same order, or
`No tasks.` when there are none. It writes nothing. Every command typed as it
can be typed today behaves as before, apart from two `ttc help` usage lines.

## Scope

- `ttc list --no-due`, its rules with the other `ttc list` options, and the
  refusal of the combinations that can never match (`PD-0014`).
- `ttc export --no-due`, with the same meaning (`PD-0014` item 6).
- Working on data files written by older ttc without rewriting them.
- The `ttc help` usage line and the README.
- Repository: `rortegalizardo/task-tracker-cli` (`project/constraints.md` row 9).

## Non-goals

- Giving, changing or clearing a due date, counting tasks with no due date in
  `ttc stats`, changing how the views `ttc list` has today show or order
  tasks, sorting by due date, reminders, any other output change: all out of
  scope in `initiative.md`.

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
