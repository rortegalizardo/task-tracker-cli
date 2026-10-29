---
id: ACC-INIT-0006
type: acceptance
initiative: INIT-0006
checked_on: 2026-10-29
checkout: origin/main 4b017d0cdb21a44807294aa7ce2d73bccbb212e0 (clean worktree)
---

# Acceptance checks, INIT-0006

Real `ttc` from a clean checkout of the merged default branch (`node bin/ttc.js`, fresh `$TTC_HOME` per group, no build step). CSV output ends each line with CRLF, the documented behaviour from before this initiative (README, "Exporting tasks"). Quoted `stdout`/`stderr` are verbatim.

| REQ | criterion | command | observed output | pass/fail |
| --- | --- | --- | --- | --- |
| REQ-0015 | AC-1: list --no-due / --open --no-due on seeded data | `ttc list --no-due` | stdout="#5 [ ] Water plants !important\n#2 [ ] Call mom +home\n" stderr="" rc=0 tasks.json unchanged=true | pass |
| REQ-0015 | AC-1: list --no-due / --open --no-due on seeded data | `ttc list --open --no-due` | stdout="#5 [ ] Water plants !important\n#2 [ ] Call mom +home\n" stderr="" rc=0 tasks.json unchanged=true | pass |
| REQ-0015 | AC-2: --done / --all with --no-due | `ttc list --done --no-due` | stdout="#4 [x] Fix bike +home\n" stderr="" rc=0 tasks.json unchanged=true | pass |
| REQ-0015 | AC-2: --done / --all with --no-due | `ttc list --all --no-due` | stdout="#5 [ ] Water plants !important\n#2 [ ] Call mom +home\n#4 [x] Fix bike +home\n" stderr="" rc=0 tasks.json unchanged=true | pass |
| REQ-0015 | AC-3: --no-due with --tag, --search | `ttc list --no-due --tag home` | stdout="#2 [ ] Call mom +home\n" stderr="" rc=0 tasks.json unchanged=true | pass |
| REQ-0015 | AC-3: --no-due with --tag, --search | `ttc list --tag home --all --no-due` | stdout="#2 [ ] Call mom +home\n#4 [x] Fix bike +home\n" stderr="" rc=0 tasks.json unchanged=true | pass |
| REQ-0015 | AC-3: --no-due with --tag, --search | `ttc list --search plant --no-due` | stdout="#5 [ ] Water plants !important\n" stderr="" rc=0 tasks.json unchanged=true | pass |
| REQ-0015 | AC-3: --no-due with --tag, --search | `ttc list --no-due --tag bills` | stdout="No tasks.\n" stderr="" rc=0 tasks.json unchanged=true | pass |
| REQ-0015 | AC-4: no-due empty result, missing home writes nothing | `ttc list --no-due` | stdout="No tasks.\n" stderr="" rc=0 tasks.json unchanged=true | pass |
| REQ-0015 | AC-4: no-due empty result, missing home writes nothing | `TTC_HOME=<nonexistent> ttc list --no-due` | stdout="No tasks.\n" stderr="" rc=0 home exists=false | pass |
| REQ-0015 | AC-5 v1: format 1 file read, left unchanged | `ttc list --no-due` | stdout="#2 [ ] Call mom\n" stderr="" rc=0 tasks.json unchanged=true | pass |
| REQ-0015 | AC-5 v3: format 3 file read, left unchanged | `ttc list --all --no-due` | stdout="#1 [ ] Call mom\n#3 [x] Fix bike +home\n" stderr="" rc=0 tasks.json unchanged=true | pass |
| REQ-0015 | AC-6: refusal with --overdue, --due-from, --due-to | `ttc list --no-due --overdue` | stdout="" stderr="ttc: options cannot be combined: --overdue --no-due\n" rc=1 tasks.json unchanged=true | pass |
| REQ-0015 | AC-6: refusal with --overdue, --due-from, --due-to | `ttc list --overdue --no-due` | stdout="" stderr="ttc: options cannot be combined: --overdue --no-due\n" rc=1 tasks.json unchanged=true | pass |
| REQ-0015 | AC-6: refusal with --overdue, --due-from, --due-to | `ttc list --no-due --due-from 2026-01-01` | stdout="" stderr="ttc: options cannot be combined: --no-due --due-from\n" rc=1 tasks.json unchanged=true | pass |
| REQ-0015 | AC-6: refusal with --overdue, --due-from, --due-to | `ttc list --due-to 2026-01-31 --no-due` | stdout="" stderr="ttc: options cannot be combined: --no-due --due-to\n" rc=1 tasks.json unchanged=true | pass |
| REQ-0015 | AC-6: refusal with --overdue, --due-from, --due-to | `ttc list --no-due --due-from 2026-01-01 --due-to 2026-01-31` | stdout="" stderr="ttc: options cannot be combined: --no-due --due-from --due-to\n" rc=1 tasks.json unchanged=true | pass |
| REQ-0015 | AC-6: refusal with --overdue, --due-from, --due-to | `ttc list --due-to 2026-01-31 --due-from 2026-01-01 --no-due --overdue` | stdout="" stderr="ttc: options cannot be combined: --overdue --no-due --due-from --due-to\n" rc=1 tasks.json unchanged=true | pass |
| REQ-0015 | AC-6: refusal with --overdue, --due-from, --due-to | `ttc export --no-due --overdue` | stdout="" stderr="ttc: options cannot be combined: --overdue --no-due\n" rc=1 tasks.json unchanged=true | pass |
| REQ-0015 | AC-6: refusal with --overdue, --due-from, --due-to | `ttc export --format csv --due-to 2026-01-31 --no-due` | stdout="" stderr="ttc: options cannot be combined: --no-due --due-to\n" rc=1 tasks.json unchanged=true | pass |
| REQ-0015 | AC-6: refusal with --overdue, --due-from, --due-to | `ttc export /var/folders/r4/gnw7zjm97xx1frxjw6gkw2sh0000gn/T/ttcacc-dir-WomRxY/undated.json --no-due --due-from 2026-01-01` | stdout="" stderr="ttc: options cannot be combined: --no-due --due-from\n" rc=1 tasks.json unchanged=true file exists=false | pass |
| REQ-0015 | AC-7: check order and other errors | `ttc list --no-due --no-due` | stdout="" stderr="ttc: option given twice: --no-due\n" rc=1 tasks.json unchanged=true | pass |
| REQ-0015 | AC-7: check order and other errors | `ttc list --no-due home` | stdout="" stderr="ttc: unexpected argument: home\n" rc=1 tasks.json unchanged=true | pass |
| REQ-0015 | AC-7: check order and other errors | `ttc list --no-due --overdue --bogus` | stdout="" stderr="ttc: unknown option: --bogus\n" rc=1 tasks.json unchanged=true | pass |
| REQ-0015 | AC-7: check order and other errors | `ttc list --overdue --no-due --due-from` | stdout="" stderr="ttc: option needs a value: --due-from\n" rc=1 tasks.json unchanged=true | pass |
| REQ-0015 | AC-7: check order and other errors | `ttc export --format xml --no-due --overdue` | stdout="" stderr="ttc: invalid format: xml (use json or csv)\n" rc=1 tasks.json unchanged=true | pass |
| REQ-0015 | AC-7: check order and other errors | `ttc list --done --overdue --no-due` | stdout="" stderr="ttc: options cannot be combined: --done --overdue\n" rc=1 tasks.json unchanged=true | pass |
| REQ-0015 | AC-7: check order and other errors | `ttc list --no-due --tag "a b" --overdue` | stdout="" stderr="ttc: options cannot be combined: --overdue --no-due\n" rc=1 tasks.json unchanged=true | pass |
| REQ-0015 | AC-7: check order and other errors | `ttc list --no-due --due-from 2026-02-30` | stdout="" stderr="ttc: options cannot be combined: --no-due --due-from\n" rc=1 tasks.json unchanged=true | pass |
| REQ-0015 | AC-7: check order and other errors | `ttc list --no-due --due-from 2026-02-01 --due-to 2026-01-01` | stdout="" stderr="ttc: options cannot be combined: --no-due --due-from --due-to\n" rc=1 tasks.json unchanged=true | pass |
| REQ-0015 | AC-7: check order and other errors | `ttc list --no-due --overdue --search ""` | stdout="" stderr="ttc: options cannot be combined: --overdue --no-due\n" rc=1 tasks.json unchanged=true | pass |
| REQ-0015 | AC-7: check order and other errors | `ttc list --no-due --tag "a b"` | stdout="" stderr="ttc: invalid tag: a b\n" rc=1 tasks.json unchanged=true | pass |
| REQ-0015 | AC-7: check order and other errors | `ttc list --no-due --search ""` | stdout="" stderr="ttc: --search text must not be empty\n" rc=1 tasks.json unchanged=true | pass |
| REQ-0015 | AC-7 corrupt: unreadable file: refusal first, else cannot read | `ttc list --no-due --overdue` | stdout="" stderr="ttc: options cannot be combined: --overdue --no-due\n" rc=1 tasks.json unchanged=true | pass |
| REQ-0015 | AC-7 corrupt: unreadable file: refusal first, else cannot read | `ttc list --no-due` | stdout="" stderr="ttc: cannot read /var/folders/r4/gnw7zjm97xx1frxjw6gkw2sh0000gn/T/ttcacc-h2ppmF/tasks.json: not valid JSON\n" rc=1 unchanged=true | pass |
| REQ-0015 | AC-7 corrupt: unreadable file: refusal first, else cannot read | `ttc export --no-due` | stdout="" stderr="ttc: cannot read /var/folders/r4/gnw7zjm97xx1frxjw6gkw2sh0000gn/T/ttcacc-h2ppmF/tasks.json: not valid JSON\n" rc=1 unchanged=true | pass |
| REQ-0015 | AC-8: export --no-due json, csv, file | `ttc export --no-due` | version=4 nextId=6 tasks=[{"id":2,"title":"Call mom","status":"open","due":null,"tags":["home"],"note":null,"important":false},{"id":4,"title":"Fix bike","status":"done","due":null,"tags":["home"],"note":null,"important":false},{"id":5,"title":"Water plants","status":"open","due":null,"tags":[],"note":null,"important":true}] rc=0 | pass |
| REQ-0015 | AC-8: export --no-due json, csv, file | `ttc export --format csv --no-due` | stdout="id,title,status,due,tags,note\r\n2,Call mom,open,,home,\r\n4,Fix bike,done,,home,\r\n5,Water plants,open,,,\r\n" stderr="" rc=0 tasks.json unchanged=true | pass |
| REQ-0015 | AC-8: export --no-due json, csv, file | `ttc export --open --no-due --format csv` | stdout="id,title,status,due,tags,note\r\n2,Call mom,open,,home,\r\n5,Water plants,open,,,\r\n" stderr="" rc=0 tasks.json unchanged=true | pass |
| REQ-0015 | AC-8: export --no-due json, csv, file | `ttc export <dir>/undated.json --no-due` | stdout="Exported 3 tasks to /var/folders/r4/gnw7zjm97xx1frxjw6gkw2sh0000gn/T/ttcacc-dir-WomRxY/undated.json\n" rc=0 file equals stdout export=true unchanged=true | pass |
| REQ-0015 | AC-9: today's views unchanged | `ttc list` | stdout="#5 [ ] Water plants !important\n#1 [ ] Pay rent due:2000-01-02 !overdue +bills\n#2 [ ] Call mom +home\n#3 [ ] Plan trip due:2099-05-01\n" stderr="" rc=0 tasks.json unchanged=true | pass |
| REQ-0015 | AC-9: today's views unchanged | `ttc list --all` | stdout="#5 [ ] Water plants !important\n#1 [ ] Pay rent due:2000-01-02 !overdue +bills\n#2 [ ] Call mom +home\n#3 [ ] Plan trip due:2099-05-01\n#4 [x] Fix bike +home\n" stderr="" rc=0 tasks.json unchanged=true | pass |
| REQ-0015 | AC-9: today's views unchanged | `ttc list --done` | stdout="#4 [x] Fix bike +home\n" stderr="" rc=0 tasks.json unchanged=true | pass |
| REQ-0015 | AC-9: today's views unchanged | `ttc list --overdue` | stdout="#1 [ ] Pay rent due:2000-01-02 !overdue +bills\n" stderr="" rc=0 tasks.json unchanged=true | pass |
| REQ-0015 | AC-9: today's views unchanged | `ttc list --due-from 2000-01-01` | stdout="#1 [ ] Pay rent due:2000-01-02 !overdue +bills\n#3 [ ] Plan trip due:2099-05-01\n" stderr="" rc=0 tasks.json unchanged=true | pass |
| REQ-0015 | AC-9: today's views unchanged | `ttc list --tag home` | stdout="#2 [ ] Call mom +home\n" stderr="" rc=0 tasks.json unchanged=true | pass |
| REQ-0015 | AC-9: today's views unchanged | `ttc list --search plant` | stdout="#5 [ ] Water plants !important\n" stderr="" rc=0 tasks.json unchanged=true | pass |
| REQ-0015 | AC-9: today's views unchanged | `ttc export --format csv` | stdout="id,title,status,due,tags,note\r\n1,Pay rent,open,2000-01-02,bills,\r\n2,Call mom,open,,home,\r\n3,Plan trip,open,2099-05-01,,\r\n4,Fix bike,done,,home,\r\n5,Water plants,open,,,\r\n" stderr="" rc=0 tasks.json unchanged=true | pass |
| REQ-0015 | AC-9: today's views unchanged | `ttc stats` | stdout="open: 4\ndone: 1\noverdue: 1\n" stderr="" rc=0 tasks.json unchanged=true | pass |
| REQ-0015 | AC-9: today's views unchanged | `ttc list --done --overdue` | stdout="" stderr="ttc: options cannot be combined: --done --overdue\n" rc=1 tasks.json unchanged=true | pass |
| REQ-0015 | AC-10: help usage lines | `ttc help` | stdout="Usage:\n  ttc help\n  ttc add \"<title>\" [--due YYYY-MM-DD] [--tag <t>]... [--note \"<text>\"] [--important]\n  ttc copy <id> [--due YYYY-MM-DD]\n  ttc list [--open\|--done\|--all\|--overdue] [--no-due] [--tag <t>] [--due-from YYYY-MM-DD] [--due-to YYYY-MM-DD] [--search <text>]\n  ttc done <id>\n  ttc reopen <id>\n  ttc important <id>\n  ttc unimportant <id>\n  ttc postpone <id>\n  ttc rename <id> \"<title>\"\n  ttc delete <id>\n  ttc clean\n  ttc tag <id> +<t> \| -<t>\n  ttc note <id> [\"<text>\" \| --clear]\n  ttc export [<file>] [--format json\|csv] [--open\|--done\|--all\|--overdue] [--no-due] [--tag <t>] [--due-from YYYY-MM-DD] [--due-to YYYY-MM-DD] [--search <text>]\n  ttc import <file>\n  ttc stats\n" stderr="" rc=0 | pass |
| REQ-0015 | AC-11: README documents --no-due | `grep README.md` | missing strings: none; lines mentioning --no-due: 5 | pass |
| REQ-0015 | AC-12: tests, lint and CI check pass | `npm test (unit then perf) at origin/main 4b017d0` | unit: tests pass 516, fail 0; perf: pass 4, fail 0; ttc list median 83.2 ms, filtered 80.1 ms, add 104.5 ms (limit 500 ms) | pass |
| REQ-0015 | AC-12: tests, lint and CI check pass | `npm run lint` | check-syntax: 67 files OK | pass |
| REQ-0015 | AC-12: tests, lint and CI check pass | `gh pr checks 42` | test pass 55s (actions run 40934656513) | pass |

Result: 55 rows, 0 fail.
