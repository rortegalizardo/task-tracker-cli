---
id: PSTATE-INIT-0001
type: product-state
title: Product definition state for INIT-0001
status: authoritative
revision: 4
owner_role: ROLE-product-manager
created: 2026-10-20
updated: 2026-10-20
updated_by_role: ROLE-product-manager
initiative: INIT-0001
phase: PRODUCT_DEFINITION
phase_entered: 2026-10-20
requester: "the requester (repository owner, rortegalizardo), via the parent session, 2026-10-20"
next_action: "ROLE-product-manager: advance to SOLUTION_EXPLORATION, record the justified single option and dispatch the technical architect (planner, PRODUCT-DISCOVERY mode) for its feasibility verdict"
blocked_by: []
converged: false
readiness_verdict: none   # none | READY | READY-with-known-issues | NOT READY | void
stories: [REQ-0001, REQ-0002, REQ-0003, REQ-0004, REQ-0005, REQ-0006, REQ-0007, REQ-0008, REQ-0009, REQ-0010]
design_refs: []
decisions: [PD-0001, PD-0002, PD-0003]
---

# Product definition state — INIT-0001

`phase` above is the authority for where this work stands on the product side.
Delivery stage lives in `delivery/state.md` and is owned by `ROLE-orchestrator`;
these two files never describe the same thing and never share a writer.

## Where this stands

PRODUCT_DEFINITION done: the initiative states outcome O1–O10 and a non-empty
out-of-scope section; ten draft `REQ-` records (one per spec item) cover it,
with the Product Definition Contract beside them. Drafting found seven gaps in
`PD-0002`; `PD-0003` supersedes it with the complete rule set. Next:
SOLUTION_EXPLORATION and the architect's feasibility verdict.

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

ROLE-product-manager: advance to SOLUTION_EXPLORATION, record the justified
single option, and dispatch the technical architect (`planner`,
PRODUCT-DISCOVERY mode) for its feasibility verdict.

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
| 2026-10-20 | 3. How a task is named by `<id>`, and whether a deleted task's id is reused | pm-resolvable | Decided by the PM under `PD-0001`: `PD-0002`, restated and completed by `PD-0003` |
| 2026-10-20 | 4. What `ttc list` shows with no status flag, in what order, and what one line holds | pm-resolvable | Decided by the PM under `PD-0001`: `PD-0002`, restated and completed by `PD-0003` |
| 2026-10-20 | 5. What "overdue" means: which day is today, a task due today, a done task | pm-resolvable | Decided by the PM under `PD-0001`: `PD-0002`, restated and completed by `PD-0003` |
| 2026-10-20 | 6. What makes a title, a tag and a due date valid | pm-resolvable | Decided by the PM under `PD-0001`: `PD-0002`, restated and completed by `PD-0003` |
| 2026-10-20 | 7. Repeated or no-op actions: `done` on a done task, adding a tag twice, removing an absent tag | pm-resolvable | Decided by the PM under `PD-0001`: `PD-0002`, restated and completed by `PD-0003` |
| 2026-10-20 | 8. Whether `import` replaces the list or merges into it, and what "validate first" checks | pm-resolvable | Decided by the PM under `PD-0001`: `PD-0002`, restated and completed by `PD-0003` |
| 2026-10-20 | 9. What `export` does when the target file already exists | pm-resolvable | Decided by the PM under `PD-0001`: `PD-0002`, restated and completed by `PD-0003` |
| 2026-10-20 | 10. What `ttc stats` prints | pm-resolvable | Decided by the PM under `PD-0001`: `PD-0002`, restated and completed by `PD-0003` |
| 2026-10-20 | 11. What `ttc help` lists while commands arrive one story at a time | pm-resolvable | Decided by the PM under `PD-0001`: `PD-0002`, restated and completed by `PD-0003` |
| 2026-10-20 | 12. Behaviour when the data file or `$TTC_HOME` is missing, or the file is unreadable | pm-resolvable | Decided by the PM under `PD-0001`: `PD-0002`, restated and completed by `PD-0003` |
| 2026-10-20 | 13. Exit code and wording of the one-line error | pm-resolvable | Decided by the PM under `PD-0001`: `PD-0002`, restated and completed by `PD-0003` |
| 2026-10-20 | 14. What a successful command that changes data prints | pm-resolvable | Decided by the PM under `PD-0001`: `PD-0002`, restated and completed by `PD-0003` |
| 2026-10-20 | 15. Two `ttc` processes writing at the same moment | pm-resolvable | Out of scope for INIT-0001 (one person, one command at a time); written into the out-of-scope section at PRODUCT_DEFINITION; `PD-0002` item 16, kept as `PD-0003` item 16 |
| 2026-10-20 | 16. Whether the initiative has a user-facing visual surface | escalation | Answered by the requester in the request itself: CLI only, no UI, no design roles, no `DES-` (`PD-0001` item 3) |

## Discovery

Sources: `S` = the raw request,
[`sources/2026-10-20-requester-spec.md`](sources/2026-10-20-requester-spec.md)
(requester, 2026-10-20); `R` = the repository at head `4e5a324`.

