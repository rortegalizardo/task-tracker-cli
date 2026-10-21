---
id: PD-0002
type: decision
title: Fix the user-visible behaviour rules the ttc spec leaves open
status: superseded
revision: 1
owner_role: ROLE-product-manager
created: 2026-10-20
updated: 2026-10-20
decided_on: 2026-10-20
affects: [INIT-0001]
supersedes:
superseded_by: PD-0003
archived_on: 2026-10-20
---

# PD-0002 — Fix the user-visible behaviour rules the ttc spec leaves open

## Context

The requester's spec for `ttc` names ten command groups and the rules that bind
them all, but leaves open details a user sees: how tasks are numbered, what
`list` prints, what "overdue" means, what counts as a valid title, tag or date,
what repeated actions do, how `import` treats the current list, and what
success and failure print. Rows 3–14 of the INIT-0001 ambiguity log list them.

The requester delegated every such detail to the product manager: "Decide
everything inside it yourself" (`PD-0001` item 1; raw source
`initiatives/INIT-0001-ttc-command-line-task-tracker/product/sources/2026-10-20-requester-spec.md`).
Left unwritten, each one becomes a choice an implementing agent makes alone,
and ten stories built in parallel would make ten different choices. This record
fixes them once, so every story and every later session uses the same answers.

## Decision

Every rule below is binding on every `ttc` command. Quoted text is printed
exactly as shown; `<n>`, `<id>`, `<t>`, `<file>`, `<path>` and `<message>` are
filled in.

1. **Task ids.** Each task gets a positive whole number, given in order from 1.
   An id is never reused, even after its task is deleted: the next task always
   gets a higher number than any task ever created.
2. **Arguments.**
   - A command takes exactly the arguments its usage line shows. A missing
     required argument, an extra argument, an option given twice (except
     `--tag` on `add`), an option with no value, or an unknown option is an
     error.
   - Options may come before or after the positional arguments.
   - An argument that begins with `--` is read as an option.
   - `<id>` must be a positive whole number written in digits. Anything else is
     an error: `ttc: invalid task id: <arg>`. A valid number with no task is an
     error: `ttc: no task with id <id>`.
3. **Titles.** A title is one argument. Spaces at both ends are removed. A
   title that is empty after that, or that contains a line break, is an error:
   `ttc: title must be one non-empty line`. Any other text, including
   non-English text, is kept as given.
4. **Tags.** A tag is 1 to 32 characters, each an English letter, a digit, `-`
   or `_`. Tags are case-insensitive and stored in lower case. Anything else is
   an error: `ttc: invalid tag: <t>`. A task never holds the same tag twice;
   repeating a tag on `add` keeps one. A task's tags are always shown in
   alphabetical order.
5. **Due dates.** A due date is written `YYYY-MM-DD` and must be a real
   calendar date (`2026-02-30` is not). Anything else is an error:
   `ttc: invalid date: <d>`. A date in the past is allowed.
6. **Today and overdue.** "Today" is the date on the user's machine, in its
   local time zone. A task is overdue when it is open and its due date is
   before today. A task due today is not overdue. A done task is never
   overdue. A task with no due date is never overdue.
7. **`list`.**
   - With no status option it shows open tasks.
   - `--open`, `--done`, `--all` and (from the due-dates story) `--overdue`
     cannot be combined; giving two is an error.
   - `--tag <t>` may be given once and narrows any status view to tasks
     holding that tag.
   - Tasks are shown in ascending id order, one line each.
   - When nothing matches, it prints `No tasks.` and exits 0.
8. **One task line.** In this order, separated by single spaces:
   - `#<id>`;
   - `[ ]` for an open task or `[x]` for a done task;
   - the title;
   - `due:YYYY-MM-DD` if the task has a due date;
   - `!overdue` if it is overdue (added by the due-dates story);
   - `+<tag>` for each tag, in alphabetical order.

   Example: `#3 [ ] Pay rent due:2026-10-01 !overdue +bills +home`.
9. **Repeated and no-op actions** succeed, change nothing, and exit 0:
   - `done` on a done task prints `Task <id> is already done`;
   - `reopen` on an open task prints `Task <id> is already open`;
   - adding a tag the task has prints `Task <id> already has tag <t>`;
   - removing a tag it lacks prints `Task <id> has no tag <t>`.
   `rename` to the same title succeeds like any rename.
10. **Success output.** A command that changes data prints one line to stdout
    and exits 0:
    - `Added task <id>`;
    - `Completed task <id>`;
    - `Reopened task <id>`;
    - `Renamed task <id>`;
    - `Deleted task <id>`;
    - `Added tag <t> to task <id>`;
    - `Removed tag <t> from task <id>`;
    - `Exported <n> tasks to <file>`;
    - `Imported <n> tasks from <file>`.
    No command asks for confirmation.
