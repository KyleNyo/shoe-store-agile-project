# SCRUM-54 — Return to catalogue with the same selection

Contribution: Erdogan Efe Demir (Tiger1234562). Base: main 5901cf0.

Catalogue search, category, sorting, price bounds and size are reflected in the
URL using replaceState. Reload restores them. Product detail links carry the
known selection parameters, and Back to catalogue restores the selected result
set and ordering. The link is also available for missing or invalid product IDs.
No storage permission is required and separate tabs retain independent selections.

Return state carries only six known parameter names and never a destination URL.
User text is assigned through URLSearchParams/DOM properties. Invalid select
values fall back to defaults. Reset clears all six controls from the URL while
retaining unrelated query/history state on the current catalogue page. Unrelated
tracking parameters are not carried to the product return link.

Verification: 20 Node tests and 32 local Edge browser groups passed, including
18 page/viewport checks, full selection round-trip/reload/reset and malformed
return state. No JavaScript page errors. Result record:
docs/catalog-return-test-results.json.

Manual demo: choose Sneakers, descending price, size 42, EUR 60–80 and search
"sneaker". Open a detail, choose Back to catalogue and refresh. The same two
products and order remain. Reset and refresh show all six products.

This independent branch does not include pending PR #11's cart-save changes.
Review/integration and checks on the combined revision remain separate steps.
