import React from 'react';
import { useState } from 'react';
import { Trophy, Medal, Award, Star } from 'lucide-react';
import { UserRanking } from '../types/spice';
import { SpiceIcon } from './SpiceIcon';

interface UserRankingListProps {
  rankings: UserRanking[];
  onSpiceClick: (ranking: UserRanking) => void;
  onRankingReorder: (spiceId: string, newRating: number) => void;
}

export const UserRankingList: React.FC<UserRankingListProps> = ({
  rankings,
  onSpiceClick,
  onRankingReorder
}) => {
  const [draggedItem, setDraggedItem] = useState<UserRanking | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const getScoreColor = (rating: number) => {
    // Normalize rating from 1-10 scale to 0-1 scale
    const normalizedRating = (rating - 1) / 9;
    
    if (normalizedRating >= 0.8) {
      // High scores (8-10): Green shades
      return 'text-green-600';
    } else if (normalizedRating >= 0.6) {
      // Good scores (6.4-7.9): Yellow-green shades
      return 'text-lime-600';
    } else if (normalizedRating >= 0.4) {
      // Medium scores (4.6-6.3): Yellow shades
      return 'text-yellow-600';
    } else if (normalizedRating >= 0.2) {
      // Low scores (2.8-4.5): Orange shades
      return 'text-orange-600';
    } else {
      // Very low scores (1-2.7): Red shades
      return 'text-red-600';
    }
  };

  const getScoreBackgroundColor = (rating: number) => {
    // Normalize rating from 1-10 scale to 0-1 scale
    const normalizedRating = (rating - 1) / 9;
    
    if (normalizedRating >= 0.8) {
      // High scores (8-10): Green background
      return 'bg-green-50 border-green-200';
    } else if (normalizedRating >= 0.6) {
      // Good scores (6.4-7.9): Yellow-green background
      return 'bg-lime-50 border-lime-200';
    } else if (normalizedRating >= 0.4) {
      // Medium scores (4.6-6.3): Yellow background
      return 'bg-yellow-50 border-yellow-200';
    } else if (normalizedRating >= 0.2) {
      // Low scores (2.8-4.5): Orange background
      return 'bg-orange-50 border-orange-200';
    } else {
      // Very low scores (1-2.7): Red background
      return 'bg-red-50 border-red-200';
    }
  };

  const handleDragStart = (e: React.DragEvent, ranking: UserRanking) => {
    setDraggedItem(ranking);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', '');
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear drag over if we're leaving the entire list area
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (!draggedItem) return;
    
    const dragIndex = rankings.findIndex(r => r.spice.id === draggedItem.spice.id);
    if (dragIndex === dropIndex) {
      setDraggedItem(null);
      setDragOverIndex(null);
      return;
    }

    // Calculate new rating based on position
    let newRating: number;
    
    if (dropIndex === 0) {
      // Dropped at the top
      newRating = Math.min(10, rankings[0].rating + 0.1);
    } else if (dropIndex === rankings.length - 1) {
      // Dropped at the bottom
      newRating = Math.max(1, rankings[rankings.length - 1].rating - 0.1);
    } else {
      // Dropped between two items
      const aboveRating = rankings[dropIndex - 1].rating;
      const belowRating = rankings[dropIndex].rating;
      newRating = (aboveRating + belowRating) / 2;
    }

    // Round to nearest tenth
    newRating = Math.round(newRating * 10) / 10;
    
    // Ensure rating stays within bounds
    newRating = Math.max(1, Math.min(10, newRating));

    onRankingReorder(draggedItem.spice.id, newRating);
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 1:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 2:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-500">#{index + 1}</span>;
    }
  };

  if (rankings.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Star className="w-8 h-8 text-orange-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Your Spice Journey</h3>
        <p className="text-gray-600">Search and rank spices above to build your personal flavor profile!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
        <h3 className="text-xl font-bold text-white">My Spice Rankings</h3>
        <p className="text-orange-100">Click any spice to re-rank it</p>
      </div>
      
      <div className="divide-y divide-gray-100">
        {rankings.map((ranking, index) => (
          <div
            key={ranking.spice.id}
            draggable
            onDragStart={(e) => handleDragStart(e, ranking)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            onClick={() => onSpiceClick(ranking)}
            className={`px-6 py-4 cursor-move transition-all duration-200 group border-l-4 select-none ${
              getScoreBackgroundColor(ranking.rating)
            } ${
              draggedItem?.spice.id === ranking.spice.id 
                ? 'opacity-50 scale-95 shadow-lg' 
                : 'hover:opacity-80'
            } ${
              dragOverIndex === index 
                ? 'border-t-4 border-t-orange-400' 
                : ''
            }`}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-4">
                {getRankIcon(index)}
              </div>
              
              <div
                className="w-10 h-10 rounded-full border-2 border-white shadow-sm mr-4 flex items-center justify-center"
                style={{ backgroundColor: ranking.spice.color }}
              >
                <SpiceIcon 
                  iconName={ranking.spice.icon} 
                  className="w-5 h-5" 
                  style={{ color: ranking.spice.color === '#F5F5DC' || ranking.spice.color === '#F5DEB3' ? '#8B4513' : 'white' }}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors pointer-events-none">
                    {ranking.spice.name}
                  </h4>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 mr-1 fill-current" />
                    <span className={`font-bold text-lg ${getScoreColor(ranking.rating)}`}>
                      {ranking.rating.toFixed(1)}/10
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 pointer-events-none">{ranking.spice.origin}</p>
              </div>
            </div>
          </div>
        ))}
        
        {/* Drop zone at the bottom */}
        {draggedItem && (
          <div
            onDragOver={(e) => handleDragOver(e, rankings.length)}
            onDrop={(e) => handleDrop(e, rankings.length)}
            className={`px-6 py-2 transition-all duration-200 ${
              dragOverIndex === rankings.length 
                ? 'border-t-4 border-t-orange-400 bg-orange-50' 
                : 'border-t border-t-transparent'
            }`}
          >
            <div className="text-center text-gray-400 text-sm">
              Drop here to rank lowest
            </div>
          </div>
        )}
      </div>
    </div>
  );
};