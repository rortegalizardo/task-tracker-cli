---
initiative: INIT-0001
type: technical-assessment
title: System impact map — ttc command-line task tracker
status: authoritative
revision: 1
owner_role: ROLE-planner
mode: PRODUCT-DISCOVERY
phase_at_assessment: SOLUTION_EXPLORATION
round: 1
assessed_on: 2026-10-20
created: 2026-10-20
updated: 2026-10-20
verdicts: []
constraints: []
questions: []
updated_by_role: ROLE-planner
---

Mode: PRODUCT-DISCOVERY

# System impact map — INIT-0001

Initiative: INIT-0001 · Mapped: 2026-10-20 · Options mapped: A
Evidence: `technical/capability-scan.md` (same date).

## Option A — the `ttc` command as the spec states it (REQ-0001..REQ-0010)

One system: the repository `rortegalizardo/task-tracker-cli`. Several
components inside it are created; none exists today.

| System / component | Current responsibility (source) | What this option requires of it |
| --- | --- | --- |
| Program entry and command dispatch | none — absent (scan) | Must run one of the ten command groups by name, print the usage, and turn every failure into one `ttc: <message>` line on stderr with exit code 1 |
| Argument rules | none — absent (scan) | Must apply PD-0003 item 2 the same way for every command, including single-dash arguments (`-1`, `-<t>`) as positionals |
| Stored list | none — absent (scan) | Must locate `$TTC_HOME/tasks.json` (else `~/.ttc`), treat a missing file as empty, refuse an invalid one without touching it, and leave the file whole-old or whole-new after any interruption |
| Data rules (title, tag, date, id, today) | none — absent (scan) | Must hold one definition of each rule, shared by input checks (`add`, `rename`, `tag`, `list --tag`) and file checks (reading `tasks.json`, `import`) |
| Export / import | none — absent (scan) | Must write a whole-list copy at a path relative to the current folder, atomically, and must check a whole file before replacing the list |
| Package manifest | `package.json`: test script, `engines >=22`, no dependencies | Must keep zero runtime dependencies; must align the runtime with Node 24; must make `ttc` runnable by name (see assessment P5) |
| Test suite | `test/placeholder.test.js` only | Must cover every criterion of every story with `node:test`, isolated per test from the user's real home folder |
| CI job `test` | runs `npm test` on Node 24, Linux, per pull request | Must pass on each story's pull request; no change required to the job itself |

| Dependency | Direction | Kind | Note |
| --- | --- | --- | --- |
| Node 24 runtime (filesystem, time zone data, test runner) | upstream | third-party | Sole runtime; built-ins only (constraints 1–2) |
| Local filesystem and OS | upstream | third-party | Atomic replace and home-folder rules come from the OS; CI verifies Linux only |
| GitHub Actions runner + setup-node | upstream | third-party | Linux, UTC clock; verification only, not runtime |
| The user's terminal and shell | downstream | human/operational | Receives every line `ttc` prints, including task titles |
| Files the user exports and later imports | downstream (export) / upstream (import) | human/operational | May come from another machine or person; untrusted on import |

| Data crossing a boundary | Class | Regime note |
| --- | --- | --- |
| `tasks.json` on local disk | personal | Free-text titles can hold personal details. Stays on the user's machine; no transfer, so no data-protection regime is triggered. Readable by other local users if created with default permissions |
| Export file at a user-chosen path | personal | Same content as `tasks.json`; leaves `ttc`'s control once written |
| Import file read from a user-chosen path | personal | Untrusted input; replaces the list only after full validation (PD-0003 item 14) |
| Terminal output | personal | Titles printed as stored; no regime |

## Not impacted

| System | Why a reader might expect it | Why it is not impacted |
| --- | --- | --- |
| Network, any remote service | Task apps often sync | Constraint 3: no network |
| npm registry / third-party packages | Typical CLI parsers and test tools | Constraint 1: built-ins only; CI has no install step |
| Design system, `DES-` records | Product surfaces usually have design | PD-0001 item 3: CLI only, no visual surface |
| Any other repository | — | Constraint 9: one repository |
