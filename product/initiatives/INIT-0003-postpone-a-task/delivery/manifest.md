---
id: DM-INIT-0003
type: delivery-manifest
title: Delivery manifest for INIT-0003
status: authoritative
revision: 1
owner_role: ROLE-orchestrator
created: 2026-10-27
updated: 2026-10-27
updated_by_role: ROLE-product-manager
initiative: INIT-0003
manifest_version: 1
band_owner: product
issued_on: 2026-10-27
issued_from_verdict: READY@2026-10-27
story_set_digest: "REQ-0012@3/2026-10-27; INIT-0003@3"
accepted_on: none
dispatch_unit: ticket
max_parallelism: 5
completion: pending
stories: [REQ-0012]
---

# Delivery manifest — INIT-0003

> Schema: `product/schemas/delivery-manifest.md`. Consumption:
> `product/architecture/delivery-fanout.md`.
> Product band (Identity → Ordering constraints) is written once by
> `ROLE-product-manager` and frozen at acceptance. Execution band (Dispatch
> units → Completion) is written only by `ROLE-orchestrator` at initiative scope.

## Identity

- Initiative: `INIT-0003` — A task is postponed from the ttc command line in one short command
- Outcome: A person using `ttc` can postpone a task with one short command that needs nothing but the task, after which the task is due later than it was and is not overdue; see the task's new due date in that command's output; and keep everything else as it is today: the task's other fields, every other task, the order of `ttc list`, and data files written by older ttc (`initiative.md` `## Outcome`, O1–O3).
- Handoff packet: [`../product/state.md`](../product/state.md) `## Handoff packet`

## Shared references

- Design references: none — no user-facing surface
- Decisions in force: `PD-0003`, `PD-0004`, `PD-0008`, `PD-0010`, `PD-0011`
- Binding technical constraints:
  - C1 — no stored-format change; `tasks.json` stays version 4 — `technical/assessment.md` round 1
  - C2 — the latest storable due date is 9999-12-31; a postpone past it is refused with fixed text before anything is written — `technical/assessment.md` round 1
  - C3 — the new date counts calendar days by the Gregorian rule, from the same local "today" the overdue rule uses — `technical/assessment.md` round 1
  - C4 — the command inherits the existing changing-command rules; there is no no-op case — `technical/assessment.md` round 1
  - C5 — the success line, the two refusals and the usage line are fixed text that tests assert exactly — `technical/assessment.md` round 1
  - C7 — the test oracle gains the command and its own calendar-day count, from the decided rules — `technical/assessment.md` round 1
  - C8 — the perf guard must still pass — `technical/assessment.md` round 1
- Explicitly out of scope: [`../initiative.md`](../initiative.md) `## Scope`, Out of scope
- Open questions (non-blocking): none

## Stories

| REQ- | Title | Status | Readiness | Depends on | Blocked by | Wave (planned) |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-0012 | A task is postponed from the ttc command line in one short command | accepted | engineering-ready | none | none | 0 |

## Ordering constraints

none — dependencies are the only ordering

---

## Dispatch units

| Unit | Stories | Depends on | State | Attempts | Last outcome | Dispatch ref | Wave | Updated |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |

## Waves

| Wave | Units | Eligible-now count |
| --- | --- | --- |

## Dispatch ledger

| Date | Unit | Event | Detail |
| --- | --- | --- | --- |

## Completion

_Computed per schema §5.8. `pending` until every unit is `complete`._
