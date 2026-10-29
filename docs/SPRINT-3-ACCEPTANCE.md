# Sprint 3 acceptance mapping — 29 October 2026

Candidate: `efe/presentation-integration`. Deadline: 31 October 2026.
The combined local verification passed 20 Node tests and 30 Edge browser groups,
including 18 page/viewport checks. GitHub CI validates Chromium and Firefox.
Actual CI outcomes must be read from the run, not inferred from this file.

| Jira item | Implemented scope | Verification in tests/browser.cjs |
| --- | --- | --- |
| SCRUM-33 | Numeric ascending/descending sorting and source order reset | Price sorting preserves search/categories and shared product order |
| SCRUM-34 | Inclusive price bounds, available size filter, invalid input recovery | Inclusive price bounds; invalid prices and reversed ranges |
| SCRUM-36 | Reset all catalogue controls and URL restrictions | Reset controls; keyboard reset; homepage query reset |
| SCRUM-37 | Linked checkout errors, field focus, retained valid input | Checkout errors; whitespace and simulated card validation |
| SCRUM-38 | Saved line snapshots and printable confirmation | New orders; legacy/malformed orders; long print layout |
| SCRUM-40 | Image dimensions/loading and one-attempt fallback | Product images reserve space and tolerate failed assets |
| SCRUM-47 | Account labels and cart focus continuity | Keyboard cart quantity/removal; account focus recovery |
| SCRUM-51 | Reject checkout after another tab changes cart/account | Two-tab checkout and logout; checkout unit regressions |
| SCRUM-52 | Undo last removal and review size/quantity before ordering | Undo; two-tab protection; checkout size review; cart unit regressions |

The image measurements for SCRUM-40 are in docs/QUALITY-IMPROVEMENTS.md.
The combined result record is docs/presentation-integration-test-results.json.
Start and five-minute demo instructions are in docs/PRESENTATION-CANDIDATE.md.

Team review and final integration remain acceptance steps. Passing automated
checks does not record a teammate's approval. Kyle's SCRUM-48/49/50 remain his
assigned work. Sprint start/closure is a Product Owner decision.
