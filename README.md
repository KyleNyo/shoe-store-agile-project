# SoleStyle — Shoe Store
E-commerce demonstration developed using Scrum for the IT Agile Development Retake Project.

## Run locally

Use Node.js 20+. Run `npm start` and open http://127.0.0.1:4173. No dependency installation is needed to run the website. Keep the same origin while testing so browser storage is shared across pages.

## Verify

- `npm test`: dependency-free cart and checkout regression checks.
- `npm install`: install the pinned Playwright development dependency.
- `npm run test:browser`: actual browser acceptance and responsive tests using installed Microsoft Edge. Set `BROWSER_CHANNEL=chrome` to use installed Chrome instead.
- Browser tests start and stop their own local server and use an isolated browser profile. Results and screenshots are written to `test-results/`.

## Demo limitations

This is a static student demonstration. Accounts, session state and cart data live in this browser's localStorage. Existing authentication stores passwords as plain text and is not production security; use invented test credentials only. Checkout is simulated and must use dummy payment data. No backend, real payment, stock tracking or cross-device account persistence is provided.

Sprint 2 implementation, defects, evidence and remaining delivery steps are described in `docs/SPRINT-2-DELIVERY.md`. The local verification does not by itself mean changes have been merged into the shared repository.

## Current delivery state

The delivered application is on `main`. The final application baseline is `91cc88431cd09d023b15a002ba725a5bde2de4ba`, including merged PRs #20 and #21. It includes catalogue controls, wishlist/comparison/recently viewed products, cart recovery, checkout validation, printable/downloadable order summaries and protection against stale or concurrent checkout submissions.

At this baseline, 40 unit tests and 54 Edge browser scenario groups passed. Chromium and Firefox checks passed on [merged main](https://github.com/KyleNyo/shoe-store-agile-project/actions/runs/41183593148). Sprint 3 closed on 31 October 2026 with no unfinished sprint issues. Follow-up features remain separate from the four-item, 17-point Sprint 2 accounting.

Use the [final ten-chapter documentation](https://shoe-store-agile.atlassian.net/wiki/spaces/~712020765d7f79f9f14cb5b73370d4875a46fd/pages/12550149) for requirements, architecture, individual contributions, verification and sprint closure. [Current status](docs/CURRENT-STATUS.md) distinguishes final delivery from older checkpoints. Earlier candidate/demo documents are dated historical records.
