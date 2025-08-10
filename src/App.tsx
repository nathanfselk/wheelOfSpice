import React, { useState } from 'react';
import { useEffect } from 'react';
import { LogOut, User } from 'lucide-react';
import { Spice, UserRanking } from './types/spice';
import { SpiceSearchDropdown } from './components/SpiceSearchDropdown';
import { SpiceModal } from './components/SpiceModal';
import { UserRankingList } from './components/UserRankingList';
import { ComparisonModal } from './components/ComparisonModal';
import { SpiceWheel } from './components/SpiceWheel';
import { SpiceBlender } from './components/SpiceBlender';
import { SpiceWiki } from './components/SpiceWiki';
import { AuthModal } from './components/AuthModal';
import { SpiceShop } from './components/SpiceShop';
import { PurchaseSuccessPage } from './components/PurchaseSuccessPage';
import { GlobalHeader } from './components/GlobalHeader';
import { EmailVerificationBanner } from './components/EmailVerificationBanner';
import { MissingSpiceModal } from './components/MissingSpiceModal';
import { useAuth } from './hooks/useAuth';
import { spices as staticSpices } from './data/spices';
import { spiceBlends } from './data/spiceBlends';
import { userRankingService } from './services/userRankingService';
import { communityRatingService, CommunityRating } from './services/communityRatingService';

