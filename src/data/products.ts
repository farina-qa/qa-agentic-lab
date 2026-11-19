/** A product as the shopper should see it in the list. */
export type Product = {
  name: string;
  price: number;
  /**
   * A fragment of the image file name. Checking that an image loaded is not
   * enough: a placeholder loads too, so the test also checks it is this
   * product's own picture.
   */
  image: string;
};

/** The catalogue the product list is expected to show, in no particular order. */
export const products: Product[] = [
  { name: 'Sauce Labs Backpack', price: 29.99, image: 'sauce-backpack' },
  { name: 'Sauce Labs Bike Light', price: 9.99, image: 'bike-light' },
  { name: 'Sauce Labs Bolt T-Shirt', price: 15.99, image: 'bolt-shirt' },
  { name: 'Sauce Labs Fleece Jacket', price: 49.99, image: 'sauce-pullover' },
  { name: 'Sauce Labs Onesie', price: 7.99, image: 'red-onesie' },
  { name: 'Test.allTheThings() T-Shirt (Red)', price: 15.99, image: 'red-tatt' },
];
