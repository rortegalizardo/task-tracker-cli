---
id: PD-0009
type: decision
title: Build INIT-0002 as option A, one on/off important mark that ttc list shows first
status: accepted
revision: 1
owner_role: ROLE-product-manager
created: 2026-10-26
updated: 2026-10-26
decided_on: 2026-10-26
affects: [INIT-0002, REQ-0011, CAP-0001]
supersedes:
superseded_by:
---

# PD-0009 — Build INIT-0002 as option A, one on/off important mark that ttc list shows first

## Context

The requester asked: "I want to mark some tasks as more important than others
and see the important ones first when I list. Keep it simple."
(`initiatives/INIT-0002-important-tasks-first/product/sources/2026-10-26-requester-request.md`).
The run limits in the same file tell the product manager to "Fill the gaps and
make the technical/product choices yourself, recording them as PD- records".

SOLUTION_EXPLORATION recorded two options in `product/state.md` (`## Options`):
A, one on/off mark, and B, three levels. The technical architect assessed both
as `feasible-with-constraints`, band `multi-component`
(`initiatives/INIT-0002-important-tasks-first/technical/assessment.md`,
round 1). Its constraint C3 says the chosen option changes rules that
`PD-0003` fixes (items 7, 8, 9, 10, 12 and 14), so those changes must be fixed
in a decision before the story gets acceptance criteria. Tests assert fixed
text exactly.

Ambiguity rows A1–A9 of the INIT-0002 ambiguity log are all `pm-resolvable`.
This record settles A1–A7. A8 is settled by the initiative's out-of-scope
section. A9 and the stored format are settled by `PD-0010`.

## Decision

Build option A. Every rule below is binding on `ttc`. Quoted text is printed
exactly as shown; `<id>` is filled in, without leading zeros (`PD-0004`
item 2).

1. **One mark (A1).** A task is either important or not. There are no levels.
   A new task is not important unless it is added with `--important`.
2. **Mark a task when adding it (A2).** `ttc add` takes a new option,
   `--important`, which has no value. The task is added already important.
   Giving it twice, or giving it a value, is an error, as for every option
   (`PD-0003` item 2). The success line stays `Added task <id>`.
3. **Mark and unmark an existing task (A2).** Two new commands, each taking
   exactly one `<id>`:
   - `ttc important <id>` marks the task. It prints
     `Marked task <id> as important`. On a task that is already important it
     prints `Task <id> is already important`, exits 0 and writes nothing.
   - `ttc unimportant <id>` removes the mark. It prints
     `Removed important mark from task <id>`. On a task that is not important
     it prints `Task <id> is not important`, exits 0 and writes nothing.
   - Both work on open and done tasks.
   - Both follow every rule that `ttc done` and `ttc reopen` follow: argument
     and id rules (`PD-0003` item 2, `PD-0004` item 2), errors (`PD-0003`
     item 11), the write lock, atomic writes and no-op rules (`PD-0004`
     items 3, 4 and 7), and a failure after the save (`PD-0008`). These are
     the architect's constraint C4.
4. **List order (A3, A4; adds to `PD-0003` item 7).** In every status view
   (`--open`, `--done`, `--all`, `--overdue`, and the default) and with every
   filter (`--tag`, `--due-from`, `--due-to`, `--search`), `ttc list` prints
   the matching important tasks first, in ascending id order, and then the
   other matching tasks, in ascending id order. The filters still decide which
   tasks are shown; the mark decides only their order. When no shown task is
   important, the order is ascending id, exactly as today. `No tasks.` is
   unchanged.
5. **The list line (A5; adds to `PD-0003` item 8).** An important task's line
   carries the token `!important`, after `!overdue` when that is present and
   before the tags:
   `#<id> [ ]|[x] <title> [due:YYYY-MM-DD] [!overdue] [!important] [+<tag>]...`.
   Example: `#3 [ ] Pay rent due:2026-10-01 !overdue !important +bills +home`.
   The line of a task that is not important is unchanged. A title may contain
   the text `!important`, as it may already contain `!overdue` (architect
   finding P3; the existing precedent is kept).
