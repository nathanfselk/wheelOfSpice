import React, { useState } from 'react';
import { useEffect } from 'react';
import { LogOut, User } from 'lucide-react';
import { Spice, UserRanking } from './types/spice';
import { SpiceSearchDropdown } from './components/SpiceSearchDropdown';
import { SpiceModal } from './components/SpiceModal';
import { UserRankingList } from './components/UserRankingList';
import { ComparisonModal } from './components/ComparisonModal';
import { SpiceWheel } from './components/SpiceWheel';
import { AuthModal } from './components/AuthModal';
import { useAuth } from './hooks/useAuth';
import { rankingService } from './services/rankingService';
import { spiceService } from './services/spiceService';
import { spices as staticSpices } from './data/spices';

function App() {
  const { user, loading, signOut } = useAuth();
  const [selectedSpice, setSelectedSpice] = useState<Spice | null>(null);
  const [spices, setSpices] = useState<Spice[]>([]);
  const [userRankings, setUserRankings] = useState<UserRanking[]>([]);
  const [editingRanking, setEditingRanking] = useState<UserRanking | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [comparisonState, setComparisonState] = useState<{
    newSpice: Spice;
    rating: number;
    conflictingSpices: UserRanking[];
    currentIndex: number;
  } | null>(null);
  const [loadingRankings, setLoadingRankings] = useState(false);

  // Load spices on component mount
  useEffect(() => {
    const loadSpices = async () => {
      // Initialize community ratings table first
      await spiceService.initializeCommunityRatings();
      // Then load spices with community averages
      const spicesWithAverages = await spiceService.getSpicesWithCommunityAverages();
      setSpices(spicesWithAverages);
    };
    loadSpices();
  }, []);

  // Load user rankings when user changes
  useEffect(() => {
    const loadRankings = async () => {
      setLoadingRankings(true);
      try {
        const rankings = await rankingService.loadRankings(user?.id);
        setUserRankings(rankings);
      } catch (error) {
        console.error('Failed to load rankings:', error);
      } finally {
        setLoadingRankings(false);
      }
    };

    loadRankings();
  }, [user]);

  const handleSpiceSelect = (spice: Spice) => {
    setSelectedSpice(spice);
    setEditingRanking(null);
  };

  const handleDeleteRating = async (spice: Spice) => {
    // Remove from local state
    const updatedRankings = userRankings.filter(r => r.spice.id !== spice.id);
    setUserRankings(updatedRankings);

    // Delete from database
    try {
      await rankingService.deleteRanking(spice.id, user?.id);
      // Update community averages after deletion
      updateCommunityAverages();
    } catch (error) {
      console.error('Failed to delete ranking:', error);
      // Revert local state on error
      const rankings = await rankingService.loadRankings(user?.id);
      setUserRankings(rankings);
    }
  };
  const handleRankingClick = (ranking: UserRanking) => {
    setSelectedSpice(ranking.spice);
    setEditingRanking(ranking);
  };

  const findSpicesWithSameRating = (rating: number, excludeSpiceId?: string): UserRanking[] => {
    return userRankings.filter(r => 
      Math.abs(r.rating - rating) < 0.05 && r.spice.id !== excludeSpiceId
    );
  };

  const updateCommunityAverages = () => {
    const updateAverages = async () => {
      try {
        const spicesWithAverages = await spiceService.getSpicesWithCommunityAverages();
        setSpices(spicesWithAverages);
      } catch (error) {
        console.error('Failed to update community averages:', error);
      }
    };
    updateAverages();
  };

  const insertSpiceAtPosition = (spice: Spice, rating: number, position: number) => {
    const updatedRankings = [...userRankings];
    const existingIndex = updatedRankings.findIndex(r => r.spice.id === spice.id);
    
    const newRanking: UserRanking = {
      spice,
      rating,
      rankedAt: new Date()
    };

    if (existingIndex >= 0) {
      updatedRankings.splice(existingIndex, 1);
    }

    // Find spices with the same rating and insert at the specified position
    const sameRatingSpices = updatedRankings.filter(r => Math.abs(r.rating - rating) < 0.05);
    
    if (sameRatingSpices.length === 0) {
      // No conflicts, just add and sort
      updatedRankings.push(newRanking);
      setUserRankings(updatedRankings.sort((a, b) => {
        if (Math.abs(a.rating - b.rating) < 0.05) {
          return a.rankedAt.getTime() - b.rankedAt.getTime();
        }
        return b.rating - a.rating;
      }));
    } else {
      // Insert at the specified position among spices with the same rating
      const insertIndex = updatedRankings.findIndex(r => r === sameRatingSpices[position]);
      if (insertIndex >= 0) {
        updatedRankings.splice(insertIndex, 0, newRanking);
      } else {
        updatedRankings.push(newRanking);
      }
      setUserRankings(updatedRankings);
    }

    // Save to database
    if (user) {
      rankingService.saveRanking(spice, rating, user.id);
    } else {
      rankingService.saveRanking(spice, rating);
    }

    // Update community averages after inserting spice
    updateCommunityAverages();
  };

  const handleSpiceRank = (spice: Spice, rating: number) => {
    const conflictingSpices = findSpicesWithSameRating(rating, spice.id);
    
    if (conflictingSpices.length > 0) {
      // Start comparison process
      setComparisonState({
        newSpice: spice,
        rating,
        conflictingSpices,
        currentIndex: 0
      });
    } else {
      // No conflicts, add normally
      const existingRankingIndex = userRankings.findIndex(r => r.spice.id === spice.id);
      
      const newRanking: UserRanking = {
        spice,
        rating,
        rankedAt: new Date()
      };

      if (existingRankingIndex >= 0) {
        const updatedRankings = [...userRankings];
        updatedRankings[existingRankingIndex] = newRanking;
        setUserRankings(updatedRankings.sort((a, b) => {
          if (Math.abs(a.rating - b.rating) < 0.05) {
            return a.rankedAt.getTime() - b.rankedAt.getTime();
          }
          return b.rating - a.rating;
        }));
      } else {
        setUserRankings([...userRankings, newRanking].sort((a, b) => {
          if (Math.abs(a.rating - b.rating) < 0.05) {
            return a.rankedAt.getTime() - b.rankedAt.getTime();
          }
          return b.rating - a.rating;
        }));
      }

      // Save to database
      rankingService.saveRanking(spice, rating, user?.id);

      // Update community averages
      updateCommunityAverages();
    }
  };

  const handleRankingReorder = (spiceId: string, newRating: number) => {
    const spiceToReorder = userRankings.find(r => r.spice.id === spiceId);
    if (!spiceToReorder) return;

    // Update the ranking with new rating
    const updatedRankings = userRankings.map(ranking => 
      ranking.spice.id === spiceId 
        ? { ...ranking, rating: newRating, rankedAt: new Date() }
        : ranking
    );

    // Sort the updated rankings
    const sortedRankings = updatedRankings.sort((a, b) => {
      if (Math.abs(a.rating - b.rating) < 0.05) {
        return a.rankedAt.getTime() - b.rankedAt.getTime();
      }
      return b.rating - a.rating;
    });

    setUserRankings(sortedRankings);

    // Save to database/localStorage
    rankingService.saveRanking(spiceToReorder.spice, newRating, user?.id);

    // Update community averages
    updateCommunityAverages();
  };

  const handleComparisonChoice = (preferNew: boolean) => {
    if (!comparisonState) return;

    const { newSpice, rating, conflictingSpices, currentIndex } = comparisonState;
    
    if (preferNew) {
      // User prefers the new spice, insert it at the current position
      insertSpiceAtPosition(newSpice, rating, currentIndex);
      setComparisonState(null);
    } else {
      // User prefers the existing spice, continue with next comparison
      if (currentIndex + 1 < conflictingSpices.length) {
        setComparisonState({
          ...comparisonState,
          currentIndex: currentIndex + 1
        });
      } else {
        // No more comparisons, insert at the end
        insertSpiceAtPosition(newSpice, rating, conflictingSpices.length);
        setComparisonState(null);
      }
    }
  };

  const closeModal = () => {
    setSelectedSpice(null);
    setEditingRanking(null);
  };

  const closeComparisonModal = () => {
    setComparisonState(null);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setUserRankings([]);
  };

  if (loading || loadingRankings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-600">{loading ? 'Loading...' : 'Loading your rankings...'}</p>
        </div>
      </div>
    );
  }

  const rankedSpiceIds = userRankings.map(r => r.spice.id);
  const availableSpices = spices.filter(spice => !rankedSpiceIds.includes(spice.id));

  // Show loading state while spices are being loaded
  if (spices.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-600">Loading spices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Auth Button */}
          <div className="flex justify-end mb-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">Welcome, {user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105"
              >
                <User className="w-4 h-4 mr-2" />
                Log In / Sign Up
              </button>
            )}
          </div>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
              Wheel of Spice
            </h1>
            <p className="text-gray-600 text-lg">
              Discover, learn, and rank your favorite spices
            </p>
          </div>
          
          <div className="flex justify-center">
            <SpiceSearchDropdown
              spices={spices}
              onSpiceSelect={handleSpiceSelect}
              excludeSpices={rankedSpiceIds}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Spinning Wheel */}
        {availableSpices.length > 0 && (
          <div className="mb-12">
            <SpiceWheel
              availableSpices={availableSpices}
              onSpiceSelect={handleSpiceSelect}
            />
          </div>
        )}

        <UserRankingList
          rankings={userRankings}
          onSpiceClick={handleRankingClick}
          onRankingReorder={handleRankingReorder}
        />
        
        {/* Sign up prompt for anonymous users */}
        {!user && userRankings.length > 0 && (
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl shadow-lg p-6 text-center mt-8">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Save Your Rankings Forever</h3>
            <p className="text-gray-600 mb-4">Sign up to keep your spice rankings across devices and never lose your progress!</p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105"
            >
              Create Account
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedSpice && (
        <SpiceModal
          spice={selectedSpice}
          onClose={closeModal}
          onRank={handleSpiceRank}
          onDelete={handleDeleteRating}
          initialRating={editingRanking?.rating}
        />
      )}

      {/* Comparison Modal */}
      {comparisonState && (
        <ComparisonModal
          newSpice={comparisonState.newSpice}
          existingSpice={comparisonState.conflictingSpices[comparisonState.currentIndex].spice}
          rating={comparisonState.rating}
          onPreferNew={() => handleComparisonChoice(true)}
          onPreferExisting={() => handleComparisonChoice(false)}
          onClose={closeComparisonModal}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}

export default App;