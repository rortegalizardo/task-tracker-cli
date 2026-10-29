---
id: DM-INIT-0005
type: delivery-manifest
title: Delivery manifest for INIT-0005
status: authoritative
revision: 1
owner_role: ROLE-orchestrator
created: 2026-10-29
updated: 2026-10-29
updated_by_role: ROLE-product-manager
initiative: INIT-0005
manifest_version: 1
band_owner: product
issued_on: 2026-10-29
issued_from_verdict: READY@2026-10-29
story_set_digest: "REQ-0014@3/2026-10-29; INIT-0005@3"
accepted_on: none
dispatch_unit: ticket
max_parallelism: 5
completion: pending
stories: [REQ-0014]
---

# Delivery manifest — INIT-0005

> Schema: `product/schemas/delivery-manifest.md`. Consumption:
> `product/architecture/delivery-fanout.md`.
> Product band (Identity → Ordering constraints) is written once by
> `ROLE-product-manager` and frozen at acceptance. Execution band (Dispatch
> units → Completion) is written only by `ROLE-orchestrator` at initiative scope.

## Identity

- Initiative: `INIT-0005` — A new task is made from an existing one without retyping it
- Outcome: A person using `ttc` can make a new task like an existing one with one short command that needs only the existing task's id, the new task holding the existing task's title, due date, tags, note and important mark, so none of them has to be typed again, and being open; see in that command's output the new task's id, without listing, so they can change the copy next; and keep everything else as it is today: the original task and every other task with their ids and fields, ids that are never given again, the order and format of `ttc list`, and data files written by older ttc (`initiative.md` `## Outcome`, O1–O3).
- Handoff packet: [`../product/state.md`](../product/state.md) `## Handoff packet`

## Shared references

- Design references: none — no user-facing surface
- Decisions in force: `PD-0003`, `PD-0004`, `PD-0008`, `PD-0009`, `PD-0010`, `PD-0011`, `PD-0013`
- Binding technical constraints:
  - C1 — inherits the existing changing-command rules; a refusal writes nothing (byte-identical, no upgrade, no file or folder created) — `technical/assessment.md` round 1
  - C2 — the next id as for `add`, and the id-limit refusal — `technical/assessment.md` round 1
  - C3 — the success line, the usage line and its position, the id-limit refusal, the check order and the `--due` rules are fixed text that tests assert exactly — `technical/assessment.md` round 1
  - C4 — no stored-format change; older files are copied and written as version 4 — `technical/assessment.md` round 1
  - C5 — the copy is made from the original's stored form, open, and the original is unchanged — `technical/assessment.md` round 1
  - C6 — the test oracle and the argument fuzzing gain `copy` and its `--due` cases, from the decided rules — `technical/assessment.md` round 1
  - C7 — the perf guard must still pass — `technical/assessment.md` round 1
  - C8 — `--due` follows the `ttc add --due` rule exactly — `technical/assessment.md` round 1
  - C9 — `--due` can only set a date — `technical/assessment.md` round 1
- Explicitly out of scope: [`../initiative.md`](../initiative.md) `## Scope`, Out of scope
- Open questions (non-blocking): none

## Stories

| REQ- | Title | Status | Readiness | Depends on | Blocked by | Wave (planned) |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-0014 | A new task is made from an existing one in one short command | accepted | engineering-ready | none | none | 0 |

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
