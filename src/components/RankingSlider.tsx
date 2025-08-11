import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

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
  const dialRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [dialRotation, setDialRotation] = useState(0);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Update dial rotation based on rating
    const rotation = ((rating - 1) / 9) * 270 - 135; // -135 to 135 degrees
    setDialRotation(rotation);
  }, [rating]);

  const updateRating = (clientX: number) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newRating = Math.round((percentage * 9 + 1) * 10) / 10; // 1.0-10.0 scale with 0.1 precision
    
    setRating(newRating);
    onRatingChange(newRating);
  };

  const updateRatingFromDial = (clientX: number, clientY: number) => {
    if (!dialRef.current) return;

    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate angle from center
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    
    // Normalize angle to 0-270 degrees (starting from left, going clockwise)
    angle = (angle + 90 + 360) % 360;
    
    // Constrain to 270-degree range (from -135 to +135 degrees)
    if (angle > 270) {
      angle = angle > 315 ? 0 : 270; // Snap to nearest end
    }
    
    // Convert angle to rating (1-10)
    const percentage = angle / 270;
    const newRating = Math.round((percentage * 9 + 1) * 10) / 10;
    
    setRating(newRating);
    onRatingChange(newRating);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMobile) return; // Disable mouse events on mobile
    setIsDragging(true);
    updateRating(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    setIsDragging(true);
    updateRatingFromDial(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && isMobile) {
      e.preventDefault();
      updateRatingFromDial(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchEnd = () => {
    if (isMobile) {
      setIsDragging(false);
    }
  };

  const handleDialMouseMove = (e: MouseEvent) => {
    if (isDragging && !isMobile) {
      updateRating(e.clientX);
    }
  };

  const handleDialMouseUp = () => {
    if (!isMobile) {
      setIsDragging(false);
    }
  };

  useEffect(() => {
    if (isDragging && !isMobile) {
      document.addEventListener('mousemove', handleDialMouseMove);
      document.addEventListener('mouseup', handleDialMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleDialMouseMove);
      document.removeEventListener('mouseup', handleDialMouseUp);
    };
  }, [isDragging, isMobile]);

  const percentage = ((rating - 1) / 9) * 100;

  return (
    <div className="w-full">
      {/* Mobile: Button Controls */}
      {isMobile && (
        <div className="mb-6 text-center">
          <div className="flex justify-between text-sm text-gray-600 mb-3">
            <span>Don't like it</span>
            <span className="font-semibold text-xl" style={{ color: spiceColor }}>
              {rating.toFixed(1)}/10
            </span>
            <span>Love it!</span>
          </div>
          
          {/* Rotatable Dial */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              {/* Dial Background */}
              <div 
                ref={dialRef}
                className="w-48 h-48 rounded-full border-8 border-gray-200 relative cursor-pointer select-none"
                style={{
                  background: `conic-gradient(from -135deg, ${spiceColor}40 0deg, ${spiceColor}80 270deg, #f3f4f6 270deg)`
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Rating Numbers around the dial */}
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                  const angle = ((num - 1) / 9) * 270 - 135; // -135 to 135 degrees
                  const radian = (angle * Math.PI) / 180;
                  const radius = 85;
                  const x = Math.cos(radian) * radius;
                  const y = Math.sin(radian) * radius;
                  
                  return (
                    <div
                      key={num}
                      className="absolute w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-600"
                      style={{
                        left: `calc(50% + ${x}px - 12px)`,
                        top: `calc(50% + ${y}px - 12px)`,
                      }}
                    >
                      {num}
                    </div>
                  );
                })}
                
                {/* Dial Pointer */}
                <div
                  className="absolute top-1/2 left-1/2 origin-bottom transition-transform duration-200"
                  style={{
                    transform: `translate(-50%, -100%) rotate(${dialRotation}deg)`,
                    height: '70px',
                    width: '4px',
                    backgroundColor: spiceColor,
                    borderRadius: '2px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                  }}
                />
                
                {/* Center Circle */}
                <div 
                  className="absolute top-1/2 left-1/2 w-8 h-8 rounded-full border-4 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2"
                  style={{ backgroundColor: spiceColor }}
                />
                
                {/* Current Rating Display */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 translate-y-8 bg-white rounded-lg px-3 py-1 shadow-lg border-2 border-gray-200">
                  <span className="font-bold text-lg" style={{ color: spiceColor }}>
                    {rating.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Instructions */}
          <div className="text-center text-sm text-gray-600 mb-4">
            <div className="flex items-center justify-center mb-2">
              <RotateCcw className="w-4 h-4 mr-2" />
              <span>Drag the dial to rate this spice</span>
            </div>
            <p className="text-xs text-gray-500">
              Rotate clockwise for higher ratings, counterclockwise for lower
            </p>
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