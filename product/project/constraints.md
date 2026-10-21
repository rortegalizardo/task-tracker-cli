---
id: PROJECT-constraints
type: project-context
title: Hard constraints
status: authoritative
revision: 2
owner_role: ROLE-product-manager
created: 2026-10-20
updated: 2026-10-20
---

# Hard constraints

Non-negotiable limits on what may be built or how. These outrank initiative
intent and are overridden only by a decision that explicitly amends them.

| # | Constraint | Source | Applies to |
| --- | --- | --- | --- |
| 1 | "Node.js, built-in libraries only" (requester's words, verbatim). | Requester, at bootstrap (2026-10-20) | As stated; the requester gave no narrower scope |
| 2 | "Node 24" (requester's words, verbatim). | Requester's spec (2026-10-20), recorded by `PD-0001` | The runtime the product targets |
| 3 | "no network" (requester's words, verbatim). | Requester's spec (2026-10-20), recorded by `PD-0001` | Every command |
| 4 | "Data lives in one JSON file at $TTC_HOME/tasks.json (default ~/.ttc)." (requester's words, verbatim) | Requester's spec (2026-10-20), recorded by `PD-0001` | All task data |
| 5 | "Every write is atomic." (requester's words, verbatim) | Requester's spec (2026-10-20), recorded by `PD-0001` | Every command that changes stored data |
| 6 | "Errors print one line to stderr and exit non-zero." (requester's words, verbatim) | Requester's spec (2026-10-20), recorded by `PD-0001` | Every command |
| 7 | "Every command has node:test tests; the CI `test` check must pass." (requester's words, verbatim) | Requester's spec (2026-10-20), recorded by `PD-0001` | Every command |
| 8 | "CLI only, no UI" (requester's words, verbatim). | Requester's instructions (2026-10-20), recorded by `PD-0001` | The product |
| 9 | Code lives in `rortegalizardo/task-tracker-cli` (`~/Desktop/Projects/task-tracker-cli`); "Every ticket must name its repo" (requester's words). | Requester's instructions (2026-10-20), recorded by `PD-0001` | Every engineering ticket |

The source of constraints 2–9 is committed verbatim in
`initiatives/INIT-0001-ttc-command-line-task-tracker/product/sources/2026-10-20-requester-spec.md`.
