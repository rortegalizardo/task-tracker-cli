---
id: REQ-0014
type: requirement
title: A new task is made from an existing one in one short command
status: draft
revision: 1
owner_role: ROLE-product-manager
created: 2026-10-29
updated: 2026-10-29
initiative: INIT-0005
outcome_element: "O1, O2 and O3 (initiative.md): make a new open task holding an existing task's title, due date, tags, note and important mark with one short command; the output gives the new id; nothing else changes"
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

# REQ-0014 — A new task is made from an existing one in one short command

> **Draft (PRODUCT_DEFINITION).** Requirement, scope and non-goals only.
> Behavior and acceptance criteria are written at DECOMPOSITION, after the
> chosen-option decision.

## Requirement

A user can make a new task from an existing one with one short command that
needs only the existing task's id. The new task has the original's title, due
date, tags, note and important mark, is open, and gets a new id, which the
command prints. The original task and every other task are unchanged.

## Scope

- The new copy command, its argument rules, its confirmation line and its
  errors.
- What the new task holds, and whether the command can give it a different
  due date.
- Keeping the original and every other task unchanged, and working on data
  files written by older ttc.
- The `ttc help` usage line and the README.
- Repository: `rortegalizardo/task-tracker-cli` (`project/constraints.md` row 9).

## Non-goals

- Copying several tasks at once, changing the copy's title, tags, note or mark
  in the copy command, changing or clearing an existing task's due date,
  recurring or automatic copies, templates, recording where a copy came from,
  copying into another list or file, any other output change: all out of
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
