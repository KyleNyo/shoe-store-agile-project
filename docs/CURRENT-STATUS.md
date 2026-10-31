# Current project status

Updated 31 October 2026.

- Delivered application: `main`, verified application revision `91cc88431cd09d023b15a002ba725a5bde2de4ba`; PRs #20 and #21 are merged.
- Verification: 40 passing unit tests, 54 passing Edge browser scenario groups, zero page errors; merged-main Chromium and Firefox checks passed in [run 41183593148](https://github.com/KyleNyo/shoe-store-agile-project/actions/runs/41183593148).
- Sprint 3 closed on 31 October 2026 at 18:22 CET after the final Jira query found no unfinished sprint issues. SCRUM-35 and all 28 epic children are Done. Original issue ownership is preserved.
- SCRUM-4 remains an unscoped legacy placeholder outside sprint commitments; it is not counted as delivered functionality.
- [Final documentation and delivery navigation](https://shoe-store-agile.atlassian.net/wiki/spaces/~712020765d7f79f9f14cb5b73370d4875a46fd/pages/12550149) provides ten chapters, individual contribution evidence and sprint review/engineering reflection.
- Course submission, instructor access and independent peer acceptance are not established by the test results.

## Historical checkpoint — 17 October 2026

The following branch names, counts and statuses describe the earlier checkpoint, not the final delivery above.

Updated 17 October 2026.

- Current presentation source: integrated-demo, including the SCRUM-39–41 quality improvements. Earlier snapshot: presentation-demo-2026-10-17.
- Current combined review: [PR #7](https://github.com/KyleNyo/shoe-store-agile-project/pull/7), from integrated-demo into main.
- The presentation application combines the catalogue controls, checkout validation, printable order summary, keyboard focus improvements and resilient images. Its 4 unit tests and 25 Edge browser groups passed locally. The same 25 browser groups passed on Linux Chromium and Firefox in [GitHub run 39058917450](https://github.com/KyleNyo/shoe-store-agile-project/actions/runs/39058917450), application revision 9fa03ca.
- Sprint 2 has four Done top-level items / 17 points. Follow-up features remain Testing; the sprint is active.
- See [running and demo instructions](INTEGRATED-DEMO.md), [contributions](../CONTRIBUTIONS.md) and [review order](PR-REVIEW.md).
- Automated checks are configured in `.github/workflows/tests.yml`; their actual status is shown in PR #7 and GitHub Actions.
- Keyboard/image/browser audit: [quality improvements](QUALITY-IMPROVEMENTS.md); baseline defect record: SCRUM-47.

## Historical verification record — 15 October 2026

The following notes describe an earlier checkpoint. Current delivery details are above.

Updated 15 October 2026.

PR #1 was merged at Erdogan Efe Demir's explicit request after pre-merge backups. No approval by Kyle Nyankabaria or Muhammadyusuf Vakhobov is claimed.

Verified main revision: `c522d124ca06123b9b6e21a72b88ce227a3f2362`.

## Completed

- Implementation merged into the shared main branch.
- Clean GitHub clone of the merged revision passed all 4 Node unit tests and 10 Edge browser groups.
- 18 page/viewport checks at 375, 768 and 1440px passed; no JavaScript page errors were observed.
- Jira and Confluence record the merged-main verification and pending peer acceptance.
- Baseline code/history, PR, Jira state and affected Confluence content have local backups. The original application remains on `backup/pre-sprint-2-2026-10-15` at `6ce5098`.

## Pending

- Peer review/acceptance: Jira work remains Testing; no peer review or meeting is fabricated.
- Sprint start, actual review/retrospective and closure.
- Teacher-specific submission format, contribution requirements and final course submission.

The active team is Erdogan Efe Demir, Kyle Nyankabaria and Muhammadyusuf Vakhobov. Two other original members are inactive; no formal removal is asserted.

## Evidence and recovery

- PR: https://github.com/KyleNyo/shoe-store-agile-project/pull/1
- Confluence: https://shoe-store-agile.atlassian.net/wiki/spaces/~712020765d7f79f9f14cb5b73370d4875a46fd/pages/6127619
- `merged-main-test-results.json` records the verified application revision and results.
- Earlier delivery/review/recovery notes describe the pre-merge state and are historical where they say main was unchanged or the PR was unmerged.
- For a different solution, create a new branch from the backup. If the merged changes must be undone on main, use a reviewed revert of merge `c522d124ca06123b9b6e21a72b88ce227a3f2362` with its first parent (for example `git revert -m 1 c522d124ca06123b9b6e21a72b88ce227a3f2362`), after checking any later work. Do not reset or force-push over team changes. No rollback has been performed.

This remains a static student demo with browser-only plaintext password storage and simulated payment; use invented test data only.
