Verdict: coherent
Initiative: INIT-0001
Story set reviewed: REQ-0001, REQ-0002, REQ-0003, REQ-0004, REQ-0005, REQ-0006, REQ-0007, REQ-0008, REQ-0009, REQ-0010 (all `draft`, revision 4)
Authorising decision: PD-0005
Assessment round relied on: 1
Reviewed: 2026-10-20
Mode: PRODUCT-DISCOVERY
Check: story-set technical coherence, full pass, round 1 of 2

Evidence read: the ten REQ files, `initiative.md` rev 3, `product/state.md` (Options, Stories),
`product/solution-contract.md`, `technical/assessment.md`, `capability-scan.md` and `impact.md`
(round 1), PD-0003, PD-0004, PD-0005, `project/constraints.md` rev 2, `package.json`,
`.github/workflows/ci.yml`. Two probes on Node 24.4.0 (see the per-story table: REQ-0001, REQ-0009).

## Summary

- **Sequencing.** The `depends_on` graph has no cycle. It matches the Stories table in
  `product/state.md`, and it matches the direction in `impact.md`: one system, and every upstream
  (Node 24, the filesystem, the CI runner) already exists. No story needs a later story first.
- **Capabilities.** No story assumes a capability that `capability-scan.md` marks `absent`
  without a story that creates it. The `partial` rows (argument parser, exact whole numbers,
  local runtime) are carried as C1, C5 and C6.
- **Verdict drift.** None. The set is still option A of PD-0005. Everything added since the
  assessment read revision 2 comes from PD-0004, and PD-0004 only adopts P1–P7, which the
  assessment already covered. No work in the set was left unassessed. `regression-required`
  does not apply.
- **Open blocking defects: 2.**
  - D1: help criteria break when stories merge in an order C7 allows.
  - D2: no story checks that export writes atomically.

  Both can be fixed in decomposition, and neither fix changes what a user sees.

## Per-story checks

| REQ- id | Independently verifiable? | Sequencing note consistent? | Assumed capability | Result |
| --- | --- | --- | --- | --- |
| REQ-0001 | Yes. No command writes yet, so the storage criteria are checked by `node:test` against the stored list directly (Notes say so). One criterion cannot be seen through `ttc` yet (D3) | Yes. Frontier, `depends_on: [none]` | Argument parser `partial`: C1 carried. Exact whole numbers `partial`: C5 carried. Test-side fault injection: `exists`. Owner-only file modes: standard on Linux and macOS. Installing `ttc` by name from a local clone: `exists`. Probe: npm on Node 24.4.0 installed a local `private` package with `--global --prefix <tmp> --offline` and the command ran by name, with no network | D3 (non-blocking) |
| REQ-0002 | Yes. Criteria read `tasks.json` by meaning and use only `add` and `help` | Yes. `[REQ-0001]` | Test-side fault injection for a stopped `ttc add`, run as a child process: `exists`. C5 carried | D4 (non-blocking) |
| REQ-0003 | Yes at its own merge. Done tasks are written by the test in the REQ-0001 layout | Yes. `[REQ-0001, REQ-0002]` | None beyond REQ-0001 | D1 (its usage-line criterion stops holding once REQ-0007 merges), D4 |
| REQ-0004 | Yes | Yes. `[REQ-0001..0003]` | Argument parser `partial` (`-1` must be a positional argument): C1 carried | Pass |
| REQ-0005 | Yes, unless it merges after REQ-0007 (D1) | Yes. `[REQ-0001..0003]` | None beyond REQ-0001 | D1 |
| REQ-0006 | Yes, unless it merges after REQ-0007 (D1) | Yes. `[REQ-0001..0003]` | None beyond REQ-0001 | D1, D6 (non-blocking) |
| REQ-0007 | Yes. Uses `done` and `reopen` from REQ-0004, which it lists | Yes. `[REQ-0001..0004]` | Time-zone data: `exists`. Test-side clock and `TZ`: `exists`. Midnight flake R2 carried. The Pago Pago / Kiritimati pair catches a UTC-instead-of-local bug at every UTC hour on a UTC runner | Causes D1 |
| REQ-0008 | Yes, unless it merges after REQ-0007 (D1) | Yes. `[REQ-0001..0003]` | Argument parser `partial` (`-home` must be a positional argument): C1 carried | D1 |
| REQ-0009 | Yes, except that atomic export is not verified (D2), and unless it merges after REQ-0007 (D1) | Yes. `[REQ-0001..0003]` | Exact whole numbers `partial`. The criterion "next id is 9007199254740993 → refused" cannot pass with the default JSON read, because that read rounds the value to 9007199254740992, which is allowed. Probe: on Node 24.4.0 the built-in JSON parser gives a reviver each number's source text (`9007199254740993`), so built-ins are enough. No story change; this is an engineering note | D1, D2, D5, D6 |
| REQ-0010 | Yes | Yes. `[REQ-0001..0004, REQ-0007]` | Time zone and clock: `exists`. R2 carried | Pass |

