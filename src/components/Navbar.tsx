
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Search, ShoppingCart, Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  const { state: cartState } = useCart();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search for:', searchQuery);
    // Later we'll implement actual search functionality
  };

  const handleLogout = () => {
    logout();
    navigate('/');
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
            <Link to="/appointments/new" className="text-gray-600 hover:text-vaquah-blue">Schedule Service</Link>
            <Link to="/contracts" className="text-gray-600 hover:text-vaquah-blue">Contracts</Link>
            <Link to="/cart" className="relative p-2">
              <ShoppingCart size={20} className="text-gray-700" />
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-vaquah-orange rounded-full">
                {cartState.cartItems.length}
              </span>
            </Link>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <User size={16} className="mr-2" />
                    {user.name.split(' ')[0]}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button variant="outline" size="sm" className="flex items-center">
                  <User size={16} className="mr-2" />
                  Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Link to="/cart" className="relative p-2 mr-2">
              <ShoppingCart size={20} className="text-gray-700" />
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-vaquah-orange rounded-full">
                {cartState.cartItems.length}
              </span>
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
            <Link to="/appointments/new" className="block py-2 px-4 text-gray-600 hover:bg-vaquah-light-blue">Schedule Service</Link>
            <Link to="/contracts" className="block py-2 px-4 text-gray-600 hover:bg-vaquah-light-blue">Contracts</Link>
            {user ? (
              <>
                <Link to="/dashboard" className="block py-2 px-4 text-gray-600 hover:bg-vaquah-light-blue">Dashboard</Link>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left py-2 px-4 text-gray-600 hover:bg-vaquah-light-blue"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="block py-2 px-4 text-gray-600 hover:bg-vaquah-light-blue">Login</Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
