---
id: PD-0013
type: decision
title: Build INIT-0005 as option B, ttc copy makes a new open task from an existing one and can give it a different due date
status: accepted
revision: 1
owner_role: ROLE-product-manager
created: 2026-10-29
updated: 2026-10-29
decided_on: 2026-10-29
affects: [INIT-0005, REQ-0014, CAP-0001]
supersedes:
superseded_by:
---

# PD-0013 — Build INIT-0005 as option B, ttc copy makes a new open task from an existing one and can give it a different due date

## Context

The requester said: "I often need another task like an existing one. Let me
make a copy without retyping everything. Keep it simple."
(`initiatives/INIT-0005-copy-a-task/product/sources/2026-10-29-requester-request.md`).
Today a task is made only with `ttc add`, typing every detail again, and no
command makes a task from another. Once a task exists, its title, tags, note
and mark can each be changed by a command, but its due date only moves to one
day after the later of its due date and today, and is never set or cleared
(Discovery P1–P3 in `initiatives/INIT-0005-copy-a-task/product/state.md`;
`PD-0011` items 3, 5). The ambiguity log there (A1–A10) is all
`pm-resolvable`. The architect found option A (`ttc copy <id>`) and option B
(`ttc copy <id> [--due YYYY-MM-DD]`) both `feasible-with-constraints`, band
`contained`, with constraints C1–C9 (C8, C9 B only), risks R1–R5 and
narrowing points P1–P10, none blocking or costly, and no stored-format change
in either (`initiatives/INIT-0005-copy-a-task/technical/assessment.md`,
round 1).

The choice between A and B is settled by the request itself
(escalation-policy §3 route 2), and the driving session relayed "Make the
product decisions yourself and record them as PD-". Both options make the
copy with nothing but the id typed, so neither drops or narrows a stated need
(§4.2). "Without retyping everything" decides for B: the due date is the one
detail no command can set after the task exists, so under A the copy of a
dated task carries the old date, and moving it more than a day ahead takes
one `ttc postpone` per day (R3; P8). "Keep it simple" holds under B: with
nothing else typed it is exactly A, and its one option is the `--due` the
user already knows from `ttc add`, under the same rules (C8).

## Decision

1. **A copy is a new task (A1, A2, C5, P5).** `ttc copy <id>` adds one new
   task made from the task with that id. The new task has the original's
   title, due date, tags, note and important mark, as stored; its status is
   open, whatever the original's; and it gets a new id (item 5). Nothing else
   is copied, and the new task does not record which task it came from (A8).
   An original with no due date, no tags or no note gives a copy with none.
   A copy of an overdue original is overdue at once, unless `--due` gives it
   another date. Example: task 3 is done, important, titled `Pay rent`, due
   `2026-10-01`, tagged `bills` and `home`, with a note. `ttc copy 3` adds
   task 8, open, important, `Pay rent`, due `2026-10-01`, tags `bills` and
   `home`, the same note; task 3 stays done and unchanged.
2. **The command (A6, A10, C1).** `ttc copy <id> [--due YYYY-MM-DD]`. It takes
   exactly one id and at most one `--due`, which may come before or after the
   id. A missing id, an extra argument, any other option, `--due` with no
   value, or `--due` given twice is an error under the existing argument
   rules (`PD-0003` item 2). One task is copied per command.
3. **`--due` (P7, C8, C9).** With `--due <d>`, the new task's due date is
   `<d>` instead of the original's. `<d>` follows the `ttc add --due` rule
   exactly: `YYYY-MM-DD`, a real calendar date, a past date allowed, nothing
   later than `9999-12-31`, and `ttc: invalid date: <d>` otherwise
   (`PD-0003` item 5, `PD-0011` item 6). It gives a date to the copy of an
   original that has none. It cannot remove a date: there is no "no due date"
   value, and a copy of a dated original always has a date.
4. **Success line (P1, C3; adds to `PD-0003` item 10).**
   `Copied task <id> as task <new-id>`, where `<id>` is the original's id and
   `<new-id>` the new task's, both without leading zeros, then exit 0. Every
   accepted copy adds a task, so there is no "nothing to do" case.
   Example: `ttc copy 007` prints `Copied task 7 as task 12`.
5. **Ids (A3, C2, P4; extends `PD-0004` item 2 to copy).** The new task gets
   the next id, and the next id rises by one, exactly as for `ttc add`; an id
   is never reused (`PD-0003` item 1). When no task id is left, `ttc copy`
   refuses as `ttc add` does: `ttc: no task id is left`, exit 1, nothing
   changed.
6. **Errors and check order (P3, C1).** Before the lock: the arguments, then
   the id (`ttc: invalid task id: <arg>`), then the `--due` date. Under the
   lock: read the list (`ttc: cannot read <path>: <reason>`), then find the
   task (`ttc: no task with id <id>`), then the id limit (item 5). The first
   failing check is the one reported. Every refusal prints one line to
   stderr, exits 1 and writes nothing: `tasks.json` stays byte-identical, a
   file written by older ttc keeps its version, and a missing `tasks.json`
   stays missing, with no file or folder created (`PD-0003` items 11, 13,
   `PD-0004` item 7).
