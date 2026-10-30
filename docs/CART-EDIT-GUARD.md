# SCRUM-65 — Stale cart quantity edits

Based on main 09b4a81, including Kyle's Sprint 3 shopping features.

Quantity edits now compare the displayed quantity with the saved row before
writing. Missing rows and changed quantities trigger cart review, clear old
Undo and preserve saved data. The customer can edit again after reviewing the
refreshed row. Failed writes keep the previous quantity. This does not claim
atomic concurrent transactions across tabs; it checks already-saved changes.

Validation: 34 Node tests and 41 Edge browser groups passed, with no page
errors. Four unit cases cover stale/missing rows, reviewed retry, write failure
and invalid quantities. A browser group models a missed storage event using
same-document writes and checks storage preservation, refresh, focus and retry.
The existing two-tab and 18 page/viewport cases remain included. Evidence:
docs/cart-edit-guard-test-results.json.

Kyle's homepage, recently viewed, wishlist and comparison implementations are
preserved. This change only alters cart quantity saving and its recovery UI.
