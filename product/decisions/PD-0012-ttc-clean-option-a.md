---
id: PD-0012
type: decision
title: Build INIT-0004 as option A, ttc clean removes every done task in one command and prints how many it removed
status: accepted
revision: 1
owner_role: ROLE-product-manager
created: 2026-10-28
updated: 2026-10-28
decided_on: 2026-10-28
affects: [INIT-0004, REQ-0013, CAP-0001]
supersedes:
superseded_by:
---

# PD-0012 — Build INIT-0004 as option A, ttc clean removes every done task in one command and prints how many it removed

## Context

The requester said: "My list is cluttered with tasks I finished ages ago. Let
me clean them up. Keep it simple."
(`initiatives/INIT-0004-clean-up-done-tasks/product/sources/2026-10-28-requester-request.md`).
Today a done task is stored for good and can only be removed with
`ttc delete <id>`, one task per command, and ttc does not record when a task
was finished (Discovery P1–P3 in
`initiatives/INIT-0004-clean-up-done-tasks/product/state.md`). The ambiguity
log there (A1–A9) is all `pm-resolvable`. The architect found option A
`feasible-with-constraints`, band `contained`, and option B
`feasible-with-constraints`, band `multi-component`, with constraints C1–C9,
risks R1–R6 and narrowing points P1–P7, none blocking
(`initiatives/INIT-0004-clean-up-done-tasks/technical/assessment.md`, round 1).

The choice between A and B is settled by the request itself
(escalation-policy §3 route 2): "Let me clean them up" asks for the finished
tasks to go in one go, and "Keep it simple" rules out a stored finish date, an
age threshold and a format change nobody asked for. The driving session
relayed that the PM makes the product decisions. Both options remove the tasks
finished long ago, so neither drops or narrows a stated need (§4.2).

## Decision

1. **Cleaning removes (A1, A4).** `ttc clean` deletes the tasks from
   `tasks.json` for good, as `ttc delete` does. Nothing is hidden, archived or
   kept anywhere else, and there is no undo.
2. **The command (A6, C1).** `ttc clean` takes no argument and no option. Any
   argument or option is an error under the existing argument rules
   (`PD-0003` item 2).
3. **Which tasks (A2, option A).** Every task whose status is done is removed.
   Every open task stays.
4. **Success line (P1, C3; adds to `PD-0003` item 10).**
   `Removed <n> done tasks`, where `<n>` is the number of tasks removed, then
   exit 0. The same form is used for every number, 0 and 1 included, as
   `Exported <n> tasks to <file>` and `Imported <n> tasks from <file>` already
   do.
5. **Nothing to remove (A8, C1).** With no done task stored, `ttc clean`
   prints `Removed 0 done tasks`, exits 0 and writes nothing: `tasks.json`
   stays byte-identical, a file written by older ttc keeps its version, and a
   missing `tasks.json` stays missing, with no file or folder created
   (`PD-0003` item 13).
6. **No confirmation (A3).** `ttc clean` does not ask "are you sure?"
   (`PD-0003` item 10: "No command asks for confirmation").
7. **Ids (A5, C2).** A removed task's id is never given again. The next id
   stays as it was, even when every task is removed (`PD-0003` item 1).
8. **Shared rules and check order (C1).** Arguments first; then, under the
   lock, read the list and remove the done tasks in one atomic write, so an
   interruption leaves either every done task or none of them removed. Every
   existing changing-command rule applies unchanged: the lock and its busy
   failure, the atomic write and file permissions (`PD-0004` items 3–4), a
   failure before the save writes nothing (`PD-0003` item 11, `PD-0004`
   item 7), and a failure after the save exits 1 and keeps the removal
   (`PD-0008`).
9. **What changes and what does not (O1, O3).** Only done tasks are removed.
   Every open task keeps its id, title, due date, tags, note and important
   mark; the order and format of `ttc list` and the next id do not change.
   What follows from the removal follows: `ttc list --done` prints
   `No tasks.`, `ttc list --all` shows only the open tasks, `ttc stats` prints
   `done: 0`, and `ttc export` no longer includes the removed tasks.
