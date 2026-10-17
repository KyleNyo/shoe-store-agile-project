# Keyboard, image and Firefox verification — 17 October 2026

Jira: SCRUM-39, SCRUM-40, SCRUM-41. Keyboard defect: [SCRUM-47](https://shoe-store-agile.atlassian.net/browse/SCRUM-47). Combined review: PR #7.

## Keyboard baseline and corrections

Baseline application: 45fe068. `quality-baseline.json` records a browser check of the previous LAN demo. Five account inputs had no associated labels, there was no skip link, and changing cart quantity replaced the focused row. After Tab the focus moved to a product link instead of the next Remove button.

All seven application pages now provide a main landmark and a visible-on-focus skip link. Interactive controls have a strong focus outline and clearance below the sticky header. Account inputs have associated labels; the account tabs expose Bootstrap tab semantics and support arrow keys. Successful authentication moves focus to Logout, and logout selects Login and focuses Email. Quantity updates change totals in place; removing a row focuses the next Remove action or the empty-cart shopping link.

Audit covers home, catalogue, product details, cart, account and checkout: input names, forward/backward navigation, mobile menu Enter/Space operation and expanded state, account arrow-key tabs, cart actions, filter reset and checkout error links. This is a focused keyboard audit, not a full accessibility conformance assessment.

## Image measurements and resilience

Existing six product SVGs are already 299–306 bytes each, 1,820 bytes total. They retain their existing product identity; recompressing them offers no useful benefit.

Generated card/detail markup now declares intrinsic 800 × 520 dimensions. The first three cards and detail image load eagerly; remaining cards load lazily and decode asynchronously. Existing product-name alternative text is preserved. A failed product image loads a local 370-byte SVG fallback once, with product-specific unavailable-image text. If the fallback also fails, no further retry occurs; name, price and detail/Add to Cart actions remain usable.

Checks deliberately fail both the product asset and fallback, then verify the retained action and bounded retry count. Responsive coverage includes 375, 768 and 1440 pixel widths.

## Browser runs

Local Edge 155.0.4283.45: 4 unit tests and all 25 browser groups pass, including 18 page/viewport checks, with no JavaScript page errors. Evidence: `quality-edge-results.json`.

Firefox 153.0 / Playwright build 1538 was downloaded from the official Playwright CDN. Windows could not start it because of a side-by-side runtime configuration error. GitHub's Linux matrix runs the same 25 groups with Playwright Firefox and Chromium. Browser versions and results are saved separately in `test-results/<browser>/results.json` and uploaded as workflow artifacts. Firefox uses print-media checks and screenshots; PDF generation is Chromium-only. The Firefox run result will be recorded after the workflow completes.

The tests cover search/category/price/size/reset, each product, cart quantities/removal/totals, registration/login/logout, guest checkout guard, checkout validation, simulated ordering and confirmation, and narrow/desktop layout. Test identities use example.test addresses.
