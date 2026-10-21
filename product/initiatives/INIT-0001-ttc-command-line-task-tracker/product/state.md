---
id: PSTATE-INIT-0001
type: product-state
title: Product definition state for INIT-0001
status: authoritative
revision: 1
owner_role: ROLE-product-manager
created: 2026-10-20
updated: 2026-10-20
updated_by_role: ROLE-product-manager
initiative: INIT-0001
phase: INTAKE
phase_entered: 2026-10-20
requester: "the requester (repository owner, rortegalizardo), via the parent session, 2026-10-20"
next_action: "ROLE-product-manager: advance INIT-0001 to DISCOVERY"
blocked_by: []
converged: false
readiness_verdict: none   # none | READY | READY-with-known-issues | NOT READY | void
stories: []
design_refs: []
decisions: [PD-0001]
---

# Product definition state — INIT-0001

`phase` above is the authority for where this work stands on the product side.
Delivery stage lives in `delivery/state.md` and is owned by `ROLE-orchestrator`;
these two files never describe the same thing and never share a writer.

## Where this stands

INTAKE: the raw request is committed verbatim
([`sources/2026-10-20-requester-spec.md`](sources/2026-10-20-requester-spec.md)).
Triage verdict `new-initiative`. Every ambiguity below is classified. Next:
DISCOVERY.

## Problem statement

Raw request: [`sources/2026-10-20-requester-spec.md`](sources/2026-10-20-requester-spec.md)
(requester, 2026-10-20).

As understood: one person wants to keep a to-do list from the terminal with a
command called `ttc`. It runs on Node 24 with built-in libraries only and never
uses the network. All tasks live in one JSON file, `$TTC_HOME/tasks.json`
(`~/.ttc` when `TTC_HOME` is not set), and no write may leave that file half
written. The person adds tasks (with an optional due date and tags), lists and
filters them, marks them done or open again, renames, deletes and retags them,
sees which are overdue, moves the whole list in and out of a file, and reads
totals. Every failure is one line on stderr with a non-zero exit. Every
command ships with `node:test` tests and the CI `test` check passes.

Today nothing of this exists: the repository holds an empty Node project with
a placeholder test (`package.json`, `test/placeholder.test.js`) and a CI job
named `test` that runs `npm test` on Node 24 for every pull request
(`.github/workflows/ci.yml`).

The requester fixed the shape: exactly ten stories, one per numbered item, in
the stated dependency order. The requester also delegated every detail inside
the spec to the product manager (`PD-0001`).

## Next action

ROLE-product-manager: advance INIT-0001 to DISCOVERY.

## Blocked by

Nothing.

## Ambiguity log

Every ambiguity encountered, classified. Escalation-class entries **must** carry
a `Q-` identifier — that requirement is what stops a material product question
from being answered quietly.

Rows 3–14 are user-visible details the spec leaves open. They are
`pm-resolvable` because the requester delegated them: "Decide everything inside
it yourself" (source file, 2026-10-20), recorded as `PD-0001` item 1. Under
`escalation-policy` §3 route 2 they never become requester questions
(`product-manager-orchestrator` §4.1, last bullet). Their answers are recorded
in one decision at PRODUCT_DEFINITION.

| Date | Ambiguity | Class (`pm-resolvable` / `escalation`) | Resolution or `Q-` |
| --- | --- | --- | --- |
| 2026-10-20 | 1. `package.json` declares `engines >=22`; the spec says Node 24 | pm-resolvable | The spec governs: Node 24 is the runtime (`PD-0001` item 2, constraint 2). Aligning `engines` is engineering's |
| 2026-10-20 | 2. Who decides the details the spec leaves open | escalation | Answered by the requester in the request itself: the PM decides inside the spec and asks only if the spec contradicts itself (`PD-0001` item 1) |
| 2026-10-20 | 3. How a task is named by `<id>`, and whether a deleted task's id is reused | pm-resolvable | PM decides at PRODUCT_DEFINITION under `PD-0001` |
| 2026-10-20 | 4. What `ttc list` shows with no status flag, in what order, and what one line holds | pm-resolvable | PM decides at PRODUCT_DEFINITION under `PD-0001` |
| 2026-10-20 | 5. What "overdue" means: which day is today, a task due today, a done task | pm-resolvable | PM decides at PRODUCT_DEFINITION under `PD-0001` |
| 2026-10-20 | 6. What makes a title, a tag and a due date valid | pm-resolvable | PM decides at PRODUCT_DEFINITION under `PD-0001` |
| 2026-10-20 | 7. Repeated or no-op actions: `done` on a done task, adding a tag twice, removing an absent tag | pm-resolvable | PM decides at PRODUCT_DEFINITION under `PD-0001` |
| 2026-10-20 | 8. Whether `import` replaces the list or merges into it, and what "validate first" checks | pm-resolvable | PM decides at PRODUCT_DEFINITION under `PD-0001` |
| 2026-10-20 | 9. What `export` does when the target file already exists | pm-resolvable | PM decides at PRODUCT_DEFINITION under `PD-0001` |
| 2026-10-20 | 10. What `ttc stats` prints | pm-resolvable | PM decides at PRODUCT_DEFINITION under `PD-0001` |
| 2026-10-20 | 11. What `ttc help` lists while commands arrive one story at a time | pm-resolvable | PM decides at PRODUCT_DEFINITION under `PD-0001` |
| 2026-10-20 | 12. Behaviour when the data file or `$TTC_HOME` is missing, or the file is unreadable | pm-resolvable | PM decides at PRODUCT_DEFINITION under `PD-0001` |
| 2026-10-20 | 13. Exit code and wording of the one-line error | pm-resolvable | PM decides at PRODUCT_DEFINITION under `PD-0001` |
| 2026-10-20 | 14. What a successful command that changes data prints | pm-resolvable | PM decides at PRODUCT_DEFINITION under `PD-0001` |
| 2026-10-20 | 15. Two `ttc` processes writing at the same moment | pm-resolvable | Out of scope for INIT-0001 (one person, one command at a time); written into the out-of-scope section at PRODUCT_DEFINITION |
| 2026-10-20 | 16. Whether the initiative has a user-facing visual surface | escalation | Answered by the requester in the request itself: CLI only, no UI, no design roles, no `DES-` (`PD-0001` item 3) |

