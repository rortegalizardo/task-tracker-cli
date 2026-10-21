---
id: REQ-0002
type: requirement
title: The ttc add command records a task with an optional due date and tags
status: accepted
revision: 5
owner_role: ROLE-product-manager
created: 2026-10-20
updated: 2026-10-20
initiative: INIT-0001
outcome_element: "O2. The user can record a task in one command, with an optional due date and tags."
acceptance:
  - "`ttc add 'Buy milk'` with no `tasks.json` → stdout is the single line `Added task 1`, stderr is empty, exit code 0; `tasks.json` is created and holds one task (id 1, title `Buy milk`, status open, no due date, no tags) and the next id to be given is 2"
  - "`ttc add 'Buy milk'` then `ttc add 'Pay rent'` with no `tasks.json` → the second command's stdout is the single line `Added task 2`, exit code 0; `tasks.json` holds task 1 `Buy milk` and task 2 `Pay rent`, both open, and the next id to be given is 3"
  - "`ttc add 'Pay rent' --due 2026-10-01 --tag bills --tag home` with no `tasks.json` → stdout is the single line `Added task 1`, exit code 0; the stored task has due date `2026-10-01` and tags `bills` and `home`"
  - "`ttc add --tag home --due 2026-10-01 'Pay rent'` (options before the title) with no `tasks.json` → stdout is the single line `Added task 1`, exit code 0; the stored task has title `Pay rent`, due date `2026-10-01` and tag `home`"
  - "`ttc add 'Old bill' --due 2020-01-01` then `ttc add 'Leap day' --due 2028-02-29` with no `tasks.json` → stdout is `Added task 1` and then `Added task 2`, exit code 0 both times; the stored due dates are `2020-01-01` and `2028-02-29`"
  - "`ttc add 'x' --due <d>` for each `<d>` in `2026-02-30`, `2027-02-29`, `10/01/2026`, `2026-1-5` and `tomorrow` → stderr is exactly the line `ttc: invalid date: <d>`, stdout is empty, exit code 1, and `tasks.json` unchanged"
  - "`ttc add '  Buy milk  '` with no `tasks.json` → stdout is the single line `Added task 1`, exit code 0; the stored title is `Buy milk`"
  - "`ttc add '  Café  au lait 牛乳 '` with no `tasks.json` → exit code 0; the stored title is `Café  au lait 牛乳` (spaces at both ends removed; the double space inside and the non-English characters kept)"
  - "`ttc add ''` and `ttc add '   '` → stderr is exactly the line `ttc: title must be one non-empty line`, stdout is empty, exit code 1, and `tasks.json` unchanged"
  - "`ttc add` with a title argument that contains a line break (`line one`, a line break, `line two`) → stderr is exactly the line `ttc: title must be one non-empty line`, stdout is empty, exit code 1, and `tasks.json` unchanged"
  - "`ttc add <title>` for each `<title>` in: `Buy milk` followed by a line feed (U+000A); `Buy milk` followed by a carriage return (U+000D); `Buy`, a space, a line separator (U+2028), a space and `milk` → stderr is exactly the line `ttc: title must be one non-empty line`, stdout is empty, exit code 1, and `tasks.json` unchanged"
  - "`ttc add <title>` for each `<title>` in: `Buy`, a space, a tab (U+0009), a space and `milk`; `Buy milk` followed by the bell character (U+0007) → stderr is exactly the line `ttc: title must not contain control characters`, stdout is empty, exit code 1, and `tasks.json` unchanged"
  - "`ttc add 'x' --tag Home --tag HOME --tag home` with no `tasks.json` → stdout is the single line `Added task 1`, exit code 0; the stored task has exactly one tag, `home`"
  - "`ttc add 'x' --tag a-b_9 --tag abcdefghijklmnopqrstuvwxyzabcdef` (the second tag is 32 letters) with no `tasks.json` → exit code 0; the stored task has tags `a-b_9` and `abcdefghijklmnopqrstuvwxyzabcdef`"
  - "`ttc add 'x' --tag <t>` for each `<t>` in `abcdefghijklmnopqrstuvwxyzabcdefa` (33 letters), `two words`, `café`, `a.b`, `-x` and `_x` → stderr is exactly the line `ttc: invalid tag: <t>`, stdout is empty, exit code 1, and `tasks.json` unchanged"
  - "`ttc add 'x' --tag ok --tag 'two words'` with no `tasks.json` → stderr is exactly the line `ttc: invalid tag: two words`, stdout is empty, exit code 1, and `tasks.json` unchanged (no task is stored, not even with the tag `ok`)"
  - "each of `ttc add`, `ttc add --due 2026-10-01`, `ttc add one two`, `ttc add 'x' --due 2026-10-01 --due 2026-10-02`, `ttc add 'x' --due`, `ttc add 'x' --due --tag a`, `ttc add 'x' --tag`, `ttc add 'x' --priority` and `ttc add '--urgent'` → stderr is one line that starts with `ttc: `, stdout is empty, exit code 1, and `tasks.json` unchanged"
  - "`tasks.json` holds the text `{` and `ttc add 'x'` runs → stderr is exactly one line `ttc: cannot read <path>: <reason>` (`<path>` is the path of `tasks.json`, `<reason>` is not empty), stdout is empty, exit code 1, and `tasks.json` still holds `{`"
  - "`TTC_HOME` names a folder whose folder and parent folders do not exist, then `ttc add 'x'` runs → exit code 0, the folder and its missing parents are created, and `tasks.json` in it holds task 1"
  - "`ttc add 'x'` whose write is stopped before it finishes (the test simulates this) while `tasks.json` holds a list → `tasks.json` still holds exactly that whole list, as valid JSON, without task `x`"
  - "`ttc add 'Buy milk'` with a stored list whose next id is 9007199254740991 (written by the test) → stdout is the single line `Added task 9007199254740991`, stderr is empty, exit code 0"
  - "`ttc add 'Buy milk'` with a stored list whose next id is 9007199254740992 (written by the test) → stderr is one line that starts with `ttc: `, stdout is empty, exit code 1, and `tasks.json` unchanged"
  - "`ttc help` → stdout holds the usage line `ttc add \"<title>\" [--due YYYY-MM-DD] [--tag <t>]...` as well as a usage line for each command that the stories it depends on add, exit code 0"
  - "`TTC_HOME` names an existing regular file, not a folder, then `ttc add 'x'` runs → stderr is one line that starts with `ttc: `, stdout is empty, exit code 1, and that file has the same bytes as before"
  - "`npm test` runs `node:test` tests covering every criterion above → all pass"
  - "the pull request delivering this story → the CI `test` check passes"
