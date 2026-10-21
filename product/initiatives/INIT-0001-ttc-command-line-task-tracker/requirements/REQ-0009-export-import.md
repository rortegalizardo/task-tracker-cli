---
id: REQ-0009
type: requirement
title: The ttc export and ttc import commands copy the whole list to and from a file, and a file that fails validation changes nothing
status: draft
revision: 3
owner_role: ROLE-product-manager
created: 2026-10-20
updated: 2026-10-20
initiative: INIT-0001
outcome_element: "O9. The user can copy the whole list to a file and restore it from a file, and a file that fails validation changes nothing."
acceptance:
  - "tasks 1 `Buy milk`, 2 `Pay rent` (due 2099-12-31, tag `bills`) and 3 `Read`, all open and made with `ttc add`, then `ttc export backup.json` run in a working folder → stdout is the single line `Exported 3 tasks to backup.json`, stderr is empty, exit code 0; `backup.json` exists in the working folder and `tasks.json` is unchanged"
  - "the file written by `ttc export backup.json` for tasks 1 `Buy milk`, 2 `Pay rent` (due 2099-12-31, tag `bills`) and 3 `Read`, copied to be the `tasks.json` of a different empty `TTC_HOME` → `ttc list --all` there prints exactly `#1 [ ] Buy milk`, `#2 [ ] Pay rent due:2099-12-31 +bills` and `#3 [ ] Read` (the exported file has the same format as `tasks.json`)"
  - "task 1 `Pay rent` stored as done with due date 2099-12-31 and no other task (written to `tasks.json` by the test, because this story does not depend on `ttc done`), then `ttc export backup.json` → stdout is the single line `Exported 1 tasks to backup.json`, exit code 0 (a done task is counted, and the word `tasks` is not changed for one task)"
  - "no `tasks.json` and no `TTC_HOME` folder, then `ttc export empty.json` → stdout is the single line `Exported 0 tasks to empty.json`, stderr is empty, exit code 0; `empty.json` exists, and neither `tasks.json` nor the `TTC_HOME` folder is created"
  - "`backup.json` already holds the text `old` and task 1 `Buy milk` is stored, then `ttc export backup.json` → stdout is the single line `Exported 1 tasks to backup.json`, exit code 0; `backup.json` no longer holds `old`, and `ttc import backup.json` run with a different empty `TTC_HOME` makes `ttc list --all` print exactly `#1 [ ] Buy milk`"
  - "`backup.json` is a symlink to `real.json` holding the text `old`, with task 1 `Buy milk` stored, then `ttc export backup.json` → stdout is the single line `Exported 1 tasks to backup.json`, exit code 0; `backup.json` is a regular file, and `real.json` still holds `old`"
  - "`ttc export out/backup.json` run in a working folder that holds an existing folder `out`, with `TTC_HOME` set to a different folder and task 1 `Buy milk` stored → stdout is the single line `Exported 1 tasks to out/backup.json`, exit code 0; the file is `out/backup.json` in the working folder, and no `backup.json` is created in the `TTC_HOME` folder"
  - "`ttc export nope/backup.json` when no folder `nope` exists and task 1 `Buy milk` is stored → stderr is one line that starts with `ttc: `, stdout is empty, exit code 1, `nope` is not created, and `tasks.json` unchanged"
  - "`ttc export <dir>` where `<dir>` is an existing folder, with task 1 `Buy milk` stored → stderr is one line that starts with `ttc: `, stdout is empty, exit code 1, and `tasks.json` unchanged"
  - "each of `ttc export`, `ttc export a.json b.json`, `ttc export a.json --force` and `ttc export --out`, with task 1 stored → stderr is one line that starts with `ttc: `, stdout is empty, exit code 1, and `tasks.json` unchanged"
  - "`tasks.json` holds the text `{` and `ttc export backup.json` runs → stderr is exactly one line `ttc: cannot read <path>: <reason>` (`<path>` is the path of `tasks.json`, `<reason>` is not empty), stdout is empty, exit code 1, and `tasks.json` still holds `{`"
  - "a stored list holding task 1 `Buy milk` (open), task 2 `Pay rent` (done, due 2099-12-31, tags `bills` and `home`), task 3 `Read` (open) and a next id of 7 (written to `tasks.json` by the test, because this story does not depend on `ttc done`), then `ttc export backup.json`, then in a different `TTC_HOME` whose folder does not exist yet `ttc import backup.json` → stdout is the single line `Imported 3 tasks from backup.json`, stderr is empty, exit code 0; `ttc list --all` prints exactly `#1 [ ] Buy milk`, `#2 [x] Pay rent due:2099-12-31 +bills +home` and `#3 [ ] Read`, and `ttc add 'Fresh'` then prints the single line `Added task 7`"
  - "a `TTC_HOME` holding tasks 1 `Old one` and 2 `Old two` made with `ttc add`, and a file `b.json` exported from a different `TTC_HOME` that holds tasks 1 `New` and 2 `Second` (tag `home`), then `ttc import b.json` with the first `TTC_HOME` → stdout is the single line `Imported 2 tasks from b.json`, exit code 0; `ttc list --all` prints exactly `#1 [ ] New` and `#2 [ ] Second +home` (the old tasks are gone and nothing is merged, although the ids clash)"
  - "tasks 1 `One`, 2 `Two` and 3 `Three` made with `ttc add`, then `ttc export backup.json`, then `ttc add 'Four'`, then `ttc import backup.json` → `ttc add 'Four'` prints `Added task 4`; `ttc import backup.json` prints the single line `Imported 3 tasks from backup.json`; `ttc list --all` then prints exactly `#1 [ ] One`, `#2 [ ] Two` and `#3 [ ] Three`; a further `ttc add 'Four again'` prints `Added task 4`; and `backup.json` is unchanged by the import"
  - "tasks 1 `One` and 2 `Two` made with `ttc add`, and `empty.json` exported from a `TTC_HOME` with no `tasks.json`, then `ttc import empty.json` → stdout is the single line `Imported 0 tasks from empty.json`, exit code 0; `ttc list --all` prints the single line `No tasks.`"
  - "`ttc import bad.json` with task 1 `Keep` stored, for each `bad.json` that is a list exported from tasks 1 `One` and 2 `Two` and changed only so that task 2's id is `0`, `-1`, `1.5` or the same as task 1's id → for each, stderr is exactly one line `ttc: invalid import file bad.json: <problem>` (`<problem>` is not empty), stdout is empty, exit code 1, and `tasks.json` unchanged"
  - "`ttc import bad.json` with task 1 `Keep` stored, for each `bad.json` that is a list exported from tasks 1 `One` and 2 `Two` and changed only so that task 2's title is an empty text or contains a line break → for each, stderr is exactly one line `ttc: invalid import file bad.json: <problem>` (`<problem>` is not empty), stdout is empty, exit code 1, and `tasks.json` unchanged"
  - "`ttc import bad.json` with task 1 `Keep` stored, for each `bad.json` that is a list exported from tasks 1 `One` and 2 `Two` and changed only so that task 2's status is `pending` or `closed` → for each, stderr is exactly one line `ttc: invalid import file bad.json: <problem>` (`<problem>` is not empty), stdout is empty, exit code 1, and `tasks.json` unchanged"
  - "`ttc import bad.json` with task 1 `Keep` stored, for each `bad.json` that is a list exported from tasks 1 `One` and 2 `Two` and changed only so that task 2's due date is `2026-02-30`, `2026-1-5` or `tomorrow` → for each, stderr is exactly one line `ttc: invalid import file bad.json: <problem>` (`<problem>` is not empty), stdout is empty, exit code 1, and `tasks.json` unchanged"
  - "`ttc import bad.json` with task 1 `Keep` stored, for each `bad.json` that is a list exported from tasks 1 `One` and 2 `Two` and changed only so that task 2 holds the tag `two words`, the 33-letter tag `abcdefghijklmnopqrstuvwxyzabcdefa`, the tag `café`, or the tag `home` twice → for each, stderr is exactly one line `ttc: invalid import file bad.json: <problem>` (`<problem>` is not empty), stdout is empty, exit code 1, and `tasks.json` unchanged"
  - "`ttc import bad.json` with task 1 `Keep` stored, where `bad.json` is a list exported from tasks 1 `One` and 2 `Two` and changed only so that task 2 holds the tag `HOME` → stderr is exactly one line `ttc: invalid import file bad.json: <problem>` (`<problem>` is not empty), stdout is empty, exit code 1, and `tasks.json` unchanged (import never changes the case of a tag)"
  - "`ttc import bad.json` with task 1 `Keep` stored, for each `bad.json` that is a list exported from tasks 1 `One` and 2 `Two` and changed only so that the next id is equal to the highest task id, or lower than it → for each, stderr is exactly one line `ttc: invalid import file bad.json: <problem>` (`<problem>` is not empty), stdout is empty, exit code 1, and `tasks.json` unchanged"
  - "`ttc import bad.json` with task 1 `Keep` stored, for each `bad.json` that is a list exported from tasks 1 `One` and 2 `Two` and changed only so that task 2's id is 9007199254740992, or the next id is 9007199254740993, or task 2's title contains a tab (U+0009) → for each, stderr is exactly one line `ttc: invalid import file bad.json: <problem>` (`<problem>` is not empty), stdout is empty, exit code 1, and `tasks.json` unchanged"
  - "`ttc import bad.json` with task 1 `Keep` stored, for each `bad.json` that holds the text `{`, is an empty file, or holds the text `42` → for each, stderr is exactly one line `ttc: invalid import file bad.json: <problem>` (`<problem>` is not empty), stdout is empty, exit code 1, and `tasks.json` unchanged"
  - "`ttc import bad.json` with task 1 `Keep` stored, where `bad.json` is a list exported from tasks 1 `One` and 2 `Two` and changed so that task 1's id is `0` and task 2's status is `pending` → stderr is exactly one line that starts with `ttc: invalid import file bad.json: ` (only one problem is reported), stdout is empty, exit code 1, and `tasks.json` unchanged"
  - "`ttc import bad.json` where `bad.json` holds the text `{`, with no `tasks.json` and no `TTC_HOME` folder → stderr is exactly one line `ttc: invalid import file bad.json: <problem>` (`<problem>` is not empty), stdout is empty, exit code 1, and neither `tasks.json` nor the `TTC_HOME` folder is created"
  - "a `TTC_HOME` whose `tasks.json` holds the text `{`, and a file `a.json` exported from tasks 1 `One` and 2 `Two` made with `ttc add` in a different `TTC_HOME`, then `ttc import a.json` with the first `TTC_HOME` → stdout is the single line `Imported 2 tasks from a.json`, stderr is empty, exit code 0; `ttc list --all` then prints exactly `#1 [ ] One` and `#2 [ ] Two` (import does not read the current `tasks.json`)"
  - "`ttc import nope.json` when no file `nope.json` exists and task 1 `Keep` is stored → stderr is one line that starts with `ttc: `, stdout is empty, exit code 1, and `tasks.json` unchanged"
  - "`ttc import sub/a.json` run in a working folder that holds the file `sub/a.json`, exported from task 1 `One`, with `TTC_HOME` set to a different folder that holds task 1 `Keep` and no `sub` folder → stdout is the single line `Imported 1 tasks from sub/a.json`, exit code 0; `ttc list --all` prints exactly `#1 [ ] One` (the path is relative to the working folder, not to the `TTC_HOME` folder)"
  - "each of `ttc import`, `ttc import a.json b.json`, `ttc import a.json --force` and `ttc import --in`, with a valid exported file `a.json` and task 1 `Keep` stored → stderr is one line that starts with `ttc: `, stdout is empty, exit code 1, and `tasks.json` unchanged"
  - "`ttc help` → stdout holds the usage lines `ttc export <file>` and `ttc import <file>` as well as the usage lines of the stories it depends on, exit code 0"
  - "`npm test` runs `node:test` tests covering every criterion above → all pass"
  - "the pull request delivering this story → the CI `test` check passes"
