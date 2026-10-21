---
initiative: INIT-0001
type: technical-assessment
title: Technical assessment — ttc command-line task tracker
status: authoritative
revision: 1
owner_role: ROLE-planner
mode: PRODUCT-DISCOVERY
phase_at_assessment: SOLUTION_EXPLORATION
round: 1
assessed_on: 2026-10-20
created: 2026-10-20
updated: 2026-10-20
verdicts: ["A: feasible-with-constraints (multi-component)"]
constraints: [C1, C2, C3, C4, C5, C6, C7]
questions: []
updated_by_role: ROLE-planner
---

Mode: PRODUCT-DISCOVERY

# Technical assessment — INIT-0001

Initiative: INIT-0001 · Phase at assessment: SOLUTION_EXPLORATION ·
Assessed: 2026-10-20 · Round: 1 · Head: `7f0b2ac`
Evidence: [`capability-scan.md`](capability-scan.md), [`impact.md`](impact.md).
Binding inputs read: PD-0001, PD-0003 (PD-0002 superseded),
`project/constraints.md` rev 2, the raw spec, REQ-0001..REQ-0010 (draft, rev 2).

## Verdicts

| Option | Requirements served | Verdict | Complexity band | One-line basis |
| --- | --- | --- | --- | --- |
| A | REQ-0001..REQ-0010 | feasible-with-constraints | multi-component | Every behaviour in PD-0003 is buildable and testable with Node 24 built-ins on the existing CI job; one system, several new components and one new stored file format whose only consumer is `ttc` itself. Constraints C1–C7 bound what "atomic", "today" and "id" can mean and how the stories integrate |

## Answers to the points the PM raised

1. **Atomic write (PD-0003 item 13) and "a write stopped before it finishes"
   — testable with Node 24 built-ins only: yes.** Probed on Node 24.4.0: a
   test can make any filesystem step of a write fail in-process, or run `ttc`
   as a child process and end it abruptly at a chosen step, with nothing
   outside the runtime. What such a test proves is process-level atomicity
   (crash, kill, thrown error). It cannot prove survival of a power cut or OS
   crash; no CI test can (C2). The criteria say "the test simulates this", so
   they are consistent with what can be shown.
2. **Local-date "today" (item 6) — feasible and testable.** The runtime ships
   full time-zone data; `TZ=Pacific/Pago_Pago` and `TZ=Pacific/Kiritimati`
   resolve correctly (probed). The REQ-0007 / REQ-0010 time-zone pair
   criteria are what catch a UTC-instead-of-local bug, because the CI runner
   is on UTC (C3, R3).
3. **Stories buildable and verifiable independently in `depends_on` order —
   yes, with one ordering rule.** Each story's criteria use only commands from
   its own `depends_on` set. REQ-0003 and REQ-0009 write `tasks.json` directly
   in the layout REQ-0001 fixes, which is sound as long as that layout is fixed
   at REQ-0001. Help criteria assert "holds" rather than "exactly", so sibling
   stories merging in any order do not break each other. REQ-0004, 0005, 0006,
   0008 and 0009 share only REQ-0001..0003 and can be built in parallel, but
   they all touch the same shared parts (command list, usage text, argument
   rules), so they integrate one after another (C7). One gap: see P7.