11. **Errors.** Every failure prints exactly one line to stderr, in the form
    `ttc: <message>`, prints nothing to stdout, exits with code 1, and changes
    no stored data. No stack trace is ever shown.
12. **Help.**
    - `ttc`, `ttc help` and `ttc --help` print the usage to stdout and exit 0.
    - The usage lists one line per command that exists at that point. Each
      story adds its own line:
      - `ttc help`
      - `ttc add "<title>" [--due YYYY-MM-DD] [--tag <t>]...`
      - `ttc list [--open|--done|--all|--overdue] [--tag <t>]` (`--overdue`
        appears with the due-dates story)
      - `ttc done <id>`
      - `ttc reopen <id>`
      - `ttc rename <id> "<title>"`
      - `ttc delete <id>`
      - `ttc tag <id> +<t> | -<t>`
      - `ttc export <file>`
      - `ttc import <file>`
      - `ttc stats`
    - An unknown command is an error: `ttc: unknown command: <cmd> (see ttc help)`.
13. **Storage.**
    - Tasks live in `$TTC_HOME/tasks.json`. When `TTC_HOME` is unset or empty,
      the folder is `~/.ttc` in the user's home folder.
    - A missing file means no tasks. A command that does not change the list
      (`help`, `list`, `stats`, `export`) never creates `tasks.json` or its
      folder.
    - The first command that writes creates the folder, with any missing
      parent folders, and the file.
    - A file that is not valid JSON, or not a valid task list, makes every
      command that reads it fail with
      `ttc: cannot read <path>: <reason>`, and leaves the file untouched.
    - "Every write is atomic" means: after any command, or any interruption of
      one, `tasks.json` holds either the whole old list or the whole new list,
      never a mix and never a partial file. How this is achieved is
      engineering's choice.
14. **Export and import.**
    - `ttc export <file>` writes the whole list, including each task's id and
      the next id to be given, to `<file>` in the same format as `tasks.json`.
    - The path is relative to the current folder. An existing file is
      replaced, atomically. A missing parent folder is an error.
    - With no `tasks.json`, export writes a list with no tasks.
    - `ttc import <file>` checks the whole file before changing anything. It
      checks:
      - valid JSON;
      - every id a positive whole number, with no id used twice;
      - every title one non-empty line;
      - every status open or done;
      - every due date valid or absent;
      - every tag valid, with no repeats on one task;
      - the next id higher than every task's id.
    - The first problem found is reported as
      `ttc: invalid import file <file>: <problem>`, and the list is left
      exactly as it was.
    - A valid file replaces the whole current list, keeping its ids and next
      id. Import never merges.
    - A list exported and then imported is the same list, task for task.
15. **`stats`** prints three lines, in this order: `open: <n>`, `done: <n>`,
    `overdue: <n>`. Overdue tasks are also counted in `open`. With no tasks,
    all three are 0.
16. **One process at a time.** Two `ttc` commands writing at the same moment
    are out of scope for INIT-0001. The spec describes one person running one
    command at a time.

## Options considered

| Option | Why not |
| --- | --- |
| Leave these details to each story's implementer | Ten stories, possibly built in parallel, would each choose differently. The tool would then be inconsistent, for example tags shown in one order by `list` and another after `import`. |
| Ask the requester each detail | The requester said the spec is complete and to decide everything inside it (`PD-0001` item 1). Asking would go against that instruction. |
| Reuse a deleted task's id | A script, or the user's memory, could act on the wrong task after a delete. Never reusing ids costs nothing visible. |
| `import` merges into the current list | Merging needs rules for clashing ids that the spec never mentions. "All or nothing" reads most simply as replacing the whole list. |
| `list` shows every task by default | An open task is the one a person acts on. With `--all` available, the default view stays short. |

## Consequences

**Costs.**

- **Fixed text.** Every message above is fixed. Changing one later needs a
  new `PD-` that supersedes this one. Tests will assert the exact text.
- **No way to change a due date.** A user who wants to change or clear a due
  date after `add` has no command for it. The spec defines none, and adding
  one would be an eleventh story.
- **Import replaces.** It discards tasks that are not in the file. The command
  does not warn first.
- **No concurrent writes.** Two `ttc` processes writing at the same moment can
  lose one write. Atomic writes still keep the file whole.

**Benefits.**

- **Consistent stories.** Every story's Behavior and acceptance criteria cite
  one rule set, so stories built in parallel behave alike.
- **Testable.** Each rule gives a reviewer a pass/fail check without asking
  anyone what was meant.

> Once `status: accepted`, this body is never rewritten. A change of mind is a
> new decision with `supersedes: PD-0002`.
