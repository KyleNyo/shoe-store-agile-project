# Cart quantity validation — SCRUM-71

Typing zero, an empty value, a negative number, a fraction or more than 99 previously replaced the input with the saved quantity on blur. The cart now retains invalid input and blocks checkout until corrected. Keyboard and pointer activation focus the first invalid row. A successful edit in another row preserves outstanding validation feedback.

Saved quantities and totals do not change for invalid edits. Correcting the field saves the quantity and removes its error attributes. Space for the status message prevents the first error from moving the checkout link during a click.

Validation: the new regression failed against the original implementation (zero became one). After the fix, 34 unit tests and 53 Edge browser groups pass, including five invalid values, correction-to-checkout, multiple cart rows, cross-tab updates, storage failures, and three viewport sizes. Browser tests block all non-local network requests. Evidence: `cart-quantity-validation-test-results.json`.

This validates the browser-only simulated store; it does not introduce server-side transactions or real payments.
