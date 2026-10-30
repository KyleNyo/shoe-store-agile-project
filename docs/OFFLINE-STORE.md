# SCRUM-68 — Local store resources

All seven store pages use local Bootstrap, app styles/scripts and product
images. The unused external Bootstrap Icons stylesheet links were removed;
no page uses that icon library. Application behavior is unchanged.

The browser suite now blocks every non-localhost request throughout all flows.
An additional check validates local resource declarations on each page. Test
evidence records the network policy and blocked external hostnames. On this
Windows environment, Kaspersky can inject a script request; it is also blocked
by the test context. No system security settings are altered.

Validation: 34 Node tests and 46 Edge browser groups, including two-tab shopping,
cart/checkout error recovery, print/download and 18 page/viewport cases.
Evidence: docs/offline-store-test-results.json. Start with npm start after
Node.js is installed; runtime dependencies and npm install are not required.
This verifies the locally served application, not installation without internet.
