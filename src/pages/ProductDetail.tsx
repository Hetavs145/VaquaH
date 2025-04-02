import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Star,
  ShoppingCart,
  Heart,
  Check,
  ChevronUp,
  ChevronDown,
  Plus,
  Minus,
  Truck,
  Shield,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductCard, { ProductProps } from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';

// Sample product data (normally would come from an API)
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
  }
];

// Extended product details
interface ExtendedProductDetails {
  specifications: {
    category: string;
    specs: {
      name: string;
      value: string;
    }[];
  }[];
  features: string[];
  documents: {
    name: string;
    url: string;
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
}

const extendedDetails: ExtendedProductDetails = {
  specifications: [
    {
      category: "General",
      specs: [
        { name: "Brand", value: "VaquaH" },
        { name: "Model", value: "PRO-INV-1.5" },
        { name: "Type", value: "Split AC" },
        { name: "Color", value: "White" },
        { name: "Capacity", value: "1.5 Ton" }
      ]
    },
    {
      category: "Performance",
      specs: [
        { name: "Energy Rating", value: "5 Star" },
        { name: "Cooling Capacity", value: "5100 W" },
        { name: "Power Consumption", value: "1550 W" },
        { name: "ISEER Value", value: "4.73" },
        { name: "Refrigerant", value: "R32 Eco-Friendly" }
      ]
    },
    {
      category: "Features",
      specs: [
        { name: "Inverter Compressor", value: "Yes" },
        { name: "Dual Filtration", value: "Yes" },
        { name: "Air Flow Direction", value: "4-Way" },
        { name: "Remote Control", value: "LCD Remote with Backlight" },
        { name: "Timer", value: "24-Hour" }
      ]
    },
    {
      category: "Dimensions",
      specs: [
        { name: "Indoor Unit Dimensions (W x H x D)", value: "970 x 315 x 235 mm" },
        { name: "Outdoor Unit Dimensions (W x H x D)", value: "800 x 554 x 333 mm" },
        { name: "Indoor Unit Weight", value: "12 kg" },
        { name: "Outdoor Unit Weight", value: "34 kg" }
      ]
    }
  ],
  features: [
    "Inverter compressor that adjusts power based on heat load",
    "Dual filtration system with PM 2.5 filter and anti-bacterial coating",
    "4-way air flow for uniform cooling",
    "Turbo cooling mode for instant cooling",
    "Sleep mode for energy saving during night",
    "Auto-restart function after power cuts",
    "Self-diagnosis for easy troubleshooting",
    "Low noise operation for peaceful environment",
    "Eco-friendly R32 refrigerant",
    "5-year warranty on compressor and 1-year comprehensive warranty"
  ],
  documents: [
    { name: "User Manual", url: "#" },
    { name: "Installation Guide", url: "#" },
    { name: "Energy Label", url: "#" },
    { name: "Warranty Card", url: "#" }
  ],
  faqs: [
    {
      question: "What is the difference between an inverter and non-inverter AC?",
      answer: "An inverter AC can adjust its compressor speed based on the cooling requirement, resulting in energy savings and more consistent temperature. Non-inverter ACs operate at a fixed speed, turning on and off to maintain temperature, which consumes more energy."
    },
    {
      question: "What area can a 1.5-ton AC effectively cool?",
      answer: "A 1.5-ton AC is suitable for rooms between 120 to 180 square feet, depending on factors like ceiling height, insulation, number of windows, and local climate conditions."
    },
    {
      question: "Does installation cost include both indoor and outdoor units?",
      answer: "Yes, our standard installation package includes installation of both indoor and outdoor units, along with brackets for the outdoor unit and up to 3 meters of copper piping."
    },
    {
      question: "How often should I clean the AC filters?",
      answer: "For optimal performance, AC filters should be cleaned every 2 weeks during heavy usage periods. Regular cleaning ensures efficient cooling and better air quality."
    }
  ]
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const [expandedFaqs, setExpandedFaqs] = useState<string[]>([]);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Find the product based on id
  const product = productsData.find(p => p.id === id) || productsData[0];
  
  // Calculate discount percentage
  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
  
  // Toggle FAQ expansion
  const toggleFaq = (question: string) => {
    if (expandedFaqs.includes(question)) {
      setExpandedFaqs(expandedFaqs.filter(q => q !== question));
    } else {
      setExpandedFaqs([...expandedFaqs, question]);
    }
  };

  // Handle Add to Cart
  const handleAddToCart = () => {
    // Create a product object that matches the expected format with all required properties
    const cartProduct = {
      _id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: product.image,
      rating: product.rating,
      energyRating: product.energyRating,
      tonnage: product.tonnage,
      inverter: product.inverter,
      description: `${product.brand} ${product.name} ${product.tonnage} Ton ${product.inverter ? 'Inverter' : 'Non-Inverter'} AC`,
      category: 'Air Conditioner',
      countInStock: 10, // Default value
      numReviews: 0,    // Default value
    };
    
    addToCart(cartProduct, quantity);
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };
  
  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };
  
