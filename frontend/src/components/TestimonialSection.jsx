import React, { useState, useEffect, useRef } from 'react';
import { Star, User, MapPin, Quote } from 'lucide-react';
import { reviewService } from '@/services/firestoreService';

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
              <div
                key={`${testimonial.id}-${idx}`}
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow flex flex-col min-w-[300px] md:min-w-[350px]"
              >
                <div className="flex items-center mb-4">
                  {Array(5).fill(0).map((_, index) => (
                    <Star
                      key={index}
                      size={16}
                      fill={index < testimonial.rating ? "currentColor" : "none"}
                      className={index < testimonial.rating ? "text-yellow-400" : "text-gray-300"}
                    />
                  ))}
                </div>

                <div className="relative mb-4 flex-grow">
                  <Quote size={24} className="text-blue-100 absolute -top-2 -left-2 -z-10" />
                  <p className="text-gray-600 italic relative z-10 text-sm md:text-base">
                    "{testimonial.quote || (() => {
                      const isService = testimonial.type === 'service';
                      if (testimonial.rating >= 5) return isService ? "Great service!" : "Great product!";
                      if (testimonial.rating >= 4) return isService ? "Good service!" : "Good product!";
                      return "Happy customer!";
                    })()}"
                  </p>
                </div>

                <div className="flex items-center mt-auto pt-4 border-t border-gray-50">
                  {testimonial.userImage ? (
                    <img
                      src={testimonial.userImage}
                      alt={testimonial.name}
                      className="w-10 h-10 rounded-full mr-3 object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full mr-3 bg-blue-50 flex items-center justify-center text-blue-500">
                      <User size={20} />
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-sm text-gray-900">{testimonial.name}</div>
                    <div className="text-xs text-gray-500 flex items-center">
                      <MapPin size={10} className="mr-1" />
                      {testimonial.location || 'Verified Customer'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialSection;
