# SCRUM-53, SCRUM-54 and SCRUM-55 — Combined follow-up

PR #11 now includes PR #12's catalogue return work, preserving its original
commit history. Review the combined change in PR #11. Main remains the accepted
Sprint 3 baseline until this follow-up is merged.

Combined local verification: 25 Node tests and 37 Edge browser groups passed,
including 18 page/viewport combinations and no JavaScript page errors. Evidence:
docs/followup-integration-test-results.json.

The suite checks live cart updates, stale Undo invalidation, focus continuity,
failed cart/checkout writes, retry/rollback reporting, catalogue selection
round-trips and malformed return state alongside existing store behavior.
Catalogue size filters also preselect that available size on product details;
the customer can change it before adding. Direct product links retain defaults.

SCRUM-55 replaces product detail's blocking add dialog with an inline live status
showing the product, saved size and quantity, plus a View cart link. Keyboard
focus stays on Add to Cart, and Tab reaches the new link. Quantity limits and
failed writes replace old success feedback without changing the saved cart.
Cart-page write errors retain their existing alert behavior. Two browser groups
cover repeated adds, keyboard navigation, the quantity cap and failed storage.

Start with npm start. Demo: select Sneakers, size 42, EUR 60–80 and descending
price. Open a product, verify size 42 is selected, and return to the unchanged
catalogue. Use two cart tabs to show automatic updates. Storage failure coverage
uses isolated injected test failures; do not change real browser settings during
the live presentation.

No merge, deployment or teammate review is claimed. The earlier per-feature
documents/results remain historical evidence; use this file for combined scope.
