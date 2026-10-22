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
| `ttc add` whole-process time, 10,000 stored tasks | median of 5 runs (after 1 warm-up) under 500 ms in CI, Node 24, ubuntu-latest, stdout to /dev/null | about 75-79 ms locally (macOS arm64, Node 26.11.1, 2026-10-21); CI unknown | guard in place (RCDEV-834 Done, 2026-10-22) | RCDEV-834 |
| `ttc list` whole-process time, 10,000 stored tasks | same as above | about 60 ms locally (same setup); CI unknown | guard in place (RCDEV-834 Done, 2026-10-22) | RCDEV-834 |
| Robustness under random arguments and corrupted data | at least 10,000 generated cases per kind per run, seeded, seed printed on failure; invalid input gives a non-zero exit and one `ttc:` line, never a stack trace; a failed operation leaves `tasks.json` bytes unchanged; valid input behaves as today | 10,000 argument-list cases and 10,000 corrupted-data cases per run (`test/fuzz-args.test.js`, `test/fuzz-data.test.js`, in-process, plus 50 per file through a real process), seeded by `TTC_FUZZ_SEED`; about 45 s for the args file and 12-36 s for the data file locally (macOS arm64, Node 26.11.1, 2026-10-21, 6 green full runs) | met | RCDEV-833 |
| CI syntax check | CI fails on a syntax error in any source or test file, Node built-ins only | only files some test loads are parsed in CI | met (RCDEV-832 Done, 2026-10-22) | RCDEV-832 |
| Concurrent changing commands lose no change | 20 `ttc add` started at once on one `TTC_HOME` keep 20 of 20 tasks, ids 1-20, repeated 5 times per CI run; a lock held by a live process past 10 s gives one `ttc:` line and exit 1 with the file unchanged; a lock left by a killed process blocks nothing | 1, 2 and 2 of 20 tasks kept in 3 runs, every process exit 0 (macOS arm64, Node 26.11.1, `main` cc20f93, 2026-10-22); no lock exists | met (RCDEV-835 Done, 2026-10-22) | RCDEV-835 |
| Killed writes leave no leftovers; first write durable | after a killed write, the next changing command leaves no ttc temp file in `TTC_HOME`; creating `TTC_HOME` fsyncs the parent of each folder created | 4 killed writes left 4 `.tasks.json.<pid>.<hex>.tmp` files, still there after the next `ttc add` (2026-10-22); parent of a new data folder never fsynced | met (RCDEV-836 Done, 2026-10-22) | RCDEV-836 |
| Versioned data file with automatic migration | every write and export is version 2 (`"version": 2` first key); version 1 (no key) works as today and is rewritten as version 2 by the next changing command; a newer version gives one `ttc: cannot read` line, exit 1, bytes unchanged | no version marker; unknown keys rejected (`validateList`), so a future layout change would make every existing file unreadable | met (RCDEV-837 Done, 2026-10-22); RCDEV-841 adds version 3 | RCDEV-837 |
| Exit codes consistent and documented | 0 on success, 1 on every failure on every path (output-stream errors and exceptions outside `run()` included), never a stack trace; README "Exit codes" section; `ttc help` unchanged | handled failures exit 1 with one line; EPIPE prints a stack trace; nothing documented (2026-10-22) | met (RCDEV-838 Done, 2026-10-22); RCDEV-839, RCDEV-840 and RCDEV-841 keep it for their new failures | RCDEV-838 |
| Filtered `ttc list` whole-process time, 10,000 stored tasks | `ttc list --all --search <word> --due-from <d> --due-to <d>`: same bar as plain `list` (median of 5 under 500 ms in CI) | unknown, the filters do not exist yet; plain `list` about 60 ms locally (2026-10-21) | in flight | RCDEV-839 |

## Tech-debt register

| Item | Evidence | Status | Ticket |
| --- | --- | --- | --- |
| Output-stream errors print a Node stack trace | `ttc list --all \| head -c 10` on a 10,000-task list prints an unhandled `EPIPE` error with stack frames (2026-10-21); `bin/ttc.js` has no handler for stdout/stderr `error` events; reconfirmed on `main` cc20f93 (2026-10-22) | fixed (RCDEV-838 Done, 2026-10-22) | RCDEV-838 |
| JSON nested too deep to parse is reported as "not valid JSON" | a 200,000-deep nested array (valid JSON) gives `ttc: cannot read ...: not valid JSON` (2026-10-21); one line and exit 1, so it meets the error rule, but the reason is imprecise | deferred | none |
| Leftover temp files from killed writes are never removed | each killed write leaves a `.tasks.json.<pid>.<hex>.tmp` up to the list size (about 1.9 MB at 10,000 tasks) in `TTC_HOME`; 4 of them survived the next `ttc add` (2026-10-22) | fixed (RCDEV-836 Done, 2026-10-22) | RCDEV-836 |
| Lock cannot detect process-id reuse | the planned lock (RCDEV-835) treats a holder whose process id is alive as live; if a dead holder's id is reused by an unrelated process, the next command waits the full 10 s and fails once; Node built-ins give no portable process start time | deferred (known limit) | none |
| Temp files next to an export target are not swept | a killed `ttc export` can leave `.<name>.<pid>.<hex>.tmp` in the user's chosen folder; the target itself stays whole | deferred | none |
| CSV export writes cell values as stored, with no formula escaping | a title or note starting with `=`, `+`, `-` or `@` may run as a formula when the CSV is opened in a spreadsheet; titles can come from someone else's import file; escaping would change the data, so RCDEV-840 writes values verbatim and the README warns | deferred (known limit) | none |

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

