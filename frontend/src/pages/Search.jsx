import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { ChevronRight, Wrench, Settings, Thermometer, Clipboard, Zap, RefreshCcw, Shield, Clock, Search as SearchIcon } from 'lucide-react';
import { productService, servicesService } from '@/services/firestoreService';
import { marketingService } from '@/services/marketingService';
import { imageUploadService } from '@/services/imageUploadService';
import { getPlaceholderImage } from '@/utils/placeholderImage';

const Search = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

    const [products, setProducts] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const performSearch = async () => {
            setLoading(true);
            try {
                // Fetch all data in parallel
                const [allProducts, allServices] = await Promise.all([
                    productService.getAllProducts(),
                    marketingService.getServices() // Use marketingService as it seems to be the source for services page
                ]);

                const lowerQuery = query.toLowerCase();

                // Filter Products
                const filteredProducts = allProducts.filter(p =>
                    (p.name && p.name.toLowerCase().includes(lowerQuery)) ||
                    (p.description && p.description.toLowerCase().includes(lowerQuery)) ||
                    (p.brand && p.brand.toLowerCase().includes(lowerQuery))
                ).map(product => {
                    const localImages = imageUploadService.getAllImagesFromLocal(product.id || product._id);
                    return {
                        ...product,
                        image: localImages[0] || product.image || product.imageUrl || getPlaceholderImage(),
                    };
                });

                // Filter Services (Normalize using same logic as Services.jsx)
                const iconMap = {
                    wrench: <Wrench className="h-8 w-8 text-vaquah-blue" />,
                    settings: <Settings className="h-8 w-8 text-vaquah-blue" />,
                    thermometer: <Thermometer className="h-8 w-8 text-vaquah-blue" />,
                    clipboard: <Clipboard className="h-8 w-8 text-vaquah-blue" />,
                    zap: <Zap className="h-8 w-8 text-vaquah-blue" />,
                    refresh: <RefreshCcw className="h-8 w-8 text-vaquah-blue" />,
                    shield: <Shield className="h-8 w-8 text-vaquah-blue" />,
                    clock: <Clock className="h-8 w-8 text-vaquah-blue" />,
                };

                const filteredServices = (allServices || []).map((it, idx) => ({
                    id: it.id || idx + 1,
                    name: it.name || it.title || 'Service',
                    description: it.description || '',
                    icon: it.iconKey && iconMap[it.iconKey] ? iconMap[it.iconKey] : null,
                    price: it.price || '',
                    image: it.imageUrl || it.image || '',
                    rating: it.rating,
                    numReviews: it.numReviews
                })).filter(s =>
                    (s.name && s.name.toLowerCase().includes(lowerQuery)) ||
                    (s.description && s.description.toLowerCase().includes(lowerQuery))
                );

                setProducts(filteredProducts);
                setServices(filteredServices);

            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setLoading(false);
            }
        };

        if (query) {
            performSearch();
        } else {
            setProducts([]);
            setServices([]);
            setLoading(false);
        }
    }, [query]);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Search Results for "{query}"
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Found {products.length} products and {services.length} services
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vaquah-blue"></div>
                    </div>
                ) : (
                    <>
                        {products.length === 0 && services.length === 0 && (
                            <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <SearchIcon className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900">No results found</h3>
                                <p className="text-gray-500 mt-2">Try checking your spelling or use different keywords.</p>
                            </div>
                        )}

                        {/* Products Section */}
                        {products.length > 0 && (
                            <section className="mb-12">
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                    Products <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{products.length}</span>
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {products.map(product => (
                                        <ProductCard key={product.id || product._id} {...product} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Services Section */}
                        {services.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                    Services <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{services.length}</span>
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {services.map((service) => (
                                        <div key={service.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                            <div className="mb-4 h-40 overflow-hidden rounded-lg bg-gray-100">
                                                <img
                                                    src={service.image || "/placeholder.svg"}
                                                    alt={service.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.src = "/placeholder.svg";
                                                    }}
                                                />
                                            </div>
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="mb-4">{service.icon}</div>
                                                {service.rating && (
                                                    <div className="bg-green-50 text-green-700 py-1 px-2 rounded flex items-center gap-1">
                                                        <span className="font-bold text-sm">{service.rating}</span>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                                                        <span className="text-xs text-gray-500">({service.numReviews || 0})</span>
                                                    </div>
                                                )}
                                            </div>
                                            <h3 className="text-xl font-bold mb-2">{service.name}</h3>
                                            <p className="text-gray-600 mb-4 text-sm line-clamp-2">{service.description}</p>
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold text-vaquah-blue">{service.price}</span>
                                                <Link to="/appointments/new">
                                                    <Button variant="outline" size="sm">
                                                        Book Now <ChevronRight className="h-4 w-4 ml-1" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default Search;
