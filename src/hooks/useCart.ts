import { useState, useEffect } from 'react';
import { CartItem, Cart } from '../types/cart';

const CART_STORAGE_KEY = 'spice-cart';

export const useCart = () => {
  const [cart, setCart] = useState<Cart>({
    items: [],
    totalItems: 0,
    totalPrice: 0
  });

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const calculateTotals = (items: CartItem[]): { totalItems: number; totalPrice: number } => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return { totalItems, totalPrice };
  };

  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    setCart(currentCart => {
      const existingItemIndex = currentCart.items.findIndex(
        cartItem => cartItem.productId === item.productId
      );

      let newItems: CartItem[];

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        newItems = currentCart.items.map((cartItem, index) =>
          index === existingItemIndex
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      } else {
        // Add new item
        newItems = [...currentCart.items, { ...item, quantity }];
      }

      const { totalItems, totalPrice } = calculateTotals(newItems);

      return {
        items: newItems,
        totalItems,
        totalPrice
      };
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(currentCart => {
      const newItems = currentCart.items.filter(item => item.productId !== productId);
      const { totalItems, totalPrice } = calculateTotals(newItems);

      return {
        items: newItems,
        totalItems,
        totalPrice
      };
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(currentCart => {
      const newItems = currentCart.items.map(item =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      );

      const { totalItems, totalPrice } = calculateTotals(newItems);

      return {
        items: newItems,
        totalItems,
        totalPrice
      };
    });
  };

  const clearCart = () => {
    setCart({
      items: [],
      totalItems: 0,
      totalPrice: 0
    });
  };

  const getItemQuantity = (productId: string): number => {
    const item = cart.items.find(item => item.productId === productId);
    return item?.quantity || 0;
  };

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemQuantity
  };
};