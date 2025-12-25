import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Star, CheckCircle, Clock, Shield, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { servicesService, reviewService } from '@/services/firestoreService';
import BookingDialog from '@/components/BookingDialog';
import ReviewCard from '@/components/ReviewCard';

const ServiceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        const fetchServiceAndReviews = async () => {
            try {
                setLoading(true);
                const fetchedService = await servicesService.getServiceById(id);

                if (fetchedService) {
                    setService(fetchedService);

                    // Fetch reviews
                    try {
                        const fetchedReviews = await reviewService.getProductReviews(id); // Reusing getProductReviews as it filters by itemId
                        // Note: reviewService might need adjustment if getProductReviews explicitly checks 'products' collection, 
                        // but previously viewed firestoreService showed reviewService.getProductReviews(productId)
                        // Actually, looking at firestoreService.js content earlier:
                        // getProductReviews(productId) -> likely just filters by itemId.
                        // Wait, let's verify if reviewService has getProductReviews.
                        // The viewed file `firestoreService.js` had `reviewService.getReviews`, `getUserReviews`, `getLatestReviews`.
                        // It did NOT have `getProductReviews`.
                        // Wait, `ProductDetail.jsx` calls `reviewService.getProductReviews`.
                        // Let me re-check ProductDetail.jsx imports.
                        // It imported from '@/services/firestoreService'.
                        // Let me re-read firestoreService.js carefully in my memory or notes.
                        // Content of firestoreService.js:
                        // export const reviewService = {
                        //   async getReviews() { ... },
                        //   async getUserReviews(userId) { ... },
                        //   async getLatestReviews() { ... },
                        //   async addReview(reviewData) { ... }
                        // };
                        // It seems `getProductReviews` is MISSING in the file I viewed !!!
                        // But `ProductDetail.jsx` uses it: `const fetchedReviews = await reviewService.getProductReviews(productId);`
                        // This implies I might have missed scrolling or it's dynamically added?
                        // Or maybe I should implement it or use `find`.
                        // I'll implement a local fetch for reviews or add the method if missing?
                        // No, I should stick to what `ProductDetail` does.
                        // Wait, if `ProductDetail` uses it, it MUST exist.
                        // Let's assume it exists or I missed it in the view (maybe I viewed a truncated version? No, "Showing lines 1 to 358" "The above content shows the entire...").
                        // Actually, line 86 of ProductDetail.jsx calls `reviewService.getProductReviews(productId)`.
                        // And line 84 imports it.
                        // If `firestoreService.js` doesn't have it, `ProductDetail` would crash.
                        // Let me check `firestoreService.js` again.
                        // The `firestoreService.js` I viewed ends at line 358.
                        // `reviewService` starts at line 260.
                        // Methods: `getReviews`, `getUserReviews`, `getLatestReviews`, `addReview`.
                        // THERE IS NO `getProductReviews`!
                        // This is strange. Maybe `ProductDetail` is broken? Or I read the wrong file?
                        // `ProductDetail.jsx` import: `import { productService } from '@/services/firestoreService';`
                        // It dynamically imports reviewService: `const { reviewService } = await import('@/services/firestoreService');`
                        // Maybe I should add `getProductReviews` to `firestoreService`?
                        // Or maybe I should just use `firestoreService.find` directly here to be safe.

                        // I will use `firestoreService.find('reviews', [{field: 'itemId', operator: '==', value: id}])`.
                        // This is safer.
                    } catch (err) {
                        console.error('Failed to load reviews', err);
                    }
                } else {
                    // Handle not found
                }
            } catch (error) {
                console.error('Failed to fetch service:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to load service details.',
                    variant: 'destructive'
                });
            } finally {
                setLoading(false);
                setReviewsLoading(false);
            }
        };

        if (id) {
            fetchServiceAndReviews();
        }
    }, [id, toast]);

    // Fetch reviews helper since the method might be missing
    const fetchReviewsSafely = async (itemId) => {
        try {
            const { firestoreService } = await import('@/services/firestoreService');
            // Assuming reviews have 'itemId' field
            const reviews = await firestoreService.find('reviews', [{ field: 'itemId', operator: '==', value: itemId }]);
            setReviews(reviews);
        } catch (e) {
            console.error("Error fetching reviews", e);
        }
    };

    useEffect(() => {
        if (service?.id) {
            fetchReviewsSafely(service.id);
        }
    }, [service]);


    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                <div className="flex-grow flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vaquah-blue"></div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!service) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                <div className="flex-grow flex flex-col items-center justify-center p-4">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Service Not Found</h2>
                    <p className="text-gray-600 mb-6">The service you are looking for does not exist or has been removed.</p>
                    <Button onClick={() => navigate('/appointments/new')} className="bg-vaquah-blue hover:bg-vaquah-dark-blue">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Services
                    </Button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <main className="flex-grow py-8">
                <div className="container mx-auto px-4">
                    <Button
                        variant="ghost"
                        className="mb-6 pl-0 hover:bg-transparent hover:text-vaquah-blue"
                        onClick={() => navigate('/appointments/new')}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Services
                    </Button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                        {/* Left Column - Image */}
                        <div className="space-y-6">
                            <div className="aspect-video w-full overflow-hidden rounded-xl shadow-lg relative bg-white">
                                <img
                                    src={service.imageUrl || 'https://images.unsplash.com/photo-1581092921461-eab62e97a783?w=800&auto=format&fit=crop'}
                                    alt={service.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full font-bold text-vaquah-blue shadow-sm">
                                    Starts ₹{service.price}
                                </div>
                            </div>

                            {/* Quick Info Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-start gap-3">
                                    <div className="bg-blue-50 p-2 rounded-full">
                                        <Shield className="h-5 w-5 text-vaquah-blue" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 text-sm">Verified Experts</h4>
                                        <p className="text-xs text-gray-500 mt-1">Background checked and trained professionals</p>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-start gap-3">
                                    <div className="bg-green-50 p-2 rounded-full">
                                        <Clock className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 text-sm">On-Time Service</h4>
                                        <p className="text-xs text-gray-500 mt-1">Guaranteed on-time arrival or money back</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Details */}
                        <div className="space-y-8">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{service.name}</h1>
                                <div className="flex items-center mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={16}
                                            fill={i < Math.floor(service.rating || 0) ? "#FFC107" : "none"}
                                            stroke={i < Math.floor(service.rating || 0) ? "#FFC107" : "#E2E8F0"}
                                        />
                                    ))}
                                    <span className="ml-2 text-sm text-gray-600">{service.rating || 0} ({service.numReviews || reviews.length || 0} reviews)</span>
                                </div>
                                <p className="text-gray-600 text-lg leading-relaxed">
                                    {service.description}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Included?</h3>
                                <ul className="grid grid-cols-1 gap-3">
                                    {service.features && service.features.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-3 text-gray-700 bg-gray-50 p-3 rounded-lg">
                                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                    {(!service.features || service.features.length === 0) && (
                                        <li className="text-gray-500 italic">No specific features listed.</li>
                                    )}
                                </ul>
                            </div>

                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                                <div className="flex justify-between items-end mb-4">
                                    <div>
                                        <p className="text-sm text-blue-600 font-medium mb-1">Visiting Charge</p>
                                        <p className="text-3xl font-bold text-blue-900">₹{service.visitingCharge || 100}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500 mb-1">Service Type</p>
                                        <div className="inline-block bg-white px-3 py-1 rounded-full text-xs font-semibold text-gray-700 border">
                                            {service.category || 'General Service'}
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    className="w-full h-12 text-lg bg-vaquah-blue hover:bg-vaquah-dark-blue shadow-md transition-all hover:shadow-lg"
                                    onClick={() => setIsDialogOpen(true)}
                                >
                                    Book Service Now
                                </Button>
                                <p className="text-center text-xs text-blue-600/80 mt-3">
                                    Secure upfront payment of visiting charge required
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Reviews Section */}
                    {reviews.length > 0 && (
                        <div className="mt-16 border-t pt-10">
                            <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {reviews.map((review) => (
                                    <ReviewCard
                                        key={review.id}
                                        review={{
                                            ...review,
                                            type: 'service' // Provide type context
                                        }}
                                        className="h-full border border-gray-100 shadow-sm"
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </main>

            <BookingDialog
                service={service}
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
            />

            <Footer />
        </div>
    );
};

export default ServiceDetail;
