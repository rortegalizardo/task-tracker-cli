---
initiative: INIT-0005
type: product-definition-contract
title: Product definition contract — A new task is made from an existing one without retyping it
status: accepted
revision: 1
owner_role: ROLE-product-manager
drafted_by: ROLE-product-manager (inline, size rule §9d.2)
validated_by: ROLE-product-manager
created: 2026-10-29
updated: 2026-10-29
requirements: [REQ-0014]
open_questions: []
decisions: []
raw_sources:
  - initiatives/INIT-0005-copy-a-task/product/sources/2026-10-29-requester-request.md
  - initiatives/INIT-0005-copy-a-task/product/state.md (Discovery, Ambiguity log)
---

# Product definition contract — INIT-0005

## Problem

The requester says "I often need another task like an existing one", asks
"Let me make a copy without retyping everything", and asks to "Keep it
simple" (raw request).

## Actors

One person who keeps their own task list with `ttc` on their own machine. No
other actor (`CAP-0001` Boundaries: one user).

## Current behavior

`CAP-0001` covers local task tracking. A task is made only with `ttc add`,
which needs the title, due date, each tag, the note and the important mark
typed again. No command makes a task from another. After a task exists, its
title, tags, note and mark can be changed, but its due date only moves one day
at a time with `ttc postpone`, which never sets or clears one
(`src/commands/`, README, `PD-0011` items 3, 5, head `7f4bddf`; Discovery
P1–P3).

## Desired outcomes

O1–O3 in `initiative.md` rev 2: make a new open task holding an existing
task's title, due date, tags, note and important mark with one short command
that needs only its id; the output gives the new id; nothing else changes.

## Requirements

| REQ- id | Status | One-line statement |
| --- | --- | --- |
| REQ-0014 | draft | A new task is made from an existing one in one short command |

## Constraints

- `project/constraints.md` rows 1–9 (Node 24, built-in libraries only, no
  network; one JSON file; atomic writes; one-line errors with non-zero exit;
  `node:test` tests and a passing CI `test` check; CLI only; repository
  `rortegalizardo/task-tracker-cli`).
- `PD-0003`, `PD-0004`, `PD-0008`, `PD-0009`, `PD-0010`, `PD-0011`: the
  existing id, message, argument, file, failure, important-mark, format and
  latest-due-date rules every command follows, including "An id is never
  reused" (`PD-0003` item 1).

## Known facts

- The request names two jobs and one quality: often make a task like an
  existing one (J1), as a copy without retyping (J2), and keep it simple (J3).
  Source: raw request.
- Every detail of a task except its due date can be changed after the task
  exists (P3), so a copy can be adjusted afterwards, except for its due date.

## Rejected assumptions

- "Copying is a recurring-task feature, which INIT-0001 left out." Not taken:
  a copy is made by hand, once, when the user asks; recurring tasks stay out
  of scope (Ambiguity log; `initiative.md` out of scope).
- "The copy keeps the original's status." Not taken: "another task" is new
  work, so the copy is open (Ambiguity log A2).
- "The copy remembers its original." Not taken: nothing in the ask needs it
  (A8).

## Open questions

none.

## Decisions already made

None yet for this initiative. The ambiguity log rows A1–A10
(`product/state.md`) are PM-resolvable and are recorded in the chosen-option
`PD-` at SOLUTION_CONVERGENCE.

## Raw-source citations

- `initiatives/INIT-0005-copy-a-task/product/sources/2026-10-29-requester-request.md`
- `initiatives/INIT-0005-copy-a-task/product/state.md` — Discovery and Ambiguity log

## Non-goals

The out-of-scope list in `initiative.md` rev 2: no copying several tasks, no
changing title, tags, note or mark in the copy command, no changing or
clearing an existing task's due date, no recurring or automatic copies, no
templates, no link to the original, no copying to another list or file, no
other output change.