## Defects

| # | REQ- id | Check failed | Blocking? | Disposition | Resolvable in decomposition? | Note |
| --- | --- | --- | --- | --- | --- | --- |
| D1 | REQ-0007, with REQ-0003, REQ-0005, REQ-0006, REQ-0008, REQ-0009 | Sequencing possibility / independence (rules 2–3) | Yes | open | Yes. A criteria rewording, no user-visible change | REQ-0007 replaces the `list` usage line. Under C7, REQ-0005, REQ-0006, REQ-0008 and REQ-0009 may merge after REQ-0007, and their help criterion then requires a line that no longer exists |
| D2 | REQ-0009 | Verdict constraint not verified (C2; PD-0004 item 3) | Yes | open | Yes. Add one criterion and C3, no user-visible change | No story checks that an export target is replaced atomically, so an export that writes in place passes every criterion |
| D3 | REQ-0001 | Independence (rule 2) | No | open | Yes. Reword or move the criterion | A "the program prints" outcome for a write, in a story where no command writes |
| D4 | REQ-0002, REQ-0003 | Constraint carriage (PD-0005: "Every story carries the constraints that bind it") | No | open | Yes. Edit the frontmatter and the constraints section | REQ-0002 lacks C3; REQ-0003 lacks C7 |
| D5 | REQ-0009 (and REQ-0001 read path) | Rule left undefined for a shared check | No | open | Yes, after a product answer | A title in a file with spaces at either end, or only spaces, has no rule. **Changes user-visible behaviour**; options below |
| D6 | REQ-0006, REQ-0009 | Cross-story contradiction | No | open | Yes. A note, or a product answer | REQ-0009 gives an id again after an import, against REQ-0006's "never reused". **User-visible**; options below |

### D1 — The `list` usage line replaced by REQ-0007 breaks help criteria under the merge order C7 allows

- **Story:** REQ-0007 causes it. REQ-0003, REQ-0005, REQ-0006, REQ-0008 and REQ-0009 are affected. **Blocking.**
- **Class:** sequencing impossibility / hidden prerequisite.
- **Exact text:**
  - REQ-0007 criterion: "`ttc help` → stdout holds the usage line `ttc list [--open|--done|--all|--overdue] [--tag <t>]` in place of the usage line `ttc list [--open|--done|--all] [--tag <t>]` of the list story it depends on".
  - REQ-0003 criterion: "`ttc help` → stdout holds the usage line `ttc list [--open|--done|--all] [--tag <t>]` as well as the usage lines of the stories it depends on".
  - REQ-0005, REQ-0006, REQ-0008, REQ-0009 criterion: "… as well as the usage lines of the stories it depends on, exit code 0". Each depends on REQ-0003, so this includes the old `list` line.
  - The Stories table and C7 let these four merge one at a time in any order relative to REQ-0007.
- **Why it blocks:** if REQ-0007 merges before any of the four, that story's own criterion cannot pass at its merge. Its test also breaks the suite. The assessment, round 1, answer 3, rested on help criteria asserting "holds" rather than "exactly", so that merge order did not matter. That basis no longer holds for the `list` line.
- **What would resolve it** (no user-visible change; recommend (a)):
  - (a) Word the dependents' help criterion as "holds a usage line for each command the stories it depends on add". Add to REQ-0007 that, from its merge on, its usage criterion replaces REQ-0003's `list`-line criterion, and that its delivery updates that test.
  - (b) Keep the wording. Add a sequencing note: REQ-0007 merges after REQ-0005, REQ-0006, REQ-0008 and REQ-0009. This changes delivery order only, and the REQ-0003 note from (a) is still needed.

### D2 — Atomic replacement of an export target is never verified

- **Story:** REQ-0009. **Blocking.**
- **Class:** verification gap against a constraint of the verdict (C2), stated as tested in PD-0004 item 3.
- **Exact text:**
  - REQ-0009 Behavior: "An existing file is replaced, atomically (item 13; `PD-0004` item 3)."
  - PD-0004 item 3: "`tasks.json`, or an export target, then holds the whole old content or the whole new content".
  - REQ-0009 has no stopped-write criterion, and its `constraints:` omit C3.
- **Why it blocks:** the symlink criterion is also met by deleting the target and then writing it in place. So an export that is not atomic passes every criterion in the set, against `project/constraints.md` row 5 and the C2 the verdict was given on.
- **What would resolve it** (no user-visible change):
  - Add a criterion in the form REQ-0002 already uses: "`ttc export backup.json` whose write is stopped before it finishes (the test simulates this) while `backup.json` holds the text `old` → `backup.json` still holds exactly `old`".
  - Optionally add the case where no target existed before: it still does not exist.
  - Add C3 to REQ-0009's constraints.

