import React, { useState } from 'react';
import { Link, useNavigate, NavLink, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu, X, User, LogOut, Home, LayoutDashboard, Package, Wrench, Tag, Percent, Settings, Users, BarChart, Mic, Hand, BookOpen } from 'lucide-react';
import { useAuth } from '@/context/AuthContext.jsx';
import { useCart } from '@/context/CartContext';
import { useAssistant } from '@/context/AssistantContext';
import SearchBar from './SearchBar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { state: cartState } = useCart();
  const { openAssistant, isGestureModeEnabled, toggleGestureMode, isListening } = useAssistant();
  const navigate = useNavigate();
  const location = useLocation();

  if (user) {
    console.log("Navbar User:", user);
  }

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
                `${isActive ? 'text-vaquah-blue border border-vaquah-blue bg-white' : 'text-white bg-vaquah-blue'} hover:text-black flex items-center px-4 py-2 rounded-md font-medium`
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


            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `${isActive ? 'text-vaquah-blue' : 'text-gray-600'} hover:text-vaquah-blue`
              }
            >
              Contact
            </NavLink>

            {/* Assistant Controls */}
            <button
              onClick={openAssistant}
              className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${isListening ? 'text-vaquah-blue bg-blue-50 animate-pulse' : 'text-gray-600'}`}
              title="Voice Assistant"
            >
              <Mic size={20} />
            </button>

            <button
              onClick={toggleGestureMode}
              className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${isGestureModeEnabled ? 'text-green-500 bg-green-50' : 'text-gray-600'}`}
              title="Enable Gestures"
            >
              <Hand size={20} />
            </button>

            {user && (
              <Link to="/cart" className="relative p-2">
                <ShoppingCart size={20} className="text-gray-700" />
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-vaquah-orange rounded-full">
                  {cartState.cartItems.length}
                </span>
              </Link>
            )}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8 flex items-center justify-center">
                      <AvatarImage src={user.photoURL} alt={user.name} referrerPolicy="no-referrer" />
                      <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-white border-gray-100 shadow-xl rounded-xl p-2 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-3 py-2 border-b border-gray-100 mb-2">
                    <p className="font-semibold text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>

                  <DropdownMenuItem onClick={() => navigate('/dashboard')} className="cursor-pointer hover:bg-blue-50 hover:text-vaquah-blue focus:bg-blue-50 focus:text-vaquah-blue rounded-lg px-3 py-2.5 transition-colors duration-200 mb-1">
                    <LayoutDashboard className="h-4 w-4 mr-2.5" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => navigate('/guide')} className="cursor-pointer hover:bg-blue-50 hover:text-vaquah-blue focus:bg-blue-50 focus:text-vaquah-blue rounded-lg px-3 py-2.5 transition-colors duration-200 mb-1">
                    <BookOpen className="h-4 w-4 mr-2.5" />
                    <span>Voice & Gesture Guide</span>
                  </DropdownMenuItem>

                  {user.isAdmin && (
                    <>
                      <div className="px-2 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-2 mb-1">Admin Controls</div>

                      <DropdownMenuItem onClick={() => navigate('/admin')} className="cursor-pointer hover:bg-blue-50 hover:text-vaquah-blue focus:bg-blue-50 focus:text-vaquah-blue rounded-lg px-3 py-2.5 transition-colors duration-200 mb-1">
                        <BarChart className="h-4 w-4 mr-2.5" />
                        <span>Overview</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => navigate('/admin/orders')} className="cursor-pointer hover:bg-blue-50 hover:text-vaquah-blue focus:bg-blue-50 focus:text-vaquah-blue rounded-lg px-3 py-2.5 transition-colors duration-200 mb-1">
                        <Package className="h-4 w-4 mr-2.5" />
                        <span>Orders</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => navigate('/admin/services')} className="cursor-pointer hover:bg-blue-50 hover:text-vaquah-blue focus:bg-blue-50 focus:text-vaquah-blue rounded-lg px-3 py-2.5 transition-colors duration-200 mb-1">
                        <Wrench className="h-4 w-4 mr-2.5" />
                        <span>Services</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => navigate('/admin/products')} className="cursor-pointer hover:bg-blue-50 hover:text-vaquah-blue focus:bg-blue-50 focus:text-vaquah-blue rounded-lg px-3 py-2.5 transition-colors duration-200 mb-1">
                        <Tag className="h-4 w-4 mr-2.5" />
                        <span>Products</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => navigate('/admin/stock')} className="cursor-pointer hover:bg-blue-50 hover:text-vaquah-blue focus:bg-blue-50 focus:text-vaquah-blue rounded-lg px-3 py-2.5 transition-colors duration-200 mb-1">
                        <LayoutDashboard className="h-4 w-4 mr-2.5" />
                        <span>Stock</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => navigate('/admin/service-rates')} className="cursor-pointer hover:bg-blue-50 hover:text-vaquah-blue focus:bg-blue-50 focus:text-vaquah-blue rounded-lg px-3 py-2.5 transition-colors duration-200 mb-1">
                        <Percent className="h-4 w-4 mr-2.5" />
                        <span>Service Rates</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => navigate('/admin/offers')} className="cursor-pointer hover:bg-blue-50 hover:text-vaquah-blue focus:bg-blue-50 focus:text-vaquah-blue rounded-lg px-3 py-2.5 transition-colors duration-200 mb-1">
                        <Percent className="h-4 w-4 mr-2.5" />
                        <span>Offers</span>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator className="my-2 bg-gray-100" />

                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700 rounded-lg px-3 py-2.5 transition-colors duration-200">
                    <LogOut className="h-4 w-4 mr-2.5" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/guide">
                  <Button variant="ghost" size="sm" className="hidden md:flex items-center text-gray-600 hover:text-vaquah-blue">
                    <BookOpen size={18} className="mr-2" />
                    Guide
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="sm" className="flex items-center">
                    <User size={16} className="mr-2" />
                    SignIn/SignUp
                  </Button>
                </Link>
              </div>
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
            {user && (
              <Link to="/cart" className="relative p-2 mr-2">
                <ShoppingCart size={20} className="text-gray-700" />
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-vaquah-orange rounded-full">
                  {cartState.cartItems.length}
                </span>
              </Link>
            )}
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

            <NavLink to="/guide" className={({ isActive }) => `block py-2 px-4 ${isActive ? 'text-vaquah-blue' : 'text-gray-600'} hover:bg-vaquah-light-blue`}>
              Guide
            </NavLink>
            <NavLink to="/contact" className={({ isActive }) => `block py-2 px-4 ${isActive ? 'text-vaquah-blue' : 'text-gray-600'} hover:bg-vaquah-light-blue`}>
              Contact
            </NavLink>

            <button
              onClick={openAssistant}
              className={`flex items-center w-full text-left py-2 px-4 ${isListening ? 'text-vaquah-blue bg-blue-50' : 'text-gray-600'} hover:bg-vaquah-light-blue`}
            >
              <Mic size={18} className="mr-2" />
              Voice Assistant
            </button>

            <button
              onClick={toggleGestureMode}
              className={`flex items-center w-full text-left py-2 px-4 ${isGestureModeEnabled ? 'text-green-500 bg-green-50' : 'text-gray-600'} hover:bg-vaquah-light-blue`}
            >
              <Hand size={18} className="mr-2" />
              {isGestureModeEnabled ? 'Disable Gestures' : 'Enable Gestures'}
            </button>

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
                    <NavLink to="/admin/services" className={({ isActive }) => `block py-2 px-4 ${isActive ? 'text-vaquah-blue' : 'text-gray-600'} hover:bg-vaquah-light-blue`}>
                      Manage Services
                    </NavLink>
                    <NavLink to="/admin/products" className={({ isActive }) => `block py-2 px-4 ${isActive ? 'text-vaquah-blue' : 'text-gray-600'} hover:bg-vaquah-light-blue`}>
                      Manage Products
                    </NavLink>
                    <NavLink to="/admin/stock" className={({ isActive }) => `block py-2 px-4 ${isActive ? 'text-vaquah-blue' : 'text-gray-600'} hover:bg-vaquah-light-blue`}>
                      Update Stock
                    </NavLink>
                    <NavLink to="/admin/service-rates" className={({ isActive }) => `block py-2 px-4 ${isActive ? 'text-vaquah-blue' : 'text-gray-600'} hover:bg-vaquah-light-blue`}>
                      Update Service Rates
                    </NavLink>
                    <NavLink to="/admin/offers" className={({ isActive }) => `block py-2 px-4 ${isActive ? 'text-vaquah-blue' : 'text-gray-600'} hover:bg-vaquah-light-blue`}>
                      Manage Offers
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
                SignIn/SignUp
              </NavLink>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