capabilities: []
design_refs: []
decisions: [PD-0001, PD-0003, PD-0004, PD-0005]
depends_on: [REQ-0001, REQ-0002, REQ-0003]
constraints: ["C1 (technical/assessment.md, round 1)", "C2 (technical/assessment.md, round 1)", "C4 (technical/assessment.md, round 1)", "C5 (technical/assessment.md, round 1)", "C6 (technical/assessment.md, round 1)", "C7 (technical/assessment.md, round 1)"]
observability: []
rollout: none
readiness: not-assessed
tickets: []
supersedes:
superseded_by:
---

# REQ-0009 — The ttc export and ttc import commands copy the whole list to and from a file, and a file that fails validation changes nothing

> A requirement **is** the engineering-ready product story. The canonical schema
> is `schemas/frontmatter.md` §"Engineering-ready product story"; its sixteen
> elements are the sections below plus the frontmatter above. Every section is
> written — an element with nothing to say carries its explicit empty form, never
> a blank.

## Requirement

The user can copy the whole list to a file and replace the list from a file, and a file that fails validation changes nothing.

## Scope

This story covers `ttc export <file>` and `ttc import <file>` and nothing else:

- writing the whole list, with each task's id and the next id to be given, to a file;
- checking a whole file before anything is changed, and the one-line report of the first problem found;
- replacing the whole stored list with the content of a valid file, keeping its ids and its next id;
- the success messages and the argument rules for both commands, the path rule for both, the unreadable-list error for `export`, and the rule that `import` does not read the stored list;
- the two new usage lines.

