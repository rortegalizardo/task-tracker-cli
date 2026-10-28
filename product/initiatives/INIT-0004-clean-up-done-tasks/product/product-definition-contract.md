---
initiative: INIT-0004
type: product-definition-contract
title: Product definition contract — Finished tasks are cleaned out of the list in one short command
status: accepted
revision: 1
owner_role: ROLE-product-manager
drafted_by: ROLE-product-manager (inline, size rule §9d.2)
validated_by: ROLE-product-manager
created: 2026-10-28
updated: 2026-10-28
requirements: [REQ-0013]
open_questions: []
decisions: []
raw_sources:
  - initiatives/INIT-0004-clean-up-done-tasks/product/sources/2026-10-28-requester-request.md
  - initiatives/INIT-0004-clean-up-done-tasks/product/state.md (Discovery, Ambiguity log)
---

# Product definition contract — INIT-0004

## Problem

The requester says "My list is cluttered with tasks I finished ages ago",
asks "Let me clean them up", and asks to "Keep it simple" (raw request).

## Actors

One person who keeps their own task list with `ttc` on their own machine. No
other actor (`CAP-0001` Boundaries: one user).

## Current behavior

`CAP-0001` covers local task tracking. A done task is stored for good: it
shows under `ttc list --done` and `--all`, counts in `ttc stats`, and goes into
every `ttc export`. The only way to remove it is `ttc delete <id>`, one task
per command. ttc does not record when a task was finished (`src/commands/`,
`src/storage.js`, README, head `21e02ed`; Discovery P1–P3).

## Desired outcomes

O1–O3 in `initiative.md` rev 2: clean finished tasks out of the list with one
short command, so the ones finished long ago no longer show; the output gives
how many were removed; nothing else changes.

## Requirements

| REQ- id | Status | One-line statement |
| --- | --- | --- |
| REQ-0013 | draft | Finished tasks are cleaned out of the list in one short command |

## Constraints

- `project/constraints.md` rows 1–9 (Node 24, built-in libraries only, no
  network; one JSON file; atomic writes; one-line errors with non-zero exit;
  `node:test` tests and a passing CI `test` check; CLI only; repository
  `rortegalizardo/task-tracker-cli`).
- `PD-0003`, `PD-0004`, `PD-0008`, `PD-0010`: the existing id, message,
  argument, file, failure and format rules every command follows, including
  "No command asks for confirmation" (`PD-0003` item 10) and "An id is never
  reused" (`PD-0003` item 1).

## Known facts

- The request names two jobs and one quality: get rid of tasks finished long
  ago (J1), all in one go (J2), and keep it simple (J3). Source: raw request.
- `ttc list` already hides done tasks by default (`PD-0003` item 7); the
  clutter is the done tasks still stored and shown everywhere else (P1).
- No finish date is stored (P3), so "finished long ago" cannot be told from
  "finished today" without storing new data.

## Rejected assumptions

- "Removing several tasks at once was rejected for ttc." False: `REQ-0006`
  left it out of its own scope because its usage line takes one id, and no
  `PD-` rejects it (`decisions/index.md`).
- "Clean up means hide." Not taken: hiding done tasks is already the default
  of `ttc list`, and the request is to clean them up (Ambiguity log A1).
- "The user must confirm first." Not taken: `PD-0003` item 10 (A3).

## Open questions

none.

## Decisions already made

None yet for this initiative. The ambiguity log rows A1–A9 (`product/state.md`)
are PM-resolvable and are recorded in the chosen-option `PD-` at
SOLUTION_CONVERGENCE.

## Raw-source citations

- `initiatives/INIT-0004-clean-up-done-tasks/product/sources/2026-10-28-requester-request.md`
- `initiatives/INIT-0004-clean-up-done-tasks/product/state.md` — Discovery and Ambiguity log

## Non-goals

The out-of-scope list in `initiative.md` rev 2: no removing open tasks, no
archive, undo or prompt, no narrowing by tag, date, id or search, no automatic
clean-ups, no finish dates shown, no reused ids, no other output change.
