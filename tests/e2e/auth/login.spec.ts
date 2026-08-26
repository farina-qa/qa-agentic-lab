import { test, expect } from '../../../src/fixtures/test';
import { users } from '../../../src/data/users';

/**
 * Login coverage.
 *
 * Each test carries the ID of its test-case issue as a tag. That tag is the
 * link between a red run and the tracked test case, and it is what lets the
 * defect-triage agent find the right issue without guessing.
 */
test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test(
    'standard user reaches the product list',
    { tag: '@TC-LOGIN-001' },
    async ({ loginPage, inventoryPage, page }) => {
      await loginPage.signIn(users.standard);

      // Two assertions on purpose: the URL proves navigation happened, the
      // heading proves the page actually rendered.
      await expect(page).toHaveURL(new RegExp(`${inventoryPage.path}$`));
      await expect(inventoryPage.title).toBeVisible();
    },
  );

  test(
    'locked out user is refused with an explanation',
    { tag: '@TC-LOGIN-002' },
    async ({ loginPage, page }) => {
      await loginPage.signIn(users.lockedOut);

      await expect(loginPage.error).toBeVisible();
      await expect(loginPage.error).toContainText('locked out');

      // Being refused must also mean going nowhere.
      await expect(page).toHaveURL(/\/$/);
    },
  );

  test('wrong password is refused', { tag: '@TC-LOGIN-003' }, async ({ loginPage }) => {
    await loginPage.signIn({
      username: users.standard.username,
      password: 'not-the-password',
    });

    await expect(loginPage.error).toContainText(
      'Username and password do not match any user in this service',
    );
  });
});
