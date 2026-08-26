---
description: Triage the last Playwright run and file or update GitHub issues.
---

Run the `defect-triage` agent against the most recent test results.

If `test-results/results.json` does not exist, run `npx playwright test` first.

Report each failure as: test name, tag, verdict, and the action you took.
