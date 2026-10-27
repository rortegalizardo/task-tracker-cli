---
id: PD-0010
type: decision
title: Store the important mark in a new data format version 4, and accept that the upgrade is one-way
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

# PD-0010 — Store the important mark in a new data format version 4, and accept that the upgrade is one-way

## Context

`PD-0009` adds an important mark to every task. The mark has to be stored in
`tasks.json` and carried in JSON exports.

The technical architect found (`initiatives/INIT-0002-important-tasks-first/technical/assessment.md`,
round 1):

- **C1.** ttc checks every stored and imported file against the exact fields
  of its format version, and refuses an unknown field or a newer version. So a
  stored mark needs a new format version, 4. This rule exists only in the
  README and the code, never in a decision, yet it decides what users of every
  later change see.
- **C2 / P1.** Once new ttc has changed the list, an older ttc (which reads up
  to version 3) refuses `tasks.json` and refuses new JSON exports, even when no
  task is marked. No shipped command writes an older version.
- **C5.** The mark must be checked strictly and the same way in `tasks.json`
  and in import files, and never coerced.

The architect offered two answers to P1: (a) accept the one-way upgrade, as
format 3 did for notes; (b) keep writing format 3 until the first task is
marked. It recommended (a).

The requester delegated such choices ("make the technical/product choices
yourself, recording them as PD- records";
`product/sources/2026-10-26-requester-request.md`). ttc has one user on one
machine (`CAP-0001`), and the format 2 to 3 upgrade for notes already worked
this way, so this is not a stakeholder question.

## Decision

1. **Format versions (C1; a rule for every later change too).**
   - Every `tasks.json` and every import file is checked against the exact
     fields of its format version.
   - A new stored field means a new format version.
   - ttc reads every older version, both as `tasks.json` and as an import file.
     A command that does not change the list, or a no-op, leaves an older
     `tasks.json` exactly as it is. The next command that changes the list
     writes the current version.
   - A file with a version newer than ttc knows is refused: as `tasks.json`
     with `ttc: cannot read <path>: <reason>`, as an import file with
     `ttc: invalid import file <file>: <problem>`.
2. **Format version 4 (C1, C5).**
   - Version 4 is version 3 plus the important mark on every task.
   - In a version 4 file, every task must hold its mark as one of the two
     values ttc writes (important, not important). A missing mark or any other
     value makes the file invalid: `ttc: cannot read <path>: <reason>` for
     `tasks.json`, `ttc: invalid import file <file>: <problem>` for an import
     file. The value is never guessed, coerced or defaulted.
   - Field name and value spelling are engineering's choice (`PD-0003`
     item 13). README "Data file format" documents them.
3. **Older files (A9).** Files of versions 1, 2 and 3 are read with no task
   important. `ttc import` accepts versions 1 to 4.
4. **The upgrade is one-way (C2, P1 option (a)).**
   - Every write, and every JSON export, uses version 4, even when no task is
     important. So JSON export bytes differ from today's even with no mark;
     `ttc list` output with no important task does not.
   - After new ttc's first change, an older ttc refuses `tasks.json` and
     refuses new JSON exports. ttc has no command that writes an older
     version.
   - README "Data file format" says so, in the same words it uses today for
     versions 1 and 2.

## Options considered

| Option | Why not |
| --- | --- |
| (b) Keep writing format 3 while no task is important; write format 4 once one is | Two written shapes and a rule that is harder to explain ("your file changes format when you first mark a task"). It only delays the same one-way step. It differs from the notes precedent (format 3 was written at once). |
| Store the mark in a second file next to `tasks.json` | Breaks constraint 4: "Data lives in one JSON file". An export would also need a second file to keep the mark. |
| Add the mark without a new version | Shipped ttc refuses unknown fields, so an older ttc would fail on the file anyway, with a less clear message, and the strict per-version check (C1) would be lost. |
| Write the mark only on important tasks (absent means not important) | A missing value would then be a valid value, which C5 forbids: a damaged or hand-edited file could lose marks silently. Version 3 already requires `note` on every task. |

## Consequences

**Costs.**

- **No way back to an older ttc.** A user who runs an older ttc on the same
  file after one change by new ttc (for example two machines sharing
  `$TTC_HOME`, or a downgrade) gets a `cannot read` error on every command
  until they use new ttc again (architect risk R2). This holds with no task
  marked.
- **JSON export bytes change** for every user, even one who never marks a
  task.
- **Every later stored field pays the same cost**, since item 1 is a standing
  rule.

**Benefits.**

- One file shape at a time, explained by one README rule users already read.
- Older files keep working with new ttc, with no step for the user.
- A damaged or hand-edited mark is caught on read and on import, never
  silently dropped.

## Provenance

Decided by `ROLE-product-manager` at SOLUTION_CONVERGENCE of INIT-0002;
`context_digest` `6136a67d57b0d9fc`, head `3dbf454`.

> Once `status: accepted`, this body is never rewritten. A change of mind is a
> new decision with `supersedes: PD-0010`.
