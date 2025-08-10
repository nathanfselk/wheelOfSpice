export interface CartItem {
  productId: string;
  priceId: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  spice?: {
    color: string;
    icon: string;
    origin: string;
  };
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}