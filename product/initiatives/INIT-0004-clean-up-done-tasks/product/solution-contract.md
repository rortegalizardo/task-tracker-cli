---
initiative: INIT-0004
type: solution-contract
title: Solution contract — Finished tasks are cleaned out of the list in one short command
status: accepted
revision: 1
owner_role: ROLE-product-manager
drafted_by: ROLE-product-manager (inline, size rule §9d.2)
validated_by: ROLE-product-manager
created: 2026-10-28
updated: 2026-10-28
chosen_decision: PD-0012
design_refs: []
---

# Solution contract — INIT-0004

> Cites `PD-0012` and `technical/assessment.md` round 1. A drift between this
> contract and those records is a defect in this contract.

## Chosen concept

Option A (`PD-0012`): `ttc clean` removes every done task from `tasks.json`
in one atomic write, prints `Removed <n> done tasks`, and changes nothing
else. With no done task it prints `Removed 0 done tasks` and writes nothing.

## Key journeys

1. **Clean out finished tasks.** Tasks 1 and 3 are done, task 2 is open.
   `ttc clean` prints `Removed 2 done tasks`. `ttc list --done` then prints
   `No tasks.`, `ttc list --all` shows only task 2, and `ttc stats` prints
   `done: 0` (`PD-0012` items 3, 4, 9).
2. **Look first, keep one.** `ttc list --done` shows what will go;
   `ttc reopen 3` keeps task 3; `ttc clean` then prints
   `Removed 1 done tasks` (items 4, 12).
3. **Nothing to clean.** With only open tasks, `ttc clean` prints
   `Removed 0 done tasks`, exits 0, and `tasks.json` is unchanged (item 5).
4. **Ids stay unique.** After cleaning, `ttc add` gives the new task a higher
   id than any task ever created (item 7).

## UX behavior

- Command and arguments: `PD-0012` item 2. Which tasks: item 3.
- Messages: items 4 and 5. No prompt: item 6. Ids: item 7.
- Shared rules and check order: item 8. What changes and what does not:
  item 9. Storage: item 10. Help and README: items 11 and 12.

## Visual direction

None. ttc is "CLI only, no UI" (`project/constraints.md` row 8); no design
concept exists and none is needed (`PD-0012` item 13). The terminal text above
is the whole surface.

## Accepted trade-offs

- Recently finished tasks are removed too, for good; the README points at
  `ttc list --done`, `ttc reopen` and `ttc export --done` first (`PD-0012`
  Consequences; assessment P7).
- One line form for every number: `Removed 1 done tasks` (item 4).
- Fixed text that tests assert (`PD-0012` Consequences).
- An age rule added later would change what `ttc clean` removes
  (assessment R6).

## Unresolved risks

- R5 (`technical/assessment.md`): an oracle that copies the new code. Covered
  by C4, which binds the story.

## DES- references

None: no user-facing visual surface (`PD-0012` item 13).
