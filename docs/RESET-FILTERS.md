# Reset catalogue controls — SCRUM-36

Prepared on 17 October 2026.

## Behavior

The Reset filters button clears search, category, minimum/maximum EUR prices and size, and restores default sorting and the original product order. Invalid price feedback is cleared. The live status reports that all products are shown; keyboard focus stays on the button.

Reset removes every search/category parameter from the current URL without navigating. Unrelated parameters, the fragment and existing history state are preserved. Reloading therefore does not restore an old homepage search or category. Cart storage and the shared product dataset are unchanged.

## Scope and review

Branch: catalog-reset-filters. Base: catalog-price-size-filters at abb55a5247a8630d4aecd102d84fb51b7b654681. This dependent follow-up is outside Sprint 2 and should be reviewed against the filter branch. Main is not changed. No estimate, merge, deployment or peer approval is claimed.

## Verification

- All 4 existing Node unit tests passed.
- All 16 Edge browser groups passed on Edge 155.0.4283.45; no JavaScript page errors.
- Three new groups cover combined reset, duplicate/stale URL filters and reload, unrelated URL/history preservation, unchanged cart/product data, invalid/no-match recovery, keyboard activation and actual homepage-search integration.
- Existing regression checks cover store navigation, sorting/filtering, cart/account/checkout and 18 page/viewport combinations at 375, 768 and 1440px.
- The 375px catalogue screenshot was visually inspected.
- Results: reset-filter-test-results.json. Run npm test and npm run test:browser with dependencies installed and Edge available. These are local tests, not GitHub Actions results.

## Manual check

Open the catalogue through homepage search, set category/price/size/sorting, then activate Reset filters. Confirm all six original products return in source order, all controls use defaults, price validation clears and reloading keeps the unrestricted catalogue. Repeat using keyboard Enter/Space and a narrow viewport.
