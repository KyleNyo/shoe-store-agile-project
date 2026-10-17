# Accessible checkout validation — SCRUM-37

Prepared with AI assistance for Erdogan Efe Demir on 17 October 2026.

## Behavior

Checkout now provides one focusable error summary on invalid submission, with links that focus the corresponding fields. Explicit labels name every input. Inline corrections are associated with their fields through aria-describedby and aria-invalid; errors use text as well as visual styling.

After the first submission attempt, editing a field updates the summary and inline errors without moving focus. Valid input remains in place. Empty or whitespace-only required text fields, malformed email addresses and invalid simulated card numbers are rejected. Card validation accepts 12–19 digits with optional spaces, including grouped 19-digit input. Existing simulated payment guidance remains associated with the card field after its error clears.

The custom handler enables noValidate only after it is installed, replacing browser validation popups with the summary. Existing guest and empty-cart restrictions, order totals, confirmation and cart clearing remain in use. This does not add real payments or production authentication.

## Verification

- 4 existing Node unit tests passed.
- 12 Edge browser groups passed on version 155.0.4283.45, including 2 new checkout groups and the existing 18 page/viewport checks at 375, 768 and 1440px. No JavaScript page errors.
- New coverage checks summary and link focus, associated inline errors, multiple errors, valid-input/cart preservation, correction without focus theft, whitespace-only required input, malformed email, card boundaries/characters, mobile layout and corrected keyboard submission through simulated confirmation.
- The 375px error-state screenshot was visually inspected. Results: checkout-validation-test-results.json.
- Run npm test and npm run test:browser with declared dependencies and Edge installed. Results are local verification, not CI or a complete accessibility conformance audit.

## Branch and delivery

Independent branch checkout-accessible-validation is based on the verified main baseline 02c923af34ef927282a43b0f489fa217e559178a. It does not depend on sorting/filter/reset branches. Review against main; no merge or deployment is claimed. This is unestimated post-Sprint 2 work, not an addition to the 4-item / 17-point Sprint 2 result. Peer acceptance remains pending.