**Target user.** One person who works in a terminal and keeps their own to-do
list on one machine, with no account, server or network (S: "a `ttc`
command-line task tracker ... no network"; "one JSON file at
$TTC_HOME/tasks.json"). No second user or shared list appears anywhere in S.

**Jobs and problems, each with its source.**

| # | Job the user has | Source |
| --- | --- | --- |
| J1 | Capture a task in one command, optionally with a due date and tags | S, story 2 |
| J2 | See open tasks, done tasks or all tasks, optionally only one tag's | S, story 3 |
| J3 | Mark a task done, and undo that | S, story 4 |
| J4 | Fix a task's title | S, story 5 |
| J5 | Remove a task | S, story 6 |
| J6 | Notice which tasks are past their due date, and list only those | S, story 7 |
| J7 | Add or remove a tag on an existing task | S, story 8 |
| J8 | Copy the whole list to a file and restore it from one, without a bad file damaging the list | S, story 9 ("validate first, all or nothing") |
| J9 | Read totals of open, done and overdue tasks | S, story 10 |
| J10 | Find out what the tool can do from the tool itself | S, story 1 (`ttc help`) |
| J11 | Trust that the list is never left half written, lives in one known file, and never leaves the machine | S, lines 1–2 |
| J12 | Script the tool: a failure is one line on stderr with a non-zero exit | S, line 3 |

**Current state.** Capability mapping: **none**. `capabilities/index.md` has
no rows, and the repository has no product code: `package.json` (test script
`node --test`, `engines >=22`), `test/placeholder.test.js`, and
`.github/workflows/ci.yml`, which runs a job named `test` (`npm test` on
Node 24) for every pull request (R).

**Population sizes.** None to record: the product holds no data today. No
`tasks.json` exists and no list-bearing surface has real data behind it (R).
The spec states no expected list size.

**Success signals** (observable, not "it shipped"):

1. From an empty `$TTC_HOME`, each of the ten command groups in S does what its
   story says, and each has `node:test` tests that run in `npm test` (S, line
   3).
2. The CI `test` check passes on every pull request that delivers a story (S,
   line 3).
3. A write interrupted at any point leaves `tasks.json` either as it was or as
   intended, never unreadable (S, "Every write is atomic").
4. Every failure prints exactly one line on stderr and exits non-zero (S,
   line 3).
5. A list exported and then imported is the same list; a file that fails
   validation changes nothing (S, story 9).
6. No command opens a network connection (S, "no network").

**Known non-goals** (nothing in S asks for them): more than one user or a
shared list; sync between machines; any graphical or full-screen terminal
interface (S and the requester's instructions: "CLI only, no UI"); reminders or
notifications; recurring tasks; priorities, subtasks or notes; text search;
safe concurrent writes from two `ttc` processes at once; publishing the
package to a registry.

## Options

| Option | User-visible difference | Feasibility verdict | Cost / risk | Trade-off |
| --- | --- | --- | --- | --- |

_Recommended option and why:_

## Consultation log

| Date | Delegate role | Question | Answer / verdict | Recorded as |
| --- | --- | --- | --- | --- |
| 2026-10-20 | sonnet drafting child (§9b; vendor claude, model sonnet) | `RUN: INIT-0001 step=product_definition` — draft the initiative, ten `REQ-` records (one per spec item, `depends_on` per the spec order) and the Product Definition Contract from the raw spec, `PD-0001` and `PD-0002` | Draft bundle returned with 7 `TODO(PM)` gaps against `PD-0002`. PM validated against the raw spec: gaps settled by `PD-0003` (supersedes `PD-0002`); one repair dispatch (same child) applied `PD-0003`, removed cross-story help wording, fixed `REQ-0010` `depends_on`. Tokens-scale L, usage n/a | `initiative.md` rev 2, `REQ-0001`…`REQ-0010` (draft), `product-definition-contract.md`, `PD-0003` |

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
| 2026-10-20 | INTAKE | DISCOVERY | ROLE-product-manager | INTAKE exit criteria met: initiative drafted, problem stated with its source, every ambiguity classified, both escalation-class rows answered by the requester (`PD-0001`) | Entry precondition (`lifecycle-hooks.md` §3.4.1 DISCOVERY) holds: draft `INIT-0001`, state at INTAKE with requester, problem statement and a classified ambiguity log. Discovery written with sources; mission hardened (rev 2). No `Q-` raised. Hooks: HOOK-phase-entry pass | `321480b86ed398de`, head `4e5a324` |
| 2026-10-20 | DISCOVERY | PRODUCT_DEFINITION | ROLE-product-manager | DISCOVERY exit criteria met: problem, user, current state and success signals stated with sources; no open escalation-class ambiguity | Entry precondition (`lifecycle-hooks.md` §3.4.1 PRODUCT_DEFINITION) holds: Discovery has users, jobs with sources (S1), capability mapping `none` (S2), success signals (S3) and non-goals. `PD-0002` records the answers to ambiguity rows 3–15. Hooks: HOOK-phase-entry pass | `d22ef5f6896a83fd`, head `060e431` |

> Every product-side session updates this file before ending — **including
> sessions that failed**, which record the failure in `next_action` and do not
> advance `phase`.
