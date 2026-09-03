# qa-agentic-lab — project plan

## Context

Build a **public** GitHub repo (`farina-qa/qa-agentic-lab`) that is simultaneously a learning project and a professional showcase for employers. It practises modern QA: Playwright automation, agentic AI tooling with Claude Code, defect finding and tracking, self-healing tests and CI/CD.

App under test: **https://www.saucedemo.com/**, chosen because it ships deliberate defects behind special users (`problem_user`, `performance_glitch_user`, `error_user`, `visual_user`), giving the defect-finding agents real, reproducible material.

Because the repo is public, credential handling is part of the showcase: even the publicly documented saucedemo passwords are treated as secrets (runtime `.env`, committed `.env.example`, GitHub secrets in CI, gitleaks scanning).

Agents run **locally, on demand**. The work is yours; the repo shows the results of it, and the agent definitions are committed so a reviewer can see how they are built.

Guiding principles: KISS and YAGNI. Every phase must be small and independently demoable.

---

## Decisions already made

| Decision | Choice |
| --- | --- |
| Repo | `farina-qa/qa-agentic-lab`, public, new (name confirmed available) |
| Tracking | GitHub Issues + Projects |
| First milestone | Thin vertical slice: login flow end to end |
| Agent runtime | Local, on demand. No agents in CI. |
| CI triggers | PR, push to `main`, and manual `workflow_dispatch`. No scheduled runs. |
| Language | TypeScript, `@playwright/test` only |

---

## Repository layout

```
qa-agentic-lab/
├── .github/
│   ├── ISSUE_TEMPLATE/       # requirement / user-story / bug / test-case forms
│   └── workflows/            # e2e.yml, secrets-scan.yml
├── .claude/
│   ├── agents/               # defect-triage.md, test-healer.md
│   ├── commands/             # /triage, /heal, /new-test-case
│   └── settings.json         # shared permissions (settings.local.json gitignored)
├── src/
│   ├── pages/                # LoginPage.ts, InventoryPage.ts, CartPage.ts, CheckoutPage.ts
│   ├── fixtures/             # test.ts — test.extend() injecting page objects
│   └── data/                 # users.ts, env.ts — read process.env, no literals
├── tests/
│   ├── e2e/                  # auth/, inventory/, cart/, checkout/
│   ├── known-defects/        # documents saucedemo's intentional bugs
│   └── api/                  # Phase 4
├── docs/
│   ├── test-strategy.md      # known-defect track, self-healing boundaries
│   ├── traceability.md       # requirement → story → test case → spec
│   └── adr/                  # short architecture decision records
├── playwright.config.ts
├── .env.example              # placeholders only, committed
└── package.json
```

`.env`, `node_modules/`, `playwright-report/`, `test-results/`, `blob-report/` and `.claude/settings.local.json` are gitignored.

---

## Tech choices

- **Playwright + TypeScript.** Drop the redundant `playwright` dependency the old repo carried; `@playwright/test` bundles the engine.
- **Fixtures-first with thin POM.** Page object classes hold selectors and actions (4-5 files, no base-page framework). `src/fixtures/test.ts` extends `base` via `test.extend()` so specs receive `{ loginPage, inventoryPage }` ready to use. This is the current Playwright idiom and it demonstrates fixture literacy.
- **Config via `dotenv`** loaded at the top of `playwright.config.ts`; `src/data/env.ts` validates required vars and fails fast. Playwright `projects` are used for the **browser matrix only**, not for environments; only one environment exists.
- **ESLint flat config + Prettier + `eslint-plugin-playwright`.** One lint script, one format script. No commit hooks; gitleaks in CI covers the real risk.
- **gitleaks as a required CI check** on every PR, justified by the public-repo constraint.
- **API tests** use Playwright's built-in `APIRequestContext`, so there is one runner and one report.

> **Regarding API testing:** Since saucedemo is a static SPA with no backend API, this plan targets restful-booker, a free public practice API unrelated to saucedemo, for API testing demonstration purposes.

---

## GitHub Issues + Projects model

**Labels** (three orthogonal dimensions plus flags):

| Dimension | Labels |
| --- | --- |
| Type | `type:requirement`, `type:user-story`, `type:bug`, `type:test-case`, `type:chore` |
| Area | `area:auth`, `area:inventory`, `area:cart`, `area:checkout`, `area:api`, `area:infra` |
| Priority | `priority:p1`, `priority:p2`, `priority:p3` |
| Flags | `agent-filed`, `self-healed`, `needs-human-review`, `known-defect`, `flaky` |

