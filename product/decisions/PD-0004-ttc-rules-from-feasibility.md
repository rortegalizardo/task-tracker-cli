---
id: PD-0004
type: decision
title: Add the ttc behaviour rules the feasibility assessment showed were missing
status: accepted
revision: 1
owner_role: ROLE-product-manager
created: 2026-10-20
updated: 2026-10-20
decided_on: 2026-10-20
affects: [INIT-0001]
supersedes:
superseded_by:
---

# PD-0004 — Add the ttc behaviour rules the feasibility assessment showed were missing

## Context

The technical architect assessed option A of INIT-0001 as
`feasible-with-constraints`
(`initiatives/INIT-0001-ttc-command-line-task-tracker/technical/assessment.md`).
It listed seven product points, P1 to P7, where `PD-0003` and the stories do
not fix what a user sees, or where the platform limits what a rule can mean.
It also flagged constraints C2 and C5 as candidates for a decision.

Each point is a detail inside the requester's spec. The requester delegated
such details to the product manager (`PD-0001` item 1), so none of them is a
requester question.

This record **adds** to `PD-0003`. It changes no rule that `PD-0003` states. It
fixes the meaning of words `PD-0003` uses ("spaces", "atomic", "unchanged",
"valid task list") and adds rules where `PD-0003` is silent. Item numbers below
are this record's own; each names the `PD-0003` item it adds to.

## Decision

1. **Titles (adds to `PD-0003` item 3; P1).**
   - Only the space character (U+0020) is removed from both ends of a title.
     A tab or any other character at either end is kept.
   - A line break anywhere in a title makes it invalid:
     `ttc: title must be one non-empty line`. A line break is any of: LF, CR,
     U+0085, U+2028 or U+2029.
   - Any other control character in a title also makes it invalid:
     `ttc: title must not contain control characters`. Control characters are
     U+0000–U+001F (tab included) and U+007F–U+009F.
   - The same checks apply to every title in an import file. A failure there
     is reported as an import problem, in `PD-0003` item 14's form.
2. **Ids (adds to `PD-0003` items 1, 2 and 14; P2, C5).**
   - The largest id is 9007199254740991.
   - An `<id>` argument above that is an error: `ttc: invalid task id: <arg>`.
   - Leading zeros are allowed: `007` names task 7. Messages print the id
     without them: `Completed task 7`.
   - When the next id is above 9007199254740991, `ttc add` fails in
     `PD-0003` item 11's form, with a message saying no task id is left.
   - An import file is invalid when any task id is above 9007199254740991, or
     when its next id is above 9007199254740992.
3. **What "atomic" covers (adds to `PD-0003` item 13; C2).**
   - The guarantee is tested at process level: `ttc` is ended or fails at
     any step of a write (a crash, a kill or an error), and `tasks.json`, or
     an export target, then holds the whole old content or the whole new
     content.
   - CI cannot test surviving a power cut or an operating-system crash.
     Engineering still uses the platform's standard practice for a durable
     replace.
   - When a symlink is replaced, the result is a regular file holding the new
     content, and the link is not kept. This applies to a `tasks.json` that is
     a symlink, and to an export target that is one. Keeping links is out of
     scope.
4. **File permissions (adds to `PD-0003` item 13; P3).** On a supported
   system:
   - the data folder `ttc` creates is readable and writable by its owner only;
   - `tasks.json` is readable and writable by its owner only, also after it
     is replaced.

   An export file gets the system's default permissions: the user chose where
   to put it.
5. **Supported systems (P4).** `ttc` supports Linux and macOS. CI verifies
   Linux. Windows is out of scope for INIT-0001.
6. **Running `ttc` by name (P5).** The package declares the command `ttc`.
   Installing it from a clone of the repository with npm, which ships with
   Node, makes `ttc` runnable by name. Publishing to a registry stays out of
   scope.
7. **"Unchanged" and interrupted writes (adds to `PD-0003` items 11 and 13;
   P6).**
   - "`tasks.json` unchanged" means the file has the same bytes, or still
     does not exist, and its folder was not created. It applies to every
     failure that `ttc` reports.
   - After an interrupted write, only `tasks.json` itself is guaranteed. A data
     folder created before the interruption may remain, and so may a stray
     temporary file in it. `ttc` ignores any such file.
8. **What a valid task list is (adds to `PD-0003` items 13 and 14; P7).**
   Reading `tasks.json` applies every check that `import` applies, including
   items 1 and 2 of this record. Two tasks with one id, an upper-case tag, a
   repeated tag, an invalid title or date, or a next id that is not higher
   than every task's id each make `tasks.json` unreadable:
   `ttc: cannot read <path>: <reason>`.

## Options considered

| Option | Why not |
| --- | --- |
| Trim every whitespace character from a title, as the runtime's usual trimming does | A title typed with a trailing line break would be accepted silently, against `PD-0003` item 3's "contains a line break is an error". |
| Allow control characters in titles | A title from someone else's import file could send terminal control sequences to the user's screen when `list` prints it. |
| Report a control character with the line-break message | A tab is not a line break; the message would mislead. |
| No upper id bound | Above 9007199254740991 two ids can compare equal, which breaks "an id is never reused". |
| Read `007` as an invalid id | It is a whole number written in digits, which `PD-0003` item 2 allows. Refusing it surprises users who pad numbers. |
| Keep symlinks when replacing a file | It needs a different write method per case, for a setup nobody asked for. |
| Default permissions for `tasks.json` | On a shared machine other accounts could read a personal list. Owner-only access costs nothing visible to the owner. |
| Support Windows | CI does not verify it. File replacement and home-folder rules differ there. Nothing in the spec asks for it. |
| Remove a folder created by an interrupted write | An interruption can stop `ttc` before it cleans up. Only the file can be guaranteed. |

## Consequences

**Costs.**

- **Two new fixed messages**, which tests will assert: the control-character
  message, and the read failure for a stored list that breaks the import
  checks. The second reuses `PD-0003`'s existing `cannot read` form.
- **No Windows.** A Windows user cannot rely on `ttc`.
- **Leftovers after an interruption.** A data folder, or a temporary file
  inside it, can remain after an interruption. It does not change what `ttc`
  shows.
- **Links are not kept.** A user who points `tasks.json` at another file with
  a symlink finds a regular file there after the first write.

**Benefits.**

- Every point the architect raised now has one answer that every story uses.
- The list stays private to its owner on a shared machine.
- A damaged or hand-edited `tasks.json` is caught on read with the same checks
  `import` uses.

> Once `status: accepted`, this body is never rewritten. A change of mind is a
> new decision with `supersedes: PD-0004`.
