# SCRUM-67 — Shopping view integration

Reproduced on main a9a9f97: another tab's wishlist update leaves an open
catalogue unchanged. The new two-tab regression failed before the fix.

Existing recently viewed, wishlist and comparison renderers are reused on
relevant storage events/clear and persisted pageshow. These refreshes do not
write saved data. Focus returns to an equivalent visible product button or a
usable page destination when a refreshed section removes its active control.
Local selection/clear actions use the same recovery path. Kyle's product
selection/storage behavior and two-product comparison limit remain in place.

Verification: 34 Node tests and 45 Edge browser groups, including real two-tab
updates, stored-data preservation, local keyboard removal/clear, the comparison
limit and failed writes. Cached restoration is tested with a simulated persisted
PageTransitionEvent, not by asserting a browser's cache policy. Existing cart,
checkout, print/download, catalogue and 18 viewport/page checks remain included.
Evidence: docs/shopping-view-sync-test-results.json.