Status (Backlog → Ready → In progress → In review → Done) lives on the **Project board**, not as labels, so state has one home.

**Templates** (`.github/ISSUE_TEMPLATE/*.yml`, GitHub issue forms):
- *Requirement*: context, acceptance-criteria checklist, area.
- *User story*: as-a / I-want / so-that, acceptance criteria, parent requirement number.
- *Test case*: case ID (`TC-LOGIN-001`), preconditions, steps, expected result, automated y/n, spec path, parent story number.
- *Bug*: environment (browser, saucedemo user), steps, expected vs actual, run URL, artifact links, severity. This is the template the triage agent fills programmatically.

**Traceability without a test-management tool:** each test carries its case ID as a Playwright tag:

```ts
test('locked out user sees error', { tag: '@TC-LOGIN-002' }, async ({ loginPage }) => { … });
```

The test-case issue records the spec path; requirement → story → test case link by plain issue references. A failure therefore names its own issue, which is what lets the triage agent link and dedupe.

**Agent interaction** is plain `gh` CLI: `gh issue list --search` to dedupe, `gh issue create --label …` to file, `gh issue comment` for repeat occurrences.

> **Token gotcha:** GitHub Projects v2 mutations need the `project` scope. Your `gh` token currently has `gist, read:org, repo, workflow`, so run `gh auth refresh -s project` before automating the board.

---

## Agent design (`.claude/agents/`)

| Agent | Model | Job | Tools |
| --- | --- | --- | --- |
| `defect-triage` | Sonnet | Read the JSON report and failure artifacts, classify, dedupe against open issues, file or comment on a bug | Read, Grep, Bash(`gh`) |
| `test-healer` | Sonnet | Locator failures only: propose a minimal fix on a branch, open a PR | Read, Edit, Bash(`git`, `gh pr create`) |

Slash commands `/triage`, `/heal` and `/new-test-case` are the entry points, run by you when you want them. `/new-test-case <story#>` scaffolds a test-case issue plus a spec stub, wiring the traceability chain in one step.

### Failure artifacts the agents read

Parsing `trace.zip` is heavy for a model. Instead, a `test.afterEach` hook attaches a small agent-readable payload on failure via `testInfo.attach()`: `{ selector, errorMessage, domSnippet }`, plus a screenshot. The agents read that, the JSON reporter output, and `git diff` since the last green commit to tell "the test changed" from "the app changed".

### Classification decision tree

| Signal | Verdict |
| --- | --- |
| Playwright reported `flaky` (failed, passed on retry) | **Unstable test** → leave red, do not heal |
| Locator not found or strict-mode violation, page otherwise renders | **Selector drift** → healer |
| Element found, assertion on a value or message fails | **Product bug** → file issue |
| Fails only in CI, passes locally | **Environment** |
| Fails only for `problem_user` / `error_user` / `visual_user` | **Product bug** (intended defect) |

### Healer guardrails

