---
id: Q-0001
type: question
title: How is a changing command described when it saves its change and then fails to print its confirmation?
status: answered
revision: 1
owner_role: ROLE-product-manager
severity: blocker
raised_by_role: ROLE-orchestrator
raised_on: 2026-10-22
created: 2026-10-22
updated: 2026-10-22
initiative: INIT-0001
resolved_by: PD-0008
answered_on: 2026-10-22
---

# Q-0001 — How is a changing command described when it saves its change and then fails to print its confirmation?

## Question

Raised by engineering ticket RCDEV-838 (raised_by: ticket body, Dependencies
section; source file
`~/Factory/Artifacts/projects/TTC/tickets/RCDEV-838/product-questions/01/question.md`),
verbatim:

> PD-0003 item 11 says every failure "changes no stored data". A changing
> command (e.g. `ttc add x | head -c 0`) saves its change atomically, then
> fails to print its confirmation line to a closed stdout. Exit is 1
> (RCDEV-838 AC-2), yet the data changed. How should the README "Exit codes"
> section describe this case: (a) exit 1, "the change was already saved", an
> exception to "changes no stored data"; (b) count it as success (exit 0); or
> (c) other?

Blocks RCDEV-838 AC-2 and AC-6 wording.

## Recommended default if unanswered

None needed: answered in the same session.

## Answer

triage: product question within `product-manager-orchestrator` §4.1 (a missing
case that follows from `PD-0003` item 10, constraints 5 and 6, and the ticket's
AC-2); decided by the product manager, 2026-10-22.

Option (a). The change stays saved, the command exits 1, at most one
`ttc: ` line, no stack trace. The README "Exit codes" section names it as the
one exception to "a failure changes no stored data". Recorded in `PD-0008`.