4. **CI `test` job and `package.json` — fit for purpose, two gaps.** The job
   already runs `npm test` (`node --test`) on Node 24 for every pull request.
   It has no install step, which is consistent with zero dependencies. It does
   not run on `main`, and `main` is not branch-protected, so the "CI `test`
   check must pass" constraint is not enforced by GitHub (R6). `package.json`
   says `engines >=22` (aligning it is engineering's) and declares no `ttc`
   command (P5).

## Constraints

| # | Option | Constraint | permanent / initiative-local | Source | PD- candidate? |
| --- | --- | --- | --- | --- | --- |
| C1 | A | Runtime is Node 24 with built-in modules only and no network. The CI job has no install step, so any runtime or test dependency also fails CI. The built-in argument parser rejects single-dash arguments (`-1`, `-home`), so PD-0003 item 2 and REQ-0008 cannot rely on it as-is | permanent | constraints.md rows 1–3; scan rows "CI `test` check", "built-in argument parser" | No — already constraints 1–3 |
| C2 | A | "Atomic" can be guaranteed and tested at process level only: after a crash, kill or error at any step, `tasks.json` (and an export target) is whole-old or whole-new. Survival of a power cut or OS crash depends on the filesystem and cannot be verified in CI. Replacing the file whole means a symlinked `tasks.json` or export target is replaced by a regular file, and the old file's permissions are not kept | permanent | constraint 5; PD-0003 items 13–14; probe on Node 24.4.0 | Yes — fixes what constraint 5 means for every later initiative |
| C3 | A | "Today" is the local calendar date in the process's time zone; a due date is compared as a calendar date, never as an instant. Tests set the zone and, where needed, the clock from the test side only; no `ttc` option or environment variable may exist for it, because PD-0003 closes the set of user-visible behaviour. The same holds for simulated write interruptions | initiative-local | PD-0003 items 2, 6, 13; scan rows "time zone", "clock control", "fault injection" | No |
| C4 | A | Test files run at the same time in separate processes. Every test must use its own data folder, its own home folder and its own working folder, and must never read or write the real home folder of the person running the tests | permanent | scan row "Test runner" | No — engineering practice |
| C5 | A | Ids are exact only up to 9007199254740991 (2^53−1). Above that, two ids can compare equal, which breaks "never reused" (PD-0003 item 1). Id parsing and import checks need an upper bound | permanent | scan row "exact whole numbers" | Yes — the bound is user-visible; see P2 |
| C6 | A | Verification runtime is Node 24 on Linux with a UTC clock (CI). The default local runtime on this machine is Node 26; CI is the arbiter. `engines >=22` must be aligned to Node 24. Other operating systems are not verified | initiative-local | CI workflow; `package.json`; scan row "Local developer runtime" | No — the OS scope itself is P4 |
| C7 | A | REQ-0001 fixes the stored-file layout; later stories' tests write that layout directly, so changing it after REQ-0001 is a cross-story change. Stories after REQ-0003 can be built in parallel but merge one at a time, in `depends_on` order, because they share the command list, usage text and argument rules | initiative-local | REQ-0001..REQ-0010 `depends_on` and criteria | No — sequencing only |

## Architectural risks

| # | Option | Risk | What it threatens | What would resolve it |
| --- | --- | --- | --- | --- |
| R1 | A | A stopped-write test passes while the write is still not atomic, because the simulated interruption hits only one step of a multi-step write | Constraint 5; REQ-0001, 0002 and every writing story | The interruption is applied at every filesystem step a write takes, including folder creation; reviewed at delivery |
| R2 | A | Date-relative tests (`<yesterday>`, `<today>`, `<tomorrow>`, the Pago Pago / Kiritimati pair) compute the date in the test and again in `ttc`; a run that crosses midnight in that zone fails once | CI reliability of REQ-0007, REQ-0010 | Fix the clock from the test side, or accept a rare flake |
| R3 | A | A UTC-instead-of-local date bug, or a due date read as a UTC instant, passes every test that does not set `TZ`, because CI runs on UTC | PD-0003 item 6 | Keep the time-zone pair criteria in REQ-0007 and REQ-0010 through DECOMPOSITION |
| R4 | A | Parallel sibling stories conflict on the shared command list, usage text and argument rules | Delivery order of REQ-0004..0006, 0008, 0009 | C7: merge in `depends_on` order |
| R5 | A | Tests pass on the local Node 26 and fail on CI's Node 24, or the reverse | Constraint 7 per story | CI is the arbiter; Node 24.4.0 is installed locally for checks |
| R6 | A | `main` is not branch-protected and CI does not run on `main`, so a pull request can merge with a red `test` check | Constraint 7 | Ship step refuses red checks; the owner may also protect `main` (operational) |

## Security / data / compliance implications

| Option | Data class | Implication | Source row in impact.md |
| --- | --- | --- | --- |
| A | personal | `tasks.json` holds free text that can name people or private matters. It stays on the machine (no network), so no data-protection regime applies. Created with default permissions, it is readable by other accounts on a shared machine (P3) | "`tasks.json` on local disk" |
| A | personal | An export is a full copy at a path the user chooses; `ttc` no longer controls it after writing | "Export file at a user-chosen path" |
| A | personal | An import file may come from someone else. PD-0003 already requires full validation before any change. Titles are printed to the terminal as stored, so a title holding terminal control characters (for example escape sequences) from an imported file reaches the user's terminal (P1) | "Import file read from a user-chosen path", "Terminal output" |
| A | personal | A test run that is not isolated (C4) reads or overwrites the developer's real `~/.ttc/tasks.json` | "`tasks.json` on local disk" |

No financial or regulated data. No secrets, credentials or network traffic.

## Product assumptions that conflict with the platform

Each row needs a product answer the architect does not give. The
recommendation is advice to `ROLE-product-manager`; it decides nothing.

| # | Assumption (and where stated) | Platform fact | Class | Raised as |
| --- | --- | --- | --- | --- |
| P1 | "Spaces at both ends are removed … contains a line break … Any other text is kept as given" (PD-0003 item 3; REQ-0002, 0005, 0009) | The runtime knows several line-break characters (LF, CR, and Unicode line and paragraph separators) and its usual trimming removes tabs and line breaks too, so `Buy milk` followed by a line break could be trimmed and accepted instead of refused. Control characters other than line breaks pass through and are printed to the terminal | narrowing | Recommendation: trim only the space character; refuse a title holding LF, CR, U+0085, U+2028 or U+2029 anywhere, and any other control character; add one criterion each to REQ-0002 and REQ-0009 |
| P2 | Ids are "a positive whole number written in digits", next id always higher (PD-0003 items 1, 2, 14) | Exact only up to 9007199254740991 (C5). Leading zeros (`007`) are digits too | narrowing | Recommendation: an id above 9007199254740991 is `ttc: invalid task id: <arg>` and an import problem; `007` means task 7 and messages print `7` |
| P3 | `tasks.json` and the export file are "replaced, atomically" (PD-0003 items 13, 14) | Whole-file replace turns a symlink into a regular file and does not keep the old file's permissions (C2). New files get default permissions, readable by other local accounts | narrowing | Recommendation: accept the symlink behaviour as out of scope; create `tasks.json` readable by its owner only |
| P4 | "a `ttc` command-line task tracker" — no operating system named (raw spec) | CI verifies Linux only. macOS shares the same file semantics. Windows differs in file replacement and home-folder rules and is not verified | narrowing | Recommendation: supported systems are Linux and macOS; Windows is out of scope for INIT-0001 (add to the initiative's out-of-scope list) |
| P5 | "The user can run `ttc help`" (REQ-0001 outcome O1) | Nothing makes `ttc` runnable by name today: `package.json` declares no command and is `private`. npm, shipped with Node, can install a command from a local clone without publishing | narrowing | Recommendation: REQ-0001 gains a criterion that the package declares the `ttc` command and that it runs after installing from the repository clone; no publishing |
| P6 | "tasks.json unchanged" means the folder was not created either (REQ-0001 Behavior), and an interrupted write leaves the old list (item 13) | A write that is cut off after creating the data folder leaves that folder, and possibly a stray temporary file, even though `tasks.json` is correct. A write that fails cleanly (for example a full disk) can remove what it created | narrowing | Recommendation: "unchanged" applies to failures that `ttc` reports; after an interruption only `tasks.json` itself is guaranteed, and a leftover folder or temporary file is accepted |
| P7 | "A `tasks.json` is a valid task list exactly when it passes the checks in item 14" (REQ-0001 Behavior) | REQ-0001 must therefore enforce the title, tag, date and id rules before REQ-0002 exposes them, but no criterion in any story checks the read path with such a file (only `{` and `42`); a stored upper-case tag or duplicate id is unverified on read | narrowing | Recommendation: add read-path criteria to REQ-0001 (for example a stored duplicate id and a stored tag `HOME` each give `ttc: cannot read <path>: <reason>`) |

## Open questions raised

| Q- id | What it blocks |
| --- | --- |
| none | No `Q-` written, per the dispatch: P1–P7 are recommendations for the PM. None blocks the verdict |