## Discovery

_Written at DISCOVERY._

## Options

| Option | User-visible difference | Feasibility verdict | Cost / risk | Trade-off |
| --- | --- | --- | --- | --- |

_Recommended option and why:_

## Consultation log

| Date | Delegate role | Question | Answer / verdict | Recorded as |
| --- | --- | --- | --- | --- |

## Escalation log

| Date | Question | `Q-` | Asked of | Answer | Recorded as |
| --- | --- | --- | --- | --- | --- |

## Stories

| `REQ-` | Title | Status | `CAP-` | `DES-` | Sequencing note |
| --- | --- | --- | --- | --- | --- |

## Readiness log

Written by `ROLE-product-readiness-reviewer` only. One row per review round,
appended — a prior row is never edited, withdrawn, or overwritten. `Verdict` is
one of `READY`, `READY-with-known-issues`, or `NOT READY`; the first two open
the handoff gate, the third shuts it. Conditions and known issues live in their
own column and never in the verdict. `Story-set digest` is the ordered list of
`(REQ- id, revision, updated)` triples plus the initiative `revision`, and is
what makes the verdict void when the set moves.

| Date | Round | Verdict | Conditions | Reviewer | Story-set digest | Findings | Finding ids |
| --- | --- | --- | --- | --- | --- | --- | --- |

## Readiness findings

Written by `ROLE-product-readiness-reviewer` only, one block per round producing
at least one finding. Finding ids are `RF-<INIT-nnnn>-<round>-<n>`, scoped to
this file: they bump no counter and appear in no index. A `NOT READY` verdict
with no findings rows is invalid output.

`Criterion` is one of `R1`–`R18` (`../architecture/skill-library.md` §3.9.2).
`Route phase` and `Route role` come from the routing table in
`architecture/skill-library.md` §3.9.1 and are not chosen per finding.

| Finding | Criterion | Artifact | What is wrong | Route phase | Route role |
| --- | --- | --- | --- | --- | --- |

## Handoff packet

_Written at ENGINEERING_READY._

## Handoff log

Written at HANDOFF. One row; a second row means a re-handoff after a regression.

| Date | Receiving role | Packet digest | Note |
| --- | --- | --- | --- |

## Phase log

| Date | From | To | Role | Trigger | Outcome | `context_digest` |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-10-20 | — | BOOTSTRAP | ROLE-product-manager | Raw request relayed by the parent session | Packet: `readiness: degraded` (`foundation: incomplete`: `project/principles.md` is `draft`), `scope.initiative: null`, profile S; `neighbouring` band read in full: capability, decision, initiative and question indexes all empty. Hooks: none (hydration only) | `e72be89a650ab320`, head `b8ee70d` |
| 2026-10-20 | BOOTSTRAP | INTAKE | ROLE-product-manager | Packet emitted, scope resolved to none | Triage verdict `new-initiative`: no `CAP-` (index empty), no `PD-` (index empty), no constraint forbids it (constraint 1 agrees with the spec), no duplicate initiative, one outcome named. Entry precondition (`lifecycle-hooks.md` §3.4.1 INTAKE) holds: packet at `degraded` with `neighbouring` read. Degradation repaired per PM §8.5 in this phase: `PD-0001`, constraints rev 2, principles rev 2. Hooks: HOOK-initiative-resolved pass, HOOK-phase-entry pass | `e72be89a650ab320`, head `b8ee70d` |

> Every product-side session updates this file before ending — **including
> sessions that failed**, which record the failure in `next_action` and do not
> advance `phase`.