function App() {
  const { user, loading, signOut } = useAuth();
  const [currentPage, setCurrentPage] = useState<'main' | 'blender' | 'wiki' | 'shop' | 'purchase-success'>('main');
  const [selectedSpice, setSelectedSpice] = useState<Spice | null>(null);
  const [spices, setSpices] = useState<Spice[]>([]);
  const [userRankings, setUserRankings] = useState<UserRanking[]>([]);
  const [editingRanking, setEditingRanking] = useState<UserRanking | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMissingSpiceModal, setShowMissingSpiceModal] = useState(false);
  const [communityRatings, setCommunityRatings] = useState<Record<string, CommunityRating>>({});
  const [comparisonState, setComparisonState] = useState<{
    newSpice: Spice;
    rating: number;
    conflictingSpices: UserRanking[];
    currentIndex: number;
  } | null>(null);
  const [loadingRankings, setLoadingRankings] = useState(false);

  // Check for purchase success page on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('product')) {
      setCurrentPage('purchase-success');
    }
  }, []);

  // Initialize spices on component mount
  useEffect(() => {
    setSpices(staticSpices);
    loadCommunityRatings();
  }, []);

  // Load community ratings
  const loadCommunityRatings = async () => {
    try {
      const spiceIds = staticSpices.map(spice => spice.id);
      const ratings = await communityRatingService.getCommunityRatings(spiceIds);
      setCommunityRatings(ratings);
    } catch (error) {
      console.error('Error loading community ratings:', error);
    }
  };

  // Load user rankings when user changes
  useEffect(() => {
    const loadUserRankings = async () => {
      if (!user) {
        // Clear rankings when user logs out
        setUserRankings([]);
        return;
      }

      setLoadingRankings(true);
      try {
        const dbRankings = await userRankingService.loadUserRankings(user.id);
        
        // Convert database rankings to UserRanking objects
        const rankings: UserRanking[] = dbRankings.map(dbRanking => {
          const spice = staticSpices.find(s => s.id === dbRanking.spice_id);
          if (!spice) return null;
          
          return {
            spice,
            rating: dbRanking.rating,
            rankedAt: new Date(dbRanking.created_at)
          };
        }).filter(Boolean) as UserRanking[];

        // Sort rankings by rating (descending) and then by rankedAt (ascending) for ties
        const sortedRankings = rankings.sort((a, b) => {
          if (Math.abs(a.rating - b.rating) < 0.05) {
            return a.rankedAt.getTime() - b.rankedAt.getTime();
          }
          return b.rating - a.rating;
        });

        setUserRankings(sortedRankings);
      } catch (error) {
        console.error('Error loading user rankings:', error);
      } finally {
        setLoadingRankings(false);
      }
    };

    loadUserRankings();
  }, [user]);

  const handleSpiceSelect = (spice: Spice) => {
    setSelectedSpice(spice);
    setEditingRanking(null);
  };

  const handleDeleteRating = async (spice: Spice) => {
    // Remove from local state
    const updatedRankings = userRankings.filter(r => r.spice.id !== spice.id);
    setUserRankings(updatedRankings);

    // Remove from database if user is authenticated
    if (user) {
      await userRankingService.deleteRanking(user.id, spice.id);
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


  const insertSpiceAtPosition = async (spice: Spice, rating: number, position: number) => {
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
      const sortedRankings = updatedRankings.sort((a, b) => {
        if (Math.abs(a.rating - b.rating) < 0.05) {
          return a.rankedAt.getTime() - b.rankedAt.getTime();
        }
        return b.rating - a.rating;
      });
      setUserRankings(sortedRankings);
    } else {
      // Insert at the specified position among spices with the same rating
      const insertIndex = updatedRankings.findIndex(r => r === sameRatingSpices[position]);
      if (insertIndex >= 0) {
        updatedRankings.splice(insertIndex, 0, newRanking);
      } else {
        updatedRankings.push(newRanking);
      }
      
      // Always sort the rankings after insertion to ensure correct order
      const sortedRankings = updatedRankings.sort((a, b) => {
        if (Math.abs(a.rating - b.rating) < 0.05) {
          return a.rankedAt.getTime() - b.rankedAt.getTime();
        }
        return b.rating - a.rating;
      });
      setUserRankings(sortedRankings);
    }

    // Save to database if user is authenticated
    if (user) {
      await userRankingService.saveRanking(user.id, spice.id, rating);
    }
  };

  const handleSpiceRank = async (spice: Spice, rating: number) => {
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

      // Save to database if user is authenticated
      if (user) {
        await userRankingService.saveRanking(user.id, spice.id, rating);
      }

    }
  };

  const handleRankingReorder = async (spiceId: string, newRating: number) => {
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

    // Save to database if user is authenticated
    if (user) {
      await userRankingService.saveRanking(user.id, spiceId, newRating);
    }
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

  const handleMissingSpiceClick = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setShowMissingSpiceModal(true);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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

  // Show Purchase Success page
  if (currentPage === 'purchase-success') {
    return <PurchaseSuccessPage onBackToApp={() => setCurrentPage('main')} />;
  }

  // Show Spice Shop page
  if (currentPage === 'shop') {
    return (
      <>
        <GlobalHeader 
          currentPage={currentPage} 
          onPageChange={setCurrentPage}
          user={user}
          onAuthClick={() => setShowAuthModal(true)}
          onSignOut={handleSignOut}
        />
        <SpiceShop />
        
        {/* Auth Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  // Show Spice Blender page
  if (currentPage === 'blender') {
    return (
      <>
        <GlobalHeader 
          currentPage={currentPage} 
          onPageChange={setCurrentPage}
          user={user}
          onAuthClick={() => setShowAuthModal(true)}
          onSignOut={handleSignOut}
        />
        <SpiceBlender spices={spices} />
        <SpiceBlender spices={spices} user={user} />
      </>
    );
  }

  // Show Spice Wiki page
  if (currentPage === 'wiki') {
    return (
      <>
        <GlobalHeader 
          currentPage={currentPage} 
          onPageChange={setCurrentPage}
          user={user}
          onAuthClick={() => setShowAuthModal(true)}
          onSignOut={handleSignOut}
        />
        <SpiceWiki 
          spices={spices} 
          spiceBlends={spiceBlends}
          onSpiceRank={handleSpiceRank}
        />
        
        {/* Auth Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  return (
    <>
      <GlobalHeader 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
        user={user}
        onAuthClick={() => setShowAuthModal(true)}
        onSignOut={handleSignOut}
      />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      {/* Header */}
      <div>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2" itemProp="name">
              Spice Ranker
            </h1>
            <h2 className="text-gray-600 text-lg font-medium" itemProp="description">
              Find the best spices online - Flavor guides - Community reviews
            </h2>
            <div className="mt-4 text-sm text-gray-500">
              <span itemProp="keywords">Premium cooking spices • Flavor profiles • Spice reviews • Quality spices online</span>
            </div>
          </div>
          
          <div className="flex justify-center">
            <SpiceSearchDropdown
              spices={spices}
              onSpiceSelect={handleSpiceSelect}
              onMissingSpiceClick={handleMissingSpiceClick}
              excludeSpices={rankedSpiceIds}
              isLoggedIn={!!user}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Email Verification Banner */}
        {user && (
          <EmailVerificationBanner 
            userEmail={user.email || undefined}
          />
        )}
        
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
        {!user && (
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl shadow-lg p-6 text-center mt-8">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Join the Spice Community</h3>
            <p className="text-gray-600 mb-4">Sign up to connect with other spice enthusiasts and share your flavor journey!</p>
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
          communityRating={communityRatings[selectedSpice.id]}
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

      {/* Missing Spice Modal */}
      <MissingSpiceModal
        isOpen={showMissingSpiceModal}
        onClose={() => setShowMissingSpiceModal(false)}
        userId={user?.id}
      />
    </div>
    </>
  );
}

export default App;