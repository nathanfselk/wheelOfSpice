import React, { useState, useRef, useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';

interface RankingSliderProps {
  initialRating?: number;
  onRatingChange: (rating: number) => void;
  spiceColor: string;
}

export const RankingSlider: React.FC<RankingSliderProps> = ({
  initialRating = 5,
  onRatingChange,
  spiceColor
}) => {
  const [rating, setRating] = useState(Number(initialRating.toFixed(1)));
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const updateRating = (clientX: number) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newRating = Math.round((percentage * 9 + 1) * 10) / 10; // 1.0-10.0 scale with 0.1 precision
    
    setRating(newRating);
    onRatingChange(newRating);
  };

  const adjustRating = (delta: number) => {
    const newRating = Math.max(1, Math.min(10, rating + delta));
    const roundedRating = Math.round(newRating * 10) / 10;
    setRating(roundedRating);
    onRatingChange(roundedRating);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMobile) return; // Disable mouse events on mobile
    setIsDragging(true);
    updateRating(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    setIsDragging(true);
    updateRating(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && isMobile) {
      e.preventDefault();
      updateRating(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    if (isMobile) {
      setIsDragging(false);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && !isMobile) {
      updateRating(e.clientX);
    }
  };

  const handleMouseUp = () => {
    if (!isMobile) {
      setIsDragging(false);
    }
  };

  useEffect(() => {
    if (isDragging && !isMobile) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isMobile]);

  const percentage = ((rating - 1) / 9) * 100;

  return (
    <div className="w-full">
      {/* Mobile: Button Controls */}
      {isMobile && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-3">
            <span>Don't like it</span>
            <span className="font-semibold text-xl" style={{ color: spiceColor }}>
              {rating.toFixed(1)}/10
            </span>
            <span>Love it!</span>
          </div>
          
          {/* Large tap buttons for mobile */}
          <div className="flex items-center justify-center space-x-4 mb-4">
            <button
              onClick={() => adjustRating(-0.5)}
              disabled={rating <= 1}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl transition-all ${
                rating <= 1 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-red-500 hover:bg-red-600 active:scale-95'
              }`}
            >
              <Minus className="w-6 h-6" />
            </button>
            
            <div className="flex-1 mx-4">
              <div className="bg-gray-200 rounded-full h-3 relative">
                <div
                  className="h-full rounded-full transition-all duration-200"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: spiceColor,
                  }}
                />
                <div
                  className="absolute top-1/2 w-6 h-6 rounded-full border-3 border-white shadow-lg transition-all duration-200 transform -translate-y-1/2"
                  style={{
                    left: `${percentage}%`,
                    backgroundColor: spiceColor,
                    marginLeft: '-12px'
                  }}
                />
              </div>
            </div>
            
            <button
              onClick={() => adjustRating(0.5)}
              disabled={rating >= 10}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl transition-all ${
                rating >= 10 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-green-500 hover:bg-green-600 active:scale-95'
              }`}
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
          
          {/* Fine adjustment buttons */}
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => adjustRating(-0.1)}
              disabled={rating <= 1}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                rating <= 1 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-red-100 text-red-700 hover:bg-red-200 active:scale-95'
              }`}
            >
              -0.1
            </button>
            <button
              onClick={() => adjustRating(0.1)}
              disabled={rating >= 10}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                rating >= 10 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200 active:scale-95'
              }`}
            >
              +0.1
            </button>
          </div>
        </div>
      )}

      {/* Desktop: Slider */}
      {!isMobile && (
        <>
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>Don't like it</span>
        <span className="font-semibold text-lg" style={{ color: spiceColor }}>
          {rating.toFixed(1)}/10
        </span>
        <span>Love it!</span>
      </div>
      
      <div
        ref={sliderRef}
            className="relative w-full h-8 bg-gray-200 rounded-full cursor-pointer group"
        onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
      >
        {/* Track fill */}
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-200"
          style={{
            width: `${percentage}%`,
            backgroundColor: spiceColor,
            opacity: 0.7
          }}
        />
        
        {/* Slider thumb */}
        <div
          className={`absolute top-1/2 w-6 h-6 rounded-full border-3 border-white shadow-lg transition-all duration-200 transform -translate-y-1/2 ${
            isDragging ? 'scale-125' : 'group-hover:scale-110'
          }`}
          style={{
            left: `${percentage}%`,
            backgroundColor: spiceColor,
            marginLeft: '-12px'
          }}
        />
        
        {/* Rating markers */}
        <div className="absolute top-full mt-2 w-full flex justify-between text-xs text-gray-400">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
            <span key={num}>{num}</span>
          ))}
        </div>
      </div>
        </>
      )}
    </div>
  );
};