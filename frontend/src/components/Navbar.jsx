import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu, X, User, LogOut, Home } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import SearchBar from './SearchBar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { state: cartState } = useCart();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-heading font-bold text-vaquah-blue">VaquaH</span>
          </Link>

          {/* Search bar - hidden on mobile */}
          <div className="hidden md:flex flex-1 mx-8">
            <SearchBar className="w-full max-w-xl" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="text-white hover:text-white flex items-center bg-vaquah-blue px-4 py-2 rounded-md font-medium">
              <Home size={18} className="mr-2" />
              Home
            </Link>
            <Link to="/products" className="text-gray-600 hover:text-vaquah-blue">Products</Link>
            <Link to="/appointments/new" className="text-gray-600 hover:text-vaquah-blue">Schedule Service</Link>
            <Link to="/contracts" className="text-gray-600 hover:text-vaquah-blue">Contracts</Link>
            <Link to="/apply-agent" className="text-gray-600 hover:text-vaquah-blue">Apply as Agent</Link>
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
                  {user.role === 'agent' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/agent-dashboard')}>
                        Agent Dashboard
                      </DropdownMenuItem>
                    </>
                  )}
                  {user.isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        Admin Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/admin/orders')}>
                        Manage Orders
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/admin/products')}>
                        Manage Products
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/admin/services')}>
                        Manage Services
                      </DropdownMenuItem>
                    </>
                  )}
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
            <Link to="/" className="text-white hover:text-white mr-3 flex items-center bg-vaquah-blue px-3 py-2 rounded-md">
              <Home size={18} />
            </Link>
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
          <SearchBar isMobile={true} />
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <Link to="/" className="flex items-center py-2 px-4 text-gray-600 hover:bg-vaquah-light-blue">
              <Home size={18} className="mr-2" />
              Home
            </Link>
            <Link to="/products" className="block py-2 px-4 text-gray-600 hover:bg-vaquah-light-blue">Products</Link>
            <Link to="/appointments/new" className="block py-2 px-4 text-gray-600 hover:bg-vaquah-light-blue">Schedule Service</Link>
            <Link to="/contracts" className="block py-2 px-4 text-gray-600 hover:bg-vaquah-light-blue">Contracts</Link>
            <Link to="/apply-agent" className="block py-2 px-4 text-gray-600 hover:bg-vaquah-light-blue">Apply as Agent</Link>
            {user ? (
              <>
                <Link to="/dashboard" className="block py-2 px-4 text-gray-600 hover:bg-vaquah-light-blue">Dashboard</Link>
                {user.role === 'agent' && (
                  <Link to="/agent-dashboard" className="block py-2 px-4 text-gray-600 hover:bg-vaquah-light-blue">Agent Dashboard</Link>
                )}
                {user.isAdmin && (
                  <>
                    <Link to="/admin" className="block py-2 px-4 text-gray-600 hover:bg-vaquah-light-blue">Admin Dashboard</Link>
                    <Link to="/admin/orders" className="block py-2 px-4 text-gray-600 hover:bg-vaquah-light-blue">Manage Orders</Link>
                    <Link to="/admin/products" className="block py-2 px-4 text-gray-600 hover:bg-vaquah-light-blue">Manage Products</Link>
                    <Link to="/admin/services" className="block py-2 px-4 text-gray-600 hover:bg-vaquah-light-blue">Manage Services</Link>
                  </>
                )}
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
