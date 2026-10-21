---
id: PD-0006
type: decision
title: Titles in a stored or imported file must be in stored form, and an import may give ids again
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

# PD-0006 — Titles in a stored or imported file must be in stored form, and an import may give ids again

## Context

The architect's coherence check of the draft stories for INIT-0001 found two
gaps (`initiatives/INIT-0001-ttc-command-line-task-tracker/technical/coherence.md`,
round 1, D5 and D6).

- **D5.** The space-trimming rule for titles (`PD-0003` item 3, `PD-0004`
  item 1) covers only a title typed as an argument. Nothing says what happens
  to a title in an import file, or in `tasks.json`, that has spaces at either
  end or holds only spaces.
- **D6.** `PD-0003` item 1 says an id is never reused. `PD-0003` item 14 says
  an import keeps the file's next id. After importing an older export, an id
  given since that export is given again.

The raw spec says neither "never reused" nor anything about titles in a file.
Both are details inside the spec, which the requester delegated to the
product manager (`PD-0001` item 1). This record **adds** to `PD-0003` and
`PD-0004` and changes no rule either states.

## Decision

1. **Titles in a file (adds to `PD-0003` item 14 and `PD-0004` items 1
   and 8).**
   - A title in an import file must already be in its stored form: not
     empty, and with no space character (U+0020) at either end. Otherwise
     the file is refused as an import problem, in `PD-0003` item 14's form.
     The import never changes a title.
   - The same check applies when reading `tasks.json` (`PD-0004` item 8).
     A stored title that fails it makes the file unreadable:
     `ttc: cannot read <path>: <reason>`.
   - `ttc` always stores titles trimmed, so a file `ttc` wrote always passes.
     This mirrors the rule for tags in a file (`PD-0003` item 14).
2. **Ids after an import (clarifies `PD-0003` items 1 and 14).**
   - "An id is never reused" holds within one list's history: add, delete
     and every other command that changes the list.
   - An import replaces the whole list, including its next id. So after a
     file is imported, ids given since that file was exported can be given
     again.
   - The import does not read the current `tasks.json` (`PD-0003` item 13).

## Options considered

| Option | Why not |
| --- | --- |
| Accept a file title as written when it has at least one non-space character | A title with outer spaces could then exist only through import, and every later `rename` of it would behave differently from `add`. |
| Trim titles on import | Import would change data, which `PD-0003` rejected for tags; a list exported and imported would no longer be the same list. |
| Import never lowers the next id | Import would have to read the current `tasks.json`, against `PD-0003` item 13, and would fail when that file is damaged — the case a restore exists for. |

## Consequences

**Costs.**

- **A hand-edited file can be refused.** A file whose title has outer spaces
  is refused, though the title is readable.
- **Ids can come back after a restore.** After restoring an older backup, an
  id can name a different task than it did before the restore.

**Benefits.**

- A title has one stored form however it got into the list.
- An import stays a true restore of the file, and works when `tasks.json` is
  damaged.

> Once `status: accepted`, this body is never rewritten. A change of mind is a
> new decision with `supersedes: PD-0006`.
