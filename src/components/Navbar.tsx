
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Search, ShoppingCart, Menu, X, User } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search for:', searchQuery);
    // Later we'll implement actual search functionality
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-heading font-bold text-vaquah-blue">VaquaH</span>
          </Link>

          {/* Search bar - hidden on mobile */}
          <div className="hidden md:flex flex-1 mx-8">
            <form onSubmit={handleSearch} className="w-full max-w-xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for split ACs..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-vaquah-blue"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-vaquah-blue">
                  <Search size={20} />
                </button>
              </div>
            </form>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/products" className="text-gray-600 hover:text-vaquah-blue">Products</Link>
            <Link to="/services" className="text-gray-600 hover:text-vaquah-blue">Services</Link>
            <Link to="/appointments" className="text-gray-600 hover:text-vaquah-blue">Appointments</Link>
            <Link to="/cart" className="relative p-2">
              <ShoppingCart size={20} className="text-gray-700" />
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-vaquah-orange rounded-full">0</span>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="sm" className="flex items-center">
                <User size={16} className="mr-2" />
                Login
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Link to="/cart" className="relative p-2 mr-2">
              <ShoppingCart size={20} className="text-gray-700" />
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-vaquah-orange rounded-full">0</span>
            </Link>
            <button onClick={toggleMenu} className="text-gray-600">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-2">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search for split ACs..."
                className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-vaquah-blue"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-vaquah-blue">
                <Search size={20} />
              </button>
            </div>
          </form>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <Link to="/products" className="block py-2 px-4 text-gray-600 hover:bg-vaquah-light-blue">Products</Link>
            <Link to="/services" className="block py-2 px-4 text-gray-600 hover:bg-vaquah-light-blue">Services</Link>
            <Link to="/appointments" className="block py-2 px-4 text-gray-600 hover:bg-vaquah-light-blue">Appointments</Link>
            <Link to="/login" className="block py-2 px-4 text-gray-600 hover:bg-vaquah-light-blue">Login</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
