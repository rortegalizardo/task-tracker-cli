# Acceptance — INIT-0004

Checked 2026-10-28 on a clean worktree of `origin/main` at `d0274b6` (merge of PR #34, RCDEV-858). No build step (Node, built-in libraries only); run with `node bin/ttc.js`, each case in a fresh `$TTC_HOME`. Script: `.scratch/accept.sh` (not committed).

| REQ | criterion | command | observed output | pass/fail |
| --- | --- | --- | --- | --- |
| REQ-0013 | AC-1 | add Pay rent --important, Buy milk, Call mom; done 1; done 3; `ttc clean`; `list --done`; `list --all`; `stats` | `Removed 2 done tasks` (rc 0, no stderr); `No tasks.`; `#2 [ ] Buy milk`; `open: 1` `done: 0` `overdue: 0` | pass |
| REQ-0013 | AC-2 | three tasks with due/tag/note/important; done 3; `export before.json`; `ttc clean`; `export after.json` | `Removed 1 done tasks` (rc 0); before tasks 1,2,3 version 4 nextId 4; after tasks 1,2 version 4 nextId 4; `deepEqual(after, before minus task 3): true` | pass |
| REQ-0013 | AC-3 | add 3 tasks; done 1,2,3; `ttc clean`; `add "New task"`; `list --all` | `Removed 3 done tasks`; `Added task 4`; `#4 [ ] New task` | pass |
| REQ-0013 | AC-4 | one open task; `ttc clean` | `Removed 0 done tasks` (rc 0, no stderr); `tasks.json` byte-identical (`cmp`) | pass |
| REQ-0013 | AC-5 | `$TTC_HOME` absent; `ttc clean` | `Removed 0 done tasks` (rc 0); folder absent afterwards | pass |
| REQ-0013 | AC-6 | version 3 file, nextId 5, task 1 done, task 2 open; `ttc clean`; `list --all`; `add "Call mom"` | `Removed 1 done tasks` (rc 0); `"version": 4`; `#2 [ ] Buy milk`; `Added task 5` | pass |
| REQ-0013 | AC-7 | version 3 file, one open task; `ttc clean` | `Removed 0 done tasks` (rc 0); `tasks.json` byte-identical (`cmp`) | pass |
| REQ-0013 | AC-8 | task 1 open, task 2 done; `clean 2`, `clean --all`, `clean --done` | `ttc: unexpected argument: 2` / `ttc: unknown option: --all` / `ttc: unknown option: --done`; each rc 1, stdout empty, `tasks.json` byte-identical | pass |
| REQ-0013 | AC-9 | `tasks.json` = `not json`; `ttc clean` | `ttc: cannot read <home>/tasks.json: not valid JSON` (rc 1, stdout empty); `tasks.json` byte-identical | pass |
| REQ-0013 | AC-10 | `ttc help` | `Usage:` then 16 lines, two-space indent, in the required order, `  ttc clean` between `  ttc delete <id>` and `  ttc tag <id> +<t> \| -<t>`; rc 0 | pass |
| REQ-0013 | AC-11 | read README.md | section `## Cleaning out done tasks`: removes every done task for good; prints `Removed <n> done tasks`; asks no confirmation; `ttc list --done` shows what will be removed, `ttc reopen <id>` keeps a task, `ttc export <file> --done` keeps a copy | pass |
| REQ-0013 | AC-12 | `npm test`; PR #34 checks | `npm run test:unit`: `tests 498`, `pass 498`, `fail 0`; perf: 4 pass, medians 70.3 / 67.2 / 88.2 ms (limit 500); `gh pr checks 34`: `test pass` | pass |
