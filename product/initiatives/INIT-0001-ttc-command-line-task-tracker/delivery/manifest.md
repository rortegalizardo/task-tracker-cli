---
id: DM-INIT-0001
type: delivery-manifest
title: Delivery manifest for INIT-0001
status: authoritative
revision: 1
owner_role: ROLE-orchestrator
created: 2026-10-20
updated: 2026-10-20
updated_by_role: ROLE-product-manager
initiative: INIT-0001
manifest_version: 1
band_owner: product
issued_on: 2026-10-20
issued_from_verdict: READY@2026-10-20
story_set_digest: "REQ-0001@6/2026-10-20; REQ-0002…REQ-0010@5/2026-10-20 each; INIT-0001@4"
accepted_on: none
dispatch_unit: ticket
max_parallelism: 5
completion: pending
stories: [REQ-0001, REQ-0002, REQ-0003, REQ-0004, REQ-0005, REQ-0006, REQ-0007, REQ-0008, REQ-0009, REQ-0010]
---

# Delivery manifest — INIT-0001

> Schema: `product/schemas/delivery-manifest.md`. Consumption:
> `product/architecture/delivery-fanout.md`.
> Product band (Identity → Ordering constraints) is written once by
> `ROLE-product-manager` and frozen at acceptance. Execution band (Dispatch
> units → Completion) is written only by `ROLE-orchestrator` at initiative scope.

## Identity

- Initiative: `INIT-0001` — Tasks are tracked locally from the ttc command line
- Outcome: One person can keep a to-do list from the terminal with the `ttc` command, on their own machine, on Node 24 with built-in libraries only and no network — adding tasks with optional due dates and tags, listing, completing, reopening, renaming, deleting and retagging them, seeing overdue ones, exporting and importing the whole list, and reading totals — with tasks kept in one local JSON file that is never left half written (`initiative.md` `## Outcome`, O1–O10).
- Handoff packet: [`../product/state.md`](../product/state.md) `## Handoff packet`

## Shared references

- Design references: none — no user-facing surface
- Decisions in force: `PD-0001`, `PD-0003`, `PD-0004`, `PD-0005`, `PD-0006`
- Binding technical constraints:
  - C1 — Node 24, built-in modules only, no network — `technical/assessment.md` round 1
  - C2 — atomic writes at process level; whole-old or whole-new after any failure — `technical/assessment.md` round 1
  - C3 — "today" is the local calendar date; time zone, clock and interruptions set from the test side only — `technical/assessment.md` round 1
  - C4 — each test uses its own data, home and working folders — `technical/assessment.md` round 1
  - C5 — ids bounded at 9007199254740991 — `technical/assessment.md` round 1
  - C6 — Node 24 on Linux with a UTC clock (CI) is the verification runtime — `technical/assessment.md` round 1
  - C7 — stored-file layout fixed by `REQ-0001`; stories after `REQ-0003` merge one at a time in `depends_on` order — `technical/assessment.md` round 1
- Explicitly out of scope: [`../initiative.md`](../initiative.md) `## Scope` (Out of scope)
- Open questions (non-blocking): none

## Stories

| REQ- | Title | Status | Readiness | Depends on | Blocked by | Wave (planned) |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-0001 | The ttc command prints its usage and keeps tasks in one atomically written file | accepted | engineering-ready | none | none | 0 |
| REQ-0002 | The ttc add command records a task with an optional due date and tags | accepted | engineering-ready | REQ-0001 | none | 1 |
| REQ-0003 | The ttc list command shows tasks by status and tag, one line each, in id order | accepted | engineering-ready | REQ-0001, REQ-0002 | none | 2 |
| REQ-0004 | The ttc done and ttc reopen commands change a task's status | accepted | engineering-ready | REQ-0001, REQ-0002, REQ-0003 | none | 3 |
| REQ-0005 | The ttc rename command changes a task's title | accepted | engineering-ready | REQ-0001, REQ-0002, REQ-0003 | none | 3 |
| REQ-0006 | The ttc delete command removes a task and its id is never reused | accepted | engineering-ready | REQ-0001, REQ-0002, REQ-0003 | none | 3 |
| REQ-0007 | The ttc list command marks overdue tasks and can show only them | accepted | engineering-ready | REQ-0001, REQ-0002, REQ-0003, REQ-0004 | none | 4 |
| REQ-0008 | The ttc tag command adds or removes one tag on a task | accepted | engineering-ready | REQ-0001, REQ-0002, REQ-0003 | none | 3 |
| REQ-0009 | The ttc export and ttc import commands copy the whole list to and from a file, and a file that fails validation changes nothing | accepted | engineering-ready | REQ-0001, REQ-0002, REQ-0003 | none | 3 |
| REQ-0010 | The ttc stats command prints the totals of open, done and overdue tasks | accepted | engineering-ready | REQ-0001, REQ-0002, REQ-0003, REQ-0004, REQ-0007 | none | 5 |

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
