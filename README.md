# task-tracker-cli

Task tracker CLI. Node.js, built-in libraries only.

Install from a clone with `npm install --global .`, then run `ttc help`.
`npm test` runs the whole suite (unit tests, then the perf check).
`npm run test:perf` runs only the perf check (median `ttc add`, `ttc list` and filtered `ttc list` time on 10,000 tasks, must be under 500 ms).
`npm run lint` checks every source and test file for syntax errors.

## Task notes

Each task can have one note. It is optional and one line long. A note follows the same rules as a title: spaces are trimmed from both ends of typed text, the note cannot be empty, and it cannot contain a line break or a control character.

```
ttc add "<title>" [--due YYYY-MM-DD] [--tag <t>]... [--note "<text>"] [--important]
ttc note <id> ["<text>" | --clear]
```

- `ttc add ... --note "<text>"`: adds the task with that note. Without `--note` the task has no note.
- `ttc note <id>`: prints the note, or `Task <id> has no note` when there is none. It never changes anything.
- `ttc note <id> "<text>"`: sets the note, replacing any earlier one, and prints `Set note on task <id>`.
- `ttc note <id> --clear`: removes the note and prints `Cleared note on task <id>`. On a task with no note it is a no-op: it prints `Task <id> has no note` and changes nothing.
- Giving both text and `--clear` is an error.

Notes are not shown in `ttc list` lines or in `ttc stats`. `--search` matches them (see below), and `ttc export` includes them.

## Important tasks

A task can be marked important. A new task is not important unless you say so.

```
ttc add "<title>" [--due YYYY-MM-DD] [--tag <t>]... [--note "<text>"] [--important]
ttc important <id>
ttc unimportant <id>
```

- `ttc add ... --important`: adds the task already marked important. Without `--important` the task is not important.
- `ttc important <id>`: marks the task and prints `Marked task <id> as important`. On a task that is already important it is a no-op: it prints `Task <id> is already important` and changes nothing.
- `ttc unimportant <id>`: removes the mark and prints `Removed important mark from task <id>`. On a task that is not important it is a no-op: it prints `Task <id> is not important` and changes nothing.
- Both commands work on open and done tasks.
- The mark stays through `done`, `reopen`, `rename`, `tag` and `note`.

## Listing and filtering tasks

```
ttc list [--open|--done|--all|--overdue] [--tag <t>] [--due-from YYYY-MM-DD] [--due-to YYYY-MM-DD] [--search <text>]
```

- Status view: `--open` (the default), `--done`, `--all` or `--overdue`. Give at most one of them.
- `--tag <t>`: only tasks with that tag.
- `--due-from YYYY-MM-DD`: only tasks due on or after that date.
- `--due-to YYYY-MM-DD`: only tasks due on or before that date. The range is inclusive at both ends, and either option works alone as an open-ended range.
- `--search <text>`: only tasks whose title or note contains the text. The match is a literal substring, ignoring upper and lower case. There are no wildcards and no regular expressions. An empty text is an error.

Important tasks come first, then the others; inside each group tasks are in ascending id order. This holds in every view and with every filter. An important task's line has the token `!important` after `!overdue` (when present) and before the tags, for example `#2 [ ] Pay rent due:2000-01-02 !overdue !important +home`.

Every option can be given at most once. All options combine with AND: a task is listed only if it passes every option given. When `--due-from` or `--due-to` is given, tasks with no due date are left out.

Example: `ttc list --all --due-from 2026-01-01 --due-to 2026-01-31 --search rent` lists every task, open or done, due in January 2026 whose title or note contains "rent".

## Exporting tasks

```
ttc export [<file>] [--format json|csv] [--open|--done|--all|--overdue] [--tag <t>] [--due-from YYYY-MM-DD] [--due-to YYYY-MM-DD] [--search <text>]
```

