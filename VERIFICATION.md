# Verification report

Verified on 14 October 2026 using Node.js 26.9.0, Next.js 16.4.0, and SQLite through `node:sqlite`.

## Save/reset repair

The user reported that the interface loaded but edits were not saved. A browser-style POST to the running server, with `Origin: http://127.0.0.1:3000`, reproduced a **403**. Next.js constructed an internal request URL using localhost; the old guard incorrectly compared the browser Origin to that URL. The earlier HTTP tests omitted Origin and therefore missed the failure.

The shared `lib/request-origin.ts` guard now compares Origin to the incoming Host, rejects cross-site fetch metadata, and ignores arbitrary forwarded host headers. Both management and event routes use it. The same live request returned **200** after the fix.

A **Reset database** button is now visible in the top bar on desktop and mobile. Its confirmation dialog clears demo records and restores the three sample ads. The API still requires its explicit reset confirmation token. The UI clears the selected workspace, unsaved copy, search, and review checkbox after a successful reset.

Current checks: **19 unit/data-layer checks passed**, TypeScript passed, and the production build plus isolated restart/HTTP acceptance test passed. Browser-style Origin headers are now included on all mutation calls in the HTTP and restart tests. Added checks cover foreign-origin rejection for both routes, rejection of unconfirmed reset without data changes, a visible reset control in initial workspace HTML, and repeated reset restoring exactly three sample ads.

The repair tests used temporary databases; the user's running demo database was not reset.

## Completed

| Check | Actual result |
| --- | --- |
| Focused data-layer checks | **19 passed**, zero failures; isolated temporary database |
| Live HTTP acceptance journey | **Passed** against the running development server and again against the final production build |
| Production restart check | **Passed**: ad additions/edits, publication, experiment assignment, and events survived a full stop/start with the same SQLite file |
| TypeScript | `npm run typecheck` **passed** |
| Production build | `npm run build` **passed** using Webpack |
| Local workspace response | HTTP **200** from `/` |
| Initial seed and measured results | Three fictional sample ads; activity starts at zero |
| Publishing and draft isolation | Distinct approved headlines appeared in initial server HTML; later drafts did not alter publication |
| Fallback | Missing, invalid, draft-only, unpublished, and deleted variation identifiers returned original copy |
| Stable experiment copy | Republishing a variation did not change existing experiment snapshots |
| Stable assignment | Same browser cookie showed the same assigned copy on reload and after production restart; core test reached both arms across 200 anonymous visitors |
| Preview exclusion | Preview view/click/order calls returned `excluded`; no recorded events or preview assignment rows |
| Checkout and results | View, click, and a two-item demo order recorded; demo value ₹4,998; direct and experiment results remained separate |
| Duplicate prevention | Repeated view, click, and order submissions retained one of each per page session |
| Missing-view recovery | A checkout click recovers its landing view once, so transient loss of the initial view request does not undercount recorded visitors |
| Reset | Restored all three sample ads and cleared variations, experiments, sessions, assignments, and events |
| Dependency installation | npm reported zero vulnerabilities at installation |

`npm test` runs core tests and skips the live-server tests unless their explicit environment flags are set. The restart test also executes the complete HTTP journey against the production build. Test databases are disposable and isolated; the development demo was reset after its HTTP check so measured results remain at zero.

## Not completed

**Manual browser journey, screenshots, and visual mobile/desktop inspection were not completed.** The browser security policy reported that access to the local origin was declined. No alternate browser surface or browser automation was used to work around that decision.

Desktop/mobile styles, preview-width controls, and the click-driven interface are implemented, but their visual layout and browser interactions remain unverified. The HTTP checks exercise the underlying routes and verify initial rendered copy; they do not prove browser layout, clipboard behavior, modal focus behavior, or a complete click-through journey.

The first build failed due to a CommonJS package setting, which was corrected to ES modules. Turbopack then failed because its subprocess could not bind a local port in the available sandbox; the project now uses supported Webpack build/dev commands. The final build passed.

## Reproduce

```sh
npm test
npm run typecheck
npm run build
ADMATCH_RESTART_TEST=1 node --import tsx --test tests/restart.test.ts
```

The restart test briefly opens a loopback server on port 3107 with its own temporary database and cleans it up afterward. Ensure that port is free.

For an already running disposable demo (this resets its data):

```sh
ADMATCH_URL=http://127.0.0.1:3000 node --import tsx --test tests/http.test.ts
```

Use the README two-minute script to complete the outstanding browser checks. Also inspect Ads, the edit form, page variations, Results, and the product page at mobile and desktop widths; test Copy link, both preview widths, and the confirmed Reset action.

## Agent setup script

`node scripts/run-local.mjs --setup-only` successfully installed the locked dependencies in a clean archive checkout. `npm run check` then passed all 19 core/origin checks and TypeScript from that fresh checkout. Starting the script with `--port 3117` from outside the repository served the workspace with HTTP 200 and seeded three sample ads. The temporary smoke-test server was stopped afterward; the user's original server/data were left untouched.
