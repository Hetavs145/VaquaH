import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductImageCarousel from '@/components/ProductImageCarousel';
import ProductCardsCarousel from '@/components/ProductCardsCarousel';

const CarouselDemo = () => {
  // Sample images for testing
  const sampleImages = [
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop'
  ];

  // Sample products for testing
  const sampleProducts = [
    {
      _id: '1',
      name: 'Split AC 1.5 Ton',
      brand: 'VaquaH',
      price: 45000,
      rating: 4.5,
      image: sampleImages[0],
      images: sampleImages.slice(0, 3),
      description: 'Energy efficient split AC with inverter technology',
      energyRating: '5',
      tonnage: 1.5,
      inverter: true
    },
    {
      _id: '2',
      name: 'Split AC 2.0 Ton',
      brand: 'VaquaH',
      price: 55000,
      rating: 4.3,
      image: sampleImages[1],
      images: sampleImages.slice(1, 4),
      description: 'High capacity split AC for large rooms',
      energyRating: '4',
      tonnage: 2.0,
      inverter: true
    },
    {
      _id: '3',
      name: 'Window AC 1.0 Ton',
      brand: 'VaquaH',
      price: 35000,
      rating: 4.0,
      image: sampleImages[2],
      images: sampleImages.slice(2, 5),
      description: 'Compact window AC for small spaces',
      energyRating: '4',
      tonnage: 1.0,
      inverter: false
    },
    {
      _id: '4',
      name: 'Split AC 1.0 Ton',
      brand: 'VaquaH',
      price: 40000,
      rating: 4.7,
      image: sampleImages[3],
      images: sampleImages.slice(0, 2),
      description: 'Efficient split AC for bedrooms',
      energyRating: '5',
      tonnage: 1.0,
      inverter: true
    },
    {
      _id: '5',
      name: 'Split AC 2.5 Ton',
      brand: 'VaquaH',
      price: 65000,
      rating: 4.2,
      image: sampleImages[4],
      images: sampleImages.slice(1, 3),
      description: 'High performance AC for commercial use',
      energyRating: '4',
      tonnage: 2.5,
      inverter: true
    },
    {
      _id: '6',
      name: 'Portable AC 1.0 Ton',
      brand: 'VaquaH',
      price: 30000,
      rating: 3.8,
      image: sampleImages[0],
      images: sampleImages.slice(2, 4),
      description: 'Portable AC for flexible cooling',
      energyRating: '3',
      tonnage: 1.0,
      inverter: false
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-8">Carousel Demo</h1>
          
          {/* Single Product Image Carousel */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Single Product Image Carousel</h2>
            <div className="max-w-2xl mx-auto">
              <ProductImageCarousel
                images={sampleImages}
                productName="Sample Product"
                autoPlay={true}
                autoPlayInterval={3000}
                showThumbnails={true}
                showDots={true}
                showArrows={true}
              />
            </div>
          </section>

          {/* Product Cards Carousel */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Product Cards Carousel</h2>
            <ProductCardsCarousel
              products={sampleProducts}
              title="Featured Products"
              subtitle="Handpicked air conditioners for your ultimate comfort"
              autoPlay={true}
              autoPlayInterval={5000}
              showArrows={true}
              showDots={true}
              maxVisibleCards={4}
            />
          </section>

          {/* Multiple Product Cards Carousel */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">All Products Carousel</h2>
            <ProductCardsCarousel
              products={sampleProducts}
              title="All Products"
              subtitle="Complete range of our air conditioning solutions"
              autoPlay={false}
              showArrows={true}
              showDots={true}
              maxVisibleCards={4}
            />
          </section>

          {/* Mobile-optimized carousel */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Mobile-Optimized Carousel</h2>
            <div className="max-w-md mx-auto">
              <ProductImageCarousel
                images={sampleImages}
                productName="Mobile Product"
                autoPlay={true}
                autoPlayInterval={4000}
                showThumbnails={false}
                showDots={true}
                showArrows={true}
              />
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CarouselDemo;