capabilities: [CAP-0001]
design_refs: []
decisions: [PD-0001, PD-0003, PD-0004, PD-0005]
depends_on: [REQ-0001]
constraints: ["C1 (technical/assessment.md, round 1)", "C2 (technical/assessment.md, round 1)", "C3 (technical/assessment.md, round 1)", "C4 (technical/assessment.md, round 1)", "C5 (technical/assessment.md, round 1)", "C6 (technical/assessment.md, round 1)"]
observability: []
rollout: none
readiness: engineering-ready
tickets: []
supersedes:
superseded_by:
---

# REQ-0002 — The ttc add command records a task with an optional due date and tags

> A requirement **is** the engineering-ready product story. The canonical schema
> is `schemas/frontmatter.md` §"Engineering-ready product story"; its sixteen
> elements are the sections below plus the frontmatter above. Every section is
> written — an element with nothing to say carries its explicit empty form, never
> a blank.

## Requirement

The user can record a task in one command, with an optional due date and tags.

## Scope

This story covers `ttc add "<title>" [--due YYYY-MM-DD] [--tag <t>]...` and nothing else:

- creating one open task with the next id;
- the title rules, the due-date rules and the tag rules that apply when a task is created;
- the success line, the errors and the argument rules for this command;
- the one new usage line.

It stops where a task has been stored. Showing tasks and changing them belong to other stories.

Code lives in the repository rortegalizardo/task-tracker-cli (~/Desktop/Projects/task-tracker-cli).

