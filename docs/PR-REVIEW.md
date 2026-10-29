# Pull request review order

Use [PR #7](https://github.com/KyleNyo/shoe-store-agile-project/pull/7) as the combined review for the presentation application.

| Original PR | Scope | Included in PR #7 |
|---|---|---|
| #2 | Price sorting — SCRUM-33 | Yes |
| #3 | Price range and EU-size filtering — SCRUM-34 | Yes |
| #4 | Reset catalogue controls — SCRUM-36 | Yes |
| #5 | Accessible checkout validation — SCRUM-37 | Yes, integrated commit bf37a5c |
| #6 | Printable order summary — SCRUM-38 | Yes, integrated commit 91e8b99 |

The individual PRs preserve the feature-by-feature review history. Their changes are already combined in PR #7; do not merge both paths independently. Closing a superseded feature PR does not delete its branch or mark the Jira feature accepted.

The presentation tag remains an immutable snapshot of the version selected for recording. Subsequent documentation and test-automation updates appear on integrated-demo and PR #7. The main branch stays separate until the combined change is reviewed and accepted.

## Automated checks

The Store tests workflow runs on pushes to main/integrated-demo and on pull requests. It installs locked dependencies, runs unit tests and the browser/responsive suite with Playwright Chromium, and saves test output/screenshots/PDF evidence as a seven-day artifact. It can also be run manually after the workflow is available in GitHub.

Local browser runs default to installed Edge. For a local Chromium run, set BROWSER_CHANNEL=chromium after installing the matching Playwright Chromium browser.
