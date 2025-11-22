import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Plus, ShoppingCart } from 'lucide-react';
import { Spice } from '../types/spice';
import { SpiceIcon } from './SpiceIcon';
import { isPurchasingEnabled } from '../config/features';
import { stripeProducts } from '../stripe-config';

interface SpiceSearchDropdownProps {
  spices: Spice[];
  onSpiceSelect: (spice: Spice) => void;
  onMissingSpiceClick: () => void;
  excludeSpices?: string[];
  isLoggedIn?: boolean;
  onAddToCart?: (product: any, spice: any) => void;
  getItemQuantity?: (productId: string) => number;
}

export const SpiceSearchDropdown: React.FC<SpiceSearchDropdownProps> = ({
  spices,
  onSpiceSelect,
  onMissingSpiceClick,
  excludeSpices = [],
  isLoggedIn = false,
  onAddToCart,
  getItemQuantity
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredSpices = spices.filter(spice => 
    spice.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !excludeSpices.includes(spice.id)
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSpiceSelect = (spice: Spice) => {
    onSpiceSelect(spice);
    setIsOpen(false);
    setSearchTerm('');
  };

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
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim() && !isOpen) {
      setIsOpen(true);
    }
  };
  return (
    <div className="relative w-full max-w-md" ref={dropdownRef}>
      <div 
        className="relative cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center w-full px-4 py-3 bg-white border-2 border-orange-200 rounded-xl focus-within:border-orange-400 transition-colors">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input
            type="text"
            placeholder="Search for a spice to rank..."
            value={searchTerm}
            onChange={handleInputChange}
            className="flex-1 outline-none text-gray-700 placeholder-gray-400"
            onClick={(e) => e.stopPropagation()}
          />
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (searchTerm.trim() || !searchTerm) && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-orange-200 rounded-xl shadow-xl max-h-80 overflow-y-auto">
          {filteredSpices.length === 0 ? (
            <div className="px-4 py-3 text-gray-500 text-center">
              {searchTerm.trim() 
                ? 'No spices found matching your search' 
                : excludeSpices.length === spices.length 
                  ? 'All spices have been ranked!' 
                  : 'No spices found'
              }
            </div>
          ) : (
            filteredSpices.map((spice) => (
              <div
                key={spice.id}
                onClick={() => handleSpiceSelect(spice)}
                className="px-4 py-3 hover:bg-orange-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                  <div 
                    className="w-8 h-8 rounded-full mr-3 border border-gray-200 flex items-center justify-center"
                    style={{ backgroundColor: spice.color }}
                  >
                    <SpiceIcon 
                      iconName={spice.icon} 
                      className="w-4 h-4" 
                      style={{ color: spice.color === '#F5F5DC' || spice.color === '#F5DEB3' ? '#8B4513' : 'white' }}
                    />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {searchTerm.trim() ? (
                        <span dangerouslySetInnerHTML={{
                          __html: spice.name.replace(
                            new RegExp(`(${searchTerm})`, 'gi'),
                            '<mark class="bg-yellow-200 text-gray-900">$1</mark>'
                          )
                        }} />
                      ) : (
                        spice.name
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{spice.origin}</div>
                  </div>
                  </div>
                  
                  {/* Cart Button */}
                  {isPurchasingEnabled() && onAddToCart && stripeProducts.find(p => p.name === spice.name) && (
                    <button
                      onClick={(e) => handleAddToCart(spice, e)}
                      disabled={addingToCart === spice.id}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ml-2 ${
                        addingToCart === spice.id
                          ? 'bg-green-500 text-white'
                          : getItemQuantity && getItemQuantity(spice.id) > 0
                            ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-600'
                      }`}
                      title={addingToCart === spice.id ? 'Adding...' : 'Add to cart'}
                    >
                      {addingToCart === spice.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <ShoppingCart className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
          
          {/* Persistent Submit Missing Spice Option */}
          {isLoggedIn && (
            <div className="border-t border-gray-200 p-3">
              <button
                onClick={() => {
                  onMissingSpiceClick();
                  setIsOpen(false);
                  setSearchTerm('');
                }}
                className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 flex items-center justify-center text-sm font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                Submit Missing Spice
              </button>
            </div>
          )}
          
          {/* Login prompt for anonymous users */}
          {!isLoggedIn && (
            <div className="border-t border-gray-200 p-3">
              <p className="text-xs text-gray-500 text-center">
                Log in to submit missing spices
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};