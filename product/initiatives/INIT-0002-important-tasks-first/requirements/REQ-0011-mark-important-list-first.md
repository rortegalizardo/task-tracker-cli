---
id: REQ-0011
type: requirement
title: Important tasks are marked from the ttc command line and listed first
status: draft
revision: 1
owner_role: ROLE-product-manager
created: 2026-10-26
updated: 2026-10-26
initiative: INIT-0002
outcome_element: "O1, O2 and O3 (initiative.md): mark and unmark a task as important; ttc list shows important tasks first and shows the mark; nothing else changes"
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

# REQ-0011 — Important tasks are marked from the ttc command line and listed first

> **Draft (PRODUCT_DEFINITION).** Requirement, scope and non-goals only.
> Behavior and acceptance criteria are written at DECOMPOSITION, after the
> chosen-option decision.

## Requirement

A user can mark a task as important and remove the mark, and `ttc list` shows
every important task before every other task and shows which tasks are
important.

## Scope

- Marking a task as important when it is added, and marking or unmarking an
  existing task by id.
- The order and the line format of `ttc list`, in every status view and with
  every filter.
- Storing the mark in `tasks.json`, keeping it through every other command, and
  carrying it through `ttc export` (JSON) and `ttc import`.
- Reading data files written by older ttc, with no task marked.
- The `ttc help` usage lines.

## Non-goals

- Importance levels, filtering by importance, counting in `ttc stats`, a CSV
  column, other sort orders: all out of scope in `initiative.md`.

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
