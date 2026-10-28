---
id: INIT-0004
type: initiative
title: Finished tasks are cleaned out of the list in one short command
status: draft
revision: 1
owner_role: ROLE-product-manager
created: 2026-10-28
updated: 2026-10-28
capabilities: [CAP-0001]
requirements: []
tickets: []
decisions: []
---

# INIT-0004 — Finished tasks are cleaned out of the list in one short command

> **Draft (INTAKE).** Problem only. PRODUCT_DEFINITION fills in the outcome,
> scope and out-of-scope sections.

## Outcome

_Written at PRODUCT_DEFINITION._

## Why now

The requester asked for it on 2026-10-28
(`product/sources/2026-10-28-requester-request.md`). Today a finished task can
only be removed one at a time with `ttc delete <id>`; INIT-0001 left
"Deleting several tasks in one command" out of `REQ-0006` because its usage
line takes one id. That was a story boundary, not a rejected decision: no
`PD-` rejects removing several tasks at once.

## Scope

_Written at PRODUCT_DEFINITION._

## Requirements

_None yet._

## Capabilities affected

- `CAP-0001` — A person tracks their tasks locally from the ttc command line.

## Open questions

None.

## Scope log

| Date | Revision | Change | Reason |
| --- | --- | --- | --- |
| 2026-10-28 | 1 | Created at INTAKE | Triage verdict `new-initiative` |
