import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { productService } from '@/services/firestoreService';
import { imageUploadService } from '@/services/imageUploadService';
import { getPlaceholderImage } from '@/utils/placeholderImage';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCarousel from '@/components/ProductCarousel';

const Products = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & sorting state
  const [sortBy, setSortBy] = useState('relevance');
  const [brandFilter, setBrandFilter] = useState('all');
  const [tonnageFilter, setTonnageFilter] = useState('all');
  const [energyFilter, setEnergyFilter] = useState('all');
  const [inverterFilter, setInverterFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const items = await productService.getAllProducts();
        const processedItems = (items || []).map(product => {
          const localImages = imageUploadService.getAllImagesFromLocal(product.id || product._id);
          return {
            ...product,
            image: localImages[0] || product.image || product.imageUrl || getPlaceholderImage(),
            images: localImages.length > 0 ? localImages : (product.images || [product.image || product.imageUrl]).filter(Boolean)
          };
        });
        setProducts(processedItems);
      } catch (error) {
        console.error('Failed to load products:', error);
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [toast]);

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add products to your cart",
        variant: "destructive",
      });
      navigate('/login', { state: { from: '/products' } });
      return;
    }
    addToCart(product, 1);
    toast({ title: "Added to cart", description: `${product.name} has been added to your cart` });
  };

  // Helper to get spec value case-insensitively
  const getSpecValue = (product, keys) => {
    if (!product.specifications) return null;
    const specKeys = Object.keys(product.specifications);
    for (const key of keys) {
      const foundKey = specKeys.find(k => k.toLowerCase().includes(key.toLowerCase()));
      if (foundKey) return product.specifications[foundKey];
    }
    return null;
  };

  // Compute available filter options from products
  const brands = useMemo(() => {
    return ['all', ...Array.from(new Set(products.map(p => p.brand).filter(Boolean)))];
  }, [products]);

  const tonnages = useMemo(() => {
    return ['1', '1.5', '2', '2.5', '3'];
  }, []);

  const energies = useMemo(() => {
    return ['1', '2', '3', '4', '5'];
  }, []);

  // Apply filters & sorting
  const filteredAndSorted = useMemo(() => {
    let list = [...products];
    if (brandFilter !== 'all') list = list.filter(p => (p.brand || '').toLowerCase() === String(brandFilter).toLowerCase());

    if (tonnageFilter !== 'all') {
      list = list.filter(p => {
        const val = getSpecValue(p, ['Capacity', 'Tonnage']);
        // Normalize both values to numbers/strings without units for comparison
        const productVal = val ? String(val).replace(/ton/i, '').trim() : '';
        const filterVal = tonnageFilter.replace(/ton/i, '').trim();
        return productVal === filterVal;
      });
    }

    if (energyFilter !== 'all') {
      list = list.filter(p => {
        const val = getSpecValue(p, ['Energy', 'Star']);
        const productVal = val ? String(val).replace(/star/i, '').trim() : '';
        const filterVal = energyFilter.replace(/star/i, '').trim();
        return productVal === filterVal;
      });
    }
    if (inverterFilter !== 'all') list = list.filter(p => Boolean(p.inverter) === (inverterFilter === 'true'));
    if (stockFilter !== 'all') list = list.filter(p => (p.inStock ?? (p.countInStock > 0)) === (stockFilter === 'true'));

    switch (sortBy) {
      case 'price_low_high':
        list.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price_high_low':
        list.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'rating':
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'name':
        list.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
        break;
      default:
        break;
    }
    return list;
  }, [products, brandFilter, tonnageFilter, energyFilter, inverterFilter, stockFilter, sortBy]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-vaquah-blue text-white py-16 animate-fade-in">
          <div className="container-custom text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 animate-slide-up">Our Products</h1>
            <p className="text-lg opacity-90 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Discover our range of energy-efficient split ACs designed for Indian homes and climate.
              Built with advanced technology for optimal cooling and electricity savings.
            </p>
          </div>
        </div>

        <section className="py-8 sm:py-12">
          <div className="container mx-auto px-4">
            {/* Controls */}
            {/* Controls */}
            <div className="mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row gap-4 justify-between items-center">

                {/* Filters Group */}
                <div className="w-full md:w-auto flex flex-wrap gap-3 items-center">
                  <div className="flex items-center gap-2 text-gray-600 font-medium mr-2">
                    <span className="p-2 bg-blue-50 rounded-lg text-vaquah-blue">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                    </span>
                    Filters:
                  </div>

                  <select
                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vaquah-blue/20 focus:border-vaquah-blue transition-all cursor-pointer hover:bg-gray-100"
                    value={brandFilter}
                    onChange={e => setBrandFilter(e.target.value)}
                  >
                    {brands.map(b => (<option key={b} value={b}>{b === 'all' ? 'All Brands' : b}</option>))}
                  </select>

                  <select
                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vaquah-blue/20 focus:border-vaquah-blue transition-all cursor-pointer hover:bg-gray-100"
                    value={tonnageFilter}
                    onChange={e => setTonnageFilter(e.target.value)}
                  >
                    <option value="all">All Tonnage</option>
                    {tonnages.map(t => (<option key={t} value={t}>{`${t} Ton`}</option>))}
                  </select>

                  <select
                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vaquah-blue/20 focus:border-vaquah-blue transition-all cursor-pointer hover:bg-gray-100"
                    value={energyFilter}
                    onChange={e => setEnergyFilter(e.target.value)}
                  >
                    <option value="all">All Ratings</option>
                    {energies.map(en => (<option key={en} value={en}>{en === 'all' ? 'All Ratings' : `${en} Star`}</option>))}
                  </select>

                  {(brandFilter !== 'all' || tonnageFilter !== 'all' || energyFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setBrandFilter('all');
                        setTonnageFilter('all');
                        setEnergyFilter('all');
                        setInverterFilter('all');
                        setStockFilter('all');
                      }}
                      className="text-sm text-red-500 hover:text-red-600 font-medium px-2"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Sort Group */}
                <div className="w-full md:w-auto flex items-center gap-3">
                  <span className="text-gray-500 text-sm hidden md:inline">Sort by:</span>
                  <select
                    className="w-full md:w-auto px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-vaquah-blue/20 focus:border-vaquah-blue shadow-sm transition-all cursor-pointer"
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                  >
                    <option value="relevance">Relevance</option>
                    <option value="price_low_high">Price: Low to High</option>
                    <option value="price_high_low">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                    <option value="name">Name (A-Z)</option>
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center text-gray-500 py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
                Loading products...
              </div>
            ) : filteredAndSorted.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-blue-50 inline-block p-4 rounded-full mb-4">
                  <Clock className="w-12 h-12 text-vaquah-blue" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon!</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  We are currently updating our product inventory. Please check back later for our latest energy-efficient ACs.
                </p>
              </div>
            ) : (
              <ProductCarousel
                title={null}
                maxProducts={filteredAndSorted.length}
                products={filteredAndSorted}
              />
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Products;