7. **Shared rules (C1).** Every existing changing-command rule applies
   unchanged: the lock and its busy failure, one atomic write of the read,
   lookup and new task, so an interruption leaves the list either without the
   copy or with the whole copy (`project/constraints.md` row 5, `PD-0004`
   items 3–4), and a failure after the save exits 1 and keeps the copy
   (`PD-0008`).
8. **What changes and what does not (O3, R2).** Only the new task is added.
   The original and every other task keep their id, title, status, due date,
   tags, note and important mark, and their stored order; the format of
   `ttc list` lines does not change.
9. **Listing (A4).** The new task is listed like any task: by its important
   mark, then by id (`PD-0003` item 7, `PD-0009` item 4). It shows in
   `ttc stats`, in `ttc export`, and under every filter it matches.
10. **Storage (A9, C4, P6).** No format change: `tasks.json` stays version 4.
    A task in a file written by older ttc is copied without error, and the
    copy holds what that file holds (no note in versions 1–2, no important
    mark in versions 1–3). A successful copy writes the file as version 4, as
    every changing command does (`PD-0010` items 1, 4); a refused copy leaves
    it as it is.
11. **Help (P2; adds to `PD-0003` item 12).** The usage gains the line
    `ttc copy <id> [--due YYYY-MM-DD]`, after the `ttc add` line and before
    the `ttc list` line.
12. **README (P9, P10).** The README gains a "Copying a task" section in the
    style of "Postponing a task": the usage, what the copy holds, that it is
    open, the `--due` option and its rule, the success line, the refusals, and
    that only the new task is added. It does not present copying and then
    deleting as a way to change a due date.
13. **A copy is not a reschedule (P9, R4).** A copy is a new task with a new
    id. Changing or clearing the due date of a task that already exists stays
    out of scope (`initiative.md`; INIT-0001 out of scope).
14. **No visual surface.** ttc is "CLI only, no UI" (`project/constraints.md`
    row 8; `PD-0001` item 3). No design role is dispatched and no `DES-` is
    made; the story carries `design_refs: []`, and its acceptance criteria
    state the exact command output and exit codes.
15. **The architect's constraints.** C1–C9 of `technical/assessment.md`
    (round 1) bind the story, C8 and C9 because option B is chosen.
16. **How this record relates to earlier ones.** It adds to `PD-0003` items 10
    and 12 and extends `PD-0004` item 2's id-limit refusal to `ttc copy`. It
    changes nothing already decided there.

## Options considered

| Option | Why not |
| --- | --- |
| A — `ttc copy <id>`, no option | The copy of a dated task always carries the old date, and the due date is the one detail no command can set afterwards; reaching a date more than a day ahead takes one `ttc postpone` per day (R3, P8). That is retyping by another route, against "without retyping everything". It remains exactly B's form when nothing else is typed, so nothing of A is lost |
| Options on `copy` for the title, tags, note or mark | `ttc rename`, `ttc tag`, `ttc note`, `ttc important` and `ttc unimportant` already change them afterwards; more options to learn, against "Keep it simple" |
| A way to give the copy no due date | Needs a new "no date" value; clearing a due date has been out of scope since INIT-0001 (C9) |
| Copying several tasks in one command | "make a copy" asks for one; out of scope (A6) |
| The copy keeps the original's status | "another task" is new work; a copy of a done task is the plain way to do it again (A2) |
| `Added task <new-id>` as the success line | Does not say a copy was made or from which task (P1) |
| Recording which task a copy came from | Nothing in the ask needs it, and a new stored field forces format version 5 and a one-way upgrade for every user (A8, C4) |
| `ttc add --from <id>` instead of a new command | Changes an existing usage line and mixes two ways of making a task in one command; "copy" is the requester's own word |
| `ttc dup`, `ttc clone` or `ttc duplicate` as the name | "copy" is the requester's own word ("Let me make a copy") (A10) |

## Consequences

**Costs.**

- **One more command** and **fixed text**: the success line and the usage line
  are fixed; changing one later needs a record that supersedes this one.
  Tests assert them.
- **A copy can stand in for a reschedule.** `ttc copy <id> --due <d>` followed
  by `ttc delete <id>` gives a task with a new date and a new id (R4). This is
  accepted: the README does not present it that way, and a script that tracks
  a task by id sees the old one go and a new one come.
- **An overdue copy.** Copying an overdue task without `--due` gives an
  overdue task; one `ttc postpone` brings it to tomorrow.
- **Tests move.** The test oracle and the argument fuzzing gain the command,
  with its `--due` cases, written from this record, not from the new code
  (C6, R1); three tests that list the whole usage gain the line.

**Benefits.**

- The user types only the id, and the date when it differs.
- Nothing new to learn beyond the command: `--due` is the option `ttc add`
  already has, under the same rule.
- No format change, no migration, and no change to any other command's
  output beyond the new task being there.
- The command behaves like the existing changing commands, so no new kind of
  rule is needed.

## Provenance

Decided by `ROLE-product-manager` at SOLUTION_CONVERGENCE of INIT-0005;
`context_digest` `0e519ee7443786e9`, head `7676d74`.

> Once `status: accepted`, this body is never rewritten. A change of mind is a
> new decision with `supersedes: PD-0013`.
