import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Plus } from 'lucide-react';
import { Spice } from '../types/spice';
import { SpiceIcon } from './SpiceIcon';

interface SpiceSearchDropdownProps {
  spices: Spice[];
  onSpiceSelect: (spice: Spice) => void;
  onMissingSpiceClick: () => void;
  excludeSpices?: string[];
  isLoggedIn?: boolean;
}

export const SpiceSearchDropdown: React.FC<SpiceSearchDropdownProps> = ({
  spices,
  onSpiceSelect,
  onMissingSpiceClick,
  excludeSpices = []
  isLoggedIn = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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
        <div className="flex items-center w-full px-4 py-3 bg-white border-2 border-orange-200 rounded-xl shadow-sm hover:border-orange-300 transition-colors">
          <Search className="w-5 h-5 text-orange-500 mr-3" />
          <input
            type="text"
            placeholder="Search for a spice to rank..."
            value={searchTerm}
            onChange={handleInputChange}
            className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
            onClick={(e) => e.stopPropagation()}
            onFocus={() => {
              if (searchTerm.trim() || filteredSpices.length > 0) {
                setIsOpen(true);
              }
            }}
          />
          <ChevronDown 
            className={`w-5 h-5 text-orange-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
        {/* Submit Missing Spice Option */}
        {searchTerm.trim() && isLoggedIn && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <button
              onClick={() => {
                onMissingSpiceClick();
                setIsOpen(false);
                setSearchTerm('');
              }}
              className="w-full px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center justify-center text-sm font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Submit Missing Spice
            </button>
          </div>
        )}
        {searchTerm.trim() && !isLoggedIn && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-400">
              Log in to submit missing spices
            </p>
          </div>
        )}
      </div>

      {isOpen && (searchTerm.trim() || !searchTerm) && (
   
   {/* Submit Missing Spice Option at bottom when there are results */}
   {filteredSpices.length > 0 && searchTerm.trim() && isLoggedIn && (
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
         Can't find it? Submit missing spice
       </button>
     </div>
   )}
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
                <div className="flex items-center">
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
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};