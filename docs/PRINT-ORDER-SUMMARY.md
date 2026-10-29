# Printable order summary - SCRUM-38

Prepared on 17 October 2026.

## Behavior

New simulated checkouts retain an item snapshot with product name, selected EU size, quantity and integer-cent unit price, alongside the existing order number and total. Delivery details, account credentials and card inputs are not added to this snapshot. There is still only one last-order record, not a new order history service.

Confirmation displays the saved item snapshot rather than reconstructing past prices from the current catalogue. Item totals must agree with the saved order total. Older records without items retain their actual recorded total and explain that item details are unavailable. Missing/malformed order records show No saved order and hide the print action. Saved strings are rendered as text, not executable markup.

Print order summary opens the browser's print dialog. A4 styles hide navigation, footer and interactive controls, retain the simulated-purchase notice, repeat table headings and keep ordinary rows together across pages. The existing order ID is used; no identifier is invented by the renderer. Printing does not create an order or change stored order/cart data.

## Verification

- 4 unit tests and 13 Edge browser groups passed on Edge 155.0.4283.45; no JavaScript page errors.
- New tests cover real simulated-checkout snapshots with two sizes, exact subtotals, keyboard activation of print, unchanged storage, reload, legacy/missing/malformed records, escaped saved text, inconsistent totals, mobile overflow and print layout.
- Existing regression checks include cart/account/checkout behavior and 18 page/viewport checks at 375, 768 and 1440px.
- Actual browser-generated A4 output was rendered and visually reviewed: a normal two-item summary is one page; a 100-row test order spans five pages. Extracted text confirms every test row appears once in order and all five pages repeat column headings. These long-order fixture records are test data.
- Results: print-order-test-results.json. Run npm test and npm run test:browser with dependencies and Edge available. These are local checks, not CI or peer acceptance.

## Delivery

Independent branch order-print-summary is based on main 02c923af34ef927282a43b0f489fa217e559178a, not catalogue or checkout-validation follow-up branches. This is unestimated work outside Sprint 2. No merge, deployment or real payment receipt is claimed. Review only this feature against main; preserve the checkout-validation changes when integrating both PRs.
