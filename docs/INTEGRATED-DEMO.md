# Integrated presentation demo

Prepared on 17 October 2026 with AI assistance for Erdogan Efe Demir.

## Exact scope

Branch: `integrated-demo`. Application integration revision: `91e8b9938d9ff88539690667e597da8d6ca702ee`. Subsequent documentation-only commits do not change that tested application code.

This combines main `02c923af34ef927282a43b0f489fa217e559178a` with:

- SCRUM-33 / PR #2: numeric price sorting.
- SCRUM-34 / PR #3: inclusive price-range and EU-size filters.
- SCRUM-36 / PR #4: reset all catalogue controls and stale search/category URLs.
- SCRUM-37 / PR #5: linked checkout error summary, explicit labels and correction feedback.
- SCRUM-38 / PR #6: saved order-item snapshots and printable confirmation.

Checkout and printing changes were cherry-picked onto the catalogue/reset branch and integrated without conflicts. Existing individual PRs remain separate review records. Main has not been merged or changed by preparing this demo. No teammate approval, final course submission or deployment is claimed.

## Start on Mac

With Python 3 installed:

```sh
git clone --branch integrated-demo https://github.com/KyleNyo/shoe-store-agile-project.git
cd shoe-store-agile-project
python3 -m http.server 8000 --bind 127.0.0.1
```

Open http://127.0.0.1:8000 and keep Terminal open. If downloading the branch ZIP instead, extract it and run the server from the folder containing index.html.

## Start on Windows

Clone/download the same branch, open a terminal in the project folder and, with Python 3 installed, run:

```sh
python -m http.server 8000 --bind 127.0.0.1
```

Open http://127.0.0.1:8000. Account, login and cart state belong to each browser/origin and do not synchronize between devices.

## Demo sequence

1. Homepage search for street; inspect matching catalogue results.
2. Combine sorting, category, price and size controls; reset them.
3. Open product details; add two sizes, change cart quantities and inspect totals.
4. Create an invented account or sign in with one previously created in this browser.
5. Submit incomplete checkout, follow an error-summary link, correct the fields and finish simulated checkout.
6. Inspect saved order lines and select Print order summary; use Save as PDF in the browser print dialog.

Use invented data only: Test Street 1, Berlin, 10115 and simulated card 1111222233334444. This student prototype uses local browser storage, including plaintext demo passwords. It is not production authentication or real payment, and its order summary is not a fiscal receipt.

## Verification

- 4 cart unit tests passed.
- 21 combined Edge browser groups passed, including all added feature groups, simulated checkout and 18 page/viewport combinations at 375, 768 and 1440px. No JavaScript page errors.
- 7 supplementary checks against the actual LAN demo passed: exact application-file hashes, homepage search, product metadata/images, account validation, empty-cart restriction, all added controls present and no page errors.
- Main HTML/JS/CSS files were subsequently rechecked against the running demo and matched the tested code.
- Actual A4 print output and all five pages of the 100-row fixture were visually inspected during print-feature verification.
- Evidence: `integrated-demo-test-results.json`. Checks are local, not GitHub Actions or peer acceptance. Mac/Safari and Firefox are not verified by these Edge results.

Run `npm test` and `npm run test:browser` with the dependencies described in the README installed.

## Delivery boundary

Sprint 2 remains four accepted top-level Jira items / 17 points. The follow-ups above remain Testing outside that sprint. SCRUM-39–41 are still future quality work; this integration does not complete them. Real review feedback, retrospective actions, version tagging and recording/submission remain separate delivery steps.
