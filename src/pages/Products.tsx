
import React, { useState } from 'react';
import { Filter, ChevronDown, ChevronUp, Star, LayoutGrid, LayoutList, ShoppingCart } from 'lucide-react';
import ProductCard, { ProductProps } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

// Sample product data
const productsData: ProductProps[] = [
  {
    id: "1",
    name: "VaquaH Pro Inverter Split AC 1.5 Ton with Dual Filtration",
    brand: "VaquaH",
    price: 32999,
    originalPrice: 42999,
    image: "https://images.unsplash.com/photo-1631693322976-03af38309d8c?auto=format&fit=crop&q=80&w=800",
    rating: 4.6,
    energyRating: "5",
    tonnage: 1.5,
    inverter: true
  },
  {
    id: "2",
    name: "VaquaH Super Cool 3-Star Window AC 1.0 Ton",
    brand: "VaquaH",
    price: 24999,
    originalPrice: 29999,
    image: "https://images.unsplash.com/photo-1631693322976-03af38309d8c?auto=format&fit=crop&q=80&w=800",
    rating: 4.2,
    energyRating: "3",
    tonnage: 1.0,
    inverter: false
  },
  {
    id: "3",
    name: "VaquaH Ultimate Inverter Split AC 2.0 Ton with Air Purification",
    brand: "VaquaH",
    price: 48999,
    originalPrice: 54999,
    image: "https://images.unsplash.com/photo-1631693322976-03af38309d8c?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    energyRating: "5",
    tonnage: 2.0,
    inverter: true
  },
  {
    id: "4",
    name: "VaquaH Essential Inverter Split AC 1.0 Ton Energy Saver",
    brand: "VaquaH",
    price: 28999,
    originalPrice: 35999,
    image: "https://images.unsplash.com/photo-1631693322976-03af38309d8c?auto=format&fit=crop&q=80&w=800",
    rating: 4.5,
    energyRating: "4",
    tonnage: 1.0,
    inverter: true
  },
  {
    id: "5",
    name: "VaquaH Supreme Inverter Split AC 1.5 Ton with Wi-Fi Control",
    brand: "VaquaH",
    price: 42999,
    originalPrice: 46999,
    image: "https://images.unsplash.com/photo-1631693322976-03af38309d8c?auto=format&fit=crop&q=80&w=800",
    rating: 4.7,
    energyRating: "5",
    tonnage: 1.5,
    inverter: true
  },
  {
    id: "6",
    name: "VaquaH Lite Split AC 1.0 Ton Affordable Cooling",
    brand: "VaquaH",
    price: 22999,
    originalPrice: 25999,
    image: "https://images.unsplash.com/photo-1631693322976-03af38309d8c?auto=format&fit=crop&q=80&w=800",
    rating: 4.1,
    energyRating: "3",
    tonnage: 1.0,
    inverter: false
  },
  {
    id: "7",
    name: "VaquaH Heavy Duty Inverter Split AC 2.0 Ton for Large Rooms",
    brand: "VaquaH",
    price: 46999,
    originalPrice: 51999,
    image: "https://images.unsplash.com/photo-1631693322976-03af38309d8c?auto=format&fit=crop&q=80&w=800",
    rating: 4.6,
    energyRating: "5",
    tonnage: 2.0,
    inverter: true
  },
  {
    id: "8",
    name: "VaquaH Compact Split AC 0.8 Ton for Small Rooms",
    brand: "VaquaH",
    price: 19999,
    originalPrice: 23999,
    image: "https://images.unsplash.com/photo-1631693322976-03af38309d8c?auto=format&fit=crop&q=80&w=800",
    rating: 4.3,
    energyRating: "4",
    tonnage: 0.8,
    inverter: false
  }
];

