---
id: REQ-0013
type: requirement
title: Finished tasks are cleaned out of the list in one short command
status: draft
revision: 1
owner_role: ROLE-product-manager
created: 2026-10-28
updated: 2026-10-28
initiative: INIT-0004
outcome_element: "O1, O2 and O3 (initiative.md): clean finished tasks out of the list with one short command; the output gives how many were removed; nothing else changes"
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

# REQ-0013 — Finished tasks are cleaned out of the list in one short command

> **Draft (PRODUCT_DEFINITION).** Requirement, scope and non-goals only.
> Behavior and acceptance criteria are written at DECOMPOSITION, after the
> chosen-option decision.

## Requirement

A user can remove finished tasks from their list with one short command that
needs nothing else typed. The command prints how many tasks it removed. Open
tasks are untouched, and a removed task's id is never given again.

## Scope

- The new clean-up command, its argument rules, its confirmation line, the
  nothing-to-remove case and its errors.
- Which finished tasks it removes.
- Keeping every open task and its fields unchanged, and working on data files
  written by older ttc.
- The `ttc help` usage lines and the README.
- Repository: `rortegalizardo/task-tracker-cli` (`project/constraints.md` row 9).

## Non-goals

- Removing open tasks, an archive, an undo, an "are you sure?" prompt,
  narrowing by tag, date, id or search, automatic clean-ups, showing when a
  task was finished, reusing ids: all out of scope in `initiative.md`.

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
