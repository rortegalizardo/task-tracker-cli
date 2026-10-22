# task-tracker-cli

Task tracker CLI. Node.js, built-in libraries only.

Install from a clone with `npm install --global .`, then run `ttc help`.
`npm test` runs the whole suite (unit tests, then the perf check).
`npm run test:perf` runs only the perf check (median `ttc add`, `ttc list` and filtered `ttc list` time on 10,000 tasks, must be under 500 ms).
`npm run lint` checks every source and test file for syntax errors.

## Listing and filtering tasks

```
ttc list [--open|--done|--all|--overdue] [--tag <t>] [--due-from YYYY-MM-DD] [--due-to YYYY-MM-DD] [--search <text>]
```

- Status view: `--open` (the default), `--done`, `--all` or `--overdue`. Give at most one of them.
- `--tag <t>`: only tasks with that tag.
- `--due-from YYYY-MM-DD`: only tasks due on or after that date.
- `--due-to YYYY-MM-DD`: only tasks due on or before that date. The range is inclusive at both ends, and either option works alone as an open-ended range.
- `--search <text>`: only tasks whose title contains the text. The match is a literal substring, ignoring upper and lower case. There are no wildcards and no regular expressions. An empty text is an error.

Every option can be given at most once. All options combine with AND: a task is listed only if it passes every option given. When `--due-from` or `--due-to` is given, tasks with no due date are left out.

Example: `ttc list --all --due-from 2026-01-01 --due-to 2026-01-31 --search rent` lists every task, open or done, due in January 2026 whose title contains "rent".

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
