# SCRUM-70 — Product navigation context

Reproduced on main af0d68f: cart size 43 opens product detail at default size 39.
Cart links now carry their row size and the allowlisted source 'cart'. Available
sizes are validated against the product; unavailable values retain defaults.
The customer can return directly to cart, and adding again merges that size.

Catalogue return decoration is shared by grid and wishlist cards. Wishlist
redraw reuses the current catalogue controls; filtering and reset update its
return links too. Only known catalogue keys and local return destinations are
accepted. Other shopping feature logic is unchanged.

Verification: 34 Node tests and 51 Edge browser groups with external requests
blocked. New groups cover cart size/navigation/data preservation, filtered
wishlist round-trip/reset, unavailable sizes, unknown source and missing IDs.
The cart-size regression failed before the fix. Cache policy is not assumed.
Evidence: docs/product-return-context-test-results.json.
