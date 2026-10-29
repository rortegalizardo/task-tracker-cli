---
id: PSTATE-INIT-0006
type: product-state
title: Product definition state for INIT-0006
status: authoritative
revision: 7
owner_role: ROLE-product-manager
created: 2026-10-29
updated: 2026-10-29
updated_by_role: ROLE-product-manager
initiative: INIT-0006
phase: READINESS
phase_entered: 2026-10-29
requester: "the requester (repository owner, rortegalizardo), via the driving session, 2026-10-29"
next_action: "ROLE-product-manager: dispatch ROLE-product-readiness-reviewer (claude, sonnet) for the readiness review of REQ-0015 rev 3, round 1 of 2, terminal unless it leaves a blocking finding"
blocked_by: []
converged: true
readiness_verdict: READY   # none | READY | READY-with-known-issues | NOT READY | void
stories: [REQ-0015]
design_refs: []
decisions: [PD-0014]
---

# Product definition state — INIT-0006

`phase` above is the authority for where this work stands on the product side.
Delivery stage lives in `delivery/state.md` and is owned by `ROLE-orchestrator`;
these two files never describe the same thing and never share a writer.

## Where this stands

READINESS. `REQ-0015` rev 3 accepted (12 pass/fail ACs, C1–C7, C9, C10); coherence round 1 (terminal) `coherent`, no defects (`technical/coherence.md`); Coverage validation zero defects; convergence declared. Awaiting the independent readiness verdict.

## Problem statement

Tasks with no due date get lost in the requester's list, and they want a
quick, simple way to see only those tasks. Source:
`sources/2026-10-29-requester-request.md` (verbatim).

Today `ttc list` shows open tasks, important first, then by id; a task with
no due date is a line with no `due:` token, mixed in with the dated ones.
No option shows only the tasks with no due date: `--due-from` and `--due-to`
leave them out, `--overdue` never includes them (a task with no due date is
never overdue, `PD-0003` item 6), and `ttc list --no-due` fails with
`ttc: unknown option: --no-due` (`src/filter.js`; `ttc help`; checked on the
CLI at head `5be0561`).

## Next action

ROLE-product-manager: dispatch ROLE-product-readiness-reviewer (claude, sonnet) for the readiness review of REQ-0015 rev 3, round 1 of 2, terminal unless it leaves a blocking finding

## Blocked by

Nothing.

## Ambiguity log

All rows are `pm-resolvable`: each is a clarification of the stated outcome,
an equivalent expression of it, a story-level detail, or already decided
(`product-manager-orchestrator` §4.1; escalation-policy §3 route 2). The
requester's own words settle the ties: "Tasks without a due date get lost in
my list", "a quick way to see just those" and "Keep it simple". No row changes
the outcome, the user or a success measure, and no row drops or narrows a
stated need (§4.2), so no `Q-` is raised.