- `[<file>]`: where to write the export. Optional. Without it, the export goes to standard output.
- `--format json|csv`: the output format. The default is `json`. The value is case-sensitive; anything else is an error.
- `--open`, `--done`, `--all`, `--overdue`, `--tag`, `--due-from`, `--due-to` and `--search` mean the same as for `ttc list` (see "Listing and filtering tasks" above), and combine with AND in the same way.

Unlike `ttc list`, the default status for `ttc export` is `--all`. So `ttc export <file>` still exports the whole list, open and done tasks alike.

### Standard output or a file

- No file: only the exported content is written to standard output. Nothing else is printed and no file is written. `-` is not a stdout alias; it is an ordinary file name.
- With a file: the file is written atomically. The path is relative to the current folder, an existing file is replaced, and a missing parent folder is an error. Then `Exported <n> tasks to <file>` is printed, where `<n>` is the number of tasks written.
- A bad option, an invalid filter or a write failure prints one `ttc: ` line, writes nothing to standard output and changes no file.

### JSON format

The same format as `tasks.json`, holding only the matching tasks. Notes and important marks are included (format version 4). It keeps the list's own next id and the stored order of the tasks. `ttc export <file>` with no other option writes the whole list, the same bytes as a plain backup.

### CSV format

- Header line `id,title,status,due,tags,note`, then one row per matching task in ascending id order.
- `status` is `open` or `done`. `due` is `YYYY-MM-DD`, or empty when the task has no due date. `tags` are in alphabetical order, separated by single spaces. `note` is the task's note, or empty when the task has none.
- A field is quoted (RFC 4180) only when it contains a comma, a double quote or a line break; inner double quotes are doubled.
- Every line, the last one included, ends with CRLF. The text is UTF-8 without a BOM.
- With no matching task, only the header line is written.

Example: `ttc export --format csv --tag home --open` prints

```
id,title,status,due,tags,note
1,"Pay ""rent"", now",open,2026-01-15,bills home,"bank transfer, ref 7"
4,Buy milk,open,,home,
```

### Cautions

- A filtered JSON export is a valid import file. Importing it with `ttc import` replaces the whole list with only those tasks; import never merges. `ttc import` does not read CSV.
- Values are written as stored. A spreadsheet may treat a CSV cell that starts with `=`, `+`, `-` or `@` as a formula, so check a file from an untrusted source before opening it there.

## Data file format

`tasks.json` is format version 4:

```
{ "version": 4, "nextId": <int>, "tasks": [ { "id", "title", "status", "due", "tags", "note", "important" } ] }
```

`note` is a string or `null`. `important` is `true` or `false`; any other value, or a missing `important`, makes the file invalid.

- Files written by older ttc (versions 1, 2 and 3) are read as-is by read-only commands, with no task important, and rewritten as version 4 by the next changing command.
- `ttc import` accepts versions 1, 2, 3 and 4.
- After the first change, an older ttc can no longer read `tasks.json` or a new JSON export: no command writes an older version.
- A file from a newer ttc is refused with one `ttc: cannot read` line and left unchanged.

## Exit codes

- `0`: the command did what was asked. This includes `ttc help`, `No tasks.`, and repeated or no-op actions (for example `done` on a task that is already done).
- `1`: every failure. ttc then prints exactly one line to stderr, `ttc: <message>`, prints nothing to stdout, and never shows a stack trace. If stderr itself cannot be written, ttc exits 1 silently.

The failures that exit 1:

- bad command line (unknown command, wrong or missing arguments)
- no such task
- data file unreadable or invalid, including a file written by a newer ttc
- cannot write (the data file or an export file)
- data file busy: another ttc command still holds it after a 10-second wait
- output could not be written (for example stdout closed by `head`)

A failure changes no stored data, with one exception. When a changing command has already saved its change and then cannot print its confirmation line (stdout closed), it exits 1, but the change was already saved and is not undone; `ttc list` shows it. Every failure found before the save changes nothing.

A ttc process ended by a signal (Ctrl-C, `kill`) gets the shell's signal status (for example 130 after Ctrl-C, 143 after `kill`), not 1.
