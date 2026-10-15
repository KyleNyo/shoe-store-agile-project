# Sprint 2 — Current status after merge

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
