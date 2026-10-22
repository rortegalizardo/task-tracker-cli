---
id: PD-0008
type: decision
title: A changing command that saves its change and then cannot print its confirmation exits 1, and the change stays saved
status: accepted
revision: 1
owner_role: ROLE-product-manager
created: 2026-10-22
updated: 2026-10-22
decided_on: 2026-10-22
affects: [INIT-0001]
supersedes:
superseded_by:
---

# PD-0008 — A changing command that saves its change and then cannot print its confirmation exits 1, and the change stays saved

## Context

Engineering ticket RCDEV-838 asked (`Q-0001`; raw question at
`~/Factory/Artifacts/projects/TTC/tickets/RCDEV-838/product-questions/01/question.md`):
a changing command such as `ttc add x | head -c 0` saves its change
atomically, then fails to print its confirmation line because stdout is
closed. RCDEV-838 AC-2 fixes the exit code at 1. `PD-0003` item 11 says
every failure "changes no stored data". The two cannot both hold for this
case, which `PD-0003` did not consider: the failure happens after the write.

This is a detail inside the spec, delegated to the product manager
(`PD-0001` item 1). This record **clarifies** `PD-0003` item 11 for that one
case and changes no other rule.

## Decision

1. **Scope of `PD-0003` item 11's "changes no stored data".** It holds for
   every failure found before the command saves its change: bad arguments,
   a missing task, an unreadable file, a failed write, an invalid import
   file. Those failures leave `tasks.json` exactly as it was.
2. **Failure after the save.** When a changing command has already saved its
   change and then cannot print its confirmation line (item 10) — for
   example because stdout was closed — the command:
   - keeps the saved change; it is not undone;
   - exits with code 1, because it did not complete as item 10 defines
     success (one line printed, exit 0);
   - prints at most one `ttc: <message>` line to stderr, if stderr can still
     be written, and never a stack trace.
3. **README.** The "Exit codes" section states this as the one exception to
   "a failure changes no stored data": exit 1 with stdout closed after a
   change means the change was already saved. Running `ttc list` shows it.

## Options considered

| Option | Why not |
| --- | --- |
| Count it as success (exit 0) | `PD-0003` item 10 defines success as printing the line; it was not printed. Constraint 6 and RCDEV-838 AC-2 make an unfinished command exit non-zero. A script would also lose the signal that its output went missing. |
| Undo the change before exiting 1 | Needs a second write after the first, which can itself fail or be interrupted, and leaves a window where the list holds the new data. That works against constraint 5 ("Every write is atomic") for no gain to the user. |
| Print the confirmation before saving | A failed save would then follow a success line, breaking item 11's "prints nothing to stdout" for that failure. |

## Consequences

**Costs.**

- **Exit 1 does not always mean "nothing changed".** A script that pipes a
  changing command into a reader that closes early must check the list
  rather than assume the change did not happen.

**Benefits.**

- The saved data is never rolled back by a second, riskier write.
- Exit 0 keeps one meaning: the command did all it promises, including its
  output.

> Once `status: accepted`, this body is never rewritten. A change of mind is a
> new decision with `supersedes: PD-0008`.
