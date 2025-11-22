import React, { useState, useRef } from 'react';
import { RotateCcw, Play, ShoppingCart } from 'lucide-react';
import { Spice } from '../types/spice';
import { SpiceIcon } from './SpiceIcon';
import { isPurchasingEnabled } from '../config/features';
import { stripeProducts } from '../stripe-config';

interface SpiceWheelProps {
  availableSpices: Spice[];
  onSpiceSelect: (spice: Spice) => void;
  onAddToCart?: (product: any, spice: any) => void;
  getItemQuantity?: (productId: string) => number;
}

export const SpiceWheel: React.FC<SpiceWheelProps> = ({
  availableSpices,
  onSpiceSelect,
  onAddToCart,
  getItemQuantity
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);

  if (availableSpices.length === 0) {
    return null;
  }

  const handleAddToCart = (spice: Spice, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!onAddToCart || !isPurchasingEnabled()) return;
    
    const product = stripeProducts.find(p => p.name === spice.name);
    if (!product) return;
    
    setAddingToCart(spice.id);
    onAddToCart(product, spice);
    
    setTimeout(() => {
      setAddingToCart(null);
    }, 500);
  };
  const handleSpin = () => {
    if (isSpinning || availableSpices.length === 0) return;

    // If only one spice left, go directly to ranking it
    if (availableSpices.length === 1) {
      onSpiceSelect(availableSpices[0]);
      return;
    }

    setIsSpinning(true);
    
    // Generate random rotation (multiple full rotations + random position)
    const randomIndex = Math.floor(Math.random() * availableSpices.length);
    const degreesPerSpice = 360 / availableSpices.length;
    const targetDegree = randomIndex * degreesPerSpice;
    const fullRotations = 5 + Math.random() * 3; // 5-8 full rotations
    const finalRotation = rotation + (fullRotations * 360) + (360 - targetDegree);
    
    setRotation(finalRotation);

    // After animation completes, select the spice
    setTimeout(() => {
      setIsSpinning(false);
      onSpiceSelect(availableSpices[randomIndex]);
    }, 2000);
  };

  const spiceSegments = availableSpices.map((spice, index) => {
    const angle = (360 / availableSpices.length) * index;
    const nextAngle = (360 / availableSpices.length) * (index + 1);
    
    return (
      <div
        key={spice.id}
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transform: `rotate(${angle}deg)`,
          clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((nextAngle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((nextAngle - 90) * Math.PI / 180)}%)`
        }}
      >
        <div
          className="w-full h-full flex items-center justify-center relative"
          style={{ backgroundColor: spice.color + '40' }}
        >
          <div
            className="absolute inset-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center"
            style={{ backgroundColor: spice.color }}
          >
            <SpiceIcon 
              iconName={spice.icon} 
              className="w-4 h-4" 
              style={{ color: spice.color === '#F5F5DC' || spice.color === '#F5DEB3' ? '#8B4513' : 'white' }}
            />
          </div>
        </div>
      </div>
    );
  });

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Can't decide? Spin the wheel!
        </h3>
        <p className="text-gray-600">
          Discover a random spice from the {availableSpices.length} you haven't ranked yet
        </p>
      </div>

      {/* Quick Add to Cart for Available Spices */}
      {isPurchasingEnabled() && onAddToCart && (
        <div className="bg-white rounded-xl shadow-lg p-4 max-w-2xl w-full">
          <h4 className="text-lg font-semibold text-gray-900 mb-3 text-center">Quick Add to Cart</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-32 overflow-y-auto">
            {availableSpices.filter(spice => stripeProducts.find(p => p.name === spice.name)).slice(0, 8).map((spice) => (
              <button
                key={spice.id}
                onClick={(e) => handleAddToCart(spice, e)}
                disabled={addingToCart === spice.id}
                className={`flex items-center p-2 rounded-lg transition-all duration-200 ${
                  addingToCart === spice.id
                    ? 'bg-green-100 text-green-700'
                    : getItemQuantity && getItemQuantity(spice.id) > 0
                      ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                      : 'bg-gray-50 text-gray-700 hover:bg-orange-50 hover:text-orange-700'
                }`}
              >
                <div
                  className="w-6 h-6 rounded-full mr-2 flex items-center justify-center"
                  style={{ backgroundColor: spice.color }}
                >
                  <SpiceIcon 
                    iconName={spice.icon} 
                    className="w-3 h-3" 
                    style={{ color: spice.color === '#F5F5DC' || spice.color === '#F5DEB3' ? '#8B4513' : 'white' }}
                  />
                </div>
                <span className="text-xs font-medium truncate flex-1">{spice.name}</span>
                {addingToCart === spice.id ? (
                  <div className="w-3 h-3 border border-green-600 border-t-transparent rounded-full animate-spin ml-1"></div>
                ) : (
                  <ShoppingCart className="w-3 h-3 ml-1" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="relative">
        {/* Wheel Container */}
        <div className="relative w-64 h-64">
          {/* Wheel */}
          <div
            ref={wheelRef}
            className="w-full h-full rounded-full border-4 border-white shadow-2xl relative overflow-hidden"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 2s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
              background: 'conic-gradient(' + 
                availableSpices.map((spice, index) => 
                  `${spice.color} ${(index / availableSpices.length) * 360}deg ${((index + 1) / availableSpices.length) * 360}deg`
                ).join(', ') + ')'
            }}
          >
            {/* Spice Icons */}
            {availableSpices.map((spice, index) => {
              const angle = (360 / availableSpices.length) * index + (360 / availableSpices.length) / 2;
              const radius = 80;
              const x = Math.cos((angle - 90) * Math.PI / 180) * radius;
              const y = Math.sin((angle - 90) * Math.PI / 180) * radius;
              
              return (
                <div
                  key={spice.id}
                  className="absolute w-8 h-8 rounded-full border-2 border-white shadow-sm flex items-center justify-center"
                  style={{
                    backgroundColor: spice.color,
                    left: `calc(50% + ${x}px - 16px)`,
                    top: `calc(50% + ${y}px - 16px)`,
                  }}
                >
                  <SpiceIcon 
                    iconName={spice.icon} 
                    className="w-4 h-4" 
                    style={{ color: spice.color === '#F5F5DC' || spice.color === '#F5DEB3' ? '#8B4513' : 'white' }}
                  />
                </div>
              );
            })}
          </div>

          {/* Pointer */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
            <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-red-500 drop-shadow-lg"></div>
          </div>

          {/* Center Button */}
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-4 border-white shadow-xl flex items-center justify-center z-20 transition-all duration-200 ${
              isSpinning 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 hover:scale-110 cursor-pointer'
            }`}
          >
            {isSpinning ? (
              <RotateCcw className="w-6 h-6 text-white animate-spin" />
            ) : (
              <Play className="w-6 h-6 text-white ml-1" />
            )}
          </button>
        </div>

        {/* Spin Button (Alternative) */}
        <div className="text-center mt-4">
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 ${
              isSpinning
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 hover:scale-105'
            }`}
          >
            {isSpinning ? 'Spinning...' : 'Spin the Wheel!'}
          </button>
        </div>
      </div>
    </div>
  );
};