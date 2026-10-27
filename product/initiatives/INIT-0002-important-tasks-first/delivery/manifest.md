---
id: DM-INIT-0002
type: delivery-manifest
title: Delivery manifest for INIT-0002
status: authoritative
revision: 1
owner_role: ROLE-orchestrator
created: 2026-10-26
updated: 2026-10-27
updated_by_role: ROLE-orchestrator
initiative: INIT-0002
manifest_version: 1
band_owner: delivery
issued_on: 2026-10-26
issued_from_verdict: READY@2026-10-26
story_set_digest: "REQ-0011@3/2026-10-26; INIT-0002@3"
accepted_on: 2026-10-27
dispatch_unit: ticket
max_parallelism: 5
completion: complete
stories: [REQ-0011]
---

# Delivery manifest — INIT-0002

> Schema: `product/schemas/delivery-manifest.md`. Consumption:
> `product/architecture/delivery-fanout.md`.
> Product band (Identity → Ordering constraints) is written once by
> `ROLE-product-manager` and frozen at acceptance. Execution band (Dispatch
> units → Completion) is written only by `ROLE-orchestrator` at initiative scope.

## Identity

- Initiative: `INIT-0002` — Important tasks are marked and listed first
- Outcome: A person using `ttc` can mark a task as important and remove the mark again, see every important task before every other task in every `ttc list` view and filter, with the mark shown on its line, and keep everything else as it is today: a list with no important task prints exactly what it prints now, data files written by older ttc keep working, and the mark survives the other commands and a JSON export/import round trip (`initiative.md` `## Outcome`, O1–O3).
- Handoff packet: [`../product/state.md`](../product/state.md) `## Handoff packet`

## Shared references

- Design references: none — no user-facing surface
- Decisions in force: `PD-0003`, `PD-0004`, `PD-0008`, `PD-0009`, `PD-0010`
- Binding technical constraints:
  - C1 — the mark needs data format version 4; versions 1–3 are read with no task important — `technical/assessment.md` round 1
  - C2 — the format 4 upgrade is one-way — `technical/assessment.md` round 1
  - C3 — the new rules are fixed text that tests assert exactly — `technical/assessment.md` round 1
  - C4 — the new commands inherit the existing changing-command rules — `technical/assessment.md` round 1
  - C5 — one strict parse path for `tasks.json` and import files, the mark included — `technical/assessment.md` round 1
  - C6 — the test oracle moves with the change, from the decided rules — `technical/assessment.md` round 1
  - C7 — the perf guard must still pass — `technical/assessment.md` round 1
- Explicitly out of scope: [`../initiative.md`](../initiative.md) `## Scope`, Out of scope
- Open questions (non-blocking): none

## Stories

| REQ- | Title | Status | Readiness | Depends on | Blocked by | Wave (planned) |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-0011 | Important tasks are marked from the ttc command line and listed first | accepted | engineering-ready | none | none | 0 |

## Ordering constraints

none — dependencies are the only ordering

---

## Dispatch units

| Unit | Stories | Depends on | State | Attempts | Last outcome | Dispatch ref | Wave | Updated |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| RCDEV-856 | REQ-0011 | none | complete | 1 | RCDEV-856 — SHIP — release.md (PR #32 merged as 1f40678) — done | INIT-0002 / orch-RCDEV-856 / PR #32 | 0 | 2026-10-27 |

## Waves

| Wave | Units | Eligible-now count |
| --- | --- | --- |
| 0 | RCDEV-856 | 0 |

## Dispatch ledger

| Date | Unit | Event | Detail |
| --- | --- | --- | --- |
| 2026-10-27 | RCDEV-856 | dispatched | cap 5 (manifest max_parallelism, no override); 06:10:27Z; launcher, default models |
| 2026-10-27 | RCDEV-856 | completed | PR #32 MERGED 2026-10-27T06:33:09Z, merge commit 1f406784499ab4ddc1071452369e463ce3f213a8, head 7e82f512 (gh pr view) |
| 2026-10-27 | — | completion | complete: every unit complete |

## Completion

_Computed per schema §5.8. `pending` until every unit is `complete`._
