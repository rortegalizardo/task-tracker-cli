# Acceptance — INIT-0005

Checked 2026-10-29 on a clean worktree of `origin/main` at `e42cd95` (merge of PR #38, RCDEV-859/T4). No build step (Node, built-in libraries only); run with `node bin/ttc.js`, each case in a fresh `$TTC_HOME`. Script: `.scratch/accept.sh` (not committed).

| REQ | criterion | command | observed output | pass/fail |
| --- | --- | --- | --- | --- |
| REQ-0014 | AC-1 | add Pay rent (due 2099-10-01, tags home bills, note, important), add Buy milk, done 1, export before.json, `ttc copy 1`, export after.json | `Copied task 1 as task 3` (rc 0, stderr empty); after version 4 nextId 4; tasks 1–2 deepEqual before; task 3 `{"id":3,"title":"Pay rent","status":"open","due":"2099-10-01","tags":["home","bills"],"note":"by card","important":true}`; task 1 still `done` | pass |
| REQ-0014 | AC-2 | `ttc list` after AC-1 | `#3 [ ] Pay rent due:2099-10-01 !important +bills +home` / `#2 [ ] Buy milk` (rc 0) | pass |
| REQ-0014 | AC-3 | add Pay rent --due 2020-01-01 --tag bills; `copy 1 --due 2099-11-01`; `copy --due 9999-12-31 1`; `copy 1 --due 2021-06-01`; `list --all` | `Copied task 1 as task 2` / `…as task 3` / `…as task 4` (rc 0 each); list: `#1 [ ] Pay rent due:2020-01-01 !overdue +bills`, `#2 [ ] Pay rent due:2099-11-01 +bills`, `#3 [ ] Pay rent due:9999-12-31 +bills`, `#4 [ ] Pay rent due:2021-06-01 !overdue +bills` | pass |
| REQ-0014 | AC-4 | add Pay rent --due 2020-01-01; `copy 1`; `list --overdue` | `Copied task 1 as task 2` (rc 0); `#1 [ ] Pay rent due:2020-01-01 !overdue` / `#2 [ ] Pay rent due:2020-01-01 !overdue` | pass |
| REQ-0014 | AC-5 | add Call mom; `copy 1`; `copy 1 --due 2099-01-01`; `list` | `Copied task 1 as task 2`, `Copied task 1 as task 3` (rc 0); `#1 [ ] Call mom` / `#2 [ ] Call mom` / `#3 [ ] Call mom due:2099-01-01` | pass |
| REQ-0014 | AC-6 | add 3 tasks; `delete 3`; `copy 002`; `add "Water plants"` | `Copied task 2 as task 4` (rc 0); `Added task 5` | pass |
| REQ-0014 | AC-7 | tasks.json version 4, nextId 9007199254740992, one task; `ttc copy 1` | stderr `ttc: no task id is left`, stdout empty, rc 1, `cmp` byte-identical | pass |
| REQ-0014 | AC-8 | task 1 stored; `copy`; `copy 1 2`; `copy 1 --tag x`; `copy 1 --due`; `copy 1 --due 2099-01-01 --due 2099-01-02` | rc 1 each, stdout empty; stderr `ttc: missing argument: <id>`, `ttc: unexpected argument: 2`, `ttc: unknown option: --tag`, `ttc: option needs a value: --due`, `ttc: option given twice: --due`; `cmp` byte-identical | pass |
| REQ-0014 | AC-9 | task 1 stored; six refusal cases | rc 1 each, stdout empty; `ttc: invalid task id: abc`, `ttc: no task with id 9`, `ttc: invalid date: 2026-02-30`, `ttc: invalid date: 10000-01-01`, `ttc: invalid task id: abc`, `ttc: invalid date: 2026-02-30`; `cmp` byte-identical | pass |
| REQ-0014 | AC-10 | `$TTC_HOME` absent; `ttc copy 1` | stderr `ttc: no task with id 1`, stdout empty, rc 1; folder absent afterwards | pass |
| REQ-0014 | AC-11 | tasks.json `not json`; `ttc copy 1` | rc 1, stdout empty, stderr `ttc: cannot read <path>/tasks.json: not valid JSON`; `cmp` byte-identical | pass |
| REQ-0014 | AC-12 | version 3 file (task 1 done); `copy 5`; `copy 1`; `export out.json` | `ttc: no task with id 5` rc 1, byte-identical; `Copied task 1 as task 2` rc 0; `"version": 4` count 1; export nextId 3, tasks 1 (done) and 2 (open) as specified, `important:false` | pass |
| REQ-0014 | AC-13 | `ttc help` | `Usage:` then 17 indented lines, `ttc copy <id> [--due YYYY-MM-DD]` second after `ttc add …`, all in the specified order; rc 0 | pass |
| REQ-0014 | AC-14 | README.md "Copying a task" section | section at line 43 documents `ttc copy <id> [--due YYYY-MM-DD]`, copied fields, open, new id, `--due` same rule as `add`, `Copied task <id> as task <new-id>`, the three refusals, only the new task added; no copy-then-delete text (no "delet" match) | pass |
| REQ-0014 | AC-15 | `npm test`; PR #38 CI | unit `ℹ tests 508 / ℹ pass 508 / ℹ fail 0`; perf `ℹ tests 4 / ℹ pass 4 / ℹ fail 0`; `gh pr checks 38`: `test pass 53s` | pass |
