# Engineering log

The engineering decision log for `ttc` (rortegalizardo/task-tracker-cli):
what was measured, what was decided and why, and which tickets came out of it.
Dated entries are append-only history, newest last; never rewrite or delete
one. The two register sections below are living and are updated in place.
Product truth lives under `product/`; this file holds engineering reasoning
only.

## NFR targets

| Target | Bar | Baseline | Status | Ticket |
| --- | --- | --- | --- | --- |
| `ttc add` whole-process time, 10,000 stored tasks | median of 5 runs (after 1 warm-up) under 500 ms in CI, Node 24, ubuntu-latest, stdout to /dev/null | about 75-79 ms locally (macOS arm64, Node 26.11.1, 2026-10-21); CI unknown | in flight (guard test) | RCDEV-834 |
| `ttc list` whole-process time, 10,000 stored tasks | same as above | about 60 ms locally (same setup); CI unknown | in flight (guard test) | RCDEV-834 |
| Robustness under random arguments and corrupted data | at least 10,000 generated cases per kind per run, seeded, seed printed on failure; invalid input gives a non-zero exit and one `ttc:` line, never a stack trace; a failed operation leaves `tasks.json` bytes unchanged; valid input behaves as today | 10,000 argument-list cases and 10,000 corrupted-data cases per run (`test/fuzz-args.test.js`, `test/fuzz-data.test.js`, in-process, plus 50 per file through a real process), seeded by `TTC_FUZZ_SEED`; about 45 s for the args file and 12-36 s for the data file locally (macOS arm64, Node 26.11.1, 2026-10-21, 6 green full runs) | met | RCDEV-833 |
| CI syntax check | CI fails on a syntax error in any source or test file, Node built-ins only | only files some test loads are parsed in CI | in flight | RCDEV-832 |

## Tech-debt register

| Item | Evidence | Status | Ticket |
| --- | --- | --- | --- |
| Output-stream errors print a Node stack trace | `ttc list --all \| head -c 10` on a 10,000-task list prints an unhandled `EPIPE` error with stack frames (2026-10-21); `bin/ttc.js` has no handler for stdout/stderr `error` events | deferred | none |
| JSON nested too deep to parse is reported as "not valid JSON" | a 200,000-deep nested array (valid JSON) gives `ttc: cannot read ...: not valid JSON` (2026-10-21); one line and exit 1, so it meets the error rule, but the reason is imprecise | deferred | none |

## 2026-10-21 — harden ttc: robustness, performance and CI syntax check

**Prompt:** Engineering ask (not product): harden ttc. Robustness: generated
tests (Node built-ins only) with a recorded random seed printed on failure,
running 10,000 cases of random argument lists and corrupted data files; valid
inputs behave exactly as today; invalid arguments or corrupted stored data give
a non-zero exit and a one-line error, never a stack trace; a failed operation
leaves the data file's bytes unchanged. Performance: with 10,000 stored tasks,
`ttc add` and `ttc list` each timed as the whole process (Node startup
included, output to /dev/null), 1 warm-up then 5 timed runs, median under
500 ms in CI (Node 24, ubuntu-latest), checked by a test. CI lint: CI fails on
a syntax error in any source or test file, Node built-ins only. No new
dependencies.

**Baseline found:** (main at 2578936)
- Code: 778 lines in `bin/` and `src/`, no dependencies, 333 `node:test` tests
  passing in about 6.3 s locally. CI is one `test` job (checkout, setup-node 24,
  `npm test`, 10-minute timeout) on pull requests. `npm test` is
  `node --test "test/**/*.test.js"`, so `test/fixtures/*.js` and any file no
  test loads are never parsed in CI.
- Robustness: `src/cli.js` `run()` catches every exception and prints one
  `ttc:` line, exit 1; stdout is buffered so nothing prints on failure.
  `writeList` validates, then writes atomically (temp file, fsync, rename,
  fsync folder), and commands check everything before writing. Manual probes
  (a 5 MB run of `[`, a 200,000-deep array, an extra `__proto__` task key) each
  gave one line and exit 1. No generated tests exist.
- Performance, measured locally only (macOS arm64, Node 26.11.1, 10,000 tasks,
  1.9 MB file, whole process, 6 runs): `list` about 60 ms, `add` about
  75-79 ms, bare `node -e 0` about 20 ms. No CI measurement exists.
- Constraints that bind (`product/project/constraints.md`): Node built-ins
  only (1), Node 24 (2), atomic writes (5), one-line errors with non-zero exit
  (6), `node:test` tests and the CI `test` check (7), every ticket names its
  repo (9). The ask restates 1, 5 and 6; it conflicts with none of them or
  with any accepted `PD-`.

**Requester confirmation:** not asked. The three accepted candidates are the
requester's three bullets, scoped one ticket each; the objective and every
acceptance bar are the requester's own (`escalation-policy` §2 B3 already
answered), and the split into tickets and their order is a delivery decision
(§3 route 3). Where the ask could be read two ways ("10,000 cases of random
argument lists and corrupted data files"), the ticket takes the reading that
meets both: at least 10,000 of each.

**Candidates considered:**
- **Accepted — CI syntax check** (RCDEV-832): `node --check` over every
  `.js`/`.cjs`/`.mjs` file in `bin/`, `src/`, `test/` (fixtures included),
  discovered at run time, as a CI step on pull requests. Small. No
  dependencies on other tickets.
- **Accepted — generated robustness tests** (RCDEV-833): a seeded PRNG in test
  code, at least 10,000 argument-list cases and 10,000 corrupted-data cases per
  run, in-process through `run()` with per-case temp `TTC_HOME` so the suite
  fits the CI timeout; checks one-line errors, no stack frames, unchanged file
  bytes on failure, and valid-input results against a test-owned oracle. Any
  defect found is fixed in `src/` in the same ticket. Medium. No dependencies
  on other tickets.
- **Accepted — performance guard test** (RCDEV-834): whole-process timing of
  `add` and `list` on a 10,000-task list, 1 warm-up plus 5 timed runs, median
  under 500 ms, run in CI isolated from other test files (`node --test` runs
  files concurrently). Small. Blocked by RCDEV-832 (both edit
  `.github/workflows/ci.yml` and `package.json` scripts) and by RCDEV-833 (its
  isolation must hold with the 20,000+ generated cases present).
- **Rejected — optimise `add`/`list`**: the local baseline (60-79 ms) is far
  under the 500 ms bar; there is nothing to optimise until a CI measurement
  says otherwise. RCDEV-834 reports the CI numbers on every PR.
- **Deferred — handle output-stream errors in `bin/ttc.js`**: `EPIPE` when
  piping to `head` prints a Node stack trace today. Outside the ask, which
  covers invalid arguments and corrupted stored data only. Would change if the
  requester extends "never a stack trace" to every failure.
- **Deferred — precise message for JSON too deep to parse**: already one line
  and exit 1, so it meets the bar; only the reason text is imprecise.

**Ticket dependencies (Linear "blocked by"):**
- RCDEV-832: none
- RCDEV-833: none
- RCDEV-834: blocked by RCDEV-832, RCDEV-833
