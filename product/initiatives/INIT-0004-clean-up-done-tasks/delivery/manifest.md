---
id: DM-INIT-0004
type: delivery-manifest
title: Delivery manifest for INIT-0004
status: authoritative
revision: 1
owner_role: ROLE-orchestrator
created: 2026-10-28
updated: 2026-10-28
updated_by_role: ROLE-orchestrator
initiative: INIT-0004
manifest_version: 1
band_owner: delivery
issued_on: 2026-10-28
issued_from_verdict: READY@2026-10-28
story_set_digest: "REQ-0013@3/2026-10-28; INIT-0004@3"
accepted_on: 2026-10-28
dispatch_unit: ticket
max_parallelism: 5
completion: pending
stories: [REQ-0013]
---

# Delivery manifest — INIT-0004

> Schema: `product/schemas/delivery-manifest.md`. Consumption:
> `product/architecture/delivery-fanout.md`.
> Product band (Identity → Ordering constraints) is written once by
> `ROLE-product-manager` and frozen at acceptance. Execution band (Dispatch
> units → Completion) is written only by `ROLE-orchestrator` at initiative scope.

## Identity

- Initiative: `INIT-0004` — Finished tasks are cleaned out of the list in one short command
- Outcome: A person using `ttc` can clean finished tasks out of their list with one short command that needs nothing else typed, after which the tasks they finished long ago no longer show under `ttc list --done` or `--all`, in `ttc stats`, or in `ttc export`; see in that command's output how many tasks it removed; and keep everything else as it is today: every open task with its id and fields, ids that are never given again, the order and format of `ttc list`, and data files written by older ttc (`initiative.md` `## Outcome`, O1–O3).
- Handoff packet: [`../product/state.md`](../product/state.md) `## Handoff packet`

## Shared references

- Design references: none — no user-facing surface
- Decisions in force: `PD-0003`, `PD-0004`, `PD-0008`, `PD-0010`, `PD-0012`
- Binding technical constraints:
  - C1 — inherits the existing changing-command rules; with nothing to remove it writes nothing (byte-identical, no upgrade, no file or folder created) — `technical/assessment.md` round 1
  - C2 — the next id is left as it is, even when every task is removed — `technical/assessment.md` round 1
  - C3 — the success line, its form for every number and the usage line and its position are fixed text that tests assert exactly — `technical/assessment.md` round 1
  - C4 — the test oracle and the argument fuzzing gain `clean`, from the decided rules — `technical/assessment.md` round 1
  - C5 — the perf guard must still pass — `technical/assessment.md` round 1
- Explicitly out of scope: [`../initiative.md`](../initiative.md) `## Scope`, Out of scope
- Open questions (non-blocking): none

## Stories

| REQ- | Title | Status | Readiness | Depends on | Blocked by | Wave (planned) |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-0013 | Finished tasks are cleaned out of the list in one short command | accepted | engineering-ready | none | none | 0 |

## Ordering constraints

none — dependencies are the only ordering

---

## Dispatch units

| Unit | Stories | Depends on | State | Attempts | Last outcome | Dispatch ref | Wave | Updated |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| RCDEV-858 | REQ-0013 | none | eligible | 0 | | | 0 | 2026-10-28 |

## Waves

| Wave | Units | Eligible-now count |
| --- | --- | --- |
| 0 | RCDEV-858 | 1 |

## Dispatch ledger

| Date | Unit | Event | Detail |
| --- | --- | --- | --- |

## Completion

_Computed per schema §5.8. `pending` until every unit is `complete`._
