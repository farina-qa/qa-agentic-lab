# Traceability

Requirements, stories and test cases are GitHub issues in this repository. Each
automated test carries its test case ID as a Playwright tag, which is what links
a red run back to the tracked case.

## Authentication

Requirement [#1](../../issues/1) → story [#2](../../issues/2)

| Test case | Issue | Tag | Spec |
| --- | --- | --- | --- |
| Standard user reaches the product list | [#3](../../issues/3) | `@TC-LOGIN-001` | `tests/e2e/auth/login.spec.ts` |
| Locked out user is refused | [#4](../../issues/4) | `@TC-LOGIN-002` | `tests/e2e/auth/login.spec.ts` |
| Wrong password is refused | [#5](../../issues/5) | `@TC-LOGIN-003` | `tests/e2e/auth/login.spec.ts` |

To run a single case:

```bash
npx playwright test --grep @TC-LOGIN-002
```
