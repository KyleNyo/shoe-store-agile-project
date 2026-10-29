# SCRUM-52 — Cart recovery and checkout review

Implemented 28 October 2026 for Erdogan Efe Demir (`Tiger1234562`).
Branch: `efe/cart-review-recovery`.
Base: main `6fcac23`. This is a separate contribution awaiting review/merge.

## Customer behavior

- Remove a cart item and use **Undo removal** to recover its exact product,
  size, quantity and original position. The total and navigation count update.
- The undo action remains available after removing the final cart item.
- Only the latest removal is recoverable, while the current page remains open.
  Reload/navigation discards the undo record; it cannot duplicate an item.
- A changed cart, account or last order invalidates recovery. Undo then shows
  the current cart without overwriting it. This protects changes in another tab
  and avoids resurrecting items after a completed simulated order.
- Checkout now shows product name, size, quantity, unit price and subtotal on
  each line, with an **Edit cart** link. Two sizes of the same shoe are distinct.

The feature uses the existing localStorage prototype. It does not promise atomic
multi-tab transactions, backend account isolation or real payment protection.
It does not change homepage search, category shortcuts or general navigation.

## Verification

`npm test`: 12 tests passed (4 existing + 8 recovery cases).
`npm run test:browser`: 13 Edge groups passed, including 3 new groups for
recovery, real two-tab protection, and checkout size review. Existing store flows
and 18 page/viewport combinations (375/768/1440px) passed. No JavaScript errors.
Edge version: 156.0.4314.50. Both new mobile screenshots were visually inspected.
Raw browser evidence: `docs/cart-review-recovery-test-results.json`.

## 90-second presentation demo

1. Add Street Classic size 42 twice and size 43 once. Show two cart lines and
   the EUR 194.97 total.
2. Remove size 42, then select **Undo removal**. Show the restored quantity 2,
   size 42, original ordering and EUR 194.97 total.
3. Remove both lines. Show that the empty cart still offers recovery of the last
   removal. Undo it.
4. With an invented demo account, open checkout. Show size, quantity, unit price
   and subtotal, then use **Edit cart** to return to the same selection.
5. Optional resilience demo: remove an item in tab A, add Trail Motion in tab B,
   then attempt Undo in A. The new Trail Motion stays; stale recovery is refused.

Explain the contribution as error recovery and clearer purchase review in a
simulated store. Show the Jira item, commit and test record; do not claim team
acceptance, merge, deployment or GitHub CI unless separately verified.

## Integration

PR #7 and PR #8 are separate pending work. During integration, retain PR #7's
cart focus behavior and checkout validation/order snapshot, PR #8's checkout
state guard, and this recovery logic/size summary. Run the combined suite after
merging. These features have not been claimed as an already-integrated release.
