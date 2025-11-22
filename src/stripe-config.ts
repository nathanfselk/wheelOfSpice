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
    description: 'Premium black peppercorns from India, the king of spices with bold, pungent flavor',
    mode: 'payment',
    price: 8.00
  },
  {
    id: 'prod_turmeric_001',
    priceId: 'price_turmeric_001',
    name: 'Turmeric',
    description: 'Golden turmeric powder from Southeast Asia, perfect for curries and health drinks',
    mode: 'payment',
    price: 7.50
  },
  {
    id: 'prod_cumin_001',
    priceId: 'price_cumin_001',
    name: 'Cumin',
    description: 'Aromatic cumin seeds from Egypt, essential for Mexican and Indian cuisine',
    mode: 'payment',
    price: 6.50
  },
  {
    id: 'prod_paprika_001',
    priceId: 'price_paprika_001',
    name: 'Paprika',
    description: 'Sweet Hungarian paprika with vibrant color and mild, smoky flavor',
    mode: 'payment',
    price: 7.00
  },
  {
    id: 'prod_cardamom_001',
    priceId: 'price_cardamom_001',
    name: 'Cardamom',
    description: 'Premium green cardamom pods from India, the queen of spices',
    mode: 'payment',
    price: 12.00
  },
  {
    id: 'prod_cloves_001',
    priceId: 'price_cloves_001',
    name: 'Cloves',
    description: 'Whole cloves from Indonesia with intense aromatic flavor',
    mode: 'payment',
    price: 9.50
  },
  {
    id: 'prod_nutmeg_001',
    priceId: 'price_nutmeg_001',
    name: 'Nutmeg',
    description: 'Whole nutmeg from Indonesia, perfect for baking and savory dishes',
    mode: 'payment',
    price: 8.50
  },
  {
    id: 'prod_ginger_001',
    priceId: 'price_ginger_001',
    name: 'Ginger',
    description: 'Dried ginger powder from Southeast Asia with warming, zesty flavor',
    mode: 'payment',
    price: 6.00
  },
  {
    id: 'prod_saffron_001',
    priceId: 'price_saffron_001',
    name: 'Saffron',
    description: 'Premium saffron threads from Greece, the world\'s most precious spice',
    mode: 'payment',
    price: 45.00
  },
  {
    id: 'prod_vanilla_001',
    priceId: 'price_vanilla_001',
    name: 'Vanilla',
    description: 'Pure vanilla extract from Madagascar beans, perfect for baking',
    mode: 'payment',
    price: 15.00
  },
  {
    id: 'prod_garlic_powder_001',
    priceId: 'price_garlic_powder_001',
    name: 'Garlic Powder',
    description: 'Premium garlic powder from California, concentrated savory flavor',
    mode: 'payment',
    price: 5.50
  }
];

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.priceId === priceId);
};

export const getProductById = (productId: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.id === productId);
};