Code lives in the repository rortegalizardo/task-tracker-cli (~/Desktop/Projects/task-tracker-cli).

## Non-goals

- Merging a file into the current list — import always replaces (`PD-0003` item 14 and Options considered).
- Importing only some of the tasks in a file, or fixing an invalid file — a file that fails validation is refused as a whole.
- A warning or a question before import replaces the list — no command asks for confirmation (`PD-0003` item 10 and Consequences).
- A file format other than the one `tasks.json` uses, such as CSV — export writes the same format as `tasks.json`.
- Exporting only some tasks, such as the open ones — export writes the whole list.
- Reading from standard input or writing to standard output — both commands take a file path.
- Keeping automatic backups — the user runs `export` when a copy is wanted.

## Behavior

**`ttc export <file>` (`PD-0003` item 14).**

- **Result.** It writes the whole list to `<file>` in the same format as `tasks.json`, including each task's id and the next id to be given, then prints `Exported <n> tasks to <file>` and exits 0 (item 10). `<n>` is the number of tasks written, open and done. `<file>` is printed as typed. The word `tasks` is printed as shown, for one task too.
- **Path (item 14).** `<file>` is relative to the current folder, not to the `TTC_HOME` folder; `import` reads its `<file>` the same way. An existing file is replaced, atomically (item 13; `PD-0004` item 3). A missing parent folder is an error, and so is a path that is an existing folder. Each error prints one line `ttc: <message>` (item 11).
- **Permissions (`PD-0004` item 4).** An export file gets the system's default permissions: the user chose where to put it.
- **A symlink as the target (`PD-0004` item 3).** When `<file>` is a symlink, the export replaces it with a regular file holding the new content, and the link is not kept. Keeping links is out of scope.
- **No tasks.** With no `tasks.json`, it writes a list with no tasks and prints `Exported 0 tasks to <file>`. It never creates `tasks.json` or its folder (item 13).
- **The stored list is not changed.** `export` is a command that does not change the list (item 13).
- **Unreadable list (export only).** When `tasks.json` cannot be read, `export` fails with `ttc: cannot read <path>: <reason>` (item 13; `PD-0004` item 8). This applies to `export` only: `import` does not read `tasks.json`.
- **Argument rules (item 2).** It takes exactly one `<file>`. A missing file, an extra argument and any option are errors.
- **Usage line this story adds (item 12).** `ttc export <file>`