## 2026-10-22 — make ttc's storage reliable: atomic writes, locking, versioned format, exit codes

**Prompt:** Engineering ask (not product): make ttc's storage reliable:
crash-safe atomic writes, safe concurrent invocations (file locking), a
versioned data-file schema with automatic migration of older files, and
consistent documented exit codes across all commands. No new runtime
dependencies.

**Baseline found:** (main at cc20f93; macOS arm64, Node 26.11.1)
- Atomic writes: already in place. `replaceFile` (`src/storage.js`) writes a
  temp file, fsyncs it, renames it over `tasks.json`, and fsyncs the folder;
  `test/interrupted-write.test.js` kills a write at 5 steps and the old list
  survives whole. Gaps: every killed write leaves a
  `.tasks.json.<pid>.<hex>.tmp` that is never removed (4 kills left 4 files,
  still there after the next `ttc add`); when a write creates `TTC_HOME`, the
  new folder's parent is never fsynced.
- Concurrency: no lock. 20 `ttc add` started at once on one `TTC_HOME`, 3
  runs, kept 1, 2 and 2 tasks; all 20 processes printed `Added task N` and
  exited 0 every time. PD-0003 lists "No concurrent writes" as an accepted
  cost, not a rule.
- Format: `{nextId, tasks}`, no version marker; `validateList` rejects any
  unknown key. PD-0003 item 13 makes the layout engineering's choice and item
  14 makes export use the same format, so versioning needs no product decision.
- Exit codes: every failure `run()` catches gives one `ttc:` line and exit 1
  (PD-0003 item 11), checked with `ttc done abc`, `ttc done 99999`,
  `ttc frob`. `ttc list --all | head -c 10` on 10,000 tasks prints Node's
  unhandled `EPIPE` stack trace and exits 1. Nothing documents the codes.
- Linear: no existing issue in Task Tracker CLI covers any of the four.

**Requester confirmation:** asked once (Q1, triage B3 objective,
`~/Factory/Artifacts/projects/TTC/tickets/ENG-0002/requester-questions.md`):
keep 0 / 1 (A), or one code per failure kind (B), which would have replaced
PD-0003 item 11. The requester answered, verbatim, "A, accept 1–4": keep 0 on
success and 1 on every failure, made consistent on every path and documented
in the README, and all four candidates accepted as proposed.

**Candidates considered:**
- **Accepted — lock the data file for changing commands** (RCDEV-835): an
  exclusive lock file next to `tasks.json` holding the holder's process id,
  taken before the read and released after the write by `add`, `done`,
  `reopen`, `rename`, `delete`, `tag`, `import`; wait up to 10 s, then one
  line and exit 1; stale locks (dead holder, empty file) recovered; readers
  take no lock. Medium. No dependencies.
- **Accepted — close the crash-safety gaps** (RCDEV-836): remove leftover ttc
  temp files of dead writers under the lock, fsync the parent of each folder a
  write creates, add a kill step after the rename. Small. Blocked by
  RCDEV-835 (removal is only safe under the lock).
- **Accepted — versioned data file with automatic migration** (RCDEV-837):
  version 2 = today's layout plus a first `"version": 2` key; no key = version
  1; ordered per-version migration steps; read-only commands migrate in memory
  and never write; the next changing command writes version 2 under the lock;
  a newer version fails as one `cannot read` line with bytes unchanged. Medium.
  Blocked by RCDEV-835 (the migrating write runs in the locked cycle; both
  rework the storage read/write path).
- **Accepted — exit codes consistent and documented** (RCDEV-838): 0 / 1 on
  every path, including output-stream errors and exceptions outside `run()`;
  README "Exit codes" section; `ttc help` unchanged; one table-driven
  real-process test over all commands. Small to medium. Blocked by RCDEV-835
  and RCDEV-837 (their new failures must exist to be covered). It carries one
  product point for the orchestrator's engineering -> product channel: a
  changing command whose confirmation line fails to print has already saved
  its change, so exit 1 there is a failure that changed data, against PD-0003
  item 11's "changes no stored data".
- **Rejected — one exit code per failure kind:** the requester chose to keep
  0 / 1 (Q1 answer A); it would also have needed a new decision replacing
  PD-0003 item 11.
- **Rejected — rewrite the atomic-write primitive:** the temp, fsync, rename,
  folder-fsync sequence is the platform's standard durable replace and is
  kill-tested already; only the two gaps in RCDEV-836 remain.
