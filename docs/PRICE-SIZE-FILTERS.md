# Price range and shoe size filters — SCRUM-34

Independent follow-up, 16 October 2026. Branch: `catalog-price-size-filters`, based on `catalog-price-sorting` / SCRUM-33 at `66f5cfed367217a5d8a1d253bc339c5bdcea1ffe`.

## Behavior

- Optional minimum/maximum EUR prices, inclusive and compared in integer cents. Empty bounds apply no restriction.
- EU size choices are generated from the product dataset (currently 38–46); All sizes applies no restriction. Listed available sizes are used, not a real-time inventory claim.
- All criteria combine with search, category and numeric price sorting. Changing one control retains the others.
- Negative, malformed and sub-cent price inputs show an accessible validation message; minimum greater than maximum is explicitly rejected. Invalid fields receive aria-invalid and reference the live feedback area. Invalid ranges show no misleading product results and recover when corrected.
- No-match feedback reflects both search and filters. Controls stack on mobile.

## Verification

4 Node unit tests and 13 Edge browser groups passed. New groups verify exact inclusive boundaries, optional bounds, available-size choices, combined criteria/sorting, zero/no-match results, invalid input and correction. Existing cart, account, checkout, navigation and sorting checks pass. Six pages at 375/768/1440px (18 combinations) have no page overflow; no JavaScript page errors were observed. Browser results: `price-size-filter-test-results.json`.

Run `npm test` and `npm run test:browser` after installing the declared dependencies and providing Edge. Checks are local; CI, deployment and peer acceptance are not claimed.

## Delivery and recovery

- Jira: https://shoe-store-agile.atlassian.net/browse/SCRUM-34
- Depends on the separate SCRUM-33 sorting change. Review only the filter delta against `catalog-price-sorting`; do not merge dependent changes in a way that discards sorting.
- No Sprint 2 membership, estimates, merge or team approval were invented. Main remains the Sprint 2 revision `02c923a`.
- A verified pre-change full-history Git bundle is saved as `Fiyat-numara-filtreleri-oncesi-yedek.bundle`.
- Prepared with AI assistance for Erdogan Efe Demir; no teammate contribution is asserted.
