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

## Inventory

Requirement [#9](../../issues/9) → story [#10](../../issues/10)

| Test case | Issue | Tag | Spec |
| --- | --- | --- | --- |
| Product list shows six complete products | [#17](../../issues/17) | `@TC-INV-001` | `tests/e2e/inventory/inventory.spec.ts` |
| Product list starts sorted by name, A to Z | [#18](../../issues/18) | `@TC-INV-002` | `tests/e2e/inventory/inventory.spec.ts` |
| Sort by name, A to Z | [#19](../../issues/19) | `@TC-INV-003` | `tests/e2e/inventory/inventory.spec.ts` |
| Sort by name, Z to A | [#20](../../issues/20) | `@TC-INV-004` | `tests/e2e/inventory/inventory.spec.ts` |
| Sort by price, low to high | [#21](../../issues/21) | `@TC-INV-005` | `tests/e2e/inventory/inventory.spec.ts` |
| Sort by price, high to low | [#22](../../issues/22) | `@TC-INV-006` | `tests/e2e/inventory/inventory.spec.ts` |

To run a single case:

```bash
npx playwright test --grep @TC-LOGIN-002
```
