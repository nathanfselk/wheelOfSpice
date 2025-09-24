import React, { useState } from 'react';
import { X, MapPin, Palette, ChefHat, Star, Trash2, ShoppingCart, Plus } from 'lucide-react';
import { Spice } from '../types/spice';
import { RankingSlider } from './RankingSlider';
import { SpiceIcon } from './SpiceIcon';
import { CommunityRating } from '../services/communityRatingService';
import { stripeProducts } from '../stripe-config';
import { isPurchasingEnabled } from '../config/features';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

interface SpiceModalProps {
  spice: Spice;
  onClose: () => void;
  onRank: (spice: Spice, rating: number) => void;
  onDelete?: (spice: Spice) => void;
  initialRating?: number;
  communityRating?: CommunityRating;
  onAddToCart?: (product: any, spice: any) => void;
  cartQuantity?: number;
}

export const SpiceModal: React.FC<SpiceModalProps> = ({
  spice,
  onClose,
  onRank,
  onDelete,
  initialRating,
  communityRating,
  onAddToCart,
  cartQuantity = 0
}) => {
  const [currentRating, setCurrentRating] = useState(initialRating || 5);
  const [addingToCart, setAddingToCart] = useState(false);

  // Lock body scroll when modal is open
  useBodyScrollLock(true);

  // Find corresponding product for this spice
  const product = stripeProducts.find(p => p.name === spice.name);
  const handleRank = () => {
    onRank(spice, currentRating);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(spice);
      onClose();
    }
  };

  const handleAddToCart = () => {
    if (!product || !onAddToCart) return;
    
    setAddingToCart(true);
    onAddToCart(product, spice);
    
    setTimeout(() => {
      setAddingToCart(false);
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-200">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="flex items-center mb-4">
            <div
              className="w-16 h-16 rounded-full border-4 border-white shadow-lg mr-4 flex items-center justify-center"
              style={{ backgroundColor: spice.color }}
            >
              <SpiceIcon 
                iconName={spice.icon} 
                className="w-8 h-8" 
                style={{ color: spice.color === '#F5F5DC' || spice.color === '#F5DEB3' ? '#8B4513' : 'white' }}
              />
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-3xl font-bold text-gray-900">{spice.name}</h2>
                {/* Cart Icon */}
                {isPurchasingEnabled() && product && onAddToCart && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart();
                    }}
                    disabled={addingToCart}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                      addingToCart
                        ? 'bg-green-500 text-white'
                        : cartQuantity > 0
                          ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-600'
                    }`}
                    title={addingToCart ? 'Adding...' : 'Add to cart'}
                  >
                    {addingToCart ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <ShoppingCart className="w-5 h-5" />
                    )}
                  </button>
                )}
              </div>
              <p className="text-gray-600 mt-1">{spice.origin}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div itemScope itemType="https://schema.org/Product">
            <meta itemProp="name" content={spice.name} />
            <meta itemProp="description" content={spice.description} />
            <meta itemProp="category" content="Spices & Seasonings" />
            <div itemProp="offers" itemScope itemType="https://schema.org/Offer">
              <meta itemProp="availability" content="https://schema.org/InStock" />
              <meta itemProp="priceCurrency" content="USD" />
            </div>
            <p className="text-gray-700 text-lg leading-relaxed">{spice.description}</p>
          </div>

          {/* Rating Section - Moved up */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
              How much do you like {spice.name}?
            </h3>
            
            <RankingSlider
              initialRating={initialRating || 5}
              onRatingChange={setCurrentRating}
              spiceColor={spice.color}
            />

            <button
              onClick={handleRank}
              className="w-full mt-6 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105"
            >
              {initialRating ? 'Update Ranking' : 'Add to My Rankings'}
            </button>

            {initialRating && onDelete && (
              <button
                onClick={handleDelete}
                className="w-full mt-3 bg-gray-500 hover:bg-red-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Rating
              </button>
            )}
          </div>

          {/* Purchase Section */}
          {isPurchasingEnabled() && product && onAddToCart && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                Add to Cart
              </h3>
              
              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">
                  High-quality {spice.name.toLowerCase()} from {spice.origin}
                </div>
                {cartQuantity > 0 && (
                  <div className="text-sm text-blue-600 font-medium mt-1">
                    {cartQuantity} in cart
                  </div>
                )}
              </div>

              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center ${
                  addingToCart
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : cartQuantity > 0
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 transform hover:scale-105'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 transform hover:scale-105'
                }`}
              >
                {addingToCart ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Adding...
                  </>
                ) : cartQuantity > 0 ? (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </>
                )}
              </button>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Origin */}
            <div className="bg-orange-50 rounded-xl p-4">
              <div className="flex items-center mb-3">
                <MapPin className="w-5 h-5 text-orange-600 mr-2" />
                <h3 className="font-semibold text-gray-900">Origin</h3>
              </div>
              <p className="text-gray-700">{spice.origin}</p>
            </div>

            {/* Flavor Profile */}
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center mb-3">
                <Palette className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="font-semibold text-gray-900">Flavor Profile</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {spice.flavorProfile.map((flavor, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {flavor}
                  </span>
                ))}
              </div>
            </div>

            {/* Community Rating */}
            {communityRating && (
              <div className="bg-purple-50 rounded-xl p-4">
                <div className="flex items-center mb-3">
                  <Star className="w-5 h-5 text-purple-600 mr-2" />
                  <h3 className="font-semibold text-gray-900">Community Rating</h3>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {communityRating.average_rating.toFixed(1)}/10
                  </div>
                 <div className="text-sm text-gray-600 mt-1">
                   Based on {communityRating.total_ratings} rating{communityRating.total_ratings !== 1 ? 's' : ''}
                 </div>
                </div>
              </div>
            )}

           {/* Show message when no community rating exists */}
           {!communityRating && (
             <div className="bg-gray-50 rounded-xl p-4">
               <div className="flex items-center mb-3">
                 <Star className="w-5 h-5 text-gray-400 mr-2" />
                 <h3 className="font-semibold text-gray-900">Community Rating</h3>
               </div>
               <div className="text-center">
                 <div className="text-gray-500">
                   No community ratings yet
                 </div>
                 <div className="text-sm text-gray-400 mt-1">
                   Be the first to rate this spice!
                 </div>
               </div>
             </div>
           )}
          </div>

          {/* Common Uses */}
          <div className="bg-green-50 rounded-xl p-4">
            <div className="flex items-center mb-3">
              <ChefHat className="w-5 h-5 text-green-600 mr-2" />
              <h3 className="font-semibold text-gray-900">Common Uses</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {spice.commonUses.map((use, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2" />
                  <span className="text-gray-700">{use}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};