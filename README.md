# shoe-store-agile-project
E-commerce website developed using Scrum for IT Agile Development Retake Project

## Run locally

Use Node.js 20+ for tests. To view the site, serve this directory with a local HTTP server, for example `python -m http.server 8000 --bind 127.0.0.1`, then open http://127.0.0.1:8000. Keep the same origin while testing so browser storage is shared across pages.

## Verify

- `npm test`: dependency-free cart data regression checks.
- `npm install`: install the pinned Playwright development dependency.
- `npm run test:browser`: actual browser acceptance and responsive tests using installed Microsoft Edge. Set `BROWSER_CHANNEL=chrome` to use installed Chrome instead.
- Browser tests start and stop their own local server and use an isolated browser profile. Results and screenshots are written to `test-results/`.

## Demo limitations

This is a static student demonstration. Accounts, session state and cart data live in this browser's localStorage. Existing authentication stores passwords as plain text and is not production security; use invented test credentials only. Checkout is simulated and must use dummy payment data. No backend, real payment, stock tracking or cross-device account persistence is provided.

Sprint 2 implementation, defects, evidence and remaining delivery steps are described in `docs/SPRINT-2-DELIVERY.md`. The local verification does not by itself mean changes have been merged into the shared repository.

## Current delivery state

The `integrated-demo` branch contains the presentation demo: the Sprint 2 main baseline plus price sorting, price/size filters, reset controls, accessible checkout errors and printable order summaries. See [integrated demo instructions and verification](docs/INTEGRATED-DEMO.md). Main has not been changed by this integration. These follow-up features remain separate from the four-item, 17-point Sprint 2 accounting.

`docs/CURRENT-STATUS.md` and earlier delivery notes preserve historical states; use the integrated demo document for this branch's current behavior and test results.
