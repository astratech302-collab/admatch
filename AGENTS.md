# AdMatch: instructions for coding agents

This is a local Next.js/TypeScript demo with Node SQLite. Read README.md and VERIFICATION.md first. No paid services, credentials, or model API keys are required. Copy suggestions are intentionally simulated.

## Install and run

From this repository:

```sh
node scripts/run-local.mjs
```

This validates Node.js, runs npm ci, and starts a loopback development server at http://127.0.0.1:3000. Keep the server in a retained/background session and report its printed URL. If port 3000 belongs to another process, use `node scripts/run-local.mjs --port 3001`; do not stop an unrelated server.

For installation without a blocking server: `node scripts/run-local.mjs --setup-only`.

## Verify

- `npm run check` generates Next.js types, runs unit tests, and type-checks a fresh checkout.
- `npm run test:integration` builds and tests an isolated temporary production database, restart persistence, and browser-style HTTP mutation requests. Port 3107 must be available.
- Never run `tests/http.test.ts` against a user's demo database without explicit reset authorization: that test clears its target. Prefer the isolated integration command.
- Same-origin guards must use the incoming Host rather than Next's internal localhost URL. Do not remove Origin headers from HTTP regression tests.
- Report actual checks; HTTP tests do not establish browser layout or click-through behavior.

## Data and scope

Keep local SQLite files, .env files, logs, and node_modules out of Git. Preserve user data when installing or restarting. The visible Reset database control requires confirmation and restores the three sample ads while clearing variations, experiments, assignments, sessions, and events.

Only headline and description change between product variations. Keep drafts separate from approved publication, freeze experiment copy, retain stable browser assignment, exclude previews, and deduplicate orders. Use only the approved product facts in README and the suggestion module. Do not add Meta scraping, shopper profiling, real payment collection, or unsupported performance claims.
