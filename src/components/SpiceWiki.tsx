import React, { useState } from 'react';
import { Search, Book, Beaker, MapPin, Palette, ChefHat, ArrowUpDown, Star } from 'lucide-react';
import { Spice } from '../types/spice';
import { SpiceBlendInfo } from '../data/spiceBlends';
import { SpiceIcon } from './SpiceIcon';
import { SpiceModal } from './SpiceModal';
import { CommunityRating } from '../services/communityRatingService';

interface SpiceWikiProps {
  spices: Spice[];
  spiceBlends: SpiceBlendInfo[];
  onSpiceRank?: (spice: Spice, rating: number) => void;
  communityRatings?: Record<string, CommunityRating>;
}

type SortOption = 'name-asc' | 'name-desc' | 'rating-high' | 'rating-low';

export const SpiceWiki: React.FC<SpiceWikiProps> = ({ spices, spiceBlends, onSpiceRank, communityRatings = {} }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'spices' | 'blends'>('spices');
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');
  const [selectedSpice, setSelectedSpice] = useState<Spice | null>(null);
  const [selectedBlend, setSelectedBlend] = useState<SpiceBlendInfo | null>(null);

  const filteredAndSortedSpices = spices
    .filter(spice =>
      spice.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spice.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spice.flavorProfile.some(flavor => flavor.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortOption) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'rating-high':
          const ratingA = communityRatings[a.id]?.average_rating || 0;
          const ratingB = communityRatings[b.id]?.average_rating || 0;
          return ratingB - ratingA;
        case 'rating-low':
          const ratingALow = communityRatings[a.id]?.average_rating || 0;
          const ratingBLow = communityRatings[b.id]?.average_rating || 0;
          return ratingALow - ratingBLow;
        default:
          return 0;
      }
    });

  const filteredBlends = spiceBlends.filter(blend =>
    blend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blend.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blend.ingredients.some(ingredient => ingredient.toLowerCase().includes(searchTerm.toLowerCase())) ||
    blend.flavorProfile.some(flavor => flavor.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 text-center" itemScope itemType="https://schema.org/WebPage">
            <meta itemProp="name" content="Complete Spice Guide - Buy Premium Spices Online" />
            <meta itemProp="description" content="Comprehensive guide to 40+ cooking spices and gourmet blends with flavor profiles, origins, and buying recommendations" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Spice Guide
            </h1>
            <p className="text-gray-600 mt-1">Expert guide to the best cooking spices online - 40+ premium spices with detailed profiles and community ratings</p>
            <div className="mt-2 text-sm text-gray-500">
              <span>Gourmet spices • Flavor profiles • Origin information • Guides • Recipe suggestions</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 space-y-4">
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
            
            {/* Sort Options */}
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center">
                <ArrowUpDown className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Sort by:</span>
              </div>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-sm"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="rating-high">Community Rating ↑ </option>
                <option value="rating-low">Community Rating ↓ </option>
              </select>
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
                Spices ({filteredAndSortedSpices.length})
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
                {filteredAndSortedSpices.length === 0 ? (
                  <div className="text-center py-12">
                    <Book className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No spices found</h3>
                    <p className="text-gray-500">Try adjusting your search terms</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {filteredAndSortedSpices.map((spice) => {
                      const communityRating = communityRatings[spice.id];
                      
                      return (
                      <div 
                        key={spice.id} 
                        className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => setSelectedSpice(spice)}
                      >
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
                            
                            {/* Community Rating Display */}
                            {communityRating && (
                              <div className="flex items-center mb-2">
                                <Star className="w-4 h-4 text-yellow-500 mr-1 fill-current" />
                                <span className="text-sm font-medium text-gray-700">
                                  {communityRating.average_rating.toFixed(1)}/10
                                </span>
                                <span className="text-xs text-gray-500 ml-2">
                                  ({communityRating.total_ratings} rating{communityRating.total_ratings !== 1 ? 's' : ''})
                                </span>
                              </div>
                            )}
                            
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
                    )})}
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
                      <div 
                        key={blend.id} 
                        className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => setSelectedBlend(blend)}
                      >
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

      {/* Spice Modal */}
      {selectedSpice && (
        <SpiceModal
          spice={selectedSpice}
          onClose={() => setSelectedSpice(null)}
          onRank={onSpiceRank || (() => {})}
        />
      )}

      {/* Blend Modal */}
      {selectedBlend && (
        <BlendModal
          blend={selectedBlend}
          onClose={() => setSelectedBlend(null)}
        />
      )}
    </>
  );
};

// Blend Modal Component
interface BlendModalProps {
  blend: SpiceBlendInfo;
  onClose: () => void;
}

const BlendModal: React.FC<BlendModalProps> = ({ blend, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-200">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <span className="text-gray-600 text-xl">×</span>
          </button>
          
          <div className="flex items-center mb-4">
            <div
              className="w-16 h-16 rounded-full border-4 border-white shadow-lg mr-4 flex items-center justify-center"
              style={{ backgroundColor: blend.color }}
            >
              <Beaker className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{blend.name}</h2>
              <p className="text-gray-600 mt-1">{blend.origin}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <p className="text-gray-700 text-lg leading-relaxed">{blend.description}</p>
          </div>

          {/* Details Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Ingredients */}
            <div className="bg-purple-50 rounded-xl p-4">
              <div className="flex items-center mb-3">
                <Book className="w-5 h-5 text-purple-600 mr-2" />
                <h3 className="font-semibold text-gray-900">Key Ingredients</h3>
              </div>
              <div className="space-y-2">
                {blend.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-2" />
                    <span className="text-gray-700">{ingredient}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Flavor Profile */}
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center mb-3">
                <Palette className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="font-semibold text-gray-900">Flavor Profile</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {blend.flavorProfile.map((flavor, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {flavor}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Common Uses */}
          <div className="bg-green-50 rounded-xl p-4">
            <div className="flex items-center mb-3">
              <ChefHat className="w-5 h-5 text-green-600 mr-2" />
              <h3 className="font-semibold text-gray-900">Common Uses</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {blend.commonUses.map((use, index) => (
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