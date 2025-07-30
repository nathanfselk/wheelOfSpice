import React, { useState, useRef, useEffect } from 'react';

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

  const updateRating = (clientX: number) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newRating = Math.round((percentage * 9 + 1) * 10) / 10; // 1.0-10.0 scale with 0.1 precision
    
    setRating(newRating);
    onRatingChange(newRating);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updateRating(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      updateRating(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const percentage = ((rating - 1) / 9) * 100;

  return (
    <div className="w-full">
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
    </div>
  );
};