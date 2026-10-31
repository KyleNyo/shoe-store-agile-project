# Checkout submission serialization — SCRUM-72

On browsers with Web Locks, checkout acquires the same exclusive `solestyle-checkout` lock before writing the order and clearing the cart. It rechecks the account, cart snapshot and form after waiting. Once one checkout completes, another queued checkout rejects its stale snapshot instead of writing another order. Repeated submissions in the same page do not enqueue additional work.

The form exposes its busy state and disables Place Order while waiting. Lock rejection leaves data unchanged and permits retry. Existing save-failure recovery runs within the lock; pending state is released even on failure. Closing the document lets the browser release its lock.

Validation: 40 unit tests and 54 Edge browser groups passed. Six new unit cases cover queued cart/account changes, repeated submissions, lock rejection and both persistence failure points followed by retry. The browser test holds the lock from a control tab, queues two checkout tabs, attempts a repeated submit, then releases it and checks exactly one order write, the correct total, an empty cart and rejection of the stale second checkout. The original implementation failed this test because it did not wait for the held lock. All browser scenarios block non-local network requests. Evidence: `checkout-submission-lock-test-results.json`.

Scope: this coordinates checkout submissions from cooperating tabs on the same origin using Web Locks. Browsers without that API retain the existing synchronous snapshot checks. It does not serialize every cart mutation, protect against direct storage edits, or replace a transactional server/payment system. Purchases remain simulated.
