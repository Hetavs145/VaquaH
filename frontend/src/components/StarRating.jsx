import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ itemId, type, status, itemDetails, reviews, onRate, readOnly = false }) => {
    const [hoverRating, setHoverRating] = useState(0);

    // Check if already reviewed
    const existingReview = reviews?.find(r => r.itemId === itemId);
    const currentRating = existingReview ? existingReview.rating : 0;

    // Unlock only if completed/success and not readOnly
    // For products, statuses like 'delivered', 'processing' (maybe not processing), 'success'.
    // Let's be permissive or rely on parent to pass correct status/readOnly.
    // If status is passed, use it.

    const isCompleted = status ? ['completed', 'success', 'delivered'].includes((status || '').toLowerCase()) : true;
    const isLocked = readOnly || !isCompleted;

    return (
        <div
            className="flex items-center gap-0.5"
            onMouseLeave={() => !isLocked && setHoverRating(0)}
        >
            {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= (hoverRating || currentRating);

                return (
                    <button
                        key={star}
                        type="button"
                        disabled={isLocked}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!isLocked && onRate) {
                                onRate(itemId, type, star, itemDetails);
                            }
                        }}
                        onMouseEnter={() => !isLocked && setHoverRating(star)}
                        className={`focus:outline-none transition-transform ${!isLocked ? 'hover:scale-125 cursor-pointer' : 'cursor-default'}`}
                    >
                        <Star
                            size={16}
                            fill={isFilled ? "#FACC15" : "none"} // Yellow-400
                            stroke={isFilled ? "#FACC15" : "#D1D5DB"} // Gray-300
                            className={`${isFilled ? "text-yellow-400" : "text-gray-300"}`}
                        />
                    </button>
                );
            })}
        </div>
    );
};

export default StarRating;
