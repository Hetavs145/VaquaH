import React from 'react';
import { Star, User, MapPin, Quote } from 'lucide-react';

const ReviewCard = ({ review, className = '' }) => {
    // Handle field variations
    const name = review.name || review.userName || 'Valued Customer';
    const rating = Number(review.rating) || 0;

    // Default quote logic if both quote and comment are missing
    const content = review.quote || review.comment || (() => {
        const isService = review.type === 'service';
        if (rating >= 5) return isService ? "Great service!" : "Great product!";
        if (rating >= 4) return isService ? "Good service!" : "Good product!";
        return "Happy customer!";
    })();

    const location = review.location || 'Verified Customer';

    // Date formatting helper
    const formatDate = (dateVal) => {
        if (!dateVal) return '';
        const dateObj = dateVal.seconds
            ? new Date(dateVal.seconds * 1000)
            : new Date(dateVal);

        return dateObj.toLocaleString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className={`bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow flex flex-col items-start h-full ${className}`}>
            <div className="flex items-center mb-4">
                {[...Array(5)].map((_, index) => (
                    <Star
                        key={index}
                        size={16}
                        fill={index < rating ? "#facc15" : "none"} // yellow-400
                        className={index < rating ? "text-yellow-400" : "text-gray-300"}
                    />
                ))}
            </div>

            <div className="relative mb-4 flex-grow w-full">
                <Quote size={24} className="text-blue-100 absolute -top-2 -left-2 -z-10" />
                <p className="text-gray-600 italic relative z-10 text-sm md:text-base line-clamp-4">
                    "{content}"
                </p>
            </div>

            <div className="flex items-center mt-auto pt-4 border-t border-gray-50 w-full">
                {review.userImage ? (
                    <img
                        src={review.userImage}
                        alt={name}
                        className="w-10 h-10 rounded-full mr-3 object-cover"
                    />
                ) : (
                    <div className="w-10 h-10 rounded-full mr-3 bg-blue-50 flex items-center justify-center text-blue-500 flex-shrink-0">
                        <User size={20} />
                    </div>
                )}
                <div className="min-w-0">
                    <div className="font-medium text-sm text-gray-900 truncate">{name}</div>
                    <div className="text-xs text-gray-500 flex items-center mb-0.5">
                        <MapPin size={10} className="mr-1 flex-shrink-0" />
                        <span className="truncate">{location}</span>
                    </div>
                    {review.createdAt && (
                        <div className="text-[10px] text-gray-400 truncate">
                            {formatDate(review.createdAt)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewCard;
