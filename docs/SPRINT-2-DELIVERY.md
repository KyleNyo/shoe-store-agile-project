> Historical pre-merge record. PR #1 has since been merged and tested. See [CURRENT-STATUS.md](CURRENT-STATUS.md) for the latest status and safe recovery procedure.

# Sprint 2 — Implementation and Verification

Review date: 15 October 2026. Delivery target: 17 October 2026.

## Baseline and scope

Repository: https://github.com/KyleNyo/shoe-store-agile-project

Baseline: `main` at `6ce5098` (Update style.css). Local working branch: `sprint-2-completion`. Published as PR #1, now ready for team review: https://github.com/KyleNyo/shoe-store-agile-project/pull/1. Main remains unchanged; merge and sprint start have not been performed. A backup branch preserves baseline 6ce5098.

Sprint 2 (ID 36) is still future, with Jira dates 9 October 10:00 UTC–17 October 10:00 UTC (12:00 Berlin). The three selected features total 13 points. Starting the sprint requires the user's confirmation; do not backdate an actual start.

| Work item | Recorded status | Verification in this change |
| --- | --- | --- |
| SCRUM-6 — Catalogue/details, 5 points | In Progress | Six products, images, search/category combinations, details/sizes, missing IDs and responsive layouts verified locally |
| SCRUM-8 — Cart, 5 points | To Do | Add, merge matching sizes, keep different sizes separate, quantity validation, removal, persistence, empty state and totals verified locally |
| SCRUM-9 — Integration/testing, 3 points | To Do | Homepage navigation, registration, invalid/valid login, logout, guest checkout restriction and simulated checkout verified locally |

All three Sprint 2 features and SCRUM-10–14 are now Testing, with dated verification comments. The table records the pre-change statuses. Existing work and assignments have been preserved. SCRUM-11 and SCRUM-12 contain truncated requirement sentences; this change does not invent the missing text.

## Changes

- Validate saved cart structure, product IDs, sizes and integer quantities. Discard invalid rows without exposing their values as HTML. Normalise size values and merge duplicate product/size rows.
- Accept quantities 1–99; explain invalid input and retain the previous valid quantity. The 99-pair cap is an implementation bound, not an inventory claim or a pre-existing Jira requirement.
- Update and remove cart rows by product/size identity, preventing stale or invalid saved rows from shifting the target.
- Sum prices in integer cents for both cart and checkout.
- Fix narrow-screen product-detail gutters. Keep the cart table horizontally scrollable within the page.
- Add accessible names for navigation, search, categories, size and cart controls, plus cart validation feedback.
- Ignore unknown category URL values and trim whitespace in search.

## Defects reproduced and fixed locally

Local report labels map respectively to Jira SCRUM-24, SCRUM-25, SCRUM-26 and SCRUM-27. They are Task records labelled sprint-2-defect because this project has no Bug type. All are Testing and linked to their corresponding feature; no story points or sprint membership were added.

| Label | Reproduction / previous result | Fix / evidence |
| --- | --- | --- |
| DEF-01 | Enter 1.5 as a cart quantity; fractional pairs were accepted | Integer/range validation; browser quantity cases passed |
| DEF-02 | Store `{}` in `ss_cart`; array operations could crash navigation/cart | Validated cart reader; unit and browser malformed-data cases passed |
| DEF-03 | Put an unknown product before a valid row in saved cart, then change/remove visible row | Use validated rows and product/size identity; browser regression passed |
| DEF-04 | Open product details at 375px; wide grid gutters caused page overflow | Reduced gutters; no page overflow at all three target widths |

An additional mobile overflow introduced by the new visually hidden table heading was caught during development and fixed by positioning the table scroll container before final verification.

## Verification — 15 October 2026

- Four Node.js cart regression tests passed.
- Ten actual-browser test groups passed using Playwright and installed Microsoft Edge. The precise browser version is recorded in `test-results/results.json`.
- Six pages checked at each of 375px, 768px and 1440px: homepage, catalogue, product details, populated cart, account and checkout. All 18 page/viewport combinations had no horizontal page overflow; mobile/tablet menu expansion and visible Shop navigation were checked.
- Screenshots captured for these 18 combinations. Representative mobile detail/cart and desktop catalogue screenshots inspected visually.
- No JavaScript page errors were observed during the completed browser run.
- Test arithmetic: Street Classic €64.99, 3 pairs = €194.97; 4 pairs across two sizes = €259.96. Simulated order confirmation retained €194.97 and cleared the cart.

