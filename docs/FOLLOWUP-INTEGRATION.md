# SCRUM-53–58 — Combined follow-up

PR #11 now includes PR #12's catalogue return work, preserving its original
commit history. Review the combined change in PR #11. Main remains the accepted
Sprint 3 baseline until this follow-up is merged.

Combined local verification: 30 Node tests and 40 Edge browser groups passed,
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

SCRUM-56 immediately invalidates checkout when another tab changes the reviewed
cart or account. The stale summary and form are hidden; a focused notice links
to cart/account review. Cached-page restoration rechecks the snapshot too,
including completed checkout sessions. Submission still checks independently
for events that have not arrived. Unchanged or unrelated storage updates leave
checkout usable. Five additional Node cases cover these event/restoration
conditions; the two-tab browser flows now verify rejection before submission
and successful retry after reviewing the current cart.

SCRUM-57 adds Download order summary beside Print. A UTF-8 plain text file
contains the displayed order's number, verified item sizes/quantities/prices,
total and simulated-purchase disclaimer. No customer or payment fields are
exported. Downloading preserves cart/order storage and keyboard focus, and
retains the displayed snapshot if another tab replaces the latest order.
Legacy/inconsistent items receive an explicit unavailable-details notice;
missing/invalid orders offer no download. Two new browser groups verify actual
downloaded bytes, legacy/mismatch handling and keyboard use.

SCRUM-58 reuses live cart refresh on persisted pageshow so a cached document
does not keep outdated rows, totals or navigation after missing storage events.
Restoration discards stale Undo and moves focus to the recovery notice when
needed. This path only reads storage. The new browser group simulates missed
writes and dispatches persisted/non-persisted PageTransitionEvents; it checks
saved rows, counts, account navigation, Undo, focus and unchanged stored data.
It exercises the restoration handler, not a browser's cache eviction policy.

Start with npm start. Demo: select Sneakers, size 42, EUR 60–80 and descending
price. Open a product, verify size 42 is selected, and return to the unchanged
catalogue. Use two cart tabs to show automatic updates. Storage failure coverage
uses isolated injected test failures; do not change real browser settings during
the live presentation.

No merge, deployment or teammate review is claimed. The earlier per-feature
documents/results remain historical evidence; use this file for combined scope.
