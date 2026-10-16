# Catalogue price sorting — SCRUM-33

Independent follow-up prepared on 16 October 2026, outside Sprint 2.

## Behavior

The catalogue provides Default order, Price: low to high and Price: high to low.
Sorting applies to the currently matching search/category results, uses numeric prices and remains selected when search/category changes. Default order restores the original catalogue order. The filtered copy is sorted, so the shared PRODUCTS array and homepage featured order are unchanged.

The responsive controls have visible labels, including an accessible Sort by price label. No extra backend, price-range filter or size filter is included in this small change.

## Scope and recovery

- Branch: `catalog-price-sorting`.
- Baseline Sprint 2 main: `02c923af34ef927282a43b0f489fa217e559178a`.
- Jira: https://shoe-store-agile.atlassian.net/browse/SCRUM-33
- No Sprint 2 membership or story-point estimate was added for this follow-up.
- A verified pre-change Git bundle was saved locally as `Fiyat-siralama-oncesi-yedek.bundle`.
- Main and the Sprint 2 source package are preserved. Use main/the baseline commit to demonstrate Sprint 2; use this separate branch to preview sorting.
- Prepared with AI assistance for Erdogan Efe Demir; no teammate contribution or review is claimed.

## Verification

- 4 existing Node unit tests passed.
- 11 Edge browser groups passed, including all existing cart/auth/checkout checks and a new sorting regression group.
- New checks cover ascending/descending numeric order, search/category combinations, preserved sort selection, no matches, resetting to default, homepage query parameters, product links and unchanged shared/featured product order.
- Existing responsive checks cover six pages at 375, 768 and 1440px (18 combinations), with no JavaScript page errors.
- The 375px catalogue screenshot was visually inspected; the three controls stack without horizontal page overflow.
- Browser output: `price-sorting-test-results.json`.

Run `npm test` and `npm run test:browser` after installing the declared Playwright dependency and ensuring Edge is available. Tests are local; no automated CI or external deployment is claimed. Publication/merge status is tracked in Jira, rather than assumed from this local implementation note.