**`ttc import <file>` (item 14).**

- **Check first.** It checks the whole file before changing anything. It checks that:
  - the file is valid JSON;
  - every id is a positive whole number, at most 9007199254740991, with no id used twice (`PD-0004` item 2);
  - every title is one non-empty line, with no control character (`PD-0004` item 1);
  - every status is open or done;
  - every due date is valid or absent;
  - every tag is valid and already in lower case, with no repeats on one task;
  - the next id is higher than every task's id, and at most 9007199254740992 (`PD-0004` item 2).

  The title check is that of `PD-0004` item 1: a line break is any of LF, CR, U+0085, U+2028 or U+2029, and any other control character (U+0000–U+001F, tab included, and U+007F–U+009F) is a problem too. A failure is reported as an import problem, in the form below.
- **A problem.** The first problem found is reported as `ttc: invalid import file <file>: <problem>`, with `<file>` as typed. Exactly one line is printed, to stderr; stdout is empty; the exit code is 1. The stored list is left exactly as it was, and no file or folder is created (items 11 and 13).
- **A valid file.** It replaces the whole current list, keeping the file's ids and its next id, then prints `Imported <n> tasks from <file>` and exits 0 (item 10). `<n>` is the number of tasks in the file. The write is atomic (item 13; `PD-0004` items 3 and 4). The first command that writes creates the `TTC_HOME` folder and `tasks.json` when they are missing (item 13).
- **Import never merges.** Tasks that are in the current list and not in the file are gone afterwards, and when ids clash the file's task is the one kept. A file with no tasks gives an empty list.
- **The file is not changed.** `import` only reads `<file>`.
- **A list exported and then imported is the same list, task for task** (item 14): the same ids, titles, statuses, due dates and tags, and the same next id.
- **No confirmation.** The command asks for nothing and prints no warning before it replaces the list (item 10).
- **A file that cannot be read.** A `<file>` that does not exist, or cannot be read, is an error: `ttc: <message>` (item 11).
- **Path (item 14).** `<file>` is relative to the current folder, not to the `TTC_HOME` folder, as for `export`.
- **The stored list is not read (item 13).** `import` does not read the current `tasks.json`. A valid file replaces a `tasks.json` that holds text that is not valid JSON, or is not a valid task list, and `import` does not fail with `ttc: cannot read <path>: <reason>` for it. This is how a user restores a damaged list from an export.
- **Tags in a file (item 14).** A tag in an import file must already be in its stored form, lower case. A file with the tag `HOME` is refused with the one-line report above, and `import` never changes the letter case of a tag. A file that `ttc export` wrote always passes this check, because export writes tags in lower case.
- **Argument rules (item 2).** It takes exactly one `<file>`. A missing file, an extra argument and any option are errors.
- **Usage line this story adds (item 12).** `ttc import <file>`

