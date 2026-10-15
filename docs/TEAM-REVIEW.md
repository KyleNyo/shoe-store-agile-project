> Historical pre-merge record. PR #1 has since been merged and tested. See [CURRENT-STATUS.md](CURRENT-STATUS.md) for the latest status and safe recovery procedure.

# Sprint 2 — Team Review and Demo

PR: https://github.com/KyleNyo/shoe-store-agile-project/pull/1

Review state: ready for review; no team approval is recorded by this document. Do not merge until the team agrees.

## Active team

The project originally had five members. Erdogan Efe Demir confirmed on 15 October 2026 that the active members are Erdogan, Kyle Nyankabaria and Muhammadyusuf Vakhobov. Two original members are currently inactive. This clarification does not assert formal removal or attribute work to inactive members.

## Suggested independent review — 10 minutes

These checks are proposed for reviewers. Empty boxes mean the team's independent checks have not yet been recorded; they do not negate the existing automated results.

- [ ] Download/checkout `sprint-2-completion`, record the commit checked and serve it locally over HTTP.
- [ ] Home → Shop works. All six products show images, names and EUR prices.
- [ ] Select Sneakers and search for `street`: one result. Search `zzzz`: clear no-result feedback.
- [ ] Open Street Classic, select 42 and add twice; select 43 and add once. Cart has separate sizes and total €194.97.
- [ ] Change the size-42 quantity to 3: total €259.96. Enter 1.5: previous valid quantity remains and feedback appears.
- [ ] Remove size 43: remaining total €194.97. Remove the last row: empty-cart message appears.
- [ ] As a guest, opening checkout requires login. Use invented credentials to check registration, logout, failed login and successful login.
- [ ] At 375px, verify the menu opens, catalogue/details are readable and the page does not overflow. The cart table may scroll horizontally within its own area.
- [ ] Run `npm test` and, after `npm install`, `npm run test:browser` with installed Edge (or `BROWSER_CHANNEL=chrome`).
- [ ] Check the diff preserves your module. Record any requested change with the file/page, reproduction steps and expected behaviour.

Review record to complete: reviewer, date, commit, checks performed, defects found, and approve/request changes. This file does not imply that Kyle or Muhammadyusuf has reviewed or approved anything.

## Demo sequence — 5 minutes

1. **Scope (30 seconds):** show SCRUM-6, SCRUM-8 and SCRUM-9, totalling 13 points. Explain actual status and active team ownership.
2. **Catalogue (60 seconds):** show products, combined category/search, no results, product details and sizes.
3. **Cart (90 seconds):** show same-size merging, separate sizes, quantity changes, exact totals, invalid-input feedback and removal.
4. **Integration (60 seconds):** show guest checkout restriction and account flow with invented credentials. Simulated checkout is optional; use dummy payment data only.
5. **Evidence and limits (60 seconds):** show 4 passed unit tests, 10 browser groups, 18 responsive page checks, defect records and the PR. State whether merge has actually happened. Explain browser-only demo authentication and simulated payment.

## After team approval

- Resolve requested changes, then merge the agreed PR using the repository's normal flow.
- Test the exact merged main revision. If it fails, keep affected tasks out of Done and fix/retest.
- Apply the agreed Definition of Done to SCRUM-6/8/9 and relevant subtasks/defects.
- Confirm sprint start/review/closure using real dates; do not backdate activity.
- Record actual review/retrospective input and contributions. Do not invent participation.
- Check the teacher's required format, deadline/time, individual evidence and submission location; submit only once these are known.

## Alternative solution / recovery

Main is unchanged by this PR until merge. The previous application is retained on `backup/pre-sprint-2-2026-10-15` at `6ce5098`. A different solution can start from main or that backup. See `RECOVERY-TR.md`; avoid force-pushing or removing later team work.
