import React, { useState } from 'react';
import { ArrowLeft, Search, Book, Beaker, MapPin, Palette, ChefHat } from 'lucide-react';
import { Spice } from '../types/spice';
import { SpiceBlendInfo } from '../data/spiceBlends';
import { SpiceIcon } from './SpiceIcon';

interface SpiceWikiProps {
  spices: Spice[];
  spiceBlends: SpiceBlendInfo[];
  onBack: () => void;
}

export const SpiceWiki: React.FC<SpiceWikiProps> = ({ spices, spiceBlends, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'spices' | 'blends'>('spices');

  const filteredSpices = spices.filter(spice =>
    spice.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    spice.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    spice.flavorProfile.some(flavor => flavor.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredBlends = spiceBlends.filter(blend =>
    blend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blend.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blend.ingredients.some(ingredient => ingredient.toLowerCase().includes(searchTerm.toLowerCase())) ||
    blend.flavorProfile.some(flavor => flavor.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="flex items-center px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Main
          </button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Spice Wiki
            </h1>
            <p className="text-gray-600 mt-1">Explore our complete collection of spices and blends</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search spices and blends..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('spices')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors flex items-center justify-center ${
                activeTab === 'spices'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                  : 'text-gray-600 hover:text-orange-600'
              }`}
            >
              <Book className="w-5 h-5 mr-2" />
              Spices ({filteredSpices.length})
            </button>
            <button
              onClick={() => setActiveTab('blends')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors flex items-center justify-center ${
                activeTab === 'blends'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                  : 'text-gray-600 hover:text-orange-600'
              }`}
            >
              <Beaker className="w-5 h-5 mr-2" />
              Blends ({filteredBlends.length})
            </button>
          </div>

          {/* Spices Tab */}
          {activeTab === 'spices' && (
            <div className="p-6">
              {filteredSpices.length === 0 ? (
                <div className="text-center py-12">
                  <Book className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No spices found</h3>
                  <p className="text-gray-500">Try adjusting your search terms</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {filteredSpices.map((spice) => (
                    <div key={spice.id} className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                      <div className="flex items-start mb-4">
                        <div
                          className="w-16 h-16 rounded-full border-4 border-white shadow-lg mr-6 flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: spice.color }}
                        >
                          <SpiceIcon 
                            iconName={spice.icon} 
                            className="w-8 h-8" 
                            style={{ color: spice.color === '#F5F5DC' || spice.color === '#F5DEB3' ? '#8B4513' : 'white' }}
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">{spice.name}</h3>
                          <p className="text-gray-700 text-lg leading-relaxed mb-4">{spice.description}</p>
                          
                          <div className="grid md:grid-cols-3 gap-4">
                            {/* Origin */}
                            <div className="bg-white rounded-lg p-4">
                              <div className="flex items-center mb-2">
                                <MapPin className="w-4 h-4 text-orange-600 mr-2" />
                                <h4 className="font-semibold text-gray-900">Origin</h4>
                              </div>
                              <p className="text-gray-700">{spice.origin}</p>
                            </div>

                            {/* Flavor Profile */}
                            <div className="bg-white rounded-lg p-4">
                              <div className="flex items-center mb-2">
                                <Palette className="w-4 h-4 text-blue-600 mr-2" />
                                <h4 className="font-semibold text-gray-900">Flavor Profile</h4>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {spice.flavorProfile.map((flavor, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                                  >
                                    {flavor}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Common Uses */}
                            <div className="bg-white rounded-lg p-4">
                              <div className="flex items-center mb-2">
                                <ChefHat className="w-4 h-4 text-green-600 mr-2" />
                                <h4 className="font-semibold text-gray-900">Common Uses</h4>
                              </div>
                              <div className="space-y-1">
                                {spice.commonUses.slice(0, 3).map((use, index) => (
                                  <div key={index} className="flex items-center text-sm">
                                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2" />
                                    <span className="text-gray-700">{use}</span>
                                  </div>
                                ))}
                                {spice.commonUses.length > 3 && (
                                  <div className="text-xs text-gray-500">
                                    +{spice.commonUses.length - 3} more uses
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Blends Tab */}
          {activeTab === 'blends' && (
            <div className="p-6">
              {filteredBlends.length === 0 ? (
                <div className="text-center py-12">
                  <Beaker className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No blends found</h3>
                  <p className="text-gray-500">Try adjusting your search terms</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {filteredBlends.map((blend) => (
                    <div key={blend.id} className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                      <div className="flex items-start mb-4">
                        <div
                          className="w-16 h-16 rounded-full border-4 border-white shadow-lg mr-6 flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: blend.color }}
                        >
                          <Beaker className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">{blend.name}</h3>
                          <p className="text-gray-700 text-lg leading-relaxed mb-4">{blend.description}</p>
                          
                          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Origin */}
                            <div className="bg-white rounded-lg p-4">
                              <div className="flex items-center mb-2">
                                <MapPin className="w-4 h-4 text-orange-600 mr-2" />
                                <h4 className="font-semibold text-gray-900">Origin</h4>
                              </div>
                              <p className="text-gray-700">{blend.origin}</p>
                            </div>

                            {/* Ingredients */}
                            <div className="bg-white rounded-lg p-4">
                              <div className="flex items-center mb-2">
                                <Book className="w-4 h-4 text-purple-600 mr-2" />
                                <h4 className="font-semibold text-gray-900">Key Ingredients</h4>
                              </div>
                              <div className="space-y-1">
                                {blend.ingredients.slice(0, 3).map((ingredient, index) => (
                                  <div key={index} className="flex items-center text-sm">
                                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2" />
                                    <span className="text-gray-700">{ingredient}</span>
                                  </div>
                                ))}
                                {blend.ingredients.length > 3 && (
                                  <div className="text-xs text-gray-500">
                                    +{blend.ingredients.length - 3} more
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Flavor Profile */}
                            <div className="bg-white rounded-lg p-4">
                              <div className="flex items-center mb-2">
                                <Palette className="w-4 h-4 text-blue-600 mr-2" />
                                <h4 className="font-semibold text-gray-900">Flavor Profile</h4>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {blend.flavorProfile.map((flavor, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                                  >
                                    {flavor}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Common Uses */}
                            <div className="bg-white rounded-lg p-4">
                              <div className="flex items-center mb-2">
                                <ChefHat className="w-4 h-4 text-green-600 mr-2" />
                                <h4 className="font-semibold text-gray-900">Common Uses</h4>
                              </div>
                              <div className="space-y-1">
                                {blend.commonUses.slice(0, 3).map((use, index) => (
                                  <div key={index} className="flex items-center text-sm">
                                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2" />
                                    <span className="text-gray-700">{use}</span>
                                  </div>
                                ))}
                                {blend.commonUses.length > 3 && (
                                  <div className="text-xs text-gray-500">
                                    +{blend.commonUses.length - 3} more uses
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};