---
initiative: INIT-0001
type: solution-contract
title: Solution contract — Tasks are tracked locally from the ttc command line
status: draft
revision: 1
owner_role: ROLE-product-manager
drafted_by: sonnet-drafting-child
validated_by: ROLE-product-manager
created: 2026-10-20
updated: 2026-10-20
chosen_decision: PD-0005
design_refs: []
---

# Solution contract — INIT-0001

## Chosen concept

INIT-0001 is built as option A, accepted in `PD-0005`: the `ttc` command as the requester's spec states it. It has ten command groups, one story each (`REQ-0001` to `REQ-0010`), in the spec's order. Behaviour follows `PD-0003` and `PD-0004`. All tasks live in one JSON file at `$TTC_HOME/tasks.json`, and the program uses Node 24 built-ins only. The technical architect assessed this option as `feasible-with-constraints`, complexity band `multi-component` (`technical/assessment.md`, round 1), and `PD-0005` accepts constraints C1 to C7 as stated there.

## Key journeys

- Discover the commands: `ttc help` prints the usage, and tasks are kept in one local file that is never left half written (`REQ-0001`).
- Capture a task: `ttc add` records one task with an optional due date and tags (`REQ-0002`).
- Review tasks: `ttc list` shows open, done or all tasks, optionally only those holding one tag, one line each in id order (`REQ-0003`).
- Complete or reopen a task: `ttc done` and `ttc reopen` change a task's status (`REQ-0004`).
- Fix a title: `ttc rename` changes a task's title (`REQ-0005`).
- Remove a task: `ttc delete` removes it, and its id is never given to another task (`REQ-0006`).
- See what is overdue: `ttc list` marks overdue open tasks, and `ttc list --overdue` shows only them (`REQ-0007`).
- Retag a task: `ttc tag` adds one tag to, or removes one tag from, a task (`REQ-0008`).
- Back up and restore: `ttc export` copies the whole list to a file, `ttc import` replaces the list from a file, and a file that fails validation changes nothing (`REQ-0009`).
- Read the totals: `ttc stats` prints the totals of open, done and overdue tasks (`REQ-0010`).

## UX behavior

The wording and forms are fixed in the decisions below. This list points to them and does not restate them.

- **Defaults.** What `list` shows when no status option is given: `PD-0003` item 7.
- **Ordering.** Tasks in ascending id order: `PD-0003` item 7. Tags in alphabetical order: `PD-0003` items 4 and 8.
- **One-line output.** The task line: `PD-0003` item 8. The success line of each command: `PD-0003` item 10. The empty-list line of `list`: `PD-0003` item 7. The totals of `stats`: `PD-0003` item 15. The usage text: `PD-0003` item 12.
- **One-line errors.** The one-line stderr form and exit code 1: `PD-0003` item 11. The messages that `PD-0004` adds or fixes: items 1 (titles), 2 (ids), 7 (what "unchanged" means) and 8 (an unreadable stored list).
- **No confirmation prompts.** No command asks for confirmation: `PD-0003` item 10.
- **No-op messages.** A repeated action succeeds and changes nothing: `PD-0003` item 9.

## Visual direction

none — no visual surface; CLI only, no UI (`PD-0001` item 3). Output is plain text lines whose wording is fixed in `PD-0003` and `PD-0004`.

## Accepted trade-offs

The `Options` table in `product/state.md` records for option A: "None inside the spec: every alternative changes something the requester fixed." `PD-0005` Options considered gives the reason each alternative was not taken, and its Consequences list the costs below.

- **Merge order.** Stories that could be built in parallel after `REQ-0003` still merge one at a time, because they share the command list, the usage text and the argument rules (C7; `PD-0005` Consequences).
- **Fixed layout.** The stored-file layout fixed in `REQ-0001` is costly to change later, because later stories' tests write that layout directly (C7; `PD-0005` Consequences).
- **Unprotected `main`.** `main` is not branch-protected, so a red `test` check is caught by the ship step rather than by GitHub (R6; `PD-0005` Consequences). Protecting `main` is the owner's to decide.

## Unresolved risks

From `technical/assessment.md`, round 1, Architectural risks. Each is carried into DECOMPOSITION.

- **R1.** A stopped-write test passes while the write is still not atomic, because the simulated interruption hits only one step of a multi-step write. Resolved when the interruption is applied at every filesystem step a write takes, including folder creation, and reviewed at delivery.
- **R2.** Date-relative tests compute the date in the test and again in `ttc`, so a run that crosses midnight in that zone fails once. Resolved by fixing the clock from the test side, or by accepting a rare flake.
- **R3.** A UTC-instead-of-local date bug, or a due date read as a UTC instant, passes every test that does not set `TZ`, because CI runs on UTC. Resolved by keeping the time-zone pair criteria in `REQ-0007` and `REQ-0010` through DECOMPOSITION.
- **R4.** Parallel sibling stories conflict on the shared command list, usage text and argument rules. Resolved by C7: stories merge in `depends_on` order.
- **R5.** Tests pass on the local Node 26 and fail on CI's Node 24, or the reverse. Resolved by treating CI as the arbiter, with Node 24.4.0 installed locally for checks.
- **R6.** `main` is not branch-protected and CI does not run on `main`, so a pull request can merge with a red `test` check. Resolved by the ship step refusing red checks; the owner may also protect `main` (operational).

## DES- references

There are no `DES-` records: the initiative has no visual surface (`PD-0001` item 3).

| DES- id | Local export | Requirements served |
| --- | --- | --- |
| none | — | — |
