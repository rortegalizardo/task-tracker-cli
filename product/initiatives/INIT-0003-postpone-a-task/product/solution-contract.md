---
initiative: INIT-0003
type: solution-contract
title: Solution contract — A task is postponed from the ttc command line in one short command
status: accepted
revision: 1
owner_role: ROLE-product-manager
drafted_by: ROLE-product-manager (inline, size rule §9d.2)
validated_by: ROLE-product-manager
created: 2026-10-27
updated: 2026-10-27
chosen_decision: PD-0011
design_refs: []
---

# Solution contract — INIT-0003

> Cites `PD-0011` and `technical/assessment.md` round 1. A drift between this
> contract and those records is a defect in this contract.

## Chosen concept

Option B (`PD-0011`): `ttc postpone <id>` moves the task's due date one
calendar day after the later of its due date and today, prints
`Postponed task <id> to <date>`, and changes nothing else. A task with no due
date, or due `9999-12-31`, is refused and nothing is written.

## Key journeys

1. **A task slipped today.** Task 3 is due 2026-10-20 and today is 2026-10-27.
   `ttc postpone 3` prints `Postponed task 3 to 2026-10-28`. `ttc list` shows
   `due:2026-10-28` with no `!overdue` (`PD-0011` items 3, 4, 9).
2. **Push a future task one more day.** Task 5 is due 2026-10-30.
   `ttc postpone 5` prints `Postponed task 5 to 2026-10-31` (item 3).
3. **A longer push.** Running `ttc postpone 5` again moves it to 2026-11-01;
   each run adds one day (item 3; Consequences).
4. **A task with no due date.** `ttc postpone 7` prints
   `ttc: task 7 has no due date` on stderr and exits 1; nothing changes
   (item 5).

## UX behavior

- Command, arguments and check order: `PD-0011` items 2 and 7.
- New-date rule: item 3. Messages: items 4, 5 and 6. Open and done tasks:
  item 8.
- What changes and what does not: item 9. Storage: item 10. Help and README:
  items 11 and 12.

## Visual direction

None. ttc is "CLI only, no UI" (`project/constraints.md` row 8); no design
concept exists and none is needed (`PD-0011` item 13). The terminal text above
is the whole surface.

## Accepted trade-offs

- A longer push takes several runs; the optional days value (option A) was
  rejected for "Keep it simple" and can be added later without changing
  `ttc postpone <id>` (`PD-0011` Options considered; assessment R5).
- Fixed text that tests assert (`PD-0011` Consequences).
- "Today" follows the machine's local date (assessment R4; `PD-0003` item 6).

## Unresolved risks

- R1 and R2 (`technical/assessment.md`): a wrong calendar count, or an oracle
  that copies the new code. Both are covered by C3 and C7, which bind the
  story.

## DES- references

None: no user-facing visual surface (`PD-0011` item 13).