## Non-goals

- Changing or clearing a due date after `add` — no command in the spec (`PD-0003` Consequences).
- Showing the stored tasks (`ttc list`) — the next story, so this story's criteria read `tasks.json` directly.
- Adding several tasks in one command — the usage line takes one title.
- Marking a task done when it is added — `ttc done` is a later story.
- A title that begins with `--` — an argument that begins with `--` is read as an option (`PD-0003` item 2), and the spec has no way to escape it.

## Behavior

**Command.** `ttc add "<title>" [--due YYYY-MM-DD] [--tag <t>]...`

- **Result.** It creates one open task and prints `Added task <id>` to stdout, then exits 0 (`PD-0003` item 10). The id is the next id to be given: positive whole numbers in order from 1, never reused (item 1). The first task of a new list gets id 1. The command asks for no confirmation.
- **No id left (`PD-0004` item 2).** The largest id is 9007199254740991. When the next id is above that, `add` fails in `PD-0003` item 11's form, with a message saying no task id is left.
- **Title (item 3; `PD-0004` item 1).** The title is one argument. Only the space character (U+0020) is removed from both ends: a tab or any other character at either end is kept. A title that is empty after that, or that contains a line break anywhere, is an error: `ttc: title must be one non-empty line`. A line break is any of LF, CR, U+0085, U+2028 or U+2029. Any other control character in a title also makes it invalid: `ttc: title must not contain control characters`. Control characters are U+0000–U+001F (tab included) and U+007F–U+009F. Any other text, including non-English text, is kept as given: inner spaces and letter case too.
- **Due date (item 5).** `--due YYYY-MM-DD`, at most once. It must be a real calendar date (`2026-02-30` is not). Anything else is an error: `ttc: invalid date: <d>`, with `<d>` the text typed after `--due`. A date in the past is allowed. Without `--due` the task has no due date.
- **Tags (item 4).** `--tag <t>` may be given any number of times. A tag is 1 to 32 characters. The first is an English letter or a digit; each of the others is an English letter, a digit, `-` or `_`. So `-x` and `_x` are not tags. Tags are case-insensitive and stored in lower case. Anything else is an error: `ttc: invalid tag: <t>`, with `<t>` as typed. A task never holds the same tag twice: a tag given more than once, in any letter case, is kept once. A task's tags are always shown in alphabetical order; the order inside the file is not fixed.
- **Argument rules (item 2).** Options may come before or after the title. An argument that begins with `--` is read as an option, so a title that begins with `--` is an unknown option. These are errors: no title, a second positional argument, `--due` given twice, `--due` or `--tag` with no value (including when the next argument begins with `--`), and an unknown option. Each prints one line `ttc: <message>` (item 11).
- **Failure leaves no trace.** A failed `add` stores nothing, even when only the last tag is invalid, and prints nothing to stdout (item 11; `PD-0004` item 7).
- **Unreadable list.** When `tasks.json` cannot be read, `add` fails with `ttc: cannot read <path>: <reason>` and writes nothing (item 13; `PD-0004` item 8).
- **Atomic write.** The write is atomic (item 13; `PD-0004` items 3 and 4). The first write creates the folder, with any missing parent folders, and the file.
- **Usage line this story adds (item 12).** `ttc add "<title>" [--due YYYY-MM-DD] [--tag <t>]...`

## Acceptance criteria

