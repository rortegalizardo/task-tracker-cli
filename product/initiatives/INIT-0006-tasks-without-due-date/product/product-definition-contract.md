---
initiative: INIT-0006
type: product-definition-contract
title: Product definition contract — Tasks with no due date are listed on their own in one short command
status: accepted
revision: 1
owner_role: ROLE-product-manager
drafted_by: ROLE-product-manager (inline, size rule §9d.2)
validated_by: ROLE-product-manager
created: 2026-10-29
updated: 2026-10-29
requirements: [REQ-0015]
open_questions: []
decisions: []
raw_sources:
  - initiatives/INIT-0006-tasks-without-due-date/product/sources/2026-10-29-requester-request.md
  - initiatives/INIT-0006-tasks-without-due-date/product/state.md (Discovery, Ambiguity log)
---

# Product definition contract — INIT-0006

## Problem

The requester says "Tasks without a due date get lost in my list", asks
"Give me a quick way to see just those", and asks to "Keep it simple" (raw
request).

## Actors

One person who keeps their own task list with `ttc` on their own machine. No
other actor (`CAP-0001` Boundaries: one user).

## Current behavior

`CAP-0001` covers local task tracking. `ttc list` shows open tasks, important
first, then by id; a task with no due date is a line with no `due:` token
among the others. No option shows only those tasks: `--due-from` and
`--due-to` leave them out, `--overdue` never shows them, and `--no-due` is an
unknown option. `ttc export` shares the `ttc list` options (`src/filter.js`,
README, `PD-0003` items 6–8, `PD-0009` items 4–5, head `5be0561`; Discovery
P1–P3).

## Desired outcomes

O1–O3 in `initiative.md` rev 2: one short command lists only the open tasks
with no due date; they are shown as `ttc list` shows tasks today and nothing
is written; nothing else changes.

## Requirements

| REQ- id | Status | One-line statement |
| --- | --- | --- |
| REQ-0015 | draft | Tasks with no due date are listed on their own in one short command |

## Constraints

- `project/constraints.md` rows 1–9 (Node 24, built-in libraries only, no
  network; one JSON file; atomic writes; one-line errors with non-zero exit;
  `node:test` tests and a passing CI `test` check; CLI only; repository
  `rortegalizardo/task-tracker-cli`).
- `PD-0003`, `PD-0004`, `PD-0009`, `PD-0010`: the existing argument, message,
  list view, line, order, file and format rules every command follows.

## Known facts

- The request names one problem, one job and one quality: tasks with no due
  date get lost (J1), see only those quickly (J2), keep it simple (J3).
  Source: raw request.
- "My list" is what `ttc list` shows by default: the open tasks (`PD-0003`
  item 7; Ambiguity log A2).
- A task with no due date is never overdue (`PD-0003` item 6), so no existing
  option ever shows it on its own.

## Rejected assumptions

- "The fix is to change the normal list, for example by moving tasks with no
  due date to the end." Not taken: the ask is "a quick way to see just
  those", and the views `ttc list` has today stay as they are
  (`initiative.md` out of scope).
- "The user also wants to give those tasks a due date." Not taken: the ask is
  to see them; giving or changing a due date after `ttc add` has been out of
  scope since INIT-0001 (Ambiguity log A8).
- "`ttc stats` should count them." Not taken: not asked (A9).

## Open questions

none.

## Decisions already made

None yet for this initiative. The ambiguity log rows A1–A9
(`product/state.md`) are PM-resolvable; A2, A3, A4, A6 and A7 are recorded in
the chosen-option `PD-` at SOLUTION_CONVERGENCE.

## Raw-source citations

- `initiatives/INIT-0006-tasks-without-due-date/product/sources/2026-10-29-requester-request.md`
- `initiatives/INIT-0006-tasks-without-due-date/product/state.md` — Discovery and Ambiguity log

## Non-goals

The out-of-scope list in `initiative.md` rev 2: no giving, changing or
clearing a due date, no `ttc stats` count, no change to how the views
`ttc list` has today show or order tasks, no sorting by due date, no
reminders, no other output change.
