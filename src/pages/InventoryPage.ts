import type { Locator, Page } from '@playwright/test';

/** The values of saucedemo's sort dropdown, named for what they do. */
export const SortOrder = {
  nameAsc: 'az',
  nameDesc: 'za',
  priceAsc: 'lohi',
  priceDesc: 'hilo',
} as const;
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];

/** The product listing shown after a successful login. */
export class InventoryPage {
  readonly title: Locator;
  readonly inventoryList: Locator;
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly sortSelect: Locator;

  constructor(page: Page) {
    this.title = page.getByText('Products', { exact: true });
    this.inventoryList = page.getByTestId('inventory-list');
    this.items = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.sortSelect = page.getByTestId('product-sort-container');
  }

  /** The URL this page is expected to live at. */
  get path(): string {
    return '/inventory.html';
  }

  /** One product card, found by the name the shopper reads on it. */
  item(name: string): Locator {
    return this.items.filter({ has: this.itemNames.getByText(name, { exact: true }) });
  }

  async sortBy(order: SortOrder): Promise<void> {
    await this.sortSelect.selectOption(order);
  }
}
