# Presentation candidate — 29 October 2026

Branch `efe/presentation-integration` combines the existing PR #7 demo
(`18eecee`), PR #8 checkout guard (`13dbfe4`) and PR #9 cart recovery (`9f26ec4`).
It is a review candidate, not a merged or team-approved release. Original
branches and main are preserved. Merge commits retain original attribution;
integration fixes are by Erdogan Efe Demir.

## Start the demo

Install Node.js if it is not already available. In the extracted project folder,
run `npm start`, then open http://127.0.0.1:4173 . No dependency installation is
needed to run the website. Keep the terminal open; Ctrl+C stops the server.
The server listens on this computer only and serves application assets only.
Use invented account/delivery/card details for this simulated store.

## Combined verification

- 20 Node tests passed.
- 30 local Edge browser groups passed, including 18 page/viewport checks.
- No JavaScript page errors; raw evidence is in
  `docs/presentation-integration-test-results.json`.
- Existing catalogue filters/reset, checkout validation, saved item snapshots,
  print layout, cart keyboard focus and image fallback are preserved.
- New stale-checkout and cart recovery scenarios pass together.
- Checkout unit-test DOM fixtures were extended to exercise the integrated
  validation code. Actual validation is also checked in browser tests.
- Local server smoke check: homepage, app script and Bootstrap CSS return 200;
  Git configuration and dependency paths return 404.

## Five-minute demo

1. Catalogue: combine price sorting, size and price filters; reset them together.
2. Product/cart: add Street Classic size 42 twice and size 43 once. Verify
   EUR 194.97, remove an item and Undo it.
3. Account/checkout: use an invented account. Show size/quantity summary and
   Edit cart. Submit incomplete details to show linked correction messages.
4. Resilience: open checkout, change quantity in another cart tab, submit the old
   checkout. Show that it requests review and preserves the current cart.
5. Finish a fresh simulated checkout, show the saved lines and printable summary.
   Show the commit history/Jira links as individual contribution evidence.

Review and rerun checks on the final merged revision before declaring Jira work
Done. No GitHub CI result, team review or deployment is claimed by this document.
