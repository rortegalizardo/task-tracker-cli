---
initiative: INIT-0006
type: solution-contract
title: Solution contract — Tasks with no due date are listed on their own in one short command
status: accepted
revision: 1
owner_role: ROLE-product-manager
drafted_by: ROLE-product-manager (inline, size rule §9d.2)
validated_by: ROLE-product-manager
created: 2026-10-29
updated: 2026-10-29
chosen_decision: PD-0014
design_refs: []
---

# Solution contract — INIT-0006

> Cites `PD-0014` and `technical/assessment.md` round 1. A drift between this
> contract and those records is a defect in this contract.

## Chosen concept

Option B (`PD-0014`): `ttc list --no-due` narrows any status view to the
tasks with no due date, like `--tag`. With nothing else typed it shows the
open tasks with no due date, on today's lines and in today's order, and
writes nothing. `--no-due` with `--overdue`, `--due-from` or `--due-to` is
refused with `ttc: options cannot be combined: <opts>`. `ttc export` takes
the same option with the same meaning.

## Key journeys

1. **See the tasks that get lost.** Open task 1 `Pay rent` due `2000-01-02`,
   open task 2 `Call mom` with no due date, open task 3 `Plan trip` due
   `2099-05-01`, done task 4 `Fix bike` with no due date. `ttc list --no-due`
   prints `#2 [ ] Call mom` and exits 0 (`PD-0014` items 2, 4).
2. **Include finished ones.** `ttc list --all --no-due` prints `#2 [ ] Call mom`
   then `#4 [x] Fix bike` (item 2).
3. **Narrow further.** `ttc list --no-due --tag home` shows the open tasks
   with no due date tagged `home` (item 2).
4. **A contradiction is told, not hidden.** `ttc list --no-due --overdue`
   prints `ttc: options cannot be combined: --overdue --no-due` and exits 1
   (item 3).
5. **Export them.** `ttc export undated.json --no-due` writes every task with
   no due date, open and done, as a JSON export (item 6).

## UX behavior

- Meaning: `PD-0014` item 1. The option and its views: item 2. Refusal and
  check order: item 3.
- Lines and order: item 4. No write, missing and older files: item 5.
  Export: item 6. Help: item 7. README: item 8. Unchanged: item 9.

## Visual direction

None. ttc is "CLI only, no UI" (`project/constraints.md` row 8); no design
concept exists and none is needed (`PD-0014` item 11). The terminal text above
is the whole surface.

## Accepted trade-offs

- One exception to "all options combine with AND": the never-matching
  combinations are refused (`PD-0014` item 3, Consequences).
- `ttc export --no-due` exports open and done tasks, while `ttc list --no-due`
  lists open ones, as with `--tag` (item 6).
- Fixed text that tests assert (`PD-0014` Consequences).

## Unresolved risks

- R1 (`technical/assessment.md`): an oracle that copies the new code. Covered
  by C6, which binds the story.
- R2: a defect in the shared filter changes what today's views select.
  Covered by acceptance criteria that re-check today's views and filters on a
  list with dated and undated, open and done tasks.

## DES- references

None: no user-facing visual surface (`PD-0014` item 11).
