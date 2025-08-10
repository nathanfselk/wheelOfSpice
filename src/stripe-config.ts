export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  price: number;
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_SqOtMYFvoBV5RJ',
    priceId: 'price_1Rui65HhELikUwZjvLjdSR11',
    name: 'Cinnamon',
    description: 'Premium Ceylon cinnamon with sweet, warm flavor perfect for baking and cooking',
    mode: 'payment',
    price: 8.00
  },
  {
    id: 'prod_SqOtMrZmrwPoyh',
    priceId: 'price_1Rui5SHhELikUwZjLOJRY9wF',
    name: 'Black Pepper',
    description: 'Black Pepper',
    mode: 'payment',
    price: 8.00
  }
];

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.priceId === priceId);
};

export const getProductById = (productId: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.id === productId);
};