### D3 — A REQ-0001 criterion asks for program output from a write that no command makes yet

- **Story:** REQ-0001. Not blocking.
- **Class:** independence / verifiability wording.
- **Exact text:** "`TTC_HOME` names an existing regular file, not a folder → a write fails with a message that the program prints as one line `ttc: <message>` on stderr with exit code 1, and that file has the same bytes as before".
- **Why it is not blocking:** a test can check the store's failure and the entry point's one-line form separately. The end-to-end path first exists with REQ-0002, which has no such criterion.
- **What would resolve it** (no user-visible change):
  - In REQ-0001, state the store-level outcome: the write fails with a non-empty message and the file keeps its bytes.
  - Add the end-to-end case to REQ-0002: `ttc add 'x'` with `TTC_HOME` naming a regular file → one `ttc: ` line on stderr, exit code 1, and the file unchanged.

### D4 — Constraint lists incomplete

- **Story:** REQ-0002, REQ-0003. Not blocking.
- **Class:** constraint carriage.
- **Exact text:**
  - REQ-0002 `constraints:` lists C1, C2, C4, C5 and C6, while its criterion reads "`ttc add 'x'` whose write is stopped before it finishes (the test simulates this)". C3 is the constraint that forbids a `ttc` option or environment variable for this.
  - REQ-0003 `constraints:` lists C1, C4 and C6, while its Notes say "The test writes them into `tasks.json` directly, in the layout the program uses". That is C7.
- **Why it is not blocking:** REQ-0001 already binds the whole program to C3 and C7.
- **What would resolve it:** add C3 to REQ-0002, and C7 to REQ-0003.

### D5 — No rule for spaces at the ends of a title in an import file or in `tasks.json`

- **Story:** REQ-0009, and REQ-0001's read path. Not blocking for coherence. It is a definition gap for the PM.
- **Class:** shared rule left undefined. **Changes user-visible behaviour.**
- **Exact text:**
  - REQ-0009: "every title is one non-empty line, with no control character".
  - REQ-0001: "Reading `tasks.json` applies every check that `import` applies".
  - The space-trimming rule (PD-0003 item 3, PD-0004 item 1) is stated only for a title typed as an argument.
- **The gap:** whether a file title `   ` (only spaces) or ` x ` is valid, and whether it is stored as written or trimmed. Engineering would otherwise choose. Any of the options below is buildable, and a file `ttc` wrote passes under each.
- **Options:**
  - (a) **Recommended.** A file title must already be in stored form: not empty, and no space at either end. Otherwise it is an import problem, and the file is unreadable on read. This mirrors PD-0003's rule for tags in a file.
  - (b) Accept the title as written when it has at least one non-space character, and refuse a title of only spaces.
  - (c) Trim on import. PD-0003 rejected import changing data for tags, so this would conflict with that precedent.

  PD-0003 and PD-0004 are accepted and cannot be rewritten, so the answer needs a new decision record.

### D6 — Import gives an id again, against "never reused"

- **Story:** REQ-0006, REQ-0009. Not blocking.
- **Class:** cross-story contradiction inside one accepted decision (PD-0003 items 1 and 14). **User-visible.**
- **Exact text:**
  - REQ-0006: "After a delete, the next task still gets a higher number than any task ever created."
  - PD-0003 item 1: "the next task always gets a higher number than any task ever created".
  - REQ-0009 criterion: "… `ttc add 'Four'` prints `Added task 4` … a further `ttc add 'Four again'` prints `Added task 4`".
- **Why it is not blocking:** REQ-0009 as written is buildable. Honouring item 1 across an import would mean reading the current `tasks.json`, which PD-0003 item 13 forbids and which fails when the list is damaged.
- **Options:**
  - (a) **Recommended.** No change to what is built. Say in REQ-0006 and REQ-0009 that "never reused" holds until an import: import restores the file's next id, so ids given after that export can be given again.
  - (b) Import never lowers the next id. This changes behaviour, needs import to read `tasks.json` against PD-0003 item 13, and fails on a damaged list. Not recommended.

## Questions raised

| Q- id | What it blocks |
| --- | --- |
| none | This dispatch limits writes to this file. D5 and D6 need a product answer from `ROLE-product-manager`, who records it as a `PD-` (under `PD-0001` item 1) or a `Q-`. Neither blocks the verdict. |

## Round 2 (delta re-check, terminal)

