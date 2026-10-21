# task-tracker-cli

Task tracker CLI. Node.js, built-in libraries only.

Install from a clone with `npm install --global .`, then run `ttc help`.
`npm test` runs the whole suite (unit tests, then the perf check).
`npm run test:perf` runs only the perf check (median `ttc add` / `ttc list` time on 10,000 tasks, must be under 500 ms).
`npm run lint` checks every source and test file for syntax errors.
