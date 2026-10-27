---
id: DM-INIT-0001
type: delivery-manifest
title: Delivery manifest for INIT-0001
status: authoritative
revision: 1
owner_role: ROLE-orchestrator
created: 2026-10-20
updated: 2026-10-21
updated_by_role: ROLE-orchestrator
initiative: INIT-0001
manifest_version: 1
band_owner: delivery
issued_on: 2026-10-20
issued_from_verdict: READY@2026-10-20
story_set_digest: "REQ-0001@6/2026-10-20; REQ-0002…REQ-0010@5/2026-10-20 each; INIT-0001@4"
accepted_on: 2026-10-21
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
| RCDEV-822 | REQ-0001 | none | complete | 1 | DONE: RCDEV-822 — shipped — https://github.com/rortegalizardo/task-tracker-cli/pull/2 — done | INIT-0001 / orch-RCDEV-822 / PR #2 branch RCDEV-822 | 0 | 2026-10-21 |
| RCDEV-823 | REQ-0002 | RCDEV-822 | complete | 1 | DONE: RCDEV-823 is shipped. PR #3 merged into main as c907a1b, and the CI test check passed. | INIT-0001 / orch-RCDEV-823 / PR #3 branch RCDEV-823 | 1 | 2026-10-21 |
| RCDEV-824 | REQ-0003 | RCDEV-822, RCDEV-823 | complete | 1 | shipped — Status: merged (check-ticket; session still finishing at completion) | INIT-0001 / orch-RCDEV-824 / PR #4 branch RCDEV-824 | 2 | 2026-10-21 |
| RCDEV-825 | REQ-0004 | RCDEV-822, RCDEV-823, RCDEV-824 | complete | 1 | DONE: RCDEV-825 shipped … merged into main through PR #6 (merge commit 73e7788). test passed, review-002 approved, Linear Done. | INIT-0001 / orch-RCDEV-825 / PR #6 branch RCDEV-825 | 3 | 2026-10-21 |
| RCDEV-826 | REQ-0005 | RCDEV-822, RCDEV-823, RCDEV-824 | complete | 1 | DONE: RCDEV-826 (`ttc rename`) is merged into `main` as PR #5 (https://github.com/rortegalizardo/task-tracker-cli/pull/5), merge commit e8a7678. | INIT-0001 / orch-RCDEV-826 / PR #5 branch RCDEV-826 | 3 | 2026-10-21 |
| RCDEV-827 | REQ-0006 | RCDEV-822, RCDEV-823, RCDEV-824 | complete | 1 | DONE: RCDEV-827 — SHIP — merged as https://github.com/rortegalizardo/task-tracker-cli/pull/7 (2eb69b8), with the test check green. | INIT-0001 / orch-RCDEV-827 / PR #7 branch RCDEV-827 | 3 | 2026-10-21 |
| RCDEV-828 | REQ-0007 | RCDEV-822, RCDEV-823, RCDEV-824, RCDEV-825 | complete | 1 | shipped — Status: merged (check-ticket; session still finishing at completion) | INIT-0001 / orch-RCDEV-828 / PR #10 branch RCDEV-828 | 4 | 2026-10-21 |
| RCDEV-829 | REQ-0008 | RCDEV-822, RCDEV-823, RCDEV-824 | complete | 1 | DONE: RCDEV-829 is shipped. PR #8 merged as bc33216 with the test check green, and Linear is set to Done. | INIT-0001 / orch-RCDEV-829 / PR #8 branch RCDEV-829 | 3 | 2026-10-21 |
| RCDEV-830 | REQ-0009 | RCDEV-822, RCDEV-823, RCDEV-824 | complete | 1 | DONE: RCDEV-830 shipped. PR #9 merged as d49e448 with the CI test check green. Linear shows Done. | INIT-0001 / orch-RCDEV-830 / PR #9 branch RCDEV-830 | 3 | 2026-10-21 |
| RCDEV-831 | REQ-0010 | RCDEV-822, RCDEV-823, RCDEV-824, RCDEV-825, RCDEV-828 | complete | 1 | DONE: RCDEV-831 shipped. ttc stats is merged in PR #11, the CI test check passed and Linear says Done. | INIT-0001 / orch-RCDEV-831 / PR #11 branch RCDEV-831 | 5 | 2026-10-21 |

## Waves

| Wave | Units | Eligible-now count |
| --- | --- | --- |
| 0 | RCDEV-822 | 0 |
| 1 | RCDEV-823 | 0 |
| 2 | RCDEV-824 | 0 |
| 3 | RCDEV-825, RCDEV-826, RCDEV-827, RCDEV-829, RCDEV-830 | 0 |
| 4 | RCDEV-828 | 0 |
| 5 | RCDEV-831 | 0 |

## Dispatch ledger