| Date | Ambiguity | Class (`pm-resolvable` / `escalation`) | Resolution or `Q-` |
| --- | --- | --- | --- |
| 2026-10-29 | A1. Which tasks are "without a due date"? | pm-resolvable | Tasks whose stored due date is empty (`due` is null), the tasks `ttc list` prints with no `due:` token. A due date is a task's only date (`PD-0003`). |
| 2026-10-29 | A2. Open tasks only, or done tasks too? | pm-resolvable | "my list" is what `ttc list` shows by default: open tasks (`PD-0003` item 7). The quick way shows the open tasks with no due date with nothing else typed. Whether done tasks with no due date can also be shown is decided at SOLUTION_CONVERGENCE between the options, after the architect costs them; "Keep it simple" is the tie-breaker. |
| 2026-10-29 | A3. Where is the quick way: an option of `ttc list` or a new command? | pm-resolvable | Decided at SOLUTION_CONVERGENCE. "my list" points at `ttc list`, where `--overdue` already shows one kind of task on its own (`REQ-0007`). |
| 2026-10-29 | A4. What is it called? | pm-resolvable | An equivalent expression of the same outcome (§4.1). Recorded in the convergence `PD-`. |
| 2026-10-29 | A5. How are the tasks shown? | pm-resolvable | Exactly as `ttc list` shows them today: the same line format and order, important first, then by id; `No tasks.` when none match. Already decided (`PD-0003` items 7, 8; `PD-0009` items 4, 5). |
| 2026-10-29 | A6. What happens when it is given with the options that pick tasks by due date (`--due-from`, `--due-to`, `--overdue`), which can never match a task with no due date? | pm-resolvable | A story-level detail. Decided at SOLUTION_CONVERGENCE from the architect's input. |
| 2026-10-29 | A7. Does `ttc export`, which takes the same task-picking options as `ttc list`, get it too? | pm-resolvable | Not asked ("see just those"). Decided at SOLUTION_CONVERGENCE as a story boundary, after the architect says what keeping or splitting the shared option set costs; "Keep it simple" is the tie-breaker. |
| 2026-10-29 | A8. Can a task with no due date be given one from there? | pm-resolvable | Out of scope. The ask is to see the tasks; giving or changing a due date after `ttc add` has been out of scope since INIT-0001 (its out of scope "Changing or clearing a due date after `add`"). |
| 2026-10-29 | A9. Does `ttc stats` count them? | pm-resolvable | Out of scope: not asked, and "Keep it simple". `ttc stats` output is unchanged. |

## Discovery

**Target user.** One person who keeps their own task list with `ttc` on their
own machine: the requester. ttc has one user and no shared list
(`CAP-0001` Boundaries; INIT-0001 out of scope). Source: S1 below.

**Jobs and problems, with sources.**

| # | Job or problem | Source |
| --- | --- | --- |
| J1 | Tasks with no due date get lost among the other tasks ("Tasks without a due date get lost in my list."). | Request, verbatim (`sources/2026-10-29-requester-request.md`) |
| J2 | See only the tasks with no due date, quickly ("Give me a quick way to see just those."). | Request, verbatim (same file) |
| J3 | Keep the feature simple: little to learn, nothing else changes ("Keep it simple."). | Request, verbatim (same file) |
| P1 | `ttc list` shows open tasks, important first, then by id. A task with no due date is a line with no `due:` token among the dated lines, for example `#2 [ ] Call mom` between `#1 [ ] Pay rent due:2000-01-02 !overdue +home` and later tasks. | `src/commands/list.js`; `PD-0003` items 7, 8; `PD-0009` items 4, 5; checked on the CLI at head `5be0561` |
| P2 | No option shows only the tasks with no due date. `--due-from` and `--due-to` leave them out; `--overdue` never shows them, since a task with no due date is never overdue; `ttc list --no-due` fails with `ttc: unknown option: --no-due`, exit 1. | README "Listing and filtering tasks"; `PD-0003` item 6; `src/filter.js`; checked on the CLI at head `5be0561` |
| P3 | `ttc export` takes the same task-picking options as `ttc list` and says they "mean the same as for `ttc list`"; one option set serves both commands. | README "Exporting tasks"; `src/filter.js` used by `src/commands/list.js` and `src/commands/export.js` at head `5be0561` |

**Current-state capability mapping (S2).** `CAP-0001` — local task tracking
from the `ttc` command line. This initiative extends it. `CAP-0001` is still
`draft` and does not describe everything that shipped; the current-state
evidence is the code and README at head `5be0561`:

- `ttc list [--open|--done|--all|--overdue] [--tag <t>] [--due-from YYYY-MM-DD] [--due-to YYYY-MM-DD] [--search <text>]`.
  At most one status view; `--open` is the default. Every option at most once;
  all options combine with AND; when `--due-from` or `--due-to` is given,
  tasks with no due date are left out (README "Listing and filtering tasks").
