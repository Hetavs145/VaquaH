import React, { useState, useEffect, useRef } from 'react';
import { reviewService } from '@/services/firestoreService';
import ReviewCard from '@/components/ReviewCard';

const TestimonialSection = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ref for auto-scroll
  const containerRef = useRef(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    // Simple Auto Scroll Logic
    if (!loading && reviews.length > 3 && containerRef.current) {
      const scrollInterval = setInterval(() => {
        if (containerRef.current) {
          containerRef.current.scrollLeft += 1;
          // Reset to start if reached end (naive implementation, for smoother infinite loop duplicate items is better)
          if (containerRef.current.scrollLeft + containerRef.current.clientWidth >= containerRef.current.scrollWidth) {
            containerRef.current.scrollLeft = 0;
          }
        }
      }, 30); // Speed
      return () => clearInterval(scrollInterval);
    }
  }, [loading, reviews]);

  const fetchReviews = async () => {
    try {
      const fetchedReviews = await reviewService.getLatestReviews();
      setReviews(fetchedReviews);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section-padding bg-vaquah-light-blue overflow-hidden">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">What Our Customers Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            Don't just take our word for it. Here's what our happy customers have to say about our products and services.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">No reviews yet. Be the first to share your experience!</p>
          </div>
        ) : (
          /* Auto Scrolling Container */
          <div
            ref={containerRef}
            className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide"
            style={{ scrollBehavior: 'auto', WebkitOverflowScrolling: 'touch' }}
          >
            {/* Duplicate reviews to create a longer scrollable area if needed, or just map once */}
            {[...reviews, ...reviews].map((testimonial, idx) => (
              <ReviewCard
                key={`${testimonial.id}-${idx}`}
                review={testimonial}
                className="min-w-[300px] md:min-w-[350px]"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialSection;
