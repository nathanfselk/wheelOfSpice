import React, { useState } from 'react';
import { ShoppingCart, Check, Loader2 } from 'lucide-react';
import { StripeProduct } from '../stripe-config';
import { stripeService } from '../services/stripeService';
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
  isPurchased?: boolean;
  onPurchaseSuccess?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  spice,
  isPurchased = false,
  onPurchaseSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePurchase = async () => {
    setLoading(true);
    setError('');

    try {
      const successUrl = `${window.location.origin}/purchase-success?product=${product.id}`;
      const cancelUrl = window.location.href;

      const result = await stripeService.createCheckoutSession(
        product.priceId,
        product.mode,
        successUrl,
        cancelUrl
      );

      if (result.error) {
        setError(result.error);
      } else if (result.url) {
        // Redirect to Stripe checkout
        window.location.href = result.url;
      }
    } catch (error: any) {
      setError(error.message || 'Failed to start checkout');
    } finally {
      setLoading(false);
    }
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
            {product.mode === 'subscription' ? 'per month' : '+ shipping'}
          </div>
        </div>

        {/* Shipping Info */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm text-blue-700">
            <div className="font-medium mb-1">Shipping Options:</div>
            <div>• Standard (3-7 days): $5.99</div>
            <div>• Express (1-2 days): $12.99</div>
            <div className="mt-1 text-xs">US addresses only</div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={handlePurchase}
          disabled={loading || isPurchased}
          className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center ${
            isPurchased
              ? 'bg-green-100 text-green-700 cursor-not-allowed'
              : loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 transform hover:scale-105'
          }`}
        >
          {isPurchased ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Purchased
            </>
          ) : loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Buy Now
            </>
          )}
        </button>
      </div>
    </div>
  );
};