# SCRUM-51 — Checkout state consistency

Date: 28 October 2026. Individual contribution: Erdogan Efe Demir
(`Tiger1234562`).

## Verified defect

On main `6fcac23`, checkout captured the account, cart and total at page load.
Changing the cart or logging out in another tab did not prevent submission.
The stale page could save its old total and erase the current cart. A second
submission could also create another order. Regression tests reproduced these
failures before the fix.

## Change

Immediately before order creation, compare the current account email and
normalised cart (product, size and quantity) with the reviewed checkout state.
Reject mismatches without modifying the cart or previous order. Display a
message linking to cart/account review and focus it. The customer starts a fresh
checkout after reviewing the change. Block repeated submission after success.
Unchanged valid checkout retains the existing total calculation and order model.

This changes checkout only. It does not modify homepage search, category
shortcuts, navigation, account implementation or Kyle's accessibility work.

## Verification

- `npm test`: 12 passing tests (4 existing cart tests, 8 checkout regressions).
- `npm run test:browser`: 12 passing Edge groups, including 2 new real two-tab
  scenarios and 18 page/viewport checks at 375, 768 and 1440 pixels.
- No JavaScript page errors. Edge version: 156.0.4314.50.
- Two-tab quantity change preserves the updated cart and previous order; after
  review, a fresh checkout saves the updated EUR 129.98 total.
- Two-tab logout refuses the stale order and preserves cart/order data.
- Unit coverage includes quantity, size, added product, empty/corrupt cart,
  logout, switched account and duplicate submission.
- Narrow-screen warning screenshot visually checked; no horizontal overflow.
- Browser result record: `docs/checkout-state-test-results.json`.

Reproduce manually: log in with invented credentials, add Street Classic size
42, open checkout, then change its quantity in another cart tab. Submit valid
invented details on the old checkout. It must request cart review without placing
an order. Repeat with logout in the other tab.

## Integration and limits

Prepared as an isolated branch from current main. Existing draft PR #7 contains
the earlier catalogue/checkout/print changes and remains a separate review.
When integrating both, preserve this guard before order creation and preserve
PR #7's validation and item snapshot. Run the combined tests after integration.
No teammate review, merge, deployment or GitHub CI result is claimed here.

This is a browser-only simulated store. The check detects changes present at
submission; localStorage is not an atomic multi-tab transaction and this is not
backend authentication or real payment protection.
