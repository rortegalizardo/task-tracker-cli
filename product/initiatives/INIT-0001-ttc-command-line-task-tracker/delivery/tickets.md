# Ticket manifest — INIT-0001

synced_on: 2026-10-20
freshness_window: 24h

Tracker tickets for INIT-0001, created from its accepted stories at HANDOFF
(Linear team RC Development, project Task Tracker CLI). The `Requirements`
column is the only authoritative story-to-ticket mapping. The global union is
`product/delivery/tickets.md`.

| Ticket | Title | Initiative | Requirements | Depends on | Branch | PR | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| RCDEV-822 | The ttc command prints its usage and keeps tasks in one atomically written file | INIT-0001 | REQ-0001 |  |  |  | Backlog |
| RCDEV-823 | The ttc add command records a task with an optional due date and tags | INIT-0001 | REQ-0002 | RCDEV-822 |  |  | Backlog |
| RCDEV-824 | The ttc list command shows tasks by status and tag, one line each, in id order | INIT-0001 | REQ-0003 | RCDEV-822, RCDEV-823 |  |  | Backlog |
| RCDEV-825 | The ttc done and ttc reopen commands change a task's status | INIT-0001 | REQ-0004 | RCDEV-822, RCDEV-823, RCDEV-824 |  |  | Backlog |
| RCDEV-826 | The ttc rename command changes a task's title | INIT-0001 | REQ-0005 | RCDEV-822, RCDEV-823, RCDEV-824 |  |  | Backlog |
| RCDEV-827 | The ttc delete command removes a task and its id is never reused | INIT-0001 | REQ-0006 | RCDEV-822, RCDEV-823, RCDEV-824 |  |  | Backlog |
| RCDEV-828 | The ttc list command marks overdue tasks and can show only them | INIT-0001 | REQ-0007 | RCDEV-822, RCDEV-823, RCDEV-824, RCDEV-825 |  |  | Backlog |
| RCDEV-829 | The ttc tag command adds or removes one tag on a task | INIT-0001 | REQ-0008 | RCDEV-822, RCDEV-823, RCDEV-824 |  |  | Backlog |
| RCDEV-830 | The ttc export and ttc import commands copy the whole list to and from a file, and a file that fails validation changes nothing | INIT-0001 | REQ-0009 | RCDEV-822, RCDEV-823, RCDEV-824 |  |  | Backlog |
| RCDEV-831 | The ttc stats command prints the totals of open, done and overdue tasks | INIT-0001 | REQ-0010 | RCDEV-822, RCDEV-823, RCDEV-824, RCDEV-825, RCDEV-828 |  |  | Backlog |

Empty `Depends on` = on the executable frontier. Tracker keys verbatim.
Status is advisory once older than `freshness_window`.
