---
initiative: INIT-0002
type: product-definition-contract
title: Product definition contract — Important tasks are marked and listed first
status: accepted
revision: 1
owner_role: ROLE-product-manager
drafted_by: ROLE-product-manager (inline, size rule §9d.2)
validated_by: ROLE-product-manager
created: 2026-10-26
updated: 2026-10-26
requirements: [REQ-0011]
open_questions: []
decisions: []
raw_sources:
  - initiatives/INIT-0002-important-tasks-first/product/sources/2026-10-26-requester-request.md
  - initiatives/INIT-0002-important-tasks-first/product/state.md (Discovery, Ambiguity log)
---

# Product definition contract — INIT-0002

## Problem

The requester wants "to mark some tasks as more important than others and see
the important ones first when I list", and to "Keep it simple" (raw request).

## Actors

One person who keeps their own task list with `ttc` on their own machine. No
other actor (`CAP-0001` Boundaries: one user).

## Current behavior

`CAP-0001` covers local task tracking. No capability covers importance: no
command, option or stored field marks a task, and `ttc list` sorts by ascending
id only (`src/commands/list.js`, README, head `6ea6439`; Discovery P1–P2).

## Desired outcomes

O1–O3 in `initiative.md` rev 2: mark and unmark; important tasks first in
every `ttc list` view and filter, with a visible mark; nothing else changes.

## Requirements

| REQ- id | Status | One-line statement |
| --- | --- | --- |
| REQ-0011 | draft | Important tasks are marked from the ttc command line and listed first |

## Constraints

- `project/constraints.md` rows 1–9 (Node 24, built-in libraries only, no
  network; one JSON file; atomic writes; one-line errors with non-zero exit;
  `node:test` tests and a passing CI `test` check; CLI only; repository
  `rortegalizardo/task-tracker-cli`).
- `PD-0003`, `PD-0004`, `PD-0006`, `PD-0008`: the existing message, argument,
  id, file and failure rules every command follows.

## Known facts

- The request names two jobs and one quality: mark tasks (J1), see them first
  when listing (J2), keep it simple (J3). Source: raw request.
- `ttc list` prints `#<id> [ ]|[x] <title> [due:<date>] [!overdue] [+<tag>]...`
  in ascending id order (`src/commands/list.js`).
- `tasks.json` is format version 3 and older versions are read and migrated
  (README "Data file format").

## Rejected assumptions

- "Priorities were rejected for ttc." False: INIT-0001 left them out of its
  scope, and no `PD-` rejects them (`decisions/index.md`).

## Open questions

none.

## Decisions already made

None yet for this initiative. The ambiguity log rows A1–A9 (`product/state.md`)
are PM-resolvable and are recorded in the chosen-option `PD-` at
SOLUTION_CONVERGENCE.

## Raw-source citations

- `initiatives/INIT-0002-important-tasks-first/product/sources/2026-10-26-requester-request.md`
- `initiatives/INIT-0002-important-tasks-first/product/state.md` — Discovery and Ambiguity log

## Non-goals

The out-of-scope list in `initiative.md` rev 2: no levels, no importance filter,
no stats count, no CSV column, no change to export order, no other sort option,
no mark in `ttc note` output, no reminders, no automatic importance.
