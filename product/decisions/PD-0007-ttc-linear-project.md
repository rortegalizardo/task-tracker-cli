---
id: PD-0007
type: decision
title: The ttc tickets live in a new Linear project, Task Tracker CLI, in team RC Development
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

# PD-0007 — The ttc tickets live in a new Linear project, Task Tracker CLI, in team RC Development

## Context

At HANDOFF, `SKILL-create-tickets-from-stories` §1 requires a Linear project
on every created issue: an issue with a team but no project does not show in
the project's Issues view. It resolves the project from an existing ticket of
this or a sibling initiative, else a workspace project whose name matches the
product, else the requester.

On 2026-10-20 none resolved it. This is the repository's first initiative, so
there is no earlier ticket. A Linear search for "Task Tracker" found no
project, archived ones included. The team was already fixed by the storage
preflight: RC Development (`RCDEV`, id `abd1c503-8acd-415e-ba29-68d2791136c9`).

The requester, through the parent session, put creating a Linear project named
"Task Tracker CLI" in RCDEV within scope, and asked that it be recorded as a
decision.

## Decision

1. The `INIT-0001` tickets are created in team RC Development (`RCDEV`), in
   the Linear project **Task Tracker CLI**: `P-RCDEV-3`, uuid
   `2e5df4f0-fa89-431b-9a08-aa10b30db353`, created 2026-10-20 at
   <https://linear.app/rdtechn/project/task-tracker-cli-74e2c6e65696>.
2. Later initiatives of this repository resolve to the same project through
   `SKILL-create-tickets-from-stories` §1's first rule: they fetch an existing
   ticket's project.
3. Every ticket and the project description name the repository:
   `rortegalizardo/task-tracker-cli` (`~/Desktop/Projects/task-tracker-cli`),
   per `project/constraints.md` row 9.

## Options considered

| Option | Why not |
| --- | --- |
| Create the issues with a team and no project | `SKILL-create-tickets-from-stories` §1 forbids it: the issues would not show in any project's Issues view. |
| Put the issues in an existing RCDEV project | None matches the product. Mixing them into another product's project would hide them from anyone looking for `ttc` work. |

## Consequences

**Costs.**

- One more project in the RCDEV workspace.

**Benefits.**

- All ten `ttc` tickets, and later ones, are visible in one place.

> Once `status: accepted`, this body is never rewritten. A change of mind is a
> new decision with `supersedes: PD-0007`.
