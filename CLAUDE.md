# AdMatch

Read AGENTS.md for project instructions, architecture constraints, and verification commands. Read README.md for the demo guide and functional limitations.

Install and start with:

```sh
node scripts/run-local.mjs
```

For a non-blocking setup use `node scripts/run-local.mjs --setup-only`. Then run `npm run check` and `npm run test:integration`. The integration command uses disposable data; do not reset the user's database as part of installation or testing.
