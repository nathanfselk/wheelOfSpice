import React from 'react';
import { X, ShoppingCart, Plus, Minus, Trash2, Package } from 'lucide-react';
import { CartItem } from '../types/cart';
import { SpiceIcon } from './SpiceIcon';
import { stripeService } from '../services/stripeService';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  totalPrice: number;
  totalItems: number;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  user: any;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  totalPrice,
  totalItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  user
}) => {
  const [checkoutLoading, setCheckoutLoading] = React.useState(false);
  const [checkoutError, setCheckoutError] = React.useState('');

  const handleCheckout = async () => {
    if (!user) {
      setCheckoutError('Please sign in to complete your purchase');
      return;
    }

    if (cartItems.length === 0) {
      setCheckoutError('Your cart is empty');
      return;
    }

    setCheckoutLoading(true);
    setCheckoutError('');

    try {
      const successUrl = `${window.location.origin}?purchase=success&items=${cartItems.length}`;
      const cancelUrl = window.location.href;

      // Create line items for Stripe
      const lineItems = cartItems.map(item => ({
        price: item.priceId,
        quantity: item.quantity
      }));

      const result = await stripeService.createCartCheckoutSession(
        lineItems,
        successUrl,
        cancelUrl
      );

      if (result.error) {
        setCheckoutError(result.error);
      } else if (result.url) {
        // Clear cart on successful checkout initiation
        onClearCart();
        window.location.href = result.url;
      }
    } catch (error: any) {
      setCheckoutError(error.message || 'Failed to start checkout');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-200">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mr-4">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Shopping Cart</h2>
              <p className="text-gray-600">
                {totalItems} item{totalItems !== 1 ? 's' : ''} • ${totalPrice.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="p-8 text-center">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Your cart is empty</h3>
              <p className="text-gray-500">Add some premium spices to get started!</p>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {cartItems.map((item) => (
                <div key={item.productId} className="flex items-center p-4 bg-gray-50 rounded-xl">
                  {/* Product Info */}
                  <div className="flex items-center flex-1">
                    {item.spice && (
                      <div
                        className="w-12 h-12 rounded-full border-2 border-white shadow-md mr-4 flex items-center justify-center"
                        style={{ backgroundColor: item.spice.color }}
                      >
                        <SpiceIcon 
                          iconName={item.spice.icon} 
                          className="w-6 h-6" 
                          style={{ color: item.spice.color === '#F5F5DC' || item.spice.color === '#F5DEB3' ? '#8B4513' : 'white' }}
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{item.name}</h4>
                      {item.spice && (
                        <p className="text-sm text-gray-600">{item.spice.origin}</p>
                      )}
                      <p className="text-sm font-medium text-gray-900">${item.price.toFixed(2)} each</p>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                      className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-4 h-4 text-gray-600" />
                    </button>
                    
                    <span className="w-8 text-center font-semibold text-gray-900">
                      {item.quantity}
                    </span>
                    
                    <button
                      onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                      className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-4 h-4 text-gray-600" />
                    </button>

                    <button
                      onClick={() => onRemoveItem(item.productId)}
                      className="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-colors ml-2"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>

                  {/* Item Total */}
                  <div className="ml-4 text-right">
                    <div className="font-bold text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-200 p-6">
            {/* Shipping Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-center">
                <Package className="w-4 h-4 text-blue-600 mr-2" />
                <div className="text-sm">
                  <div className="font-medium text-blue-900">US Shipping Available</div>
                  <div className="text-blue-700">Standard ($5.99) or Express ($12.99) shipping options</div>
                </div>
              </div>
            </div>

            {/* Cart Summary */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Subtotal ({totalItems} items):</span>
                <span className="font-bold text-gray-900">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="text-sm text-gray-500">
                + shipping (calculated at checkout)
              </div>
            </div>

            {/* Error Message */}
            {checkoutError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{checkoutError}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={onClearCart}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200"
              >
                Clear Cart
              </button>
              
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading || !user}
                className={`flex-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center ${
                  checkoutLoading || !user
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 transform hover:scale-105'
                }`}
              >
                {checkoutLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </>
                ) : !user ? (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Sign In to Checkout
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Checkout ${totalPrice.toFixed(2)}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};