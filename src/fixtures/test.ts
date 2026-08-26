import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';

/**
 * Custom fixtures.
 *
 * A fixture is something Playwright builds for a test on request and cleans up
 * afterwards. Extending the base test lets a spec ask for `{ loginPage }` and
 * receive one already wired to a fresh browser page, so no test ever writes
 * `new LoginPage(page)` itself.
 *
 * Every test gets its own browser context, which means its own cookies and
 * localStorage. That matters on saucedemo, where the cart is stored in the
 * browser and would otherwise leak between tests.
 */
type Pages = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
};

export const test = base.extend<Pages>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
});

// Re-exported so specs import `test` and `expect` from one place.
export { expect } from '@playwright/test';