- [ ] `ttc add 'Buy milk'` with no `tasks.json` → stdout is the single line `Added task 1`, stderr is empty, exit code 0; `tasks.json` is created and holds one task (id 1, title `Buy milk`, status open, no due date, no tags) and the next id to be given is 2
- [ ] `ttc add 'Buy milk'` then `ttc add 'Pay rent'` with no `tasks.json` → the second command's stdout is the single line `Added task 2`, exit code 0; `tasks.json` holds task 1 `Buy milk` and task 2 `Pay rent`, both open, and the next id to be given is 3
- [ ] `ttc add 'Pay rent' --due 2026-10-01 --tag bills --tag home` with no `tasks.json` → stdout is the single line `Added task 1`, exit code 0; the stored task has due date `2026-10-01` and tags `bills` and `home`
- [ ] `ttc add --tag home --due 2026-10-01 'Pay rent'` (options before the title) with no `tasks.json` → stdout is the single line `Added task 1`, exit code 0; the stored task has title `Pay rent`, due date `2026-10-01` and tag `home`
- [ ] `ttc add 'Old bill' --due 2020-01-01` then `ttc add 'Leap day' --due 2028-02-29` with no `tasks.json` → stdout is `Added task 1` and then `Added task 2`, exit code 0 both times; the stored due dates are `2020-01-01` and `2028-02-29`
- [ ] `ttc add 'x' --due <d>` for each `<d>` in `2026-02-30`, `2027-02-29`, `10/01/2026`, `2026-1-5` and `tomorrow` → stderr is exactly the line `ttc: invalid date: <d>`, stdout is empty, exit code 1, and `tasks.json` unchanged
- [ ] `ttc add '  Buy milk  '` with no `tasks.json` → stdout is the single line `Added task 1`, exit code 0; the stored title is `Buy milk`
- [ ] `ttc add '  Café  au lait 牛乳 '` with no `tasks.json` → exit code 0; the stored title is `Café  au lait 牛乳` (spaces at both ends removed; the double space inside and the non-English characters kept)
- [ ] `ttc add ''` and `ttc add '   '` → stderr is exactly the line `ttc: title must be one non-empty line`, stdout is empty, exit code 1, and `tasks.json` unchanged
- [ ] `ttc add` with a title argument that contains a line break (`line one`, a line break, `line two`) → stderr is exactly the line `ttc: title must be one non-empty line`, stdout is empty, exit code 1, and `tasks.json` unchanged
- [ ] `ttc add <title>` for each `<title>` in: `Buy milk` followed by a line feed (U+000A); `Buy milk` followed by a carriage return (U+000D); `Buy`, a space, a line separator (U+2028), a space and `milk` → stderr is exactly the line `ttc: title must be one non-empty line`, stdout is empty, exit code 1, and `tasks.json` unchanged
- [ ] `ttc add <title>` for each `<title>` in: `Buy`, a space, a tab (U+0009), a space and `milk`; `Buy milk` followed by the bell character (U+0007) → stderr is exactly the line `ttc: title must not contain control characters`, stdout is empty, exit code 1, and `tasks.json` unchanged
- [ ] `ttc add 'x' --tag Home --tag HOME --tag home` with no `tasks.json` → stdout is the single line `Added task 1`, exit code 0; the stored task has exactly one tag, `home`
- [ ] `ttc add 'x' --tag a-b_9 --tag abcdefghijklmnopqrstuvwxyzabcdef` (the second tag is 32 letters) with no `tasks.json` → exit code 0; the stored task has tags `a-b_9` and `abcdefghijklmnopqrstuvwxyzabcdef`
- [ ] `ttc add 'x' --tag <t>` for each `<t>` in `abcdefghijklmnopqrstuvwxyzabcdefa` (33 letters), `two words`, `café`, `a.b`, `-x` and `_x` → stderr is exactly the line `ttc: invalid tag: <t>`, stdout is empty, exit code 1, and `tasks.json` unchanged
- [ ] `ttc add 'x' --tag ok --tag 'two words'` with no `tasks.json` → stderr is exactly the line `ttc: invalid tag: two words`, stdout is empty, exit code 1, and `tasks.json` unchanged (no task is stored, not even with the tag `ok`)
- [ ] each of `ttc add`, `ttc add --due 2026-10-01`, `ttc add one two`, `ttc add 'x' --due 2026-10-01 --due 2026-10-02`, `ttc add 'x' --due`, `ttc add 'x' --due --tag a`, `ttc add 'x' --tag`, `ttc add 'x' --priority` and `ttc add '--urgent'` → stderr is one line that starts with `ttc: `, stdout is empty, exit code 1, and `tasks.json` unchanged
- [ ] `tasks.json` holds the text `{` and `ttc add 'x'` runs → stderr is exactly one line `ttc: cannot read <path>: <reason>` (`<path>` is the path of `tasks.json`, `<reason>` is not empty), stdout is empty, exit code 1, and `tasks.json` still holds `{`
- [ ] `TTC_HOME` names a folder whose folder and parent folders do not exist, then `ttc add 'x'` runs → exit code 0, the folder and its missing parents are created, and `tasks.json` in it holds task 1
- [ ] `ttc add 'x'` whose write is stopped before it finishes (the test simulates this) while `tasks.json` holds a list → `tasks.json` still holds exactly that whole list, as valid JSON, without task `x`
- [ ] `ttc add 'Buy milk'` with a stored list whose next id is 9007199254740991 (written by the test) → stdout is the single line `Added task 9007199254740991`, stderr is empty, exit code 0
- [ ] `ttc add 'Buy milk'` with a stored list whose next id is 9007199254740992 (written by the test) → stderr is one line that starts with `ttc: `, stdout is empty, exit code 1, and `tasks.json` unchanged
- [ ] `ttc help` → stdout holds the usage line `ttc add "<title>" [--due YYYY-MM-DD] [--tag <t>]...` as well as a usage line for each command that the stories it depends on add, exit code 0
- [ ] `TTC_HOME` names an existing regular file, not a folder, then `ttc add 'x'` runs → stderr is one line that starts with `ttc: `, stdout is empty, exit code 1, and that file has the same bytes as before
- [ ] `npm test` runs `node:test` tests covering every criterion above → all pass
- [ ] the pull request delivering this story → the CI `test` check passes

