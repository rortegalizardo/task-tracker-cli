---
id: DM-INIT-0006
type: delivery-manifest
title: Delivery manifest for INIT-0006
status: authoritative
revision: 1
owner_role: ROLE-orchestrator
created: 2026-10-29
updated: 2026-10-29
updated_by_role: ROLE-orchestrator
initiative: INIT-0006
manifest_version: 1
band_owner: delivery
issued_on: 2026-10-29
issued_from_verdict: READY@2026-10-29
story_set_digest: "REQ-0015@3/2026-10-29; INIT-0006@3"
accepted_on: 2026-10-29
dispatch_unit: ticket
max_parallelism: 5
completion: pending
stories: [REQ-0015]
---

# Delivery manifest — INIT-0006

> Schema: `product/schemas/delivery-manifest.md`. Consumption:
> `product/architecture/delivery-fanout.md`.
> Product band (Identity → Ordering constraints) is written once by
> `ROLE-product-manager` and frozen at acceptance. Execution band (Dispatch
> units → Completion) is written only by `ROLE-orchestrator` at initiative scope.

## Identity

- Initiative: `INIT-0006` — Tasks with no due date are listed on their own in one short command
- Outcome: A person using `ttc` can see only their open tasks that have no due date with one short command, typing nothing else; see those tasks exactly as `ttc list` shows tasks today, with nothing written; and keep everything else as it is today: every command typed as it can be typed today gives the same output, apart from the `ttc list` and `ttc export` usage lines that `ttc help` prints, and data files written by older ttc still work (`initiative.md` `## Outcome`, O1–O3).
- Handoff packet: [`../product/state.md`](../product/state.md) `## Handoff packet`

## Shared references

- Design references: none — no user-facing surface
- Decisions in force: `PD-0003`, `PD-0004`, `PD-0009`, `PD-0010`, `PD-0014`
- Binding technical constraints:
  - C1 — `ttc list` stays read-only (no write, no file or folder created, older files left as they are); `ttc export` keeps its rules — `technical/assessment.md` round 1
  - C2 — "no due date" is the stored due value being empty; no stored-format change — `technical/assessment.md` round 1
  - C3 — today's line and order unchanged; `No tasks.` when none match — `technical/assessment.md` round 1
  - C4 — the two usage lines, the refusal text and its place in the check order are fixed text that tests assert exactly — `technical/assessment.md` round 1
  - C5 — `list` and `export` keep one shared option set — `technical/assessment.md` round 1
  - C6 — the test oracle and the argument fuzzing gain `--no-due` and its refusal, from the decided rules — `technical/assessment.md` round 1
  - C7 — the perf guard must still pass — `technical/assessment.md` round 1
  - C9 — `--no-due` combines with every view; never-matching combinations are refused — `technical/assessment.md` round 1
  - C10 — the check order, all before the read — `technical/assessment.md` round 1
- Explicitly out of scope: [`../initiative.md`](../initiative.md) `## Scope`, Out of scope
- Open questions (non-blocking): none

## Stories

| REQ- | Title | Status | Readiness | Depends on | Blocked by | Wave (planned) |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-0015 | Tasks with no due date are listed on their own in one short command | accepted | engineering-ready | none | none | 0 |

## Ordering constraints

none — dependencies are the only ordering

---

## Dispatch units

| Unit | Stories | Depends on | State | Attempts | Last outcome | Dispatch ref | Wave | Updated |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| RCDEV-864 | REQ-0015 | none | eligible | 0 | none | none | 0 | 2026-10-29 |

## Waves

| Wave | Units | Eligible-now count |
| --- | --- | --- |
| 0 | RCDEV-864 | 1 |

## Dispatch ledger

| Date | Unit | Event | Detail |
| --- | --- | --- | --- |

## Completion

_Computed per schema §5.8. `pending` until every unit is `complete`._