Run `npm test` and `npm run test:browser` to reproduce. The tests use invented credentials in an isolated profile. They do not test a deployed site, a merged branch, a backend or real payment processing.

## Contribution evidence

Confluence records Kyle Nyankabaria as Product Owner and homepage/navigation owner; Erdogan Efe Demir as Scrum Master and catalogue/details owner; Muhammadyusuf Vakhobov as registration/login owner. Jira currently assigns all three Sprint 2 features to erdogan.demir.

Git history reviewed: KyleNyo's initial commit, Tiger1234562's integrated application import (`4871889`), and Tiger1234562's stylesheet update (`6ce5098`). Import history alone does not establish authorship of every module. Commit cc2bbe2 was published using the verified Tiger1234562 account identity. No commits have been created under another person's identity.

## Documentation issues and remaining work

- Team composition confirmed by Erdogan on 15 October: originally five members; the three active members are Erdogan Efe Demir, Kyle Nyankabaria and Muhammadyusuf Vakhobov. The other two are inactive. Confluence project and delivery pages have been updated without asserting formal removal or unsupported contributions.
- The Sprint 1 retrospective is still an unfilled template. Actual participants must supply their reflections; no meeting or attendance has been fabricated.
- SCRUM-6's old due date and historical Sprint 1 wording need review against Sprint 2 dates. Do not silently rewrite history.
- Some Confluence paragraphs say browser testing is pending despite recorded partial manual results. Append this dated verification and clarify which checks are new.
- Existing browser-only authentication stores plaintext passwords. This is a demo limitation, not secure production authentication. Do not describe the project as production ready.
- Teacher-specific submission format/rubric and any required individual contribution evidence have not been supplied.
- User approval for publication was received, with a requirement to back up prior state. Backups were created and verified before changes.
- Branch/PR publication, linked defect records, Testing statuses and Confluence reporting are complete. Review and integrate into the shared main branch, rerun tests on that exact revision, then apply the team's Definition of Done. No work item is Done solely because this local test run passed.

## Demo sequence (approximately 5 minutes)

1. Show the Sprint 2 board: selected scope, 13 points, actual status and ownership.
2. Open Home → Shop; demonstrate six products, Sneakers + street search, and a no-result search.
3. Open Street Classic, select size 42, add twice; select size 43 and add again.
4. Open Cart; show separate sizes, quantity update, correct total and removal. Demonstrate rejected fractional quantity.
5. Show guest checkout restriction, register with dummy data, logout, invalid login and successful login.
6. Optionally complete the existing simulated checkout with dummy payment data; show confirmation and empty cart.
7. Show 375px menu and product layout, test results, changes/PR and remaining limitations.

## Delivery checklist

- [x] Jira scope, acceptance criteria, subtasks and documented ownership inspected.
- [x] Shared repository baseline and existing implementation inspected.
- [x] Local implementation and regression tests completed.
- [x] Real-browser integration and responsive checks passed.
- [x] Test report and presentation sequence prepared.
- [x] User approval for external publication received.
- [x] Branch pushed and PR #1 linked and marked ready for review.
- [x] Defects and test evidence published to Jira; documentation updated in Confluence.
- [ ] Shared branch integration reviewed and verified.
- [ ] Team contribution evidence and actual retrospective completed by the team.
- [ ] Teacher's required submission format checked and final submission made.

## Publication and recovery — 15 October 2026

- Review-ready PR: https://github.com/KyleNyo/shoe-store-agile-project/pull/1
- Confluence: https://shoe-store-agile.atlassian.net/wiki/spaces/~712020765d7f79f9f14cb5b73370d4875a46fd/pages/6127619
- Backup branch: backup/pre-sprint-2-2026-10-15 (6ce5098). Main stays on the same baseline.
- 4 unit tests and all 10 browser groups passed again on a fresh GitHub clone of published application commit cc2bbe2. Subsequent publication notes change documentation only.
- The old catalogue Confluence page retains all historical content, with a dated verification appendix (version 7 → 8).
- Local backup includes the verified Git bundle, baseline source ZIP, full Jira record snapshot, affected comment/transition snapshots and Confluence HTML/version snapshot.
- To take a different approach, branch from main or the backup; do not reset or force-push over team work. Keep review/merge and final submission pending until the team agrees.

## Ready for team review

PR #1 is open and no longer a draft. It remains unmerged. See `TEAM-REVIEW.md` for the independent review checklist, five-minute demo and post-approval steps. No team approval is implied. Application code has not changed since the tested commit cc2bbe2; later commits only update documentation.
