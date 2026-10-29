---
initiative: INIT-0005
type: solution-contract
title: Solution contract — A new task is made from an existing one without retyping it
status: accepted
revision: 1
owner_role: ROLE-product-manager
drafted_by: ROLE-product-manager (inline, size rule §9d.2)
validated_by: ROLE-product-manager
created: 2026-10-29
updated: 2026-10-29
chosen_decision: PD-0013
design_refs: []
---

# Solution contract — INIT-0005

> Cites `PD-0013` and `technical/assessment.md` round 1. A drift between this
> contract and those records is a defect in this contract.

## Chosen concept

Option B (`PD-0013`): `ttc copy <id> [--due YYYY-MM-DD]` adds one new open
task with the original's title, due date, tags, note and important mark and
the next id, in one atomic write, and prints `Copied task <id> as task
<new-id>`. With `--due` the new task gets that date instead. The original and
every other task are unchanged.

## Key journeys

1. **Copy a task as it is.** Task 3 is `Pay rent`, done, important, due
   `2026-10-01`, tagged `bills` and `home`, with a note; the next id is 8.
   `ttc copy 3` prints `Copied task 3 as task 8`. Task 8 is open and holds
   the same title, due date, tags, note and mark; task 3 is still done and
   unchanged (`PD-0013` items 1, 4, 8).
2. **Copy for another day.** `ttc copy 3 --due 2026-11-01` adds a task like
   task 3, due `2026-11-01` (item 3).
3. **Adjust the copy afterwards.** `ttc rename 8 "Pay rent November"`,
   `ttc tag 8 -home` or `ttc unimportant 8` change only the copy (items 1, 8;
   the existing commands are unchanged).
4. **Mistakes change nothing.** `ttc copy 99` with no task 99 prints
   `ttc: no task with id 99` and exits 1; `ttc copy 3 --due 2026-02-30`
   prints `ttc: invalid date: 2026-02-30` and exits 1; `tasks.json` stays
   byte-identical (items 3, 6).

## UX behavior

- What a copy holds: `PD-0013` item 1. Command and arguments: item 2.
  `--due`: item 3.
- Messages: item 4. Ids and the id limit: item 5. Errors and check order:
  item 6.
- Shared rules: item 7. What changes and what does not: item 8. Listing:
  item 9. Storage: item 10. Help and README: items 11 and 12.

## Visual direction

None. ttc is "CLI only, no UI" (`project/constraints.md` row 8); no design
concept exists and none is needed (`PD-0013` item 14). The terminal text above
is the whole surface.

## Accepted trade-offs

- Copy then delete can stand in for a reschedule with a new id; the README
  does not present it that way (`PD-0013` item 13, Consequences; R4).
- Copying an overdue task without `--due` gives an overdue task (item 1).
- `--due` can set a date but not remove one (item 3; C9).
- Fixed text that tests assert (`PD-0013` Consequences).

## Unresolved risks

- R1 (`technical/assessment.md`): an oracle that copies the new code. Covered
  by C6, which binds the story.
- R2: a defect that changes the original as well as the copy. Covered by
  acceptance criteria that check the original and every other task.

## DES- references

None: no user-facing visual surface (`PD-0013` item 14).