- Line format `#<id> [ ]|[x] <title> [due:<date>] [!overdue] [!important] [+<tag>]...`;
  order important first, then ascending id, in every view; `No tasks.` when
  nothing matches (`PD-0003` items 7, 8; `PD-0009` items 4, 5).
- `ttc list` never writes and never creates `tasks.json` (`PD-0003` item 13).
- `ttc export` takes the same options, with `--all` as its default status
  (README "Exporting tasks").
- Errors: one line `ttc: <message>` on stderr, exit 1; an unknown option is
  `ttc: unknown option: <opt>`; two status views are
  `ttc: options cannot be combined: <opts>` (`PD-0003` items 2, 7, 11;
  `src/filter.js`).

**Success signals (S3).**

1. A user sees only their open tasks with no due date with one short command,
   typing nothing but that command.
2. Every task it shows has no due date, and no open task with no due date is
   left out.
3. The tasks look and are ordered exactly as `ttc list` shows them today, and
   nothing is written.
4. Everything else is unchanged: `ttc list` with the options it has today
   prints the same output, other commands behave as today, and data files
   written by older ttc still work.

**Known non-goals.** Giving, changing or clearing a due date (A8); counting
tasks with no due date in `ttc stats` (A9); changing how the normal
`ttc list` shows or orders tasks; reminders or prompts to add due dates.

Sources: S1 = the request file above; INIT-0001 `initiative.md` out of scope;
S2/S3 = the code and README at head `5be0561`.

## Options

| Option | User-visible difference | Feasibility verdict | Cost / risk | Trade-off |
| --- | --- | --- | --- | --- |
| A — `--no-due` as a fifth status view of `ttc list` | `ttc list --no-due` shows open tasks with no due date; it cannot be given with `--open`, `--done`, `--all` or `--overdue`, so done tasks with no due date cannot be listed on their own | `feasible-with-constraints`, band `contained` (`technical/assessment.md`, round 1) | Constraints C1–C7, C8, C10; R1, R2, R3 (a later move to B changes `ttc export --no-due` if export takes it under A), R4, R5. No stored-format change | One more member of the "pick one view" group, with a hidden "open only" meaning; `--no-due --done` is an error |
| B — `--no-due` as a filter, like `--tag` | `ttc list --no-due` shows open tasks with no due date, exactly as A; it also narrows any other view, so `ttc list --all --no-due` and `ttc list --done --no-due` work | `feasible-with-constraints`, band `contained` (`technical/assessment.md`, round 1) | Constraints C1–C7, C9, C10; R1, R2, R4 (one more never-matching combination: `--overdue`), R5. No stored-format change | One rule the README already states ("All options combine with AND"); `--no-due` works with every view the way `--tag` does |

_Recommended option and why:_ **B.** The quick command the request asks for
is the same in both: `ttc list --no-due`, nothing else typed (O1). The
options differ only in what other combinations do, and "Keep it simple"
decides that: under B, `--no-due` follows the rule every `ttc list` filter
already follows (it narrows whatever view is shown, like `--tag`), so there
is nothing new to learn; under A it joins the "pick one view" group, carries
an unstated "open only" meaning, and makes `--no-due --done` an error. A
missing due date is a fact about the date, not a status, so it sits with the
date options. B costs one more never-matching combination (`--overdue`),
which the N1 refusal covers. The architect's N1–N5 are taken as recommended:
never-matching combinations (`--overdue`, `--due-from`, `--due-to`) are
refused with `ttc: options cannot be combined: <opts>` before the read (N1,
avoids R4); `ttc export` takes `--no-due` with the same meaning, keeping one
shared option set and the README promise true (N2; under B it exports open
and done tasks by its `--all` default, as `--tag` does); no stored-format
change (N3); oracle and fuzz from the `PD-` text (N4); the name `--no-due`
(N5; R5 is not material: `ttc add` without `--due` already makes a task with
no due date, and removing a date stays out of scope).

