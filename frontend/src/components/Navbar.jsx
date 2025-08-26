import React, { useState } from 'react';
import { Link, useNavigate, NavLink, useLocation } from 'react-router-dom';
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
  const location = useLocation();

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
            <NavLink
              to="/"
              className={({ isActive }) =>
                `${isActive ? 'text-vaquah-blue border border-vaquah-blue bg-white' : 'text-white bg-vaquah-blue'} hover:text-white flex items-center px-4 py-2 rounded-md font-medium`
              }
              end
            >
              <Home size={18} className="mr-2" />
              Home
            </NavLink>
            <NavLink
              to="/products"
              className={({ isActive }) =>
                `${isActive ? 'text-vaquah-blue' : 'text-gray-600'} hover:text-vaquah-blue`
              }
            >
              Products
            </NavLink>
            <NavLink
              to="/appointments/new"
              className={({ isActive }) =>
                `${isActive ? 'text-vaquah-blue' : 'text-gray-600'} hover:text-vaquah-blue`
              }
            >
              Schedule Service
            </NavLink>
            <NavLink
              to="/contracts"
              className={({ isActive }) =>
                `${isActive ? 'text-vaquah-blue' : 'text-gray-600'} hover:text-vaquah-blue`
              }
            >
              Contracts
            </NavLink>
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
            <NavLink
              to="/"
              className={({ isActive }) =>
                `${isActive ? 'text-vaquah-blue border border-vaquah-blue bg-white' : 'text-white bg-vaquah-blue'} mr-3 flex items-center px-3 py-2 rounded-md`
              }
              end
            >
              <Home size={18} />
            </NavLink>
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
            <NavLink to="/" className={({ isActive }) => `flex items-center py-2 px-4 ${isActive ? 'text-vaquah-blue' : 'text-gray-600'} hover:bg-vaquah-light-blue`} end>
              <Home size={18} className="mr-2" />
              Home
            </NavLink>
            <NavLink to="/products" className={({ isActive }) => `block py-2 px-4 ${isActive ? 'text-vaquah-blue' : 'text-gray-600'} hover:bg-vaquah-light-blue`}>
              Products
            </NavLink>
            <NavLink to="/appointments/new" className={({ isActive }) => `block py-2 px-4 ${isActive ? 'text-vaquah-blue' : 'text-gray-600'} hover:bg-vaquah-light-blue`}>
              Schedule Service
            </NavLink>
            <NavLink to="/contracts" className={({ isActive }) => `block py-2 px-4 ${isActive ? 'text-vaquah-blue' : 'text-gray-600'} hover:bg-vaquah-light-blue`}>
              Contracts
            </NavLink>
            {user ? (
              <>
                <NavLink to="/dashboard" className={({ isActive }) => `block py-2 px-4 ${isActive ? 'text-vaquah-blue' : 'text-gray-600'} hover:bg-vaquah-light-blue`}>
                  Dashboard
                </NavLink>
                {user.isAdmin && (
                  <>
                    <NavLink to="/admin" className={({ isActive }) => `block py-2 px-4 ${isActive ? 'text-vaquah-blue' : 'text-gray-600'} hover:bg-vaquah-light-blue`}>
                      Admin Dashboard
                    </NavLink>
                    <NavLink to="/admin/orders" className={({ isActive }) => `block py-2 px-4 ${isActive ? 'text-vaquah-blue' : 'text-gray-600'} hover:bg-vaquah-light-blue`}>
                      Manage Orders
                    </NavLink>
                    <NavLink to="/admin/products" className={({ isActive }) => `block py-2 px-4 ${isActive ? 'text-vaquah-blue' : 'text-gray-600'} hover:bg-vaquah-light-blue`}>
                      Manage Products
                    </NavLink>
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
              <NavLink to="/login" className={({ isActive }) => `block py-2 px-4 ${isActive ? 'text-vaquah-blue' : 'text-gray-600'} hover:bg-vaquah-light-blue`}>
                Login
              </NavLink>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
