---
initiative: INIT-0003
type: product-definition-contract
title: Product definition contract — A task is postponed from the ttc command line in one short command
status: accepted
revision: 1
owner_role: ROLE-product-manager
drafted_by: ROLE-product-manager (inline, size rule §9d.2)
validated_by: ROLE-product-manager
created: 2026-10-27
updated: 2026-10-27
requirements: [REQ-0012]
open_questions: []
decisions: []
raw_sources:
  - initiatives/INIT-0003-postpone-a-task/product/sources/2026-10-27-requester-request.md
  - initiatives/INIT-0003-postpone-a-task/product/state.md (Discovery, Ambiguity log)
---

# Product definition contract — INIT-0003

## Problem

The requester says "I keep pushing tasks back", asks for "a quick way to
postpone a task", and asks to "Keep it simple" (raw request).

## Actors

One person who keeps their own task list with `ttc` on their own machine. No
other actor (`CAP-0001` Boundaries: one user).

## Current behavior

`CAP-0001` covers local task tracking. A due date is set only by `ttc add
--due`; no command changes it afterwards (`src/commands/`, README, head
`ae4417c`; `PD-0003` Consequences; Discovery P1–P2). An open task whose due
date has passed shows `!overdue` in `ttc list` until it is done.

## Desired outcomes

O1–O3 in `initiative.md` rev 2: postpone a task with one short command so it
is due later and not overdue; the output names the new due date; nothing else
changes.

## Requirements

| REQ- id | Status | One-line statement |
| --- | --- | --- |
| REQ-0012 | draft | A task is postponed from the ttc command line in one short command |

## Constraints

- `project/constraints.md` rows 1–9 (Node 24, built-in libraries only, no
  network; one JSON file; atomic writes; one-line errors with non-zero exit;
  `node:test` tests and a passing CI `test` check; CLI only; repository
  `rortegalizardo/task-tracker-cli`).
- `PD-0003`, `PD-0004`, `PD-0006`, `PD-0008`, `PD-0010`: the existing date,
  message, argument, id, file, failure and format rules every command follows.

## Known facts

- The request names two jobs and one quality: push tasks back (J1), quickly
  (J2), and keep it simple (J3). Source: raw request.
- A due date is `YYYY-MM-DD`; "today" is the local date; a task is overdue
  when it is open and due before today (`PD-0003` items 5–6, `src/overdue.js`).
- Changing commands print one confirmation line and work on open and done
  tasks (`src/commands/important.js`).

## Rejected assumptions

- "Changing a due date was rejected for ttc." False: INIT-0001 left it out of
  its scope because the spec named no command for it, and no `PD-` rejects it
  (`decisions/index.md`).
- "Postpone means hide the task for a while." Not taken: a task's only date is
  its due date, and a hide feature adds a new idea against "Keep it simple"
  (Ambiguity log A1).

## Open questions

none.

## Decisions already made

None yet for this initiative. The ambiguity log rows A1–A11 (`product/state.md`)
are PM-resolvable and are recorded in the chosen-option `PD-` at
SOLUTION_CONVERGENCE.

## Raw-source citations

- `initiatives/INIT-0003-postpone-a-task/product/sources/2026-10-27-requester-request.md`
- `initiatives/INIT-0003-postpone-a-task/product/state.md` — Discovery and Ambiguity log

## Non-goals

The out-of-scope list in `initiative.md` rev 2: no snooze, no setting or
clearing a due date at will, no first due date for an undated task, no several
tasks at once, no postpone count, no weekends or holidays, no reminders, no
recurring tasks, no other output change.
