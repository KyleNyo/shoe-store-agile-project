# SCRUM-53 — Cart synchronisation and failed saves

Base: merged main 5901cf0. Contribution: Erdogan Efe Demir (Tiger1234562).

Other-tab cart/account/order updates now refresh navigation counts and the cart
view using the storage event. Unrelated keys and other storage areas are ignored.
Stale Undo is removed with an explanation. Focus stays on the equivalent named
cart control if available, otherwise on the update notice.

Cart add, quantity, removal and Undo writes now catch failed saves. The user sees
an actionable storage message; saved items/totals remain unchanged. Failed Undo
retains its recovery record for retry. The existing checkout state guard remains.

Verification: 25 Node tests and 33 local Edge browser groups passed. New coverage
checks real two-tab quantity/removal changes, totals/counts, focus, stale Undo,
failed cart writes and retry. Existing 18 page/viewport checks and all catalogue,
account, checkout and print scenarios pass; no JavaScript page errors.
Evidence: docs/cart-live-sync-test-results.json.

Manual check: open cart in two tabs, change quantity/remove a row in the second,
and verify the first updates without reload. For failed-save tests the browser
suite injects QuotaExceededError for cart writes only, then restores storage and
checks a successful retry.

Checkout save failures are also handled: if saving the order or clearing its
cart fails, checkout stays on the form and attempts to restore the previous order.
A recovered failure retains form values and permits retry. If restoring the
previous order also fails, retry is blocked with an explicit incomplete-state
message and a route to review the cart. Tests inject both failure points and a
failed rollback. No successful confirmation is displayed after a failed save.

Account persistence is unchanged. localStorage does not provide atomic multi-tab
transactions. These tests do not establish team review, a merge or deployment.
