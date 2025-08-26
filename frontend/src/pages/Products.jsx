import React, { useEffect, useState, useMemo } from 'react';
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

  // Compute available filter options from products
  const brands = useMemo(() => {
    return ['all', ...Array.from(new Set(products.map(p => p.brand).filter(Boolean)))];
  }, [products]);
  const tonnages = useMemo(() => {
    return ['all', ...Array.from(new Set(products.map(p => p.tonnage).filter(v => v !== undefined && v !== null)))];
  }, [products]);
  const energies = useMemo(() => {
    return ['all', ...Array.from(new Set(products.map(p => p.energyRating).filter(v => v !== undefined && v !== null)))];
  }, [products]);

  // Apply filters & sorting
  const filteredAndSorted = useMemo(() => {
    let list = [...products];
    if (brandFilter !== 'all') list = list.filter(p => (p.brand || '').toLowerCase() === String(brandFilter).toLowerCase());
    if (tonnageFilter !== 'all') list = list.filter(p => String(p.tonnage) === String(tonnageFilter));
    if (energyFilter !== 'all') list = list.filter(p => String(p.energyRating) === String(energyFilter));
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
            {/* Controls */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex gap-2 overflow-x-auto">
                <select className="border rounded px-3 py-2" value={brandFilter} onChange={e => setBrandFilter(e.target.value)}>
                  {brands.map(b => (<option key={b} value={b}>{b === 'all' ? 'All brands' : b}</option>))}
                </select>
                <select className="border rounded px-3 py-2" value={tonnageFilter} onChange={e => setTonnageFilter(e.target.value)}>
                  {tonnages.map(t => (<option key={t} value={t}>{t === 'all' ? 'All tonnage' : `${t} Ton`}</option>))}
                </select>
                <select className="border rounded px-3 py-2" value={energyFilter} onChange={e => setEnergyFilter(e.target.value)}>
                  {energies.map(en => (<option key={en} value={en}>{en === 'all' ? 'All ratings' : `${en} Star`}</option>))}
                </select>
                <select className="border rounded px-3 py-2" value={inverterFilter} onChange={e => setInverterFilter(e.target.value)}>
                  <option value="all">All types</option>
                  <option value="true">Inverter</option>
                  <option value="false">Non-Inverter</option>
                </select>
                <select className="border rounded px-3 py-2" value={stockFilter} onChange={e => setStockFilter(e.target.value)}>
                  <option value="all">Any stock</option>
                  <option value="true">In Stock</option>
                  <option value="false">Out of Stock</option>
                </select>
              </div>
              <div className="md:col-span-2 flex md:justify-end">
                <select className="border rounded px-3 py-2" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option value="relevance">Sort: Relevance</option>
                  <option value="price_low_high">Price: Low to High</option>
                  <option value="price_high_low">Price: High to Low</option>
                  <option value="rating">Rating</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text-center text-gray-500 py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
                Loading products...
              </div>
            ) : filteredAndSorted.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No products found.</div>
            ) : (
              <ProductCarousel 
                title="All Products"
                subtitle="Browse our complete collection of air conditioners and cooling solutions"
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
