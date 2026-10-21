# Raw request — INIT-0001

Received 2026-10-20 in chat, relayed verbatim by the parent session that
launched this product-manager session. Committed unchanged before any
synthesis; every product artifact of INIT-0001 cites this file and never
replaces it. Only the `Spec` and `Requester instructions` blocks are the
requester's words; the storage handoff block is the parent session's
verification and is omitted.

## Requester instructions (verbatim)

- The spec is complete. Decide everything inside it yourself (record decisions as PD- where your process requires). Only escalate to the requester if the spec contradicts itself. No design work: CLI only, no UI — skip all design roles/DES records; record that the initiative has no user-facing visual surface.
- Every ticket must name its repo: rortegalizardo/task-tracker-cli (~/Desktop/Projects/task-tracker-cli).
- Commit product/ changes per your commit discipline; push to origin (approved commits on repos with a remote get pushed).

## Spec (verbatim from requester)

Product: a `ttc` command-line task tracker. Node 24, built-in libraries only, no network.
Data lives in one JSON file at $TTC_HOME/tasks.json (default ~/.ttc). Every write is atomic.
Errors print one line to stderr and exit non-zero. Every command has node:test tests; the CI `test` check must pass.

Stories (one each, in this dependency order):
1. Storage + CLI skeleton + `ttc help`.
2. `ttc add "<title>" [--due YYYY-MM-DD] [--tag <t>]...`
3. `ttc list [--open|--done|--all] [--tag <t>]`
4. `ttc done <id>` / `ttc reopen <id>`
5. `ttc rename <id> "<title>"`
6. `ttc delete <id>`
7. Due dates: `list` marks overdue tasks; `ttc list --overdue`.
8. `ttc tag <id> +<t> | -<t>`
9. `ttc export <file>` / `ttc import <file>`: validate first, all or nothing.
10. `ttc stats`: totals for open, done, overdue.

Exactly 10 stories, one per item, depends_on matching this order (each story depends on what it actually needs; at minimum story 1 precedes all).

## Expected end state (verbatim from the task)

Take it from BOOTSTRAP/INTAKE through HANDOFF in this session: Linear tickets created plus the delivery manifest compiled. Stop at HANDOFF (no engineering dispatch, no batch fan-out).
