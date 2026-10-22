# task-tracker-cli

Task tracker CLI. Node.js, built-in libraries only.

Install from a clone with `npm install --global .`, then run `ttc help`.
`npm test` runs the whole suite (unit tests, then the perf check).
`npm run test:perf` runs only the perf check (median `ttc add` / `ttc list` time on 10,000 tasks, must be under 500 ms).
`npm run lint` checks every source and test file for syntax errors.

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