## Sequencing

- `REQ-0001` comes first: `add` needs the stored list and its atomic write to keep a task, and the command skeleton to run, to print errors in the one-line form and to list its usage line in `ttc help`.

## Technical constraints

- **C1** (`technical/assessment.md`, round 1): The runtime is Node 24 with built-in modules only, and no network. The CI job has no install step, so a dependency also fails CI, and the built-in argument parser cannot be used as it is for single-dash arguments such as `-1` and `-home`.
- **C2** (`technical/assessment.md`, round 1): "Atomic" holds at process level: after a crash, kill or error at any step of a write, `tasks.json` (and an export target) holds the whole old content or the whole new content. A power cut or operating-system crash cannot be tested in CI, and a replaced symlink becomes a regular file (`PD-0004` item 3).
- **C3** (`technical/assessment.md`, round 1): This story's test of a stopped write simulates the interruption from the test side only. No `ttc` option or environment variable may exist for it, because `PD-0003` closes the set of user-visible behaviour.
- **C4** (`technical/assessment.md`, round 1): Test files run at the same time in separate processes. Every test uses its own data folder, home folder and working folder, and never reads or writes the real home folder of the person running the tests.
- **C5** (`technical/assessment.md`, round 1): Ids are exact only up to 9007199254740991. Id parsing and the import checks need that upper bound (`PD-0004` item 2).
- **C6** (`technical/assessment.md`, round 1): Verification runs on Node 24 on Linux with a UTC clock in CI, and CI is the arbiter. The `engines` field is aligned to Node 24, and other operating systems are not verified.

## Observability

none — a local, offline command; its stdout/stderr lines and exit code are the whole operable signal, and the requester ruled out network (constraints.md row 3).

## Rollout

none

## Notes

- Criteria read stored results from `tasks.json` by meaning, because the JSON layout is engineering's choice (`PD-0003` item 13) and `ttc list` is not yet available to this story.
- The wording of argument-shape errors is engineering's (`PD-0003` item 2); the criteria assert only the form `ttc: <message>`.
- `PD-0003` items 1, 3, 4 and 5 give the rules for ids, titles, tags and due dates; `PD-0004` items 1 and 2 add to the title and id rules.

> **Immutable once `status: accepted`** — in its product content. The lifecycle
> fields `status`, `readiness`, and `tickets` are advanced by the delivery roles
> under the restricted authority in `manifest.yaml`. Any content change is a new
> `REQ-` with `supersedes`.