_Chosen (SOLUTION_CONVERGENCE, 2026-10-29):_ **B**, `PD-0014`. A rejected for the
reasons in `PD-0014` "Options considered". N1–N5 settled as the architect
recommended (`PD-0014` items 1–13). No option is left under consideration.

## Consultation log

| Date | Delegate role | Question | Answer / verdict | Recorded as |
| --- | --- | --- | --- | --- |
| 2026-10-29 | ROLE-planner (PRODUCT-DISCOVERY) | Feasibility verdict, constraints, risks and band for options A and B, plus recommendations on N1–N5 (one dispatch: capability scan, impact, assessment; §9d.1) | A `feasible-with-constraints`, `contained`; B `feasible-with-constraints`, `contained`; constraints C1–C10 (C8 A only, C9 B only); risks R1–R5 (R3 A only); assumptions P1–P7 all narrowing, none blocking or costly; no stored-format change (C2). N1 refuse never-matching combinations with the existing combine message, checked after the two-views check; N2 export takes the option; N3 no storage change; N4 oracle and fuzz from the `PD-` text, list usage in 9 unit files plus the oracle, export usage in 5 plus the oracle (PM re-ran the search: 10 and 6 files); N5 keep `--no-due`. Registry note: `CAP-0001` out of date (as in INIT-0002..0005), left for initiative close | `technical/capability-scan.md`, `technical/impact.md`, `technical/assessment.md` (round 1); this row; C2–C5, C8–C10, N1, N2, N5 and P1, P7 go to the convergence `PD-`. Vendor claude, model opus |
| 2026-10-29 | ROLE-planner (PRODUCT-DISCOVERY) | Story-set technical coherence, full pass, on the draft set `REQ-0015` rev 3 against `PD-0014` and `technical/assessment.md` round 1; declared round 1 of 2, terminal unless it reports a blocking defect (§9d.3, §9a.1) | `coherent`; no defect, no question. Independently verifiable, sequencing consistent (frontier, head `5be0561`), only assumed-absent capability is the one the story creates, no drift from option B, N1, N2 or C1–C7, C9, C10; every AC-1..AC-12 text and check-order dependency checked against `node bin/ttc.js` today. Code, tests, README and CI unchanged between `5be0561` and HEAD. Round 1 terminal: no round 2 | `technical/coherence.md` (round 1); this row. Vendor claude, model opus |

Dispatch log: `phase | delegate | vendor | model | tokens-scale | ledger run | artifact produced`

- `SOLUTION_EXPLORATION | ROLE-planner | claude | opus | L (subagent reported 120,560 tokens, 34 tool uses, 357 s) | a79b3dafbc8d6f50b | technical/capability-scan.md, impact.md, assessment.md`
- `DECOMPOSITION | ROLE-planner (coherence, round 1 of 2) | claude | opus | M (subagent reported 83,565 tokens, 15 tool uses, 115 s) | ac5cf5f7fec926021 | technical/coherence.md`
- `READINESS | ROLE-product-readiness-reviewer | claude | sonnet | M (subagent reported 70,979 tokens, 16 tool uses, 77 s) | af025587960294b06 | Readiness log row 1 (READY)`

## Escalation log

| Date | Question | `Q-` | Asked of | Answer | Recorded as |
| --- | --- | --- | --- | --- | --- |

## Stories

| `REQ-` | Title | Status | `CAP-` | `DES-` | Sequencing note |
| --- | --- | --- | --- | --- | --- |
| REQ-0015 | Tasks with no due date are listed on their own in one short command | accepted (rev 3) | CAP-0001 | none — no user-facing visual surface | none — on the frontier |

## Coverage validation

`SKILL-validate-requirement-coverage`, full mode, run by ROLE-product-manager on
2026-10-29 against the set on disk (iteration 1: zero defects). Story-set digest:
`(REQ-0015, 3, 2026-10-29)`; `INIT-0006` revision 3.

