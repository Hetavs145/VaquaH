import React, { useState, useEffect } from 'react';
import { Star, User, MapPin, Quote } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { reviewService, orderService } from '@/services/firestoreService';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const TestimonialSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [formData, setFormData] = useState({
    rating: 5,
    quote: '',
    location: ''
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const fetchedReviews = await reviewService.getReviews();
      setReviews(fetchedReviews);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWriteReviewClick = async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to write a review.',
        variant: 'destructive'
      });
      navigate('/login');
      return;
    }

    setVerifying(true);
    try {
      const orders = await orderService.getUserOrders(user.uid);
      const hasAvailedService = orders.some(order =>
        ['delivered', 'completed'].includes(order.status?.toLowerCase())
      );

      if (hasAvailedService) {
        setIsDialogOpen(true);
      } else {
        toast({
          title: 'Verification Failed',
          description: 'You can only write a review for products or services you have availed and completed.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: 'Error',
        description: 'Failed to verify your order history. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.quote.trim()) return;

    setSubmitting(true);
    try {
      await reviewService.createReview({
        userId: user.uid,
        name: user.displayName || 'Valued Customer',
        location: formData.location || 'India',
        quote: formData.quote,
        rating: Number(formData.rating),
        image: user.photoURL || null,
        createdAt: new Date()
      });

      toast({
        title: 'Review Submitted',
        description: 'Thank you for your feedback!',
      });

      setIsDialogOpen(false);
      setFormData({ rating: 5, quote: '', location: '' });
      fetchReviews(); // Refresh list
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit review. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section-padding bg-vaquah-light-blue">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">What Our Customers Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            Don't just take our word for it. Here's what our happy customers have to say about our products and services.
          </p>

          <Button
            onClick={handleWriteReviewClick}
            disabled={verifying}
            className="bg-vaquah-blue hover:bg-vaquah-dark-blue"
          >
            {verifying ? 'Verifying...' : 'Write a Review'}
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">No reviews yet. Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((testimonial) => (
              <div key={testimonial.id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow flex flex-col h-full">
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
                  <p className="text-gray-600 italic relative z-10">"{testimonial.quote}"</p>
                </div>

                <div className="flex items-center mt-auto pt-4 border-t border-gray-50">
                  {testimonial.image ? (
                    <img
                      src={testimonial.image}
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

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Write a Review</DialogTitle>
              <DialogDescription>
                Share your experience with VaquaH. Your feedback helps us improve.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Rating</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        size={24}
                        fill={star <= formData.rating ? "currentColor" : "none"}
                        className={star <= formData.rating ? "text-yellow-400" : "text-gray-300"}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location (City)</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g. Mumbai"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quote">Your Review</Label>
                <Textarea
                  id="quote"
                  required
                  value={formData.quote}
                  onChange={(e) => setFormData(prev => ({ ...prev, quote: e.target.value }))}
                  placeholder="Tell us about your experience..."
                  rows={4}
                />
              </div>

              <DialogFooter>
                <Button type="submit" disabled={submitting} className="bg-vaquah-blue hover:bg-vaquah-dark-blue">
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default TestimonialSection;
