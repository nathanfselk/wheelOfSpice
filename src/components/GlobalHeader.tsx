import React, { useState, useEffect } from 'react';
import { Menu, X, Star, Beaker, Book } from 'lucide-react';

interface GlobalHeaderProps {
  currentPage: 'main' | 'blender' | 'wiki';
  onPageChange: (page: 'main' | 'blender' | 'wiki') => void;
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({ currentPage, onPageChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const menuItems = [
    { id: 'main', label: 'Spice Ranker', icon: Star },
    { id: 'blender', label: 'Blend Maker', icon: Beaker },
    { id: 'wiki', label: 'Spice Wiki', icon: Book }
  ];

  const handlePageChange = (page: 'main' | 'blender' | 'wiki') => {
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
                  <h2 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    Wheel of Spice
                  </h2>
                </div>
                
                <nav className="space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => handlePageChange(item.id as 'main' | 'blender' | 'wiki')}
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
              </div>
            </div>
          </>
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
            <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Wheel of Spice
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex space-x-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handlePageChange(item.id as 'main' | 'blender' | 'wiki')}
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
        </div>
      </div>
    </div>
  );
};