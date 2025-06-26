
import React from 'react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  onRate?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readOnly?: boolean;
  className?: string;
}

const Star: React.FC<{ filled: boolean; onClick?: () => void; onMouseEnter?: () => void; onMouseLeave?: () => void; sizeClass: string; colorClass: string; hoverColorClass?: string; readOnly?: boolean }> = 
({ filled, onClick, onMouseEnter, onMouseLeave, sizeClass, colorClass, hoverColorClass, readOnly }) => {
  return (
    <svg
      className={` ${sizeClass} ${filled ? colorClass : 'text-gray-300'} ${!readOnly && hoverColorClass ? `${hoverColorClass} cursor-pointer` : ''} transition-colors`}
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
    </svg>
  );
};

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  onRate,
  size = 'md',
  readOnly = false,
  className = '',
}) => {
  const [hoverRating, setHoverRating] = React.useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const handleRate = (newRating: number) => {
    if (onRate && !readOnly) {
      onRate(newRating);
    }
  };

  const handleMouseEnter = (newRating: number) => {
    if (!readOnly) {
      setHoverRating(newRating);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverRating(0);
    }
  };

  return (
    <div className={`flex items-center ${className}`}>
      {Array.from({ length: maxRating }, (_, i) => {
        const starValue = i + 1;
        const filled = (hoverRating || rating) >= starValue;
        return (
          <Star
            key={i}
            filled={filled}
            onClick={() => handleRate(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
            sizeClass={sizeClasses[size]}
            colorClass="text-yellow-400"
            hoverColorClass="hover:text-yellow-500"
            readOnly={readOnly}
          />
        );
      })}
    </div>
  );
};

export default StarRating;

