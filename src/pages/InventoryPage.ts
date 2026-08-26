import type { Locator, Page } from '@playwright/test';

/**
 * The product listing shown after a successful login.
 *
 * In phase 1 it exists only so the login test can prove where it landed.
 * Phase 2 adds sorting, the cart badge and the product cards.
 */
export class InventoryPage {
  readonly title: Locator;
  readonly inventoryList: Locator;

  constructor(page: Page) {
    this.title = page.getByText('Products', { exact: true });
    this.inventoryList = page.getByTestId('inventory-list');
  }

  /** The URL this page is expected to live at. */
  get path(): string {
    return '/inventory.html';
  }
}