| Date | Unit | Event | Detail |
| --- | --- | --- | --- |
| 2026-10-21 | RCDEV-822 | dispatched | cap 5 (manifest max_parallelism, no override); 07:22:14Z; launcher, ORCHESTRATOR_MODEL=opus, CLAUDE_CODE_SUBAGENT_MODEL=opus |
| 2026-10-21 | RCDEV-822 | completed | PR #2 MERGED 2026-10-21T07:34:28Z, merge commit 7d8d4174c7dc52b49fd82a5667ce2619851fb540, head bb062f32 (gh pr view) |
| 2026-10-21 | RCDEV-823 | dispatched | cap 5; 2026-10-21T07:36:01Z; ORCHESTRATOR_MODEL=opus, CLAUDE_CODE_SUBAGENT_MODEL=opus |
| 2026-10-21 | RCDEV-823 | completed | PR #3 MERGED 2026-10-21T07:44:08Z, merge commit c907a1b0216cc19eb95be6413f3315d12481cf58, head 7f9d35cd (gh pr view) |
| 2026-10-21 | RCDEV-824 | dispatched | cap 5; 2026-10-21T07:45:39Z; ORCHESTRATOR_MODEL=opus, CLAUDE_CODE_SUBAGENT_MODEL=opus |
| 2026-10-21 | RCDEV-824 | completed | PR #4 MERGED 2026-10-21T07:52:09Z, merge commit 7b4b9d95fdac406ee61ad98f6b4e762ba25e0009, head fafe16ba (gh pr view) |
| 2026-10-21 | RCDEV-825 | dispatched | cap 5; 2026-10-21T07:53:10Z; ORCHESTRATOR_MODEL=opus, CLAUDE_CODE_SUBAGENT_MODEL=opus |
| 2026-10-21 | RCDEV-826 | dispatched | cap 5; 2026-10-21T07:53:12Z; ORCHESTRATOR_MODEL=opus, CLAUDE_CODE_SUBAGENT_MODEL=opus |
| 2026-10-21 | RCDEV-827 | dispatched | cap 5; 2026-10-21T07:53:13Z; ORCHESTRATOR_MODEL=opus, CLAUDE_CODE_SUBAGENT_MODEL=opus |
| 2026-10-21 | RCDEV-829 | dispatched | cap 5; 2026-10-21T07:53:14Z; ORCHESTRATOR_MODEL=opus, CLAUDE_CODE_SUBAGENT_MODEL=opus |
| 2026-10-21 | RCDEV-830 | dispatched | cap 5; 2026-10-21T07:53:15Z; ORCHESTRATOR_MODEL=opus, CLAUDE_CODE_SUBAGENT_MODEL=opus |
| 2026-10-21 | RCDEV-826 | completed | PR #5 MERGED 2026-10-21T07:59:00Z, merge commit e8a767815fe9a0af3d37d20e56b1b41df6a7350a, head 36976dcf (gh pr view) |
| 2026-10-21 | RCDEV-827 | completed | PR #7 MERGED 2026-10-21T08:02:39Z, merge commit 2eb69b838778d10276440acacb8561aa8cd0397b, head 2d934605 (gh pr view) |
| 2026-10-21 | RCDEV-829 | completed | PR #8 MERGED 2026-10-21T08:07:07Z, merge commit bc33216d0252c8d0d9125902997b443d2cde7ce1, head c110d141 (gh pr view); conflict resolved in-workflow (earlier head 9cefea99) |
| 2026-10-21 | RCDEV-825 | completed | PR #6 MERGED 2026-10-21T08:09:17Z, merge commit 73e7788327137cdfaef09709c4364c45e1f535aa, head fa32c64e (gh pr view); conflict resolved in-workflow, review-002 |
| 2026-10-21 | RCDEV-828 | dispatched | cap 5; 2026-10-21T08:10:34Z; ORCHESTRATOR_MODEL=opus, CLAUDE_CODE_SUBAGENT_MODEL=opus |
| 2026-10-21 | RCDEV-830 | completed | PR #9 MERGED 2026-10-21T08:12:48Z, merge commit d49e4484751e1f407429ac004aad6cb574cb02e7, head 2d737738 (gh pr view); conflict resolved in-workflow (earlier head 5eab1fc7) |
| 2026-10-21 | RCDEV-828 | completed | PR #10 MERGED 2026-10-21T08:18:35Z, merge commit 5f620c715b5beedae8f86ed37254681d655d6625, head 99bee270 (gh pr view) |
| 2026-10-21 | RCDEV-831 | dispatched | cap 5; 2026-10-21T08:19:06Z; ORCHESTRATOR_MODEL=opus, CLAUDE_CODE_SUBAGENT_MODEL=opus |
| 2026-10-21 | RCDEV-831 | completed | PR #11 MERGED 2026-10-21T08:27:16Z, merge commit 25789362184eaa2f7ec07e562b4b81a828f698eb, head 43c63cc4 (gh pr view) |

## Completion

_Computed per schema §5.8. `pending` until every unit is `complete`._
