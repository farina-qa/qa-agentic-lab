# Traceability

Requirements, stories and test cases are GitHub issues in this repository. Each
automated test carries its test case ID as a Playwright tag, which is what links
a red run back to the tracked case.

| Test case                              | Tag             | Spec                           | Story   |
| -------------------------------------- | --------------- | ------------------------------ | ------- |
| Standard user reaches the product list | `@TC-LOGIN-001` | `tests/e2e/auth/login.spec.ts` | Sign in |
| Locked out user is refused             | `@TC-LOGIN-002` | `tests/e2e/auth/login.spec.ts` | Sign in |
| Wrong password is refused              | `@TC-LOGIN-003` | `tests/e2e/auth/login.spec.ts` | Sign in |

To run one case: `npx playwright test --grep @TC-LOGIN-002`