- **Deferred — detect process-id reuse in the lock:** Node built-ins give no
  portable process start time; the cost is one 10 s wait and failure in a rare
  case. Would change if a user reports it.
- **Deferred — sweep temp files next to an export target:** the target stays
  whole; ttc does not clean folders the user chose.

**Ticket dependencies (Linear "blocked by"):**
- RCDEV-835: none
- RCDEV-836: blocked by RCDEV-835
- RCDEV-837: blocked by RCDEV-835
- RCDEV-838: blocked by RCDEV-835, RCDEV-837

## 2026-10-22 — task search and export: list filters, filtered JSON/CSV export, notes

**Prompt:** Add task search and export to ttc: `ttc list` filters by status,
tag, and due-date range, plus free-text search over titles and notes; a new
`ttc export` command writes the filtered tasks as JSON or CSV to stdout or a
file; every new flag documented in README and --help. Consistent with existing
exit codes. No new runtime dependencies.

**Baseline found:** (main at 70ddae0)
- `ttc list` already filters by status (`--open|--done|--all|--overdue`, one
  at a time, default `--open`) and by one `--tag` (PD-0003 item 7); the filter
  logic is inline in `src/commands/list.js`. No due-date range, no search.
- A task holds id, title, status, due and tags only (format version 2,
  `src/storage.js`). There is no notes field, so "search over notes" had
  nothing to search.
- `ttc export <file>` already exists: whole list, `tasks.json` format, written
  atomically, `Exported <n> tasks to <file>`; it is the backup `ttc import`
  restores (PD-0003 items 10, 14). No filters, no CSV, no stdout.
- `ttc help` / `ttc --help` print one usage line per command (PD-0003 item
  12); the README documents install, tests and exit codes only.
- Exit codes: 0 / 1 on every path, documented in the README (RCDEV-838).
- The generated robustness tests carry a model of every command and its usage
  line (`test/support/ttc-model.js`, `fuzz-gen.js`), so every new option must
  be added there. The perf guard times plain `add` and `list` only.
- Linear: no existing issue in Task Tracker CLI covers search, CSV or notes.
- Constraints that bind (`product/project/constraints.md`): built-ins only
  (1), atomic writes (5), one-line errors with non-zero exit (6), `node:test`
  tests and CI (7), every ticket names its repo (9).

**Requester confirmation:** asked once (Q1, triage B3 objective,
`~/Factory/Artifacts/projects/TTC/tickets/ENG-0003/requester-questions.md`):
accept 1 and 2 with search over titles only (A), or also add notes (B). The
requester answered, verbatim, "B: accept 1, 2 and 3".

**Candidates considered:**
- **Accepted — list date-range filter and title search** (RCDEV-839):
  `--due-from`, `--due-to` (inclusive, undated tasks drop out),
  `--search <text>` (case-insensitive literal substring), all AND-combined,
  in one shared filter module; usage line, README section, robustness model,
  exit-code rows, and a filtered case in the perf guard. Medium. No
  dependencies.
- **Accepted — filtered JSON/CSV export to stdout or a file** (RCDEV-840):
  extends the existing `ttc export` rather than adding a command; same
  filters with default `--all`; `--format json|csv`; no `<file>` means
  stdout, data only. JSON stays the `tasks.json` format, byte-identical with
  no filter, so a filtered export is still importable and replaces the whole
  list (README caution). CSV per RFC 4180, header `id,title,status,due,tags`.
  Medium. Blocked by RCDEV-839.
- **Accepted — task notes, searched with titles** (RCDEV-841): one one-line
  note per task, format version 3 (adds `"note"`, v2 -> v3 migration),
  `ttc note <id> ["<text>" | --clear]`, `ttc add --note`, import/export and a
  CSV `note` column, `--search` over title or note; `list` lines unchanged.
  Medium-large. Blocked by RCDEV-839 and RCDEV-840. The requester's accepted
  set listed only RCDEV-839 as its blocker; RCDEV-840 was added as a
  sequencing call (escalation-policy §3 route 3) because this ticket adds a
  column to the CSV that RCDEV-840 creates, and both edit `export.js`, the
  README and the robustness model.
- **Rejected — replace `ttc export` with a new command:** it would break the
  whole-list backup that `ttc import` restores (PD-0003 item 14); extending
  the command delivers everything asked.
- **Rejected — per-command `--help` with flag descriptions:** `ttc --help`
  already lists every command's flags in its usage lines; the README carries
  their meaning. Would change if the requester wants descriptions in the
  terminal.
- **Deferred — CSV formula escaping:** values are written as stored and the
  README warns; escaping would change exported data. Tech-debt register row.

Product record: the three tickets extend PD-0003 items 7, 8, 10, 12, 13 and
14 (new options, usage lines, messages, a stored field). The requester
accepted them at intake; each ticket asks the product manager to record the
amendment through the engineering -> product channel, and none waits on it.

**Ticket dependencies (Linear "blocked by"):**
- RCDEV-839: none
- RCDEV-840: blocked by RCDEV-839
- RCDEV-841: blocked by RCDEV-839, RCDEV-840
