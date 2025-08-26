import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { productService } from '@/services/firestoreService';
import { imageUploadService } from '@/services/imageUploadService';
import { getPlaceholderImage } from '@/utils/placeholderImage';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
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

  // Filters & Sorting
  const [sortBy, setSortBy] = useState('relevance');
  const [brand, setBrand] = useState('all');
  const [inverterOnly, setInverterOnly] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('all');
  const [tonnage, setTonnage] = useState('all');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const items = await productService.getAllProducts();
        
        // Process products to ensure proper image handling
        const processedItems = (items || []).map(product => {
          // Get images from localStorage if available
          const localImages = imageUploadService.getAllImagesFromLocal(product.id || product._id);
          
          return {
            ...product,
            // Use local images if available, otherwise use the stored image
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
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  // Derived brand list
  const brandOptions = useMemo(() => {
    const set = new Set((products || []).map(p => (p.brand || '').trim()).filter(Boolean));
    return ['all', ...Array.from(set).sort()];
  }, [products]);

  const tonnageOptions = ['all', '1', '1.5', '2'];
  const ratingOptions = ['all', '3', '4', '4.5', '5'];

  const filteredSorted = useMemo(() => {
    let list = [...products];

    // Filters
    if (brand !== 'all') {
      list = list.filter(p => (p.brand || '').toLowerCase() === brand.toLowerCase());
    }
    if (inverterOnly !== 'all') {
      const target = inverterOnly === 'yes';
      list = list.filter(p => Boolean(p.inverter) === target);
    }
    if (tonnage !== 'all') {
      const t = parseFloat(tonnage);
      list = list.filter(p => parseFloat(p.tonnage) === t);
    }
    if (minRating !== 'all') {
      const r = parseFloat(minRating);
      list = list.filter(p => Number(p.rating || 0) >= r);
    }
    const min = minPrice === '' ? -Infinity : Number(minPrice);
    const max = maxPrice === '' ? Infinity : Number(maxPrice);
    if (min !== -Infinity || max !== Infinity) {
      list = list.filter(p => {
        const price = Number(p.price || 0);
        return price >= min && price <= max;
      });
    }

    // Sorting
    switch (sortBy) {
      case 'price_low_high':
        list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
        break;
      case 'price_high_low':
        list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
        break;
      case 'rating_high_low':
        list.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
        break;
      case 'newest':
        list.sort((a, b) => {
          const ad = a.createdAt?.toDate?.()?.getTime?.() || new Date(a.createdAt || 0).getTime();
          const bd = b.createdAt?.toDate?.()?.getTime?.() || new Date(b.createdAt || 0).getTime();
          return bd - ad;
        });
        break;
      default:
        break;
    }

    return list;
  }, [products, brand, inverterOnly, minPrice, maxPrice, minRating, sortBy, tonnage]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <section className="bg-gradient-to-r from-vaquah-light-blue to-blue-100 py-8 sm:py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 font-sans leading-tight" style={{fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"'}}>
              Our Products
            </h1>
            <p className="text-gray-600 text-center max-w-3xl mx-auto text-base sm:text-lg px-2">
              Discover our range of energy-efficient split ACs designed for Indian homes and climate.
              Built with advanced technology for optimal cooling and electricity savings.
            </p>
          </div>
        </section>

        <section className="py-8 sm:py-12">
          <div className="container mx-auto px-4">
            {/* Filters */}
            <div className="mb-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border rounded-md px-2 py-2 text-sm">
                <option value="relevance">Sort: Relevance</option>
                <option value="price_low_high">Price: Low to High</option>
                <option value="price_high_low">Price: High to Low</option>
                <option value="rating_high_low">Rating</option>
                <option value="newest">Newest</option>
              </select>

              <select value={brand} onChange={e => setBrand(e.target.value)} className="border rounded-md px-2 py-2 text-sm">
                {brandOptions.map(b => (
                  <option key={b} value={b}>{b === 'all' ? 'All Brands' : b}</option>
                ))}
              </select>

              <select value={inverterOnly} onChange={e => setInverterOnly(e.target.value)} className="border rounded-md px-2 py-2 text-sm">
                <option value="all">All Types</option>
                <option value="yes">Inverter</option>
                <option value="no">Non-Inverter</option>
              </select>

              <select value={tonnage} onChange={e => setTonnage(e.target.value)} className="border rounded-md px-2 py-2 text-sm">
                {tonnageOptions.map(t => (
                  <option key={t} value={t}>{t === 'all' ? 'All Tonnage' : `${t} Ton`}</option>
                ))}
              </select>

              <select value={minRating} onChange={e => setMinRating(e.target.value)} className="border rounded-md px-2 py-2 text-sm">
                {ratingOptions.map(r => (
                  <option key={r} value={r}>{r === 'all' ? 'Any Rating' : `${r}+ Stars`}</option>
                ))}
              </select>

              <div className="flex gap-2">
                <input type="number" inputMode="numeric" placeholder="Min ₹" className="border rounded-md px-2 py-2 text-sm w-full" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
                <input type="number" inputMode="numeric" placeholder="Max ₹" className="border rounded-md px-2 py-2 text-sm w-full" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
              </div>
            </div>

            {loading ? (
              <div className="text-center text-gray-500 py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
                Loading products...
              </div>
            ) : filteredSorted.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No products found.</div>
            ) : (
              <ProductCarousel 
                title="All Products"
                subtitle="Browse our complete collection of air conditioners and cooling solutions"
                maxProducts={filteredSorted.length}
                products={filteredSorted}
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
