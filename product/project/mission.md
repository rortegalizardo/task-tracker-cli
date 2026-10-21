---
id: PROJECT-mission
type: project-context
title: Product mission
status: authoritative
revision: 2
owner_role: ROLE-product-manager
created: 2026-10-20
updated: 2026-10-20
---

# Product mission

Hardened at DISCOVERY of `INIT-0001` (2026-10-20) from the requester's own
words, committed verbatim in
`initiatives/INIT-0001-ttc-command-line-task-tracker/product/sources/2026-10-20-requester-spec.md`.
Quoted text is the requester's; the rest only restates it.

## What this product is

"a `ttc` command-line task tracker" (requester's words): one person keeps a
to-do list from the terminal. The list lives in one JSON file on their own
machine (`$TTC_HOME/tasks.json`, default `~/.ttc`), and the tool runs on
Node 24 with built-in libraries only and no network (`constraints.md` rows
1–4).

## What success looks like

The person can add, list, finish, reopen, rename, delete, tag and export or
import tasks, see what is overdue, and read totals, all from `ttc`. The list is
never left half written ("Every write is atomic"), a failure is one line on
stderr with a non-zero exit, and every command is covered by `node:test` tests
that pass in the CI `test` check (`constraints.md` rows 5–7).

## What this product is deliberately not

"CLI only, no UI" (requester's words): no graphical or full-screen interface.
No network, so no sync, accounts or sharing (`constraints.md` rows 3 and 8).