const Products = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<number[]>([15000, 60000]);
  const [activeBrands, setActiveBrands] = useState<string[]>(['VaquaH']);
  const [activeStars, setActiveStars] = useState<string[]>([]);
  const [activeTonnage, setActiveTonnage] = useState<number[]>([]);
  const [activeTypes, setActiveTypes] = useState<string[]>([]);
  
  // Filter toggle handlers
  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };
  
  // Brand filter handler
  const handleBrandFilter = (brand: string) => {
    if (activeBrands.includes(brand)) {
      setActiveBrands(activeBrands.filter(b => b !== brand));
    } else {
      setActiveBrands([...activeBrands, brand]);
    }
  };
  
  // Star rating filter handler
  const handleStarFilter = (star: string) => {
    if (activeStars.includes(star)) {
      setActiveStars(activeStars.filter(s => s !== star));
    } else {
      setActiveStars([...activeStars, star]);
    }
  };
  
  // Tonnage filter handler
  const handleTonnageFilter = (tonnage: number) => {
    if (activeTonnage.includes(tonnage)) {
      setActiveTonnage(activeTonnage.filter(t => t !== tonnage));
    } else {
      setActiveTonnage([...activeTonnage, tonnage]);
    }
  };
  
  // Type filter handler
  const handleTypeFilter = (type: string) => {
    if (activeTypes.includes(type)) {
      setActiveTypes(activeTypes.filter(t => t !== type));
    } else {
      setActiveTypes([...activeTypes, type]);
    }
  };
  
  // Price range handler
  const handlePriceChange = (values: number[]) => {
    setPriceRange(values);
  };

  // Apply filters to products
  const filteredProducts = productsData.filter(product => {
    // Price filter
    if (product.price < priceRange[0] || product.price > priceRange[1]) {
      return false;
    }
    
    // Brand filter
    if (activeBrands.length > 0 && !activeBrands.includes(product.brand)) {
      return false;
    }
    
    // Star rating filter
    if (activeStars.length > 0 && !activeStars.includes(product.energyRating)) {
      return false;
    }
    
    // Tonnage filter
    if (activeTonnage.length > 0 && !activeTonnage.includes(product.tonnage)) {
      return false;
    }
    
    // Type filter (inverter/non-inverter)
    if (activeTypes.length > 0) {
      if (activeTypes.includes('Inverter') && !product.inverter) {
        return false;
      }
      if (activeTypes.includes('Non-Inverter') && product.inverter) {
        return false;
      }
    }
    
    return true;
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Split Air Conditioners</h1>
          <p className="text-gray-600">Browse our collection of premium split ACs for your home or office.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filter sidebar - for desktop */}
          <div className="hidden lg:block w-64 bg-white rounded-lg shadow p-4 h-fit">
            <div className="mb-6">
              <h3 className="font-medium text-lg mb-3">Price Range</h3>
              <Slider
                defaultValue={[15000, 60000]}
                max={80000}
                min={10000}
                step={1000}
                value={priceRange}
                onValueChange={handlePriceChange}
                className="mb-2"
              />
              <div className="flex justify-between text-sm">
                <span>₹{priceRange[0].toLocaleString()}</span>
                <span>₹{priceRange[1].toLocaleString()}</span>
              </div>
            </div>

            <div className="border-t pt-4 mb-6">
              <h3 className="font-medium text-lg mb-3">Brand</h3>
              <div className="space-y-2">
                {['VaquaH', 'Daikin', 'Voltas', 'Carrier'].map(brand => (
                  <label key={brand} className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-vaquah-blue focus:ring-vaquah-blue mr-2"
                      checked={activeBrands.includes(brand)}
                      onChange={() => handleBrandFilter(brand)}
                    />
                    {brand}
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t pt-4 mb-6">
              <h3 className="font-medium text-lg mb-3">Energy Rating</h3>
              <div className="space-y-2">
                {['3', '4', '5'].map(star => (
                  <label key={star} className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-vaquah-blue focus:ring-vaquah-blue mr-2"
                      checked={activeStars.includes(star)}
                      onChange={() => handleStarFilter(star)}
                    />
                    {star} Star
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t pt-4 mb-6">
              <h3 className="font-medium text-lg mb-3">Tonnage</h3>
              <div className="space-y-2">
                {[0.8, 1.0, 1.5, 2.0].map(tonnage => (
                  <label key={tonnage} className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-vaquah-blue focus:ring-vaquah-blue mr-2"
                      checked={activeTonnage.includes(tonnage)}
                      onChange={() => handleTonnageFilter(tonnage)}
                    />
                    {tonnage} Ton
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium text-lg mb-3">Type</h3>
              <div className="space-y-2">
                {['Inverter', 'Non-Inverter'].map(type => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-vaquah-blue focus:ring-vaquah-blue mr-2"
                      checked={activeTypes.includes(type)}
                      onChange={() => handleTypeFilter(type)}
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1">
            {/* Mobile filter button */}
            <div className="lg:hidden mb-4">
              <Button
                variant="outline"
                onClick={toggleFilter}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center">
                  <Filter size={18} className="mr-2" />
                  Filter Products
                </div>
                {isFilterOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </Button>
              
              {/* Mobile filters */}
              {isFilterOpen && (
                <div className="mt-4 bg-white rounded-lg shadow p-4">
                  {/* Price Range filter for mobile */}
                  <div className="mb-6">
                    <h3 className="font-medium text-lg mb-3">Price Range</h3>
                    <Slider
                      defaultValue={[15000, 60000]}
                      max={80000}
                      min={10000}
                      step={1000}
                      value={priceRange}
                      onValueChange={handlePriceChange}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-sm">
                      <span>₹{priceRange[0].toLocaleString()}</span>
                      <span>₹{priceRange[1].toLocaleString()}</span>
                    </div>
                  </div>
                  
                  {/* Other mobile filters */}
                  {/* Brand filter */}
                  <div className="border-t pt-4 mb-6">
                    <h3 className="font-medium text-lg mb-3">Brand</h3>
                    <div className="flex flex-wrap gap-2">
                      {['VaquaH', 'Daikin', 'Voltas', 'Carrier'].map(brand => (
                        <Button
                          key={brand}
                          variant={activeBrands.includes(brand) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleBrandFilter(brand)}
                          className={activeBrands.includes(brand) ? "bg-vaquah-blue" : ""}
                        >
                          {brand}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Energy Rating filter */}
                  <div className="border-t pt-4 mb-6">
                    <h3 className="font-medium text-lg mb-3">Energy Rating</h3>
                    <div className="flex flex-wrap gap-2">
                      {['3', '4', '5'].map(star => (
                        <Button
                          key={star}
                          variant={activeStars.includes(star) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleStarFilter(star)}
                          className={activeStars.includes(star) ? "bg-vaquah-blue" : ""}
                        >
                          {star} Star
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Tonnage filter */}
                  <div className="border-t pt-4 mb-6">
                    <h3 className="font-medium text-lg mb-3">Tonnage</h3>
                    <div className="flex flex-wrap gap-2">
                      {[0.8, 1.0, 1.5, 2.0].map(tonnage => (
                        <Button
                          key={tonnage}
                          variant={activeTonnage.includes(tonnage) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleTonnageFilter(tonnage)}
                          className={activeTonnage.includes(tonnage) ? "bg-vaquah-blue" : ""}
                        >
                          {tonnage} Ton
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Type filter */}
                  <div className="border-t pt-4">
                    <h3 className="font-medium text-lg mb-3">Type</h3>
                    <div className="flex flex-wrap gap-2">
                      {['Inverter', 'Non-Inverter'].map(type => (
                        <Button
                          key={type}
                          variant={activeTypes.includes(type) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleTypeFilter(type)}
                          className={activeTypes.includes(type) ? "bg-vaquah-blue" : ""}
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Toolbar with view switch */}
            <div className="bg-white rounded-lg shadow p-4 flex justify-between items-center mb-6">
              <div>
                <span className="text-gray-600">{filteredProducts.length} products found</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600 text-sm">View:</span>
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-1 rounded ${viewMode === 'grid' ? 'bg-vaquah-light-blue text-vaquah-blue' : 'text-gray-400'}`}
                >
                  <LayoutGrid size={18} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-1 rounded ${viewMode === 'list' ? 'bg-vaquah-light-blue text-vaquah-blue' : 'text-gray-400'}`}
                >
                  <LayoutList size={18} />
                </button>
              </div>
            </div>
            
            {/* Product grid */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map(product => (
                  <div key={product.id} className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row">
                    <div className="md:w-1/3 flex justify-center mb-4 md:mb-0">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="h-48 object-contain" 
                      />
                    </div>
                    <div className="md:w-2/3 md:pl-6">
                      <div className="text-xs text-gray-500 mb-1">{product.brand}</div>
                      <h3 className="font-medium text-lg text-gray-800 mb-2">{product.name}</h3>
                      
                      <div className="flex items-center mb-2">
                        <div className="bg-green-50 text-green-700 py-0.5 px-2 rounded flex items-center">
                          <Star size={14} fill="currentColor" className="mr-1" />
                          <span className="text-sm font-medium">{product.rating}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="bg-gray-100 px-2 py-1 rounded text-xs text-center">
                          {product.tonnage} Ton
                        </div>
                        <div className="bg-gray-100 px-2 py-1 rounded text-xs text-center">
                          {product.energyRating} Star
                        </div>
                        <div className="bg-gray-100 px-2 py-1 rounded text-xs text-center">
                          {product.inverter ? 'Inverter' : 'Non-Inverter'}
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex items-center">
                          <span className="text-lg font-bold">₹{product.price.toLocaleString()}</span>
                          {product.originalPrice && (
                            <span className="text-sm text-gray-400 line-through ml-2">
                              ₹{product.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">Free Delivery</div>
                      </div>
                      
                      <div className="flex space-x-3">
                        <Button className="bg-vaquah-blue hover:bg-vaquah-dark-blue">
                          <ShoppingCart size={16} className="mr-2" />
                          Add to Cart
                        </Button>
                        <Button variant="outline" className="border-vaquah-blue text-vaquah-blue hover:bg-vaquah-light-blue">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Empty state */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-xl font-bold mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">Try changing your filter criteria</p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setPriceRange([15000, 60000]);
                    setActiveBrands(['VaquaH']);
                    setActiveStars([]);
                    setActiveTonnage([]);
                    setActiveTypes([]);
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
