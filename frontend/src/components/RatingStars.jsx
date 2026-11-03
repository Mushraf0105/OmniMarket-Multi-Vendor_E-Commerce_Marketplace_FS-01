import React from 'react';
import { Star } from 'lucide-react';

const RatingStars = ({ rating = 0, numReviews, size = 16, interactive = false, onRatingChange }) => {
  const roundedRating = Math.round(rating * 2) / 2;

  return (
    <div className="flex items-center space-x-1.5">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} focus:outline-none`}
          >
            <Star
              size={size}
              className={`${
                star <= roundedRating
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-gray-300 fill-gray-100'
              }`}
            />
          </button>
        ))}
      </div>
      {numReviews !== undefined && (
        <span className="text-xs font-medium text-slate-500">
          ({numReviews})
        </span>
      )}
    </div>
  );
};

export default RatingStars;