  // Related products (exclude current product)
  const relatedProducts = productsData.filter(p => p.id !== id);

  return (
    <div className="bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Product detail section */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product images */}
            <div className="flex justify-center items-center bg-gray-50 rounded-lg p-6">
              <img 
                src={product.image} 
                alt={product.name}
                className="max-h-96 object-contain" 
              />
            </div>
            
            {/* Product info */}
            <div>
              <div className="mb-2 text-gray-500">{product.brand}</div>
              <h1 className="text-2xl font-bold mb-3">{product.name}</h1>
              
              {/* Ratings */}
              <div className="flex items-center mb-4">
                <div className="bg-green-50 text-green-700 py-1 px-2 rounded flex items-center mr-3">
                  <Star size={16} fill="currentColor" className="mr-1" />
                  <span className="font-medium">{product.rating}</span>
                </div>
                <span className="text-gray-500">496 Reviews</span>
              </div>
              
              {/* Key features */}
              <div className="mb-4">
                <div className="text-sm font-medium mb-2">Key Features:</div>
                <ul className="space-y-1">
                  {extendedDetails.features.slice(0, 4).map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check size={16} className="text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Price */}
              <div className="mb-4">
                <div className="flex items-center">
                  <span className="text-3xl font-bold">₹{product.price.toLocaleString()}</span>
                  {product.originalPrice && (
                    <>
                      <span className="text-lg text-gray-400 line-through ml-3">
                        ₹{product.originalPrice.toLocaleString()}
                      </span>
                      <span className="ml-2 text-sm bg-red-50 text-red-600 px-2 py-0.5 rounded">
                        {discount}% off
                      </span>
                    </>
                  )}
                </div>
                <div className="text-green-600 text-sm">In stock</div>
                <div className="text-gray-500 text-sm mt-1">Inclusive of all taxes</div>
              </div>
              
              {/* Delivery */}
              <div className="flex items-center mb-6">
                <Truck size={18} className="text-gray-500 mr-2" />
                <span>Free delivery available</span>
              </div>
              
              {/* Quantity */}
              <div className="mb-6">
                <div className="text-sm font-medium mb-2">Quantity:</div>
                <div className="flex items-center">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="border rounded-l p-2 hover:bg-gray-100"
                  >
                    <Minus size={16} />
                  </button>
                  <div className="border-t border-b px-4 py-1">{quantity}</div>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="border rounded-r p-2 hover:bg-gray-100"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              
              {/* CTA buttons */}
              <div className="flex flex-wrap gap-4 mb-6">
                <Button 
                  className="flex-1 flex items-center justify-center bg-vaquah-blue hover:bg-vaquah-dark-blue"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart size={16} className="mr-2" />
                  Add to Cart
                </Button>
                <Button 
                  variant="secondary" 
                  className="flex-1 flex items-center justify-center"
                  onClick={handleBuyNow}
                >
                  Buy Now
                </Button>
              </div>
              
              {/* Additional info */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center mb-2">
                  <RefreshCw size={16} className="mr-2 text-gray-500" />
                  <span className="text-sm">10 days easy return policy</span>
                </div>
                <div className="flex items-center">
                  <Shield size={16} className="mr-2 text-gray-500" />
                  <span className="text-sm">5 year warranty on compressor</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs for details */}
        <div className="bg-white rounded-lg shadow mb-8">
          <Tabs defaultValue="specifications">
            <TabsList className="w-full border-b justify-start rounded-none">
              <TabsTrigger value="specifications" className="rounded-none">Specifications</TabsTrigger>
              <TabsTrigger value="features" className="rounded-none">Features</TabsTrigger>
              <TabsTrigger value="documents" className="rounded-none">Documents</TabsTrigger>
              <TabsTrigger value="faqs" className="rounded-none">FAQs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="specifications" className="p-4 md:p-6">
              <div className="space-y-6">
                {extendedDetails.specifications.map((category, index) => (
                  <div key={index}>
                    <h3 className="font-bold text-lg mb-3">{category.category}</h3>
                    <div className="bg-gray-50 rounded-lg overflow-hidden">
                      <table className="min-w-full">
                        <tbody>
                          {category.specs.map((spec, specIndex) => (
                            <tr key={specIndex} className={specIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                              <td className="px-4 py-3 text-sm font-medium">{spec.name}</td>
                              <td className="px-4 py-3 text-sm">{spec.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="features" className="p-4 md:p-6">
              <div className="space-y-1">
                {extendedDetails.features.map((feature, index) => (
                  <div key={index} className="flex items-start mb-3">
                    <Check size={16} className="text-green-500 mr-2 mt-1" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="documents" className="p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {extendedDetails.documents.map((doc, index) => (
                  <a 
                    key={index} 
                    href={doc.url}
                    className="border rounded-lg p-4 flex items-center hover:bg-gray-50"
                  >
                    <div className="bg-gray-100 p-3 rounded mr-3">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 18H17V16H7V18Z" fill="currentColor"/>
                        <path d="M17 14H7V12H17V14Z" fill="currentColor"/>
                        <path d="M7 10H11V8H7V10Z" fill="currentColor"/>
                        <path fillRule="evenodd" clipRule="evenodd" d="M6 2C4.34315 2 3 3.34315 3 5V19C3 20.6569 4.34315 22 6 22H18C19.6569 22 21 20.6569 21 19V9C21 5.13401 17.866 2 14 2H6ZM6 4H13V9H19V19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V5C5 4.44772 5.44772 4 6 4ZM15 4.10002C16.6113 4.4271 17.9413 5.52906 18.584 7H15V4.10002Z" fill="currentColor"/>
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium">{doc.name}</div>
                      <div className="text-xs text-gray-500">Click to download</div>
                    </div>
                  </a>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="faqs" className="p-4 md:p-6">
              <div className="space-y-4">
                {extendedDetails.faqs.map((faq, index) => (
                  <div key={index} className="border rounded-lg">
                    <button 
                      className="flex justify-between items-center w-full px-4 py-3 text-left font-medium"
                      onClick={() => toggleFaq(faq.question)}
                    >
                      <div className="flex items-center">
                        <HelpCircle size={16} className="mr-2 text-vaquah-blue" />
                        <span>{faq.question}</span>
                      </div>
                      {expandedFaqs.includes(faq.question) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    
                    {expandedFaqs.includes(faq.question) && (
                      <div className="px-4 pb-3 pt-0">
                        <p className="text-gray-600 pl-6">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Related products */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <h2 className="text-xl font-bold mb-4">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.slice(0, 3).map(product => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
