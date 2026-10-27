---
initiative: INIT-0002
type: solution-contract
title: Solution contract — Important tasks are marked and listed first
status: accepted
revision: 1
owner_role: ROLE-product-manager
drafted_by: ROLE-product-manager (inline, size rule §9d.2)
validated_by: ROLE-product-manager
created: 2026-10-26
updated: 2026-10-26
chosen_decision: PD-0009
design_refs: []
---

# Solution contract — INIT-0002

> Cites `PD-0009`, `PD-0010` and `technical/assessment.md` round 1. A drift
> between this contract and those records is a defect in this contract.

## Chosen concept

Option A (`PD-0009`): one on/off important mark. `ttc add --important` and
`ttc important <id>` set it, `ttc unimportant <id>` clears it, and `ttc list`
prints important tasks first, ascending id inside each group, with a
`!important` token on their lines. The mark is stored in data format
version 4 (`PD-0010`). There is no design concept: ttc has no visual surface
(`project/constraints.md` row 8; `PD-0009` item 11).

## Key journeys

All serve `REQ-0011`.

1. **Add an important task.** `ttc add "Pay rent" --important` prints
   `Added task <id>`; the task lists first, with `!important`.
2. **Mark an existing task.** `ttc important <id>` prints
   `Marked task <id> as important`; again prints
   `Task <id> is already important` and writes nothing.
3. **Unmark a task.** `ttc unimportant <id>` prints
   `Removed important mark from task <id>`; again prints
   `Task <id> is not important` and writes nothing.
4. **List.** Every `ttc list` view and filter shows the matching important
   tasks first, then the rest, each group in ascending id order.
5. **Back up and restore.** `ttc export` (JSON) keeps marks; `ttc import`
   restores them.
6. **Upgrade.** A `tasks.json` from older ttc lists with no task marked; the
   next change writes version 4.

## UX behavior

- Default: a new task is not important (`PD-0009` item 1).
- Order: important first, ascending id inside each group, in every view and
  filter; with no important task shown, the order and the output are exactly
  today's (`PD-0009` item 4).
- Line: `#<id> [ ]|[x] <title> [due:YYYY-MM-DD] [!overdue] [!important] [+<tag>]...`
  (`PD-0009` item 5).
- The mark survives `done`, `reopen`, `rename`, `tag`, `note`, and an export
  then import (`PD-0009` items 6 and 8).
- Errors and no-ops follow the `done`/`reopen` rules (`PD-0009` item 3).
- Usage: `[--important]` ends the `ttc add` line; `ttc important <id>` and
  `ttc unimportant <id>` follow `ttc reopen <id>` (`PD-0009` item 7).

## Visual direction

`none — reuses existing patterns`: the `!important` token follows the
`!overdue` precedent. No visual surface.

## Accepted trade-offs

From the `## Options` table in `product/state.md` and the two decisions:

- Two groups only, no levels (option B rejected): less to learn, as asked.
- The data upgrade is one-way, even with no task marked (`PD-0010` item 4,
  architect C2/P1 option (a)).
- A title containing `!important` looks marked (`PD-0009`, architect P3).

## Unresolved risks

Carried into DECOMPOSITION from `technical/assessment.md`:

- **R1.** A code path that rewrites tasks drops the mark. Resolved by
  acceptance criteria that run every changing command and an export→import on
  a list holding important tasks.
- **R3.** The test oracle is updated from the new code rather than from the
  decisions. Resolved by C6, stated in the story's technical constraints.

R2 (downgrade) is accepted by `PD-0010`. R4 (a later move to levels) needs
nothing now.

## DES- references

None: no user-facing visual surface (`PD-0009` item 11).

| DES- id | Local export | Requirements served |
| --- | --- | --- |
| none | — | — |
