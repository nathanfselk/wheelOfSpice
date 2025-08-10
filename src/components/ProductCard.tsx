import React, { useState } from 'react';
import { ShoppingCart, Loader2, Plus, Check } from 'lucide-react';
import { StripeProduct } from '../stripe-config';
import { SpiceIcon } from './SpiceIcon';

interface ProductCardProps {
  product: StripeProduct;
  spice?: {
    color: string;
    icon: string;
    description: string;
    origin: string;
    flavorProfile: string[];
  };
  onAddToCart: (product: StripeProduct, spice?: any) => void;
  cartQuantity: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  spice,
  onAddToCart,
  cartQuantity
}) => {
  const [addingToCart, setAddingToCart] = useState(false);

  const handlePurchase = async () => {
  const handleAddToCart = () => {
    setAddingToCart(true);
    onAddToCart(product, spice);
    
    // Show brief success animation
    setTimeout(() => {
      setAddingToCart(false);
    }, 500);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Product Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center mb-4">
          {spice && (
            <div
              className="w-12 h-12 rounded-full border-2 border-white shadow-md mr-4 flex items-center justify-center"
              style={{ backgroundColor: spice.color }}
            >
              <SpiceIcon 
                iconName={spice.icon} 
                className="w-6 h-6" 
                style={{ color: spice.color === '#F5F5DC' || spice.color === '#F5DEB3' ? '#8B4513' : 'white' }}
              />
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
            {spice && (
              <p className="text-gray-600 text-sm">{spice.origin}</p>
            )}
          </div>
        </div>

        <p className="text-gray-700 leading-relaxed">
          {product.description || spice?.description}
        </p>

        {spice && spice.flavorProfile.length > 0 && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {spice.flavorProfile.map((flavor, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium"
                >
                  {flavor}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Product Footer */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </div>
          <div className="text-sm text-gray-600">
            {product.mode === 'subscription' }
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
            addingToCart

              : cartQuantity > 0
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 transform hover:scale-105'
                : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 transform hover:scale-105'
          onClick={handleAddToCart}
          disabled={addingToCart}
          {addingToCart ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Added!
            </>
          ) : cartQuantity > 0 ? (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Add Another ({cartQuantity} in cart)
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
};