import type { Locator, Page } from '@playwright/test';
import type { User } from '../data/users';

/**
 * The saucedemo login page.
 *
 * A page object holds two things: where the elements are (the locators) and
 * what a user can do on the page (the methods). Tests then read as intent
 * rather than as a list of clicks, and when the site's markup changes there is
 * exactly one file to fix.
 */
export class LoginPage {
  readonly username: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;
  readonly error: Locator;

  constructor(private readonly page: Page) {
    // data-test attributes are added by the developers for testing, so they
    // survive styling changes. They are the most stable choice on this site.
    this.username = page.getByTestId('username');
    this.password = page.getByTestId('password');
    this.loginButton = page.getByTestId('login-button');
    this.error = page.getByTestId('error');
  }

  /** Opens the login page. baseURL comes from playwright.config.ts. */
  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  /** Fills the form and submits it. It does not assert anything. */
  async signIn(user: User): Promise<void> {
    await this.username.fill(user.username);
    await this.password.fill(user.password);
    await this.loginButton.click();
  }
}