- **Locators and waits only.** It must never touch `expect(...)` expected values; a wrong price, cart count or error message is a product signal, and healing it is exactly how self-healing hides bugs.
- **Excluded from healing:** tests tagged `@known-defect` (saucedemo's intentional bugs are the expected behaviour under test), tests you have labelled `flaky`, and `performance_glitch_user` timeouts (documented slowness, given their own longer timeout).
- **If ambiguous, fail loud.** No confident single candidate element means no guess: leave the test red and file a `needs-human-review` issue.
- Output is always a PR labelled `self-healed` + `needs-human-review`, with before/after diff and screenshot. `main` is branch-protected; nothing auto-merges. A CI check flags any healer PR that changed an assertion.

---

## CI/CD

| Workflow | Trigger | Contents |
| --- | --- | --- |
| `e2e.yml` | PR, push to `main`, `workflow_dispatch` | Chromium on PRs for fast feedback; full chromium/firefox/webkit matrix on `main` and on manual runs. `trace: retain-on-failure`, HTML report artifact 14 days. |
| `secrets-scan.yml` | PR, push to `main` | gitleaks, required check. |

No scheduled runs. When you want a full pass outside a PR, trigger `e2e.yml` manually from the Actions tab or with `gh workflow run e2e.yml`.

**Secrets and variables:** `BASE_URL` as a repo **Variable**; saucedemo passwords as repo **Secrets** despite being public, purely to demonstrate the pattern, with the README saying exactly that.

---

## Roadmap

**Phase 0 — prerequisites**
- `sudo dnf install nodejs22 gitleaks` (Node 22 LTS is packaged for Nobara; Node is not currently installed).
- Verify `npx playwright install --with-deps` on Fedora: **the `--with-deps` flag targets Debian/Ubuntu** and may not resolve system libraries here. Confirm browsers actually launch, and document a manual `dnf` fallback if not.
- `gh repo create farina-qa/qa-agentic-lab --public --clone`; branch protection on `main`; `gh auth refresh -s project`; create labels and the Project.

**Phase 1 — thin vertical slice (login)** ← the milestone
1. Scaffold: `package.json`, `tsconfig.json`, `playwright.config.ts` (chromium only), ESLint/Prettier, `.gitignore`, `.env.example`.
2. Issue templates and labels; file one requirement, one story and three test cases (`TC-LOGIN-001..003`) **by hand**, to prove the traceability model before automating it.
3. `src/pages/LoginPage.ts`, `src/pages/InventoryPage.ts`, `src/fixtures/test.ts`, `src/data/env.ts`.
4. `tests/e2e/auth/login.spec.ts`: valid login, `locked_out_user`, invalid credentials.
5. `.github/workflows/e2e.yml` + `secrets-scan.yml`; secrets and variables configured.
6. `.claude/agents/defect-triage.md` and `/triage`.
7. README explaining the loop and the design decisions behind it.

**Phase 2** — inventory, cart, checkout; `tests/known-defects/problem-user.spec.ts` with `@known-defect` tags; full matrix on `main`.
**Phase 3** — `test-healer` + `/heal`, PR workflow, assertion guard.
**Phase 4** — API track against restful-booker, split into its own Playwright project.

**Backlog notes only** (`docs/adr/`):
- *Flakiness analysis*: Playwright's JSON reporter already marks a test `flaky` when it fails then passes on retry; a future phase could accumulate run history on an orphan branch and add a `flakiness-analyst` agent to flag repeat offenders.
- Accessibility via `@axe-core/playwright`.
- Visual regression via `toHaveScreenshot` against `visual_user`.

---

## Verification of the thin slice

1. `node -v && npm -v`; `npm ci`; `npx playwright install chromium` and confirm a browser actually launches on Fedora.
2. Copy `.env.example` to `.env`, run the login spec, confirm three green tests, open the HTML report.
3. Confirm the requirement → story → test-case chain resolves in GitHub, and each `@TC-LOGIN-00x` tag matches what its issue records.
4. Open a PR; confirm `e2e.yml` runs green and uploads a downloadable report artifact.
5. Break a locator deliberately, rerun, then `/triage`: it must classify selector drift and **not** file a product bug.
6. Restore the locator. The product-bug path is verified in phase 2, against a real `problem_user` defect with a clean working tree: `/triage` files a bug linked to the right test case, and files nothing new on a second run.
   Editing a spec to fake the failure does not work, because the agent reads `git diff` to tell a changed test from a changed app and correctly refuses to file.
7. gitleaks passes and `git grep` finds no credential literals; `git log -p -- .env` shows nothing.

---

## Risks and gotchas

- **Self-healing hiding real bugs** is the central risk of the project. Mitigated by locator-only scope, the `@known-defect` and `flaky` exclusions, fail-loud-if-ambiguous, and PR-only output. Make this the most visible explanation in the README; it is what an employer will scrutinise.
- **saucedemo is a shared public site** with no reset and no data isolation. Fresh browser context per test, modest parallelism, no load-style patterns. Document it as a deliberate strategy choice.
- **`performance_glitch_user` injects real latency.** Isolate those tests and give them their own timeout so slowness is never mistaken for a defect.
- **Playwright on Fedora**: `--with-deps` assumes apt. Verify in Phase 0 rather than discovering it in CI.
- **Projects v2 token scope**: `gh auth refresh -s project` is needed before board automation works.
- **Public repo secrets**: no credential literals in code, test titles, error messages or committed reports. Traces can embed typed values, so review artifact retention before sharing public artifact links.
- **The site can change or go down.** A red run is not automatically a product bug, which is precisely why triage classifies before filing.