10. **Storage (A9).** No format change: `tasks.json` stays version 4. When at
    least one task is removed, a file written by older ttc is written as
    version 4, as by every changing command (`PD-0010` items 1, 4).
11. **Help (P1; adds to `PD-0003` item 12).** The usage gains the line
    `ttc clean`, after `ttc delete <id>` and before `ttc tag <id> +<t> | -<t>`.
12. **README (P7).** The README documents `ttc clean`: it removes every done
    task for good and prints how many it removed. It also says that
    `ttc list --done` shows beforehand what will go, that `ttc reopen <id>`
    keeps a task, and that `ttc export <file> --done` keeps a copy.
13. **No visual surface.** ttc is "CLI only, no UI" (`project/constraints.md`
    row 8; `PD-0001` item 3). No design role is dispatched and no `DES-` is
    made; the story carries `design_refs: []`, and its acceptance criteria
    state the exact command output and exit codes.
14. **The architect's constraints.** C1–C5 of `technical/assessment.md`
    (round 1) bind the story. C6–C9 apply only to option B and do not apply.
15. **How this record relates to `PD-0003`.** It adds to `PD-0003` items 10
    and 12 and changes nothing already decided there.

## Options considered

| Option | Why not |
| --- | --- |
| B — `ttc clean` removes only done tasks finished more than 30 days ago, with `ttc done` recording the finish date | Needs a stored finish date, so format version 5 and a one-way upgrade for every user from any changing command (C6, C7, R4), changes to `done`, `reopen`, import and JSON export (C8), and a 30-day rule to learn. Every task already done when it ships has no date, so its first clean removes all of them anyway (R1). "Keep it simple" decides it. It stays possible later (R6) |
| Move done tasks to an archive instead of deleting them | A second list to learn; `ttc export <file> --done` already keeps a copy (A4) |
| Ask "are you sure?" first | `PD-0003` item 10: no command asks for confirmation (A3) |
| Only hide done tasks | `ttc list` already hides them by default; the request is to clean them up (A1) |
| A separate line when nothing is removed | One more fixed text to learn and test; the count line with 0 says the same (P1) |
| `Removed 1 done task` for one task | Two forms instead of one; `Exported <n> tasks` and `Imported <n> tasks` already use one form for every number (P1) |
| `ttc delete --done` instead of a new command | Changes an existing usage line and mixes a one-id form with an all-done form in one command; "clean" is the requester's own word |
| `ttc clear` or `ttc purge` as the name | "clean" is the requester's own word ("Let me clean them up") |

## Consequences

**Costs.**

- **Recently finished tasks go too.** A task marked done a minute ago is
  removed with the rest, for good (assessment P7). The README points at
  `ttc list --done`, `ttc reopen <id>` and `ttc export <file> --done` before
  cleaning.
- **One more command** to learn, and **fixed text**: the success line and the
  usage line are fixed; changing one later needs a record that supersedes this
  one. Tests assert them. One task gives `Removed 1 done tasks`, as one export
  gives `Exported 1 tasks`.
- **An age rule later changes `ttc clean`.** If "only old tasks" is asked for
  later, it removes fewer tasks than today and needs a stored finish date then
  (assessment R6).
- **Tests move.** The test oracle and the argument fuzzing gain the command,
  written from this record, not from the new code (C4, R5).

**Benefits.**

- The smallest change that does what was asked: one command, one rule, no
  argument.
- No format change, no migration, and no change to any other command's output
  beyond the removed tasks no longer being there.
- The command behaves like the existing changing commands, so no new kind of
  rule is needed.

## Provenance

Decided by `ROLE-product-manager` at SOLUTION_CONVERGENCE of INIT-0004;
`context_digest` `2b4a364ef1aee73c`, head `e3b874b`.

> Once `status: accepted`, this body is never rewritten. A change of mind is a
> new decision with `supersedes: PD-0012`.
