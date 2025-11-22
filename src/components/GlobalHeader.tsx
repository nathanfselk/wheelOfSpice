import React, { useState, useEffect } from 'react';
import { Menu, X, Star, Beaker, Book, User, LogOut, ShoppingBag, ShoppingCart } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useCart } from '../hooks/useCart';
import { CartModal } from './CartModal';
import { isPurchasingEnabled } from '../config/features';

interface GlobalHeaderProps {
  currentPage: 'main' | 'blender' | 'wiki' | 'shop' | 'purchase-success';
  onPageChange: (page: 'main' | 'blender' | 'wiki' | 'shop' | 'purchase-success') => void;
  user: SupabaseUser | null;
  onAuthClick: () => void;
  onSignOut: () => void;
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({ 
  currentPage, 
  onPageChange, 
  user, 
  onAuthClick, 
  onSignOut 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart } = useCart();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const baseMenuItems = [
    { id: 'main', label: 'Spice Ranker', icon: Star },
    { id: 'blender', label: 'Blend Maker', icon: Beaker },
    { id: 'wiki', label: 'Spice Wiki', icon: Book }
  ];

  const menuItems = isPurchasingEnabled() 
    ? [...baseMenuItems, { id: 'shop', label: 'Spice Shop', icon: ShoppingBag }]
    : baseMenuItems;

  const handlePageChange = (page: 'main' | 'blender' | 'wiki' | 'shop' | 'purchase-success') => {
    onPageChange(page);
    setIsMobileMenuOpen(false);
  };

  if (isMobile) {
    return (
      <>
        {/* Mobile Menu Button */}
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-12 h-12 bg-white rounded-lg shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Side Menu */}
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Side Menu */}
            <div className="fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform">
              <div className="p-6">
                <div className="flex items-center mb-8 mt-8">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mr-3">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <button
                    onClick={() => handlePageChange('main')}
                    className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
                  >
                   Wheel of Spice
                  </button>
                </div>
                
                <nav className="space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => handlePageChange(item.id as 'main' | 'blender' | 'wiki' | 'shop' | 'purchase-success')}
                        className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
                
                {/* Mobile Auth Section */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  {user ? (
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600 px-4">
                        Welcome, {user.email}
                      </div>
                      <button
                        onClick={() => {
                          onSignOut();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
                      >
                        <LogOut className="w-5 h-5 mr-3" />
                        <span className="font-medium">Sign Out</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        onAuthClick();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all"
                    >
                      <User className="w-5 h-5 mr-3" />
                      <span className="font-medium">Log In / Sign Up</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Cart Modal */}
        {isPurchasingEnabled() && (
          <CartModal
            isOpen={showCart}
            onClose={() => setShowCart(false)}
            cartItems={cart.items}
            totalPrice={cart.totalPrice}
            totalItems={cart.totalItems}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeFromCart}
            onClearCart={clearCart}
            user={user}
          />
        )}
      </>
    );
  }

  // Desktop Header
  return (
    <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mr-3">
              <Star className="w-5 h-5 text-white" />
            </div>
            <button
              onClick={() => onPageChange('main')}
              className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            >
             Wheel of Spice
            </button>
          </div>

          <div className="flex items-center space-x-4">
            {/* Navigation */}
            <nav className="flex space-x-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handlePageChange(item.id as 'main' | 'blender' | 'wiki' | 'shop' | 'purchase-success')}
                    className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
            {/* Auth Section */}
            {user ? (
              <div className="flex items-center space-x-3">
                {/* Cart Button */}
                {isPurchasingEnabled() && cart.totalItems > 0 && (
                  <button
                    onClick={() => setShowCart(true)}
                    className="relative flex items-center px-3 py-2 bg-orange-100 hover:bg-orange-200 rounded-lg transition-colors text-sm"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2 text-orange-600" />
                    <span className="text-orange-600 font-medium">Cart</span>
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                      {cart.totalItems}
                    </div>
                  </button>
                )}
                
                <span className="text-gray-600 text-sm">Welcome, {user.email}</span>
                <button
                  onClick={onSignOut}
                  className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                {/* Cart Button for Anonymous Users */}
                {isPurchasingEnabled() && cart.totalItems > 0 && (
                  <button
                    onClick={() => setShowCart(true)}
                    className="relative flex items-center px-3 py-2 bg-orange-100 hover:bg-orange-200 rounded-lg transition-colors text-sm"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2 text-orange-600" />
                    <span className="text-orange-600 font-medium">Cart</span>
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                      {cart.totalItems}
                    </div>
                  </button>
                )}
                
              <button
                onClick={onAuthClick}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105 text-sm"
              >
                <User className="w-4 h-4 mr-2" />
                Log In / Sign Up
              </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};