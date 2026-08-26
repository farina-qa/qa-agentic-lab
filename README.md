# qa-agentic-lab

A QA automation project that tests [saucedemo.com](https://www.saucedemo.com/) with
Playwright, and uses Claude Code agents to triage the failures and propose fixes.

It is a working portfolio: the requirements, stories, test cases and bugs all live
in this repository's issues, so the process is as visible as the code.

## Why saucedemo

It ships deliberate defects behind specific accounts, `problem_user`,
`performance_glitch_user`, `error_user` and `visual_user`. That gives the
defect-finding agents real, reproducible material instead of contrived failures.

## How it fits together

```
requirement issue → user story → test case issue → spec file
                                        ↓
                              Playwright run (local or CI)
                                        ↓
                            defect-triage agent classifies
                                        ↓
                       product bug → GitHub issue, linked to the test case
                     selector drift → healer proposes a fix in a pull request
                        unstable test → left red, labelled, handed to a human
```

Each test carries its test case ID as a tag, so a failure names its own issue:

```ts
test('locked out user is refused', { tag: '@TC-LOGIN-002' }, async ({ loginPage }) => { … });
```

## Self-healing, and its limits

An agent that rewrites tests until they pass is worse than no automation at all.
The healer in this project may change **locators and waits only**. It may never
touch an expected value, because a wrong price or a wrong error message is a
product signal and healing it would hide a real defect.

It is also excluded from tests tagged `@known-defect`, from tests labelled
`flaky`, and from `performance_glitch_user` timeouts. When the evidence is
ambiguous it leaves the test red and asks for a human. Every fix it proposes
arrives as a pull request; nothing merges to `main` on its own.

## Credentials

The saucedemo passwords are printed on the site's own login page. They are still
handled as secrets here: read from `.env` at runtime, listed as placeholders in
`.env.example`, stored as GitHub secrets in CI, and scanned for by gitleaks on
every push. The habit is the point.

## Running the tests

```bash
npm ci
npx playwright install chromium
cp .env.example .env   # then fill it in
npm test               # npm run test:ui for the interactive runner
npm run report         # opens the HTML report of the last run
```

Local runs use chromium and firefox. Webkit cannot launch on Fedora, so it runs
in CI only; see [ADR 0001](docs/adr/0001-browser-matrix.md).

## Layout

| Path              | What lives there                                         |
| ----------------- | -------------------------------------------------------- |
| `src/pages/`      | Page objects: where the elements are, what a user can do |
| `src/fixtures/`   | Custom fixtures that hand page objects to a test         |
| `src/data/`       | Environment reading and the test accounts                |
| `tests/e2e/`      | The specs                                                |
| `.claude/agents/` | Agent definitions, committed so they can be read         |
| `docs/adr/`       | Decisions, with the reasoning that produced them         |

## Status

Phase 1: login covered end to end, triage agent running locally.
Phase 2 adds inventory, cart and checkout, plus the intentional-defect suite.
