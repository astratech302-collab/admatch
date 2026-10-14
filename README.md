# AdMatch

A working local MVP for ecommerce ad-to-page message matching. Fictional Roam ads promote one Roam Everyday Backpack. Only headline and supporting description vary.

## Quick start for people, Claude, or Codex

```sh
git clone https://github.com/astratech302-collab/admatch.git
cd admatch
node scripts/run-local.mjs
```

The public repository is `astratech302-collab/admatch`. An identical private copy is available at `vmehra25/admatch`; cloning that copy requires authorised GitHub access. Install Node.js 24 LTS first if needed. The script uses the committed dependency lockfile and starts the app at http://127.0.0.1:3000. It does not reset existing data or configure any LLM API.

Use `--port 3001` to choose another port, or `--setup-only` to install without starting a server. Run it from any working directory using the script's absolute path; it resolves the repository directory itself.

For a coding-agent prompt: “Read AGENTS.md and README.md. Install and run this project using scripts/run-local.mjs. Keep the server running, report its URL, and run npm run check plus npm run test:integration without resetting my demo database.” CLAUDE.md provides the same entry point for Claude.

## Run

Use Node.js **22.13 or newer** (Node 24 LTS recommended; verified on 26.9). No API keys, external accounts, or paid services are required.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000. The three fictional ads are seeded on first run. SQLite lives in `data/admatch.sqlite`; edits persist across server restarts. `ADMATCH_DB=/absolute/path/demo.sqlite` selects another file.

Production-style local run:

```sh
npm run build
npm start
```

The app uses Next.js 16, React 19, TypeScript, Tailwind CSS 4, and Node's built-in SQLite. Webpack is selected because Turbopack's local subprocess binding failed in the available sandbox. All illustration assets are local SVG components. No runtime network services or external fonts are used.

## Two-minute demo script

- **0:00–0:20:** Show the three Ads cards. Explain that commute, weekend, and mixed messages share a product and page template. These are fictional ads, not connected Meta campaigns.
- **0:20–0:45:** Open Weekend travel. Click Generate suggestion. Point out “Sample suggestions — AI not connected.” Explain the angle and approved facts.
- **0:45–1:00:** Edit the headline, check the review confirmation, and Approve and publish. Switch between desktop and mobile preview widths. Preview activity is excluded.
- **1:00–1:25:** Click Open page. Show the approved headline, ₹2,499 price, and product facts. Try demo checkout and Complete demo order. No payment or personal information is collected.
- **1:25–1:40:** Return to Results and Refresh. Show recorded view, click, order, and demo order value, separate from experiment traffic.
- **1:40–2:00:** In Page variations, Create experiment. Open its link and refresh: the anonymous browser keeps its original or matching-copy assignment. Explain that an experiment freezes approved copy and does not establish real commercial performance.

The in-app Demo guide follows the same sequence. The top-bar **Reset database** button is available on desktop and mobile. Its confirmation dialog restores sample ads and removes drafts, variations, experiments, assignments, sessions, and events. Reset leaves the SQLite database usable for the next live presentation.

## Functional

- SQLite ad entry, editing, deletion, sample seeds, and reset.
- Deterministic sample suggestions for work, weekend, and mixed messages, with explanation and approved facts; unrecognised messages fall back to a generic sample.
- Saved drafts separate from published copy; merchant review required to publish.
- Server-rendered approved variation links and original-page fallback for missing, invalid, unpublished, and deleted variations.
- Copy/open links; marketer preview links and inline previews excluded from measurements.
- Immutable experiment copy snapshots, 50/50 random assignment, stable anonymous browser cookie and database assignment.
- Demo checkout, quantity 1–10, completion, and SQLite event collection. Event context comes from the server's saved visit session.
- View/click/order uniqueness per page visit; duplicate completion of the same order does not create another order.
- Direct demo versus within-ad experiment results, zero initial activity, recent-event table, and honest empty states.

## Simulated and deferred

**Simulated:** rule-based copy suggestions, local product illustration, fictional ads and product, and checkout without payment or fulfilment.

**Deferred:** real language model, Meta integration, payments, authentication, production hosting, advanced statistics, and campaign operations. No shopper profiling is implemented. `lib/suggestions.ts` defines a server-side adapter interface and the prescribed AI instruction for later integration. Future AI adapters must validate returned structure and supplied facts and preserve merchant review. No secrets belong in browser code.

## Architecture

| Responsibility | Module |
| --- | --- |
| SQLite/schema/transactions | `lib/db.ts` |
| Ad storage and seeding | `lib/ads.ts` |
| Copy suggestions and adapter contract | `lib/suggestions.ts` |
| Drafts and approved variations | `lib/variations.ts` |
| Experiment snapshots and assignments | `lib/experiments.ts` |
| Initial page-copy resolution and visit session | `lib/landing.ts` |
| Event collection and results | `lib/events.ts` |
| Anonymous cookie | `proxy.ts` |
| Product rendering and checkout | `components/ProductPage.tsx` |
| Marketer UI | `components/Workspace.tsx` |

Management routes accept JSON at `/api/manage`; visitor events use `/api/events`. Mutation requests compare the browser Origin against the incoming Host rather than Next.js’s internal URL and reject cross-site requests. Prepared statements handle database values. Publishing only accepts an explicit merchant review flag. Events accept an unguessable session token and resolve context server-side, rather than trusting client-supplied assignment or order price.

## Checks

```sh
npm test
npm run typecheck
npm run test:integration
```

Tests use an isolated temporary SQLite database. `tests/core.test.ts` covers seeds, cross-process persistence, suggestions, publication, draft isolation, fallback, assignment stability, immutable snapshots, preview exclusion, deduplication, result separation, validation, and reset.

The live HTTP acceptance test is skipped by default. It resets the selected app's demo data before and after checking the journey; only point it at a disposable local demo:

```sh
ADMATCH_URL=http://127.0.0.1:3000 node --import tsx --test tests/http.test.ts
```

A production restart test uses an isolated temporary database and briefly opens port 3107:

```sh
ADMATCH_RESTART_TEST=1 node --import tsx --test tests/restart.test.ts
```

See `VERIFICATION.md` for actual check outcomes and limitations.

## Local-demo limits

SQLite is intended for this local demo. A deployment with ephemeral files, multiple processes/instances, or edge execution needs a durable supported database and migration plan. Keep the server on loopback: this MVP has no authentication and is not ready for public hosting.

Assignment belongs to an anonymous browser cookie per experiment; clearing the cookie or using another browser creates a new visitor. There is no cross-device identity. A fresh page load is a new visit session and can complete a new demo order; replaying completion for the same session is deduplicated. Bot filtering and session-retention policies are deferred. A view is collected after client hydration, so JavaScript-disabled visits are not measured. Browser network retries can replay the same session safely; failed event requests show an error, but no offline queue is implemented.

Experiments retain their immutable snapshot and ad reference after an ad or variation is removed. Reset removes those experiments. One draft/published variation is maintained per ad; republishing updates its demonstration URL, while existing experiment snapshots stay unchanged. Attribution is from the selected variation/experiment, not an imported live campaign ID.
