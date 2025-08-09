import React, { useState } from 'react';
import { Plus, X, Beaker, ChefHat, Sparkles } from 'lucide-react';
import { Spice } from '../types/spice';
import { BlendSpice, BlendSummary } from '../types/blend';
import { SpiceIcon } from './SpiceIcon';
import { blendService } from '../services/blendService';

interface SpiceBlenderProps {
  spices: Spice[];
}

export const SpiceBlender: React.FC<SpiceBlenderProps> = ({ spices }) => {
  const [selectedSpices, setSelectedSpices] = useState<BlendSpice[]>([]);
  const [showSpiceSelector, setShowSpiceSelector] = useState(false);
  const [blendSummary, setBlendSummary] = useState<BlendSummary | null>(null);
  const [blendName, setBlendName] = useState('');

  const availableSpices = spices.filter(spice => 
    !selectedSpices.some(bs => bs.spice.id === spice.id)
  );

  const totalPercentage = selectedSpices.reduce((sum, bs) => sum + bs.percentage, 0);
  const canAddSpice = selectedSpices.length < 5;
  const isValidBlend = totalPercentage === 100 && selectedSpices.length >= 2;

  const addSpice = (spice: Spice) => {
    if (selectedSpices.length >= 5) return;

    // Calculate even distribution for all spices including the new one
    const newSpiceCount = selectedSpices.length + 1;
    const evenPercentage = Math.floor(100 / newSpiceCount);
    const remainder = 100 - (evenPercentage * newSpiceCount);

    const newBlendSpice: BlendSpice = {
      spice: {
        id: spice.id,
        name: spice.name,
        color: spice.color,
        icon: spice.icon,
        flavorProfile: spice.flavorProfile
      },
      percentage: evenPercentage + (remainder > 0 ? 1 : 0) // Give remainder to first spice
    };

    // Redistribute all existing spices to even percentages
    const redistributedSpices = selectedSpices.map((bs, index) => ({
      ...bs,
      percentage: evenPercentage + (index < remainder - 1 ? 1 : 0) // Distribute remainder among first spices
    }));

    // Add the new spice
    const updatedSpices = [...redistributedSpices, newBlendSpice];
    
    // Ensure total is exactly 100%
    const currentTotal = updatedSpices.reduce((sum, bs) => sum + bs.percentage, 0);
    if (currentTotal !== 100) {
      updatedSpices[0].percentage += (100 - currentTotal);
    }

    setSelectedSpices(updatedSpices);
    setShowSpiceSelector(false);
  };

  const removeSpice = (spiceId: string) => {
    setSelectedSpices(selectedSpices.filter(bs => bs.spice.id !== spiceId));
  };

  const updatePercentage = (spiceId: string, percentage: number) => {
    setSelectedSpices(selectedSpices.map(bs => 
      bs.spice.id === spiceId ? { ...bs, percentage } : bs
    ));
  };

  const handleCreateBlend = () => {
    if (!isValidBlend) return;

    const summary = blendService.analyzeBlend(selectedSpices);
    const generatedName = blendService.generateBlendName(selectedSpices);
    
    setBlendSummary(summary);
    setBlendName(generatedName);
  };

  const resetBlend = () => {
    setSelectedSpices([]);
    setBlendSummary(null);
    setBlendName('');
  };

  if (blendSummary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8" itemScope itemType="https://schema.org/WebApplication">
            <meta itemProp="name" content="Custom Spice Blend Maker - Create Your Own Spice Blends" />
            <meta itemProp="description" content="Create custom spice blends online with our interactive blend maker. Combine premium spices and get flavor profiles and recipe suggestions." />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Custom Spice Blend Maker
            </h1>
            <p className="text-gray-600 mt-1">Create custom spice blends with premium ingredients - Get flavor profiles and recipe ideas</p>
            <div className="mt-2 text-sm text-gray-500">
              <span>Custom spice blends • Gourmet seasonings • Recipe development • Flavor combinations</span>
            </div>
          </div>

          {/* Blend Summary */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Blend Header */}
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-4">
              <h2 className="text-2xl font-bold text-white">{blendName}</h2>
              <p className="text-purple-100">Your custom spice blend is ready!</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Blend Composition */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Beaker className="w-5 h-5 mr-2 text-purple-600" />
                  Blend Composition
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedSpices.map(({ spice, percentage }) => (
                    <div key={spice.id} className="flex items-center p-3 bg-orange-50 rounded-lg">
                      <div
                        className="w-8 h-8 rounded-full mr-3 flex items-center justify-center"
                        style={{ backgroundColor: spice.color }}
                      >
                        <SpiceIcon 
                          iconName={spice.icon} 
                          className="w-4 h-4" 
                          style={{ color: spice.color === '#F5F5DC' || spice.color === '#F5DEB3' ? '#8B4513' : 'white' }}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{spice.name}</div>
                        <div className="text-sm text-gray-600">{percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Flavor Profile */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-orange-600" />
                  Flavor Profile
                </h3>
                <div className="flex flex-wrap gap-2">
                  {blendSummary.flavorProfile.map((flavor, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
                    >
                      {flavor}
                    </span>
                  ))}
                </div>
              </div>

              {/* Common Uses */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ChefHat className="w-5 h-5 mr-2 text-orange-600" />
                  Perfect For
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {blendSummary.commonUses.map((use, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mr-2" />
                      <span className="text-gray-700">{use}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Similar Blends */}
              {blendSummary.similarBlends.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Similar to These Blends
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {blendSummary.similarBlends.map((blend, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
                      >
                        {blend}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-4 pt-4 border-t border-gray-200">
                <button
                  onClick={resetBlend}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105"
                >
                  Create Another Blend
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Spice Blender
          </h1>
          <p className="text-gray-600 mt-1">Create your perfect spice blend</p>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <Beaker className="w-6 h-6 text-orange-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">How it Works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-start">
              <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-orange-600 font-bold text-xs">1</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">Select Spices</div>
                <div>Choose 2-5 spices from our collection</div>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-orange-600 font-bold text-xs">2</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">Set Percentages</div>
                <div>Adjust each spice's proportion (min 5%)</div>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-orange-600 font-bold text-xs">3</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">Create Blend</div>
                <div>Get flavor profile and usage suggestions</div>
              </div>
            </div>
          </div>
        </div>

        {/* Blend Builder */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-4">
            <h3 className="text-xl font-bold text-white">Build Your Blend</h3>
            <p className="text-purple-100">
              {selectedSpices.length}/5 spices • {totalPercentage}% total
            </p>
          </div>

          <div className="p-6">
            {/* Selected Spices */}
            <div className="space-y-4 mb-6">
              {selectedSpices.map(({ spice, percentage }) => (
                <div key={spice.id} className="flex items-center p-4 bg-gray-50 rounded-xl">
                  <div
                    className="w-10 h-10 rounded-full mr-4 flex items-center justify-center"
                    style={{ backgroundColor: spice.color }}
                  >
                    <SpiceIcon 
                      iconName={spice.icon} 
                      className="w-5 h-5" 
                      style={{ color: spice.color === '#F5F5DC' || spice.color === '#F5DEB3' ? '#8B4513' : 'white' }}
                    />
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{spice.name}</h4>
                    <div className="flex items-center mt-2">
                      <input
                        type="range"
                        min="5"
                        max="95"
                        value={percentage}
                        onChange={(e) => updatePercentage(spice.id, parseInt(e.target.value))}
                        className="flex-1 mr-4"
                        style={{
                          background: `linear-gradient(to right, ${spice.color} 0%, ${spice.color} ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`
                        }}
                      />
                      <div className="flex items-center">
                        <input
                          type="number"
                          min="5"
                          max="95"
                          value={percentage}
                          onChange={(e) => updatePercentage(spice.id, Math.max(5, Math.min(95, parseInt(e.target.value) || 5)))}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                        />
                        <span className="ml-1 text-sm text-gray-600">%</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeSpice(spice.id)}
                    className="ml-4 w-8 h-8 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              ))}

              {selectedSpices.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Beaker className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Start building your blend by adding spices below</p>
                </div>
              )}
            </div>

            {/* Add Spice Button */}
            {canAddSpice && (
              <div className="mb-6">
                <button
                  onClick={() => setShowSpiceSelector(!showSpiceSelector)}
                  className="w-full px-4 py-3 border-2 border-dashed border-orange-300 rounded-xl text-orange-600 hover:border-orange-400 hover:bg-orange-50 transition-colors flex items-center justify-center"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Spice ({selectedSpices.length}/5)
                </button>
              </div>
            )}

            {/* Spice Selector */}
            {showSpiceSelector && (
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-3">Choose a Spice to Add</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-60 overflow-y-auto">
                  {availableSpices.map(spice => (
                    <button
                      key={spice.id}
                      onClick={() => addSpice(spice)}
                      className="flex items-center p-3 bg-white rounded-lg hover:bg-orange-50 transition-colors"
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
                      <span className="text-sm font-medium text-gray-900">{spice.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Percentage Warning */}
            {totalPercentage !== 100 && selectedSpices.length > 0 && (
              <div className={`p-3 rounded-lg mb-4 ${
                totalPercentage > 100 
                  ? 'bg-red-50 border border-red-200' 
                  : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <p className={`text-sm ${
                  totalPercentage > 100 ? 'text-red-700' : 'text-yellow-700'
                }`}>
                  {totalPercentage > 100 
                    ? `Total percentage is ${totalPercentage}%. Please reduce to 100%.`
                    : `Total percentage is ${totalPercentage}%. Add ${100 - totalPercentage}% more.`
                  }
                </p>
              </div>
            )}

            {/* Create Blend Button */}
            <button
              onClick={handleCreateBlend}
              disabled={!isValidBlend}
              className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                isValidBlend
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 transform hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {selectedSpices.length < 2 
                ? 'Add at least 2 spices to create blend'
                : totalPercentage !== 100
                  ? 'Adjust percentages to equal 100%'
                  : 'Create My Blend'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};