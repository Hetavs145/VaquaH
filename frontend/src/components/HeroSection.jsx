import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const HeroSection = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const carouselRef = useRef(null);

  // Carousel images - you can add more images here
  const carouselImages = [
    {
      image: "https://images.unsplash.com/photo-1621617003570-050caddcba61?auto=format&fit=crop&q=80&w=800",
      title: "Beat the Heat with Premium Split ACs",
      subtitle: "Experience ultimate cooling comfort with energy-efficient split air conditioners. Get expert installation and maintenance services.",
      ctaText: "Shop Now",
      ctaLink: "/products"
    },
    {
      image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800",
      title: "Professional AC Installation & Service",
      subtitle: "Expert technicians for installation, maintenance, and repair of all AC brands. 24/7 emergency service available.",
      ctaText: "Book Service",
      ctaLink: "/appointments/new"
    },
    {
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800",
      title: "Energy Efficient Cooling Solutions",
      subtitle: "Save on electricity bills with our range of inverter ACs. Eco-friendly and cost-effective cooling for your home.",
      ctaText: "View Products",
      ctaLink: "/products"
    }
  ];

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDragging) {
        setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
      }
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [carouselImages.length, isDragging]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Touch/swipe handlers for mobile
  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (isDragging) {
      setCurrentX(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    if (isDragging) {
      const diff = startX - currentX;
      const threshold = 50; // Minimum swipe distance

      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          // Swipe left - next slide
          nextSlide();
        } else {
          // Swipe right - previous slide
          prevSlide();
        }
      }
      
      setIsDragging(false);
      setStartX(0);
      setCurrentX(0);
    }
  };

  // Mouse drag handlers for desktop
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setCurrentX(e.clientX);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setCurrentX(e.clientX);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      const diff = startX - currentX;
      const threshold = 100; // Higher threshold for mouse

      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
      
      setIsDragging(false);
      setStartX(0);
      setCurrentX(0);
    }
  };

  return (
    <section className="relative bg-gradient-to-r from-vaquah-light-blue to-white overflow-hidden hero-section">
      {/* Carousel Container */}
      <div 
        className="relative h-[400px] sm:h-[500px] md:h-[600px] hero-carousel"
        ref={carouselRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Carousel Slides */}
        {carouselImages.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
                loading={index === 0 ? "eager" : "lazy"}
                draggable={false} // Prevent image dragging
              />
              {/* Overlay for better text readability */}
              <div className="absolute inset-0 bg-black bg-opacity-30"></div>
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 h-full flex items-center">
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
                  {/* Text Content */}
                  <div className="text-white text-content">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 font-sans leading-tight">
                      {slide.title}
                    </h1>
                    <p className="text-base sm:text-lg mb-4 sm:mb-6 text-white/90">
                      {slide.subtitle}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
                      <Button 
                        className="bg-vaquah-blue hover:bg-vaquah-dark-blue text-white w-full sm:w-auto"
                        onClick={() => navigate(slide.ctaLink)}
                      >
                        {slide.ctaText} <ArrowRight size={16} className="ml-2" />
                      </Button>
                      <Button 
                        variant="outline" 
                        className="border-white text-white hover:bg-white hover:text-vaquah-blue w-full sm:w-auto"
                        onClick={() => navigate('/appointments/new')}
                      >
                        Book a Service
                      </Button>
                    </div>

                    {/* Static content to prevent CLS */}
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-white/20 backdrop-blur-sm rounded-full shadow-sm mr-3 w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-xs sm:text-sm">❄️</div>
                        <span className="text-xs sm:text-sm font-medium text-white">Energy Efficient</span>
                      </div>
                      <div className="flex items-center">
                        <div className="p-2 bg-white/20 backdrop-blur-sm rounded-full shadow-sm mr-3 w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-xs sm:text-sm">🛡️</div>
                        <span className="text-xs sm:text-sm font-medium text-white">5 Year Warranty</span>
                      </div>
                      <div className="flex items-center">
                        <div className="p-2 bg-white/20 backdrop-blur-sm rounded-full shadow-sm mr-3 w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-xs sm:text-sm">⏱️</div>
                        <span className="text-xs sm:text-sm font-medium text-white">24/7 Support</span>
                      </div>
                    </div>
                  </div>

                  {/* Image placeholder for larger screens */}
                  <div className="hidden md:flex justify-center">
                    <div className="hero-image-container">
                      <img 
                        src={slide.image} 
                        alt={slide.title} 
                        width="800"
                        height="533"
                        loading="eager"
                        fetchpriority="high"
                        className="hero-image rounded-lg shadow-lg" 
                        draggable={false} // Prevent image dragging
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        {carouselImages.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all z-20"
              aria-label="Previous slide"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all z-20"
              aria-label="Next slide"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Carousel Indicators */}
        {carouselImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
            {carouselImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide 
                    ? 'bg-white' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;
