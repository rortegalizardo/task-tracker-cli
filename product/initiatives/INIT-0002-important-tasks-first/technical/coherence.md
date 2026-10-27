Verdict: coherent
Initiative: INIT-0002
Story set reviewed: REQ-0011 (revision 2, draft)
Authorising decision: PD-0009 (with PD-0010)
Assessment round relied on: 1
Reviewed: 2026-10-26
Mode: PRODUCT-DISCOVERY — story-set-technical-coherence, full pass, round 1 of 2

Evidence: `technical/assessment.md`, `impact.md`, `capability-scan.md` (round 1,
code at `9731f42`); REQ-0011 rev 2; PD-0009; PD-0010; `initiative.md`; the raw
request. Spot-checked at repo head `b16e0dc`: `list` still sorts by id only
after filtering (`src/commands/list.js:30`); the `done`/`reopen` builder still
gives the no-op-without-write pattern (`src/commands/status.js`); the format
registry still holds v1–v3; `--search` matches title and note, case-insensitive
(`src/filter.js:54-69`); extra positionals fail as `unexpected argument`
(`src/args.js:20-21`); export/import/stats/note/CSV messages match the exact
text the ACs assert. The capability scan still holds at this head.

## Per-story checks
| REQ- id | Independently verifiable? | Sequencing note consistent? | Assumed capability | Result |
| --- | --- | --- | --- | --- |
| REQ-0011 | Yes. One story; every AC runs against this story's build alone. | Yes. `depends_on: [none]`; it builds only on shipped commands. `impact.md` has no upstream change pending: v1–3 files are the input, older ttc installs are the downstream. | Mark: `absent`, and this story creates it. List order: `partial` (id only), and this story adds the second key. Value-less `add` option: the parser has it (`exists`). Format registry, changing-command pattern, lock, atomic write, one parse path, serializer, help registry: `exists`. The oracle hard-codes v1–3: covered by C6. Nothing is assumed that the story does not create. | pass |

Verdict drift (rule 5): none. The story is option A as PD-0009 fixes it: one
mark, two commands plus `add --important`, important-first order, `!important`
token, format 4 one-way (PD-0010), JSON export/import carry the mark, CSV,
stats and note unchanged. No AC implies work outside the Option A rows of
`impact.md`. No AC touches anything listed as out of scope in `initiative.md`.

Constraints (scope-excess check): none flagged. PD-0009 item 12 makes C1–C7
binding on the story, so the story has to carry them.

## Defects
| # | REQ- id | Check failed | Blocking? | Disposition | Resolvable in decomposition? | Note |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | REQ-0011 (AC-6) | scope-excess | no | open | yes | Drop clause "`ttc list --done --search delta` prints exactly `No tasks.`". It tests only an empty result, which is unchanged behaviour (PD-0009 item 4: "`No tasks.` is unchanged") and is already covered by the existing `list` tests. No mark is in play. |
| 2 | REQ-0011 (AC-7) | scope-excess | no | open | yes | Drop clause "the same bytes ttc at head `3dbf454` prints for the same commands". The exact six lines are already stated. The clause adds a second oracle: an old build to run side by side. The platform has no such oracle; the test-owned model is the oracle (C6). |
| 3 | REQ-0011 (AC-8) | scope-excess | no | open | yes | Drop clause "`ttc list --all` after `ttc done 1` prints `#1 [x] Buy milk !important` first". AC-5 already shows a done important task's line and position (`#5 [x] Echo !important` in `--done` and `--all`). The final list in AC-8 already proves the mark survived `done`. |
| 4 | REQ-0011 (AC-11) | scope-excess | no | open | yes | Keep the v3 sub-cases (list, file left as it is, upgrade to 4 on change, import). Drop the v2 and v1 sub-cases, for both `list` and `import`. The only new upgrade step is 3→4. The v1→v2→v3 chain is already tested (e.g. `test/import.test.js` "version 1, 2 and 3 file"), and C6 moves those tests to version 4. Behaviour is unchanged: PD-0010 item 3 still binds it. |
| 5 | REQ-0011 (AC-12, AC-13) | scope-excess | no | open | yes | Merge AC-12 into AC-13 as one more damaged file (`"version": 5`) with the same two expected results. Refusing a newer version is existing behaviour, already tested at the old boundary (`test/exit-codes.test.js` "newer ttc"; the fuzz data generators), and C6 moves the boundary to 5. As a separate AC it repeats AC-13's stdout, exit-code and file-unchanged clauses word for word. |
| 6 | REQ-0011 (AC-14) | scope-excess | no | open | yes | Cut the id list to one invalid id per command (e.g. `abc`) plus `no task with id 7`. Drop the `0`, `-1`, `1.5` and `9007199254740992` values, the no-`tasks.json` case and the `007` case. These are the inherited id rules (C4, PD-0009 item 3). They come from the shared id parser, `test/done-reopen.test.js` already lists the same values, and the fuzz argument generator produces them for every command label once the oracle knows the new commands (C6). |
| 7 | REQ-0011 (AC-15) | scope-excess | no | open | yes | Drop the corrupt-file clause ("A `tasks.json` holding the text `{` ... still holds `{`"). It is the generic read failure every command inherits, and the fuzz data suite already covers it. Also drop the `ttc unimportant` mirror cases and `ttc important 1 --force`: the shared argument parser and the per-label fuzz cases cover them. Keep `ttc important`, `ttc important 1 2`, `--important --important` and `--important yes`. Those test rules PD-0009 items 2–3 state directly ("exactly one `<id>`", "Giving it twice, or giving it a value, is an error"). |
| 8 | REQ-0011 (AC-17) | scope-excess | no | open | yes | Drop clause "with their four messages". PD-0009 item 10 asks the README for `--important`, the two commands, the list order and the token. PD-0010 item 4 asks for the format and the one-way note. Neither asks for the messages, and AC-2 to AC-4 already assert their exact text. |

## Questions raised
| Q- id | What it blocks |
| --- | --- |
| none | — |