## Acceptance criteria

- [ ] tasks 1 `Buy milk`, 2 `Pay rent` (due 2099-12-31, tag `bills`) and 3 `Read`, all open and made with `ttc add`, then `ttc export backup.json` run in a working folder → stdout is the single line `Exported 3 tasks to backup.json`, stderr is empty, exit code 0; `backup.json` exists in the working folder and `tasks.json` is unchanged
- [ ] the file written by `ttc export backup.json` for tasks 1 `Buy milk`, 2 `Pay rent` (due 2099-12-31, tag `bills`) and 3 `Read`, copied to be the `tasks.json` of a different empty `TTC_HOME` → `ttc list --all` there prints exactly `#1 [ ] Buy milk`, `#2 [ ] Pay rent due:2099-12-31 +bills` and `#3 [ ] Read` (the exported file has the same format as `tasks.json`)
- [ ] task 1 `Pay rent` stored as done with due date 2099-12-31 and no other task (written to `tasks.json` by the test, because this story does not depend on `ttc done`), then `ttc export backup.json` → stdout is the single line `Exported 1 tasks to backup.json`, exit code 0 (a done task is counted, and the word `tasks` is not changed for one task)
- [ ] no `tasks.json` and no `TTC_HOME` folder, then `ttc export empty.json` → stdout is the single line `Exported 0 tasks to empty.json`, stderr is empty, exit code 0; `empty.json` exists, and neither `tasks.json` nor the `TTC_HOME` folder is created
- [ ] `backup.json` already holds the text `old` and task 1 `Buy milk` is stored, then `ttc export backup.json` → stdout is the single line `Exported 1 tasks to backup.json`, exit code 0; `backup.json` no longer holds `old`, and `ttc import backup.json` run with a different empty `TTC_HOME` makes `ttc list --all` print exactly `#1 [ ] Buy milk`
- [ ] `backup.json` is a symlink to `real.json` holding the text `old`, with task 1 `Buy milk` stored, then `ttc export backup.json` → stdout is the single line `Exported 1 tasks to backup.json`, exit code 0; `backup.json` is a regular file, and `real.json` still holds `old`
- [ ] `ttc export out/backup.json` run in a working folder that holds an existing folder `out`, with `TTC_HOME` set to a different folder and task 1 `Buy milk` stored → stdout is the single line `Exported 1 tasks to out/backup.json`, exit code 0; the file is `out/backup.json` in the working folder, and no `backup.json` is created in the `TTC_HOME` folder
- [ ] `ttc export nope/backup.json` when no folder `nope` exists and task 1 `Buy milk` is stored → stderr is one line that starts with `ttc: `, stdout is empty, exit code 1, `nope` is not created, and `tasks.json` unchanged
- [ ] `ttc export <dir>` where `<dir>` is an existing folder, with task 1 `Buy milk` stored → stderr is one line that starts with `ttc: `, stdout is empty, exit code 1, and `tasks.json` unchanged
- [ ] each of `ttc export`, `ttc export a.json b.json`, `ttc export a.json --force` and `ttc export --out`, with task 1 stored → stderr is one line that starts with `ttc: `, stdout is empty, exit code 1, and `tasks.json` unchanged
- [ ] `tasks.json` holds the text `{` and `ttc export backup.json` runs → stderr is exactly one line `ttc: cannot read <path>: <reason>` (`<path>` is the path of `tasks.json`, `<reason>` is not empty), stdout is empty, exit code 1, and `tasks.json` still holds `{`
- [ ] a stored list holding task 1 `Buy milk` (open), task 2 `Pay rent` (done, due 2099-12-31, tags `bills` and `home`), task 3 `Read` (open) and a next id of 7 (written to `tasks.json` by the test, because this story does not depend on `ttc done`), then `ttc export backup.json`, then in a different `TTC_HOME` whose folder does not exist yet `ttc import backup.json` → stdout is the single line `Imported 3 tasks from backup.json`, stderr is empty, exit code 0; `ttc list --all` prints exactly `#1 [ ] Buy milk`, `#2 [x] Pay rent due:2099-12-31 +bills +home` and `#3 [ ] Read`, and `ttc add 'Fresh'` then prints the single line `Added task 7`
- [ ] a `TTC_HOME` holding tasks 1 `Old one` and 2 `Old two` made with `ttc add`, and a file `b.json` exported from a different `TTC_HOME` that holds tasks 1 `New` and 2 `Second` (tag `home`), then `ttc import b.json` with the first `TTC_HOME` → stdout is the single line `Imported 2 tasks from b.json`, exit code 0; `ttc list --all` prints exactly `#1 [ ] New` and `#2 [ ] Second +home` (the old tasks are gone and nothing is merged, although the ids clash)
- [ ] tasks 1 `One`, 2 `Two` and 3 `Three` made with `ttc add`, then `ttc export backup.json`, then `ttc add 'Four'`, then `ttc import backup.json` → `ttc add 'Four'` prints `Added task 4`; `ttc import backup.json` prints the single line `Imported 3 tasks from backup.json`; `ttc list --all` then prints exactly `#1 [ ] One`, `#2 [ ] Two` and `#3 [ ] Three`; a further `ttc add 'Four again'` prints `Added task 4`; and `backup.json` is unchanged by the import
- [ ] tasks 1 `One` and 2 `Two` made with `ttc add`, and `empty.json` exported from a `TTC_HOME` with no `tasks.json`, then `ttc import empty.json` → stdout is the single line `Imported 0 tasks from empty.json`, exit code 0; `ttc list --all` prints the single line `No tasks.`
- [ ] `ttc import bad.json` with task 1 `Keep` stored, for each `bad.json` that is a list exported from tasks 1 `One` and 2 `Two` and changed only so that task 2's id is `0`, `-1`, `1.5` or the same as task 1's id → for each, stderr is exactly one line `ttc: invalid import file bad.json: <problem>` (`<problem>` is not empty), stdout is empty, exit code 1, and `tasks.json` unchanged
- [ ] `ttc import bad.json` with task 1 `Keep` stored, for each `bad.json` that is a list exported from tasks 1 `One` and 2 `Two` and changed only so that task 2's title is an empty text or contains a line break → for each, stderr is exactly one line `ttc: invalid import file bad.json: <problem>` (`<problem>` is not empty), stdout is empty, exit code 1, and `tasks.json` unchanged
- [ ] `ttc import bad.json` with task 1 `Keep` stored, for each `bad.json` that is a list exported from tasks 1 `One` and 2 `Two` and changed only so that task 2's status is `pending` or `closed` → for each, stderr is exactly one line `ttc: invalid import file bad.json: <problem>` (`<problem>` is not empty), stdout is empty, exit code 1, and `tasks.json` unchanged
- [ ] `ttc import bad.json` with task 1 `Keep` stored, for each `bad.json` that is a list exported from tasks 1 `One` and 2 `Two` and changed only so that task 2's due date is `2026-02-30`, `2026-1-5` or `tomorrow` → for each, stderr is exactly one line `ttc: invalid import file bad.json: <problem>` (`<problem>` is not empty), stdout is empty, exit code 1, and `tasks.json` unchanged
- [ ] `ttc import bad.json` with task 1 `Keep` stored, for each `bad.json` that is a list exported from tasks 1 `One` and 2 `Two` and changed only so that task 2 holds the tag `two words`, the 33-letter tag `abcdefghijklmnopqrstuvwxyzabcdefa`, the tag `café`, or the tag `home` twice → for each, stderr is exactly one line `ttc: invalid import file bad.json: <problem>` (`<problem>` is not empty), stdout is empty, exit code 1, and `tasks.json` unchanged
- [ ] `ttc import bad.json` with task 1 `Keep` stored, where `bad.json` is a list exported from tasks 1 `One` and 2 `Two` and changed only so that task 2 holds the tag `HOME` → stderr is exactly one line `ttc: invalid import file bad.json: <problem>` (`<problem>` is not empty), stdout is empty, exit code 1, and `tasks.json` unchanged (import never changes the case of a tag)
- [ ] `ttc import bad.json` with task 1 `Keep` stored, for each `bad.json` that is a list exported from tasks 1 `One` and 2 `Two` and changed only so that the next id is equal to the highest task id, or lower than it → for each, stderr is exactly one line `ttc: invalid import file bad.json: <problem>` (`<problem>` is not empty), stdout is empty, exit code 1, and `tasks.json` unchanged
- [ ] `ttc import bad.json` with task 1 `Keep` stored, for each `bad.json` that is a list exported from tasks 1 `One` and 2 `Two` and changed only so that task 2's id is 9007199254740992, or the next id is 9007199254740993, or task 2's title contains a tab (U+0009) → for each, stderr is exactly one line `ttc: invalid import file bad.json: <problem>` (`<problem>` is not empty), stdout is empty, exit code 1, and `tasks.json` unchanged
- [ ] `ttc import bad.json` with task 1 `Keep` stored, for each `bad.json` that holds the text `{`, is an empty file, or holds the text `42` → for each, stderr is exactly one line `ttc: invalid import file bad.json: <problem>` (`<problem>` is not empty), stdout is empty, exit code 1, and `tasks.json` unchanged
- [ ] `ttc import bad.json` with task 1 `Keep` stored, where `bad.json` is a list exported from tasks 1 `One` and 2 `Two` and changed so that task 1's id is `0` and task 2's status is `pending` → stderr is exactly one line that starts with `ttc: invalid import file bad.json: ` (only one problem is reported), stdout is empty, exit code 1, and `tasks.json` unchanged
- [ ] `ttc import bad.json` where `bad.json` holds the text `{`, with no `tasks.json` and no `TTC_HOME` folder → stderr is exactly one line `ttc: invalid import file bad.json: <problem>` (`<problem>` is not empty), stdout is empty, exit code 1, and neither `tasks.json` nor the `TTC_HOME` folder is created
- [ ] a `TTC_HOME` whose `tasks.json` holds the text `{`, and a file `a.json` exported from tasks 1 `One` and 2 `Two` made with `ttc add` in a different `TTC_HOME`, then `ttc import a.json` with the first `TTC_HOME` → stdout is the single line `Imported 2 tasks from a.json`, stderr is empty, exit code 0; `ttc list --all` then prints exactly `#1 [ ] One` and `#2 [ ] Two` (import does not read the current `tasks.json`)
- [ ] `ttc import nope.json` when no file `nope.json` exists and task 1 `Keep` is stored → stderr is one line that starts with `ttc: `, stdout is empty, exit code 1, and `tasks.json` unchanged
- [ ] `ttc import sub/a.json` run in a working folder that holds the file `sub/a.json`, exported from task 1 `One`, with `TTC_HOME` set to a different folder that holds task 1 `Keep` and no `sub` folder → stdout is the single line `Imported 1 tasks from sub/a.json`, exit code 0; `ttc list --all` prints exactly `#1 [ ] One` (the path is relative to the working folder, not to the `TTC_HOME` folder)
- [ ] each of `ttc import`, `ttc import a.json b.json`, `ttc import a.json --force` and `ttc import --in`, with a valid exported file `a.json` and task 1 `Keep` stored → stderr is one line that starts with `ttc: `, stdout is empty, exit code 1, and `tasks.json` unchanged
- [ ] `ttc help` → stdout holds the usage lines `ttc export <file>` and `ttc import <file>` as well as the usage lines of the stories it depends on, exit code 0
- [ ] `npm test` runs `node:test` tests covering every criterion above → all pass
- [ ] the pull request delivering this story → the CI `test` check passes

