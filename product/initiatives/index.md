# Initiative index

Every initiative, in any status. `active` and `blocked` initiatives also appear
on [the delivery board](../delivery/board.md); `shipped` initiatives stay listed
here and remain in place on disk.

| ID | Title | Status | Path | Updated |
| --- | --- | --- | --- | --- |
| INIT-0001 | Tasks are tracked locally from the ttc command line | active | [INIT-0001-ttc-command-line-task-tracker/initiative.md](INIT-0001-ttc-command-line-task-tracker/initiative.md) | 2026-10-20 |
| INIT-0002 | Important tasks are marked and listed first | active | [INIT-0002-important-tasks-first/initiative.md](INIT-0002-important-tasks-first/initiative.md) | 2026-10-26 |

To create one: allocate `INIT-nnnn` from `../manifest.yaml`, copy
`../templates/initiative.md` into `INIT-nnnn-<slug>/initiative.md`, create
`delivery/state.md` from `../templates/delivery-state.md`, and add the row here
— all in one commit.
