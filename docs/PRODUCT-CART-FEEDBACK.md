# SCRUM-69 — Current product cart feedback

Reproduced on main cccbad3: changing/removing a cart item in another tab updates
the navigation count but leaves product detail claiming its old saved quantity.
The new two-tab regression failed before the fix.

Cart refresh now replaces existing product feedback with a neutral review
notice. View cart is hidden for an empty cart, with focus recovery when that
link was active. Persisted pageshow refreshes existing feedback; untouched
product pages remain blank. Saved data and the selected shoe size are unchanged.

Verification: 34 Node tests and 48 Edge browser groups with non-localhost
requests blocked. The new cases check real two-tab quantity/removal updates,
navigation/link/focus consistency, simulated persisted/non-persisted restoration
and no invented success on an untouched page. Existing flows remain included.
Evidence: docs/product-cart-feedback-test-results.json.
