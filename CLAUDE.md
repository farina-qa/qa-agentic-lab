# CLAUDE.md

Playwright tests against saucedemo.com, plus Claude Code agents that triage failures and
review tickets. Public portfolio repo: the process is meant to be as readable as the code.

## Commands

```bash
npm test                              # full run (chromium)
npx playwright test --grep @TC-LOGIN-002   # one test case by tag
npm run test:ui                       # interactive runner
npm run report                        # HTML report of the last run
npm run lint && npm run typecheck     # must both pass before a commit
npm run format                        # prettier over the repo
```

Tests need `.env` (copy `.env.example`). Every variable is read through
`requireEnv()` in `src/data/env.ts`, which fails the run with an actionable
message rather than a mysterious timeout.

## Architecture

- `tests/e2e/**.spec.ts` import `test` and `expect` from `src/fixtures/test.ts`,
  never from `@playwright/test` directly. The fixture hands over ready page
  objects, so no spec calls `new LoginPage(page)`.
- `src/pages/` holds locators and user actions. Page-object methods do not assert;
  assertions live in the spec.
- `src/data/users.ts` builds accounts from env vars. Credentials never appear as
  literals, even though saucedemo publishes them.
- `testIdAttribute` is set to `data-test` in `playwright.config.ts`, so
  `getByTestId('username')` targets saucedemo's own attribute.

## Traceability

Each test carries its test-case issue ID as a tag: `{ tag: '@TC-LOGIN-001' }`.
That tag is the only link between a red run and the tracked issue, so a new test
gets a test-case issue and a row in `docs/traceability.md` first.

Requirement issue → user story → test case issue → spec file.

## Agents

`.claude/agents/` is committed on purpose, so a reviewer can read the definitions.

- `/triage` runs `defect-triage` over `test-results/results.json` (the JSON
  reporter exists for this) and classifies each failure before acting.
- `/devils-advocate <issue>` argues against a ticket and archives the report under
  `docs/reviews/`.

Agents run locally, on demand. None run in CI.

## Conventions

- Ticket wording follows `docs/writing-tickets.md`; Playwright, agents and
  saucedemo accounts stay out of requirements and stories.
- A healer may change locators and waits only. Changing an expected value would
  hide a product defect.
- Comments explain why a choice was made, not what the line does. Match that tone.
- Browsers: chromium locally and in CI; webkit cannot launch on Fedora
  (`docs/adr/0001-browser-matrix.md`).

## Workflow

Work starts from a GitHub issue: read it, move it to In Progress, then create a
branch and a worktree for it under `.worktrees/` at the repository root
(gitignored). Once the issue's PR is merged, delete both the branch and the
worktree.