## Sequencing

- `REQ-0001` comes first: both commands read or write the stored list and the exported file, run inside the command skeleton, print errors in the one-line form and add their lines to `ttc help`. The rules for the stored list, including what makes a `tasks.json` a valid task list, are set there.
- `REQ-0002` comes before it: the lists exported and imported in the tests are built with `ttc add`, with due dates and tags.
- `REQ-0003` comes before it: the tests of this story read the list before and after through `ttc list`, which shows every task, open and done.

## Technical constraints

- **C1** (`technical/assessment.md`, round 1): The runtime is Node 24 with built-in modules only, and no network. The CI job has no install step, so a dependency also fails CI, and the built-in argument parser cannot be used as it is for single-dash arguments such as `-1` and `-home`.
- **C2** (`technical/assessment.md`, round 1): "Atomic" holds at process level: after a crash, kill or error at any step of a write, `tasks.json` (and an export target) holds the whole old content or the whole new content. A power cut or operating-system crash cannot be tested in CI, and a replaced symlink becomes a regular file (`PD-0004` item 3).
- **C4** (`technical/assessment.md`, round 1): Test files run at the same time in separate processes. Every test uses its own data folder, home folder and working folder, and never reads or writes the real home folder of the person running the tests.
- **C5** (`technical/assessment.md`, round 1): Ids are exact only up to 9007199254740991. Id parsing and the import checks need that upper bound (`PD-0004` item 2).
- **C6** (`technical/assessment.md`, round 1): Verification runs on Node 24 on Linux with a UTC clock in CI, and CI is the arbiter. The `engines` field is aligned to Node 24, and other operating systems are not verified.
- **C7** (`technical/assessment.md`, round 1): Stories after `REQ-0003` merge one at a time, in `depends_on` order, because they share the command list, the usage text and the argument rules. The stored-file layout is the one `REQ-0001` fixes.

