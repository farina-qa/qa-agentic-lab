import { test, expect } from '../../../src/fixtures/test';
import { users } from '../../../src/data/users';
import { products } from '../../../src/data/products';
import { SortOrder } from '../../../src/pages/InventoryPage';

/**
 * Product list coverage for story #10.
 *
 * Expected orders are derived from the catalogue in src/data/products.ts
 * rather than copied from the site, so a sort that returns the wrong order
 * cannot also become the expected value.
 */
const byName = (a: string, b: string) => a.localeCompare(b);
const namesAsc = products.map((p) => p.name).sort(byName);
const pricesAsc = products.map((p) => p.price).sort((a, b) => a - b);
const asText = (prices: number[]) => prices.map((p) => `$${p.toFixed(2)}`);

test.describe('Product list', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.signIn(users.standard);
  });

  test('shows six complete products', { tag: '@TC-INV-001' }, async ({ inventoryPage }) => {
    await expect(inventoryPage.items).toHaveCount(6);

    for (const product of products) {
      const item = inventoryPage.item(product.name);
      await expect(item.getByTestId('inventory-item-desc')).toHaveText(/\S/);
      await expect(item.getByTestId('inventory-item-price')).toHaveText(/^\$\d+\.\d{2}$/);

      const image = item.getByRole('img');
      await expect(image).toHaveAttribute('src', new RegExp(product.image));
      // A src attribute proves nothing about the pixels; naturalWidth is 0
      // when the browser failed to decode or fetch the file.
      await expect
        .poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0))
        .toBe(true);
    }
  });

  test('starts sorted by name, A to Z', { tag: '@TC-INV-002' }, async ({ inventoryPage }) => {
    await expect(inventoryPage.itemNames).toHaveText(namesAsc);
  });

  // Each row keeps its own tag, so a red run still names the one direction
  // that broke.
  const sorts = [
    {
      tag: '@TC-INV-003',
      title: 'sorts by name, A to Z',
      // The list already starts A to Z, so sort away first or the test
      // would pass without the control doing anything.
      apply: [SortOrder.nameDesc, SortOrder.nameAsc],
      column: 'itemNames',
      expected: namesAsc,
    },
    {
      tag: '@TC-INV-004',
      title: 'sorts by name, Z to A',
      apply: [SortOrder.nameDesc],
      column: 'itemNames',
      expected: [...namesAsc].reverse(),
    },
    // Prices are compared rather than names: the two $15.99 shirts may
    // appear in either order, and the price column is the same both ways.
    {
      tag: '@TC-INV-005',
      title: 'sorts by price, low to high',
      apply: [SortOrder.priceAsc],
      column: 'itemPrices',
      expected: asText(pricesAsc),
    },
    {
      tag: '@TC-INV-006',
      title: 'sorts by price, high to low',
      apply: [SortOrder.priceDesc],
      column: 'itemPrices',
      expected: asText([...pricesAsc].reverse()),
    },
  ] as const;

  for (const { tag, title, apply, column, expected } of sorts) {
    test(title, { tag: [tag] }, async ({ inventoryPage }) => {
      for (const order of apply) {
        await inventoryPage.sortBy(order);
      }
      await expect(inventoryPage[column]).toHaveText([...expected]);
    });
  }
});