Traceability map: O1, O2, O3 (`initiative.md` Outcome) -> `REQ-0015` (accepted,
`outcome_element` names all three) -> `CAP-0001` (resolves, `draft`) -> no `DES-`
(no visual surface, `PD-0014` item 11) -> `PD-0003`, `PD-0004`, `PD-0009`,
`PD-0010`, `PD-0014` (all `accepted`, all indexed) -> no `Q-` open -> no tickets
yet.

| Rule | Result | Evidence |
| --- | --- | --- |
| R1 | pass | O1–O3 each map to accepted `REQ-0015` (O1: AC-1 `ttc list --no-due` with nothing else typed shows only the open tasks with no due date; O2: AC-1–AC-3 today's lines and order, AC-4 `No tasks.` and nothing written or created, AC-5 older files left as they are; O3: AC-9 today's views, filters, export and stats unchanged, AC-10 help changes only in the two usage lines, AC-5 older files) |
| R2 | pass | `REQ-0015` id = filename = index row (`requirements/index.md`, `accepted`); counter `requirement: 15`; no renumbering |
| R3 | pass | `outcome_element` names O1–O3; `CAP-0001` resolves in `capabilities/index.md` |
| R4 | pass | No user-facing visual surface (`PD-0014` item 11); `design_refs: []`; no `DES-` on the initiative |
| R5 | pass | 12 acceptance entries, each a command trigger and exact output, exit code or file state; AC-11 names the README content; AC-12 names `npm test`, the oracle and fuzz cover, the perf guard and the CI `test` check |
| R6 | pass | `depends_on: [none]` |
| R7 | pass | Stories table sequencing note `none — on the frontier`; graph acyclic |
| R8 | pass | No `blocker` `Q-`; Ambiguity log A1–A9 all `pm-resolvable`; no contradiction found between `REQ-0015` and an accepted `PD-` or `constraints.md` (flag-only) |
| R9 | pass | `PD-0014` cites `feasible-with-constraints`; coherence verdict `coherent` recorded in the Consultation log, round 1 terminal (no blocking defect), no findings to disposition |
| R10 | pass | Every `decisions:` entry is `accepted`; no dependency on a non-accepted `REQ-` or an open `Q-` |
| R11 | pass | Out of scope has 6 items; `REQ-0015` Non-goals mirror all six; no AC exercises excluded behaviour (AC-9 checks `ttc stats` is unchanged; no AC sets, changes or clears a due date beyond `ttc add --due` fixtures, sorts by due date or changes today's views) |
| R12 | pass | `INIT-0006`, `REQ-0015`, `CAP-0001`, `PD-0003/0004/0009/0010/0014` resolve through their indexes; file, `id`, frontmatter and index rows agree |

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
| 2026-10-29 | 1 | READY | none | ROLE-product-readiness-reviewer (claude, sonnet) | (REQ-0015, 3, 2026-10-29); INIT-0006 revision 3 | 0 (R13-R18 pass; R8 contradiction clause pass; R9 currency clause pass, no date gap; B10 not applicable, no DES) | none |

## Readiness findings

Written by `ROLE-product-readiness-reviewer` only, one block per round producing
at least one finding. Finding ids are `RF-<INIT-nnnn>-<round>-<n>`, scoped to
this file: they bump no counter and appear in no index. A `NOT READY` verdict
with no findings rows is invalid output.

| Finding | Criterion | Artifact | What is wrong | Route phase | Route role |
| --- | --- | --- | --- | --- | --- |

## Handoff packet

_Assembled at ENGINEERING_READY._

## Handoff log

| Date | Receiving role | Packet digest | Note |
| --- | --- | --- | --- |

## Phase log

Dates are UTC timestamps.

| Date | From | To | Role | Trigger | Outcome | `context_digest` |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-10-29T17:49:59Z | — | BOOTSTRAP | ROLE-product-manager | Raw request relayed by the driving session | Packet: `readiness: ready`, `scope.initiative: null`, profile S, no areas, no open `Q-` (`Q-0001` answered). `neighbouring` read in full: `CAP-0001` (draft) has no way to list only tasks with no due date; no `PD-` (accepted or rejected) concerns it; `PD-0003` items 6–8, `PD-0009` items 4–5 (overdue, list view, line, order) bind; INIT-0001 out of scope "Changing or clearing a due date after `add`" is a story boundary, not a rejected decision. INIT-0001..INIT-0005 are not touched. Advisory, carried: `CAP-0001` is still draft and predates shipped behaviour (code and README at head `5be0561` are the current-state evidence); `delivery/tickets.md` mirror `synced_on` 2026-10-21 is stale; the working tree has an uncommitted delivery-owned edit to `INIT-0005/delivery/tickets.md`, left alone. Hooks: HOOK-canonical-root pass, HOOK-hydrate pass | `c995399e88ef32e3`, head `5be0561` |
| 2026-10-29T17:50:50Z | BOOTSTRAP | INTAKE | ROLE-product-manager | Packet emitted, scope resolved to none | Triage verdict `new-initiative`: not `satisfied-by CAP-0001` (no option lists only tasks with no due date: `--due-from`/`--due-to` leave them out, `--overdue` never includes them, `--no-due` is an unknown option); no `PD-` settles it; no constraint forbids it; no initiative covers it (INIT-0001 base commands and `--overdue`, INIT-0002 important mark, INIT-0003 postpone, INIT-0004 clean, INIT-0005 copy), so not a duplicate; one outcome named. Raw request committed verbatim. `INIT-0006` allocated (counter 5 -> 6, checked against `origin/main` `5be0561`). Size: small (≤3 stories expected). Hooks: HOOK-initiative-resolved pass, HOOK-phase-entry pass | `c995399e88ef32e3`, head `5be0561` |
| 2026-10-29T17:52:12Z | INTAKE | DISCOVERY | ROLE-product-manager | INTAKE exit criteria met: one initiative, one problem, one named requester, ambiguity rows A1–A9 all classified (`pm-resolvable`) | Entry precondition (`lifecycle-hooks.md` §3.4.1 DISCOVERY) holds: `initiative.md` at `status: draft`; state at INTAKE with requester, problem statement and a classified ambiguity log. Discovery written (J1–J3, P1–P3, S2 `CAP-0001`, S3 signals 1–4, non-goals). No delegate consulted (optional, read-only; the code answers the current state). No `Q-` raised. Hooks: HOOK-phase-entry pass | `c995399e88ef32e3`, head `28e0544` |
| 2026-10-29T17:52:30Z | DISCOVERY | PRODUCT_DEFINITION | ROLE-product-manager | DISCOVERY exit criteria met: problem, user, current state and success signals stated with sources; no open escalation-class ambiguity | Entry precondition (`lifecycle-hooks.md` §3.4.1 PRODUCT_DEFINITION) holds: Discovery has the target user, jobs J1–J3 and problems P1–P3 each with a source (S1), mapping `CAP-0001` (S2), success signals 1–4 (S3) and known non-goals. Hooks: HOOK-phase-entry pass | `c995399e88ef32e3`, head `dd7f9af` |
| 2026-10-29T17:54:03Z | PRODUCT_DEFINITION | SOLUTION_EXPLORATION | ROLE-product-manager | PRODUCT_DEFINITION exit criteria met: outcome O1–O3, out of scope (6 items), success measures 1–6, draft `REQ-0015` covering O1–O3, Product Definition Contract citing the raw request | Entry precondition (`lifecycle-hooks.md` §3.4.1 SOLUTION_EXPLORATION) holds: F1 `initiative.md` rev 2 has an outcome and a non-empty out-of-scope section; one `status: draft` `REQ-`; F2 draft-mode coverage (inline, deterministic): J1 -> `REQ-0015` Requirement ("only their tasks that have no due date"), J2 -> Requirement ("one short command", "With nothing else typed"), J3 -> Non-goals and the initiative out of scope; no `R1` defect. `requirement` counter 14 -> 15, checked against `origin/main`. No scope `PD-` needed yet: A2–A4, A6, A7 are recorded in the chosen-option `PD-`. Hooks: HOOK-phase-entry pass | `c995399e88ef32e3`, head `e5fee86` |
| 2026-10-29T18:01:36Z | SOLUTION_EXPLORATION | SOLUTION_CONVERGENCE | ROLE-product-manager | SOLUTION_EXPLORATION exit criteria met: options A and B recorded, each with a feasibility verdict (`feasible-with-constraints`) and a user-visible trade-off; PM recommends B with reasons | Entry precondition (`lifecycle-hooks.md` §3.4.1 SOLUTION_CONVERGENCE) holds: X1 two distinguishable options; X2 each verdict in the closed set (`technical/assessment.md` round 1); one Consultation log row for the one delegate response. No design dispatch: no visual surface (`project/constraints.md` row 8, `PD-0001` item 3; to be recorded in the convergence `PD-`, §9d.5). Hooks: HOOK-phase-entry pass | `c995399e88ef32e3`, head `53c39af` |
| 2026-10-29T18:03:33Z | SOLUTION_CONVERGENCE | DECOMPOSITION | ROLE-product-manager | SOLUTION_CONVERGENCE exit criteria met: one accepted chosen-option `PD-0014` (option B), indexed, with the rejected option A and its reasons; it also settles A1–A7, N1–N5, P1 and P7; `REQ-0015` rev 2 (draft) is consistent with it; no option left under consideration; Solution Contract `product/solution-contract.md` cites `PD-0014` and states there is no design concept (no visual surface, `PD-0014` item 11) | Choice settled by the request (escalation-policy §3 route 2; §4.1: the quick command `ttc list --no-due` is the same under both options, which differ only in combinations the request does not mention; "Keep it simple" decides those); no stated need dropped or narrowed (§4.2); no `Q-`. Entry precondition (`lifecycle-hooks.md` §3.4.1 DECOMPOSITION) holds: exactly one accepted chosen-option `PD-` (`PD-0014`) citing verdict `feasible-with-constraints` (`technical/assessment.md` round 1). Counter `decision` 13 -> 14, checked against `origin/main`. `INIT-0006` rev 3 (O3, success measures 1 and 4, scope and last out-of-scope item name the two `ttc help` usage lines, architect P1). Hooks: HOOK-phase-entry pass | `c995399e88ef32e3`, head `bec62d4` |
| 2026-10-29T18:11:43Z | DECOMPOSITION | READINESS | ROLE-product-manager | DECOMPOSITION exit criteria met: O1–O3 map to accepted `REQ-0015` rev 3; it meets the nine points of §10.3 (accepted, one testable outcome, 12 pass/fail ACs, `CAP-0001`, no visual surface so no `DES-`, independently verifiable, no `blocker` `Q-`, no contradiction, indexed in the same commit); coherence round 1 (terminal) left no open blocking defect; convergence declared (`converged: true`) | Entry precondition (`lifecycle-hooks.md` §3.4.1 READINESS) holds: `converged: true`; `HOOK-traceability` zero defects (Coverage validation, iteration 1); `technical/coherence.md` verdict `coherent`, round 1 terminal under §9d.3, no findings; no user-facing story, so no `DES-` needed. AC texts for today's behaviour checked by the PM on `node bin/ttc.js` at head `5be0561`. Review budget this session: 1 of 6. Hooks: HOOK-phase-entry pass | `c995399e88ef32e3` (carried), head `b8d03c1` |

> Every product-side session updates this file before ending — **including
> sessions that failed**, which record the failure in `next_action` and do not
> advance `phase`.