Reviewed: 2026-10-20
Mode: PRODUCT-DISCOVERY
Check: story-set technical coherence, delta re-check, round 2 of 2. Terminal: no round 3 runs against this set (rule 10).
Story set: REQ-0001 to REQ-0010, all revision 5. Authorising decision: PD-0005, with PD-0006 (adds to PD-0003 and PD-0004; changes no rule either states).
Assessment round relied on: 1. Verdict drift: none (see D5 and D6 below; neither adds work the assessment never covered).
Evidence: `git diff 23db67b f007ec9` over `requirements/`, PD-0006, `impact.md`, `capability-scan.md`, the round 1 defect text.
Scope: D1 to D6 and the repair edits only. Round 1 `carried-accepted` rows: none existed. The rest of the set is not re-derived.

**Round 2 verdict: `coherent`.** Zero open blocking defects. One new non-blocking observation (N1).

### Defects

| # | REQ- id | Check failed | Blocking? | Disposition | Resolvable in decomposition? | Note |
| --- | --- | --- | --- | --- | --- | --- |
| D1 | REQ-0002 to REQ-0010, REQ-0003, REQ-0007 | Sequencing possibility / independence (rules 2-3) | Yes | fixed | n/a | Every dependent's help criterion now asks for "a usage line for each command that the stories it depends on add", so it holds for either `list` line. REQ-0003 and REQ-0007 each carry the note that REQ-0007's usage criterion replaces REQ-0003's `list`-line criterion from REQ-0007's merge on, and that REQ-0007's delivery updates that test. No order C7 allows breaks a criterion. REQ-0007 depends on REQ-0001 to REQ-0004 only, so the stories that follow it in its own criterion are already merged. Not re-raised: REQ-0003's literal `list` line criterion still fails after REQ-0007, but the note makes that a stated, owned update, not a hidden prerequisite |
| D2 | REQ-0009 | Verdict constraint not verified (C2; PD-0004 item 3) | Yes | fixed | n/a | Two stopped-export criteria: target holding `old` stays exactly `old`; no prior target stays absent. C3 added to `constraints:` and to the constraints section (test-side simulation only, no `ttc` option or environment variable). Matches the form REQ-0002 uses. An in-place writer now fails the first criterion |
| D3 | REQ-0001, REQ-0002 | Independence (rule 2) | No | fixed | n/a | REQ-0001 now states the store-level outcome only (non-empty message, file keeps its bytes). REQ-0002 gains the end-to-end case (one `ttc: ` line on stderr, empty stdout, exit 1, file unchanged), which first becomes possible with `add` |
| D4 | REQ-0002, REQ-0003 | Constraint carriage (PD-0005) | No | fixed | n/a | C3 in REQ-0002 `constraints:` and constraints section; C7 in REQ-0003 `constraints:` and constraints section |
| D5 | REQ-0001, REQ-0009 | Rule left undefined for a shared check | No | fixed | n/a | PD-0006 item 1 (option (a), as recommended): a file title must already be in stored form, import never changes it. REQ-0009 states the rule and tests a leading space, a trailing space and an all-space title. REQ-0001's read-path Behavior states it; see N1 for its criterion. Buildable with built-ins only; no new capability or system |
| D6 | REQ-0006, REQ-0009 | Cross-story contradiction | No | fixed | n/a | PD-0006 item 2 (option (a), as recommended): "never reused" holds within one list's history; an import restores the file's next id. Both stories say so and cite PD-0006. REQ-0009 still does not read the current `tasks.json` (PD-0003 item 13), so no new dependency or capability |
| N1 | REQ-0001 | Verification gap, read path (rule 2) | No | open | Yes, optional | New in round 2, introduced by the D5 repair. The REQ-0001 Behavior bars a space at either end of a title on read, but its criterion list adds only "a title has a space at its start". The trailing-space and all-space cases are tested on the import path in REQ-0009, not on the read path. It does not change what gets built: the Behavior sentence states the rule and the criterion is a representative case. The PM may add the two cases or leave it |

### Repair edits checked for new defects

- **Help wording (REQ-0002 to REQ-0010).** No new hidden prerequisite. REQ-0001 owns `help`, and the wording asks only for commands that existing dependencies add. No capability assumed.
- **REQ-0003 / REQ-0007 notes.** Consistent with each other and with C7. The `depends_on` graph is unchanged and acyclic. No edge was added or removed in the diff.
- **REQ-0009 stopped-export criteria and C3.** Simulation is test-side from a child process, the same capability round 1 marked `exists` for REQ-0002. No edge touched.
- **REQ-0002 end-to-end criterion.** Needs only `add` and the store from REQ-0001, its stated dependency. Does not touch other stories.
- **PD-0006 effects.** The set stays inside option A of PD-0005. PD-0006 adds a title check on read and import, and no id lookup on import, both inside the assessed built-in JSON read and whole-file replace. No `regression-required` condition.

### Questions raised

| Q- id | What it blocks |
| --- | --- |
| none | Nothing. N1 is optional for the PM. |

Terminal round: no round 3 will run against this set. No REQ-, state.md, index or decision was edited by this check.
