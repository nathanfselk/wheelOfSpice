import React from 'react';
import { X, AArrowDown as Vs } from 'lucide-react';
import { Spice } from '../types/spice';
import { SpiceIcon } from './SpiceIcon';

interface ComparisonModalProps {
  newSpice: Spice;
  existingSpice: Spice;
  rating: number;
  onPreferNew: () => void;
  onPreferExisting: () => void;
  onClose: () => void;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  newSpice,
  existingSpice,
  rating,
  onPreferNew,
  onPreferExisting,
  onClose
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-200">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
          
          <h2 className="text-2xl font-bold text-gray-900 text-center">
            Ranking Tie-Breaker
          </h2>
          <p className="text-gray-600 text-center mt-2">
            Both spices have the same rating ({rating.toFixed(1)}/10). Which do you prefer?
          </p>
        </div>

        {/* Comparison Content */}
        <div className="p-6">
          <div className="flex items-center justify-between">
            {/* New Spice */}
            <div className="flex-1 text-center">
              <div className="mb-4">
                <div
                  className="w-20 h-20 rounded-full border-4 border-white shadow-lg mx-auto mb-3 flex items-center justify-center"
                  style={{ backgroundColor: newSpice.color }}
                >
                  <SpiceIcon 
                    iconName={newSpice.icon} 
                    className="w-10 h-10" 
                    style={{ color: newSpice.color === '#F5F5DC' || newSpice.color === '#F5DEB3' ? '#8B4513' : 'white' }}
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{newSpice.name}</h3>
                <p className="text-gray-600">{newSpice.origin}</p>
                <div className="mt-2 text-sm text-gray-500">
                  {newSpice.flavorProfile.slice(0, 2).join(', ')}
                </div>
              </div>
              
              <button
                onClick={onPreferNew}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 transform hover:scale-105"
              >
                I prefer {newSpice.name}
              </button>
            </div>

            {/* VS Divider */}
            <div className="mx-8 flex flex-col items-center">
              <span className="text-lg font-bold text-gray-500">VS</span>
            </div>

            {/* Existing Spice */}
            <div className="flex-1 text-center">
              <div className="mb-4">
                <div
                  className="w-20 h-20 rounded-full border-4 border-white shadow-lg mx-auto mb-3 flex items-center justify-center"
                  style={{ backgroundColor: existingSpice.color }}
                >
                  <SpiceIcon 
                    iconName={existingSpice.icon} 
                    className="w-10 h-10" 
                    style={{ color: existingSpice.color === '#F5F5DC' || existingSpice.color === '#F5DEB3' ? '#8B4513' : 'white' }}
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{existingSpice.name}</h3>
                <p className="text-gray-600">{existingSpice.origin}</p>
                <div className="mt-2 text-sm text-gray-500">
                  {existingSpice.flavorProfile.slice(0, 2).join(', ')}
                </div>
              </div>
              
              <button
                onClick={onPreferExisting}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 transform hover:scale-105"
              >
                I prefer {existingSpice.name}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};