6. **The mark stays (A6).** `ttc done`, `ttc reopen`, `ttc rename`, `ttc tag`
   and `ttc note` never change the mark. Only `ttc unimportant` removes it.
   `ttc delete` removes the task with its mark. `ttc import` replaces the list,
   marks included, with the file's list (`PD-0003` item 14).
7. **Help (adds to `PD-0003` item 12).** The `ttc add` usage line becomes
   `ttc add "<title>" [--due YYYY-MM-DD] [--tag <t>]... [--note "<text>"] [--important]`.
   Two new lines, `ttc important <id>` and then `ttc unimportant <id>`, come
   right after `ttc reopen <id>`. Every other usage line, and the order of
   the others, stays as `ttc help` prints it at head `3dbf454`.
8. **Export and import (A7; adds to `PD-0003` item 14).**
   - A JSON export, whole or filtered, holds each exported task's mark.
     `ttc import` restores it. "A list exported and then imported is the same
     list" includes the mark.
   - `ttc import` checks every task's mark as part of checking the whole file
     (`PD-0010` item 2).
   - Unchanged: the CSV columns (`id,title,status,due,tags,note`), the order of
     both export formats, and every export option.
9. **Unchanged commands.** `ttc stats` output and `ttc note` output do not show
   or count the mark.
10. **README.** The README documents `--important`, the two commands, the list
    order and the `!important` token.
11. **No visual surface.** ttc is "CLI only, no UI" (`project/constraints.md`
    row 8). No design role is dispatched for INIT-0002, its stories carry
    `design_refs: []`, and each story's acceptance criteria state the command,
    the exact output and the exit code (definition §9d.5).
12. **The architect's constraints.** C1–C7 of
    `technical/assessment.md` round 1 are accepted and bind the story. In
    particular C6: the test oracle is changed from this record's and
    `PD-0010`'s text, not from the new code. C8 applies to option B only.
13. **How this record relates to `PD-0003`.** It adds to `PD-0003` items 7, 8,
    9, 10, 12 and 14 as stated above and changes no other item. Item 7's
    "ascending id order" now means "important tasks first, ascending id inside
    each group"; when no shown task is important the two are the same.
    `PD-0003` stays accepted, as it did when `PD-0004` and `PD-0008` added to
    it.

## Options considered

| Option | Why not |
| --- | --- |
| B — three levels (high, normal, low), `ttc priority <id> <level>` | The request asks for "more important than others" and "Keep it simple"; two groups meet that. B contradicts the initiative's out-of-scope item "more than one level". It adds a level vocabulary to learn and spell (C8) and messages the option never defined (P2). A later move from A to levels is lossless (architect risk R4), so A does not block it. |
| One command, `ttc important <id> [--clear]`, like `ttc note` | One command fewer, but the pair `done`/`reopen` is the closer precedent for an on/off state, and a pair needs no option to learn. |
| A filter `ttc list --important` | Out of scope: the ask is to see important tasks first, not to list only them. |
| A marker before the title (for example `*` or `!` after `[ ]`) | Changes where the title starts on marked lines only, so lines would no longer line up the same way. The `!overdue` precedent puts a status token after the title and due date. |
| Supersede `PD-0003` and restate its sixteen items | Copies sixteen items to add to six, and none of the other ten changes. `PD-0004` and `PD-0008` set the precedent of adding to `PD-0003` in a new record. |

## Consequences

**Costs.**

- **Two more commands and one more option** to learn.
- **Fixed text.** The four messages and the token above are fixed; changing
  one later needs a record that supersedes this one. Tests assert them.
- **A title can look marked.** A task titled `Call mom !important` that is not
  important prints the same line as an important task titled `Call mom`.
  The same is already true of `!overdue`.
- **One-way data upgrade.** See `PD-0010`.
- **Tests move.** The test oracle and the unit tests that assert format 3
  output change with the story (C6).

**Benefits.**

- The smallest change that does what was asked: two groups, today's order
  inside each.
- A list with no important task prints exactly what it prints today.
- Every new command behaves like an existing one, so no new kind of rule is
  needed.

## Provenance

Decided by `ROLE-product-manager` at SOLUTION_CONVERGENCE of INIT-0002;
`context_digest` `6136a67d57b0d9fc`, head `3dbf454`.

> Once `status: accepted`, this body is never rewritten. A change of mind is a
> new decision with `supersedes: PD-0009`.