## Observability

none — a local, offline command; its stdout/stderr lines and exit code are the whole operable signal, and the requester ruled out network (constraints.md row 3).

## Rollout

none

## Notes

- "A list exported from tasks 1 `One` and 2 `Two` and changed only so that …" means: a file written by `ttc export` for that list, then edited in exactly the one way named. The JSON layout of the file is engineering's choice (`PD-0003` item 13), so the tests build the changed file from a real export.
- A done task is set up by writing `tasks.json` directly in the test, because this story does not depend on `ttc done`. The same holds for a next id higher than the highest task id: no story this one depends on can delete a task, so the test writes it.
- The wording of `<problem>`, of an error for a missing file or folder, and of argument-shape errors is engineering's (`PD-0003` item 2). The criteria assert only the form `ttc: <message>`, and that `<problem>` is not empty.
- The criteria with two `TTC_HOME` folders run each command with its own `TTC_HOME`.
- `PD-0003` item 14 gives the checks, the path rule, the lower-case tag rule and the replace rule, item 10 the two success messages and item 13 the storage rules, including that `import` does not read the current `tasks.json`. `PD-0004` items 1 and 2 add to the title and id checks, item 3 covers symlinks and atomic writes, and item 4 gives an export file default permissions.

> **Immutable once `status: accepted`** — in its product content. The lifecycle
> fields `status`, `readiness`, and `tickets` are advanced by the delivery roles
> under the restricted authority in `manifest.yaml`. Any content change is a new
> `REQ-` with `supersedes`.
