import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* Main footer content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Company info */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">VaquaH</h2>
            <p className="mb-4 text-sm sm:text-base">
              Premium Split AC solutions for Indian homes and businesses. Quality products, expert installation, and reliable services.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-white"><Facebook size={18} className="sm:w-5 sm:h-5" /></a>
              <a href="#" className="hover:text-white"><Twitter size={18} className="sm:w-5 sm:h-5" /></a>
              <a href="#" className="hover:text-white"><Instagram size={18} className="sm:w-5 sm:h-5" /></a>
              <a href="#" className="hover:text-white"><Youtube size={18} className="sm:w-5 sm:h-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/products" className="hover:text-white text-sm sm:text-base">Products</Link></li>
              <li><Link to="/services" className="hover:text-white text-sm sm:text-base">Services</Link></li>
              <li><Link to="/appointments/new" className="hover:text-white text-sm sm:text-base">Book Appointment</Link></li>
              <li><Link to="/about-us" className="hover:text-white text-sm sm:text-base">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white text-sm sm:text-base">Contact</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div className="col-span-1">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Customer Support</h3>
            <ul className="space-y-2">
              <li><Link to="/faqs" className="hover:text-white text-sm sm:text-base">FAQs</Link></li>
              <li><Link to="/warranty" className="hover:text-white text-sm sm:text-base">Warranty Policy</Link></li>
              <li><Link to="/shipping" className="hover:text-white text-sm sm:text-base">Shipping Info</Link></li>
              <li><Link to="/returns" className="hover:text-white text-sm sm:text-base">Returns & Refunds</Link></li>
              <li><Link to="/track-order" className="hover:text-white text-sm sm:text-base">Track Your Order</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <Phone size={16} className="mr-2 mt-1 sm:w-4 sm:h-5 flex-shrink-0" />
                <div>
                  <p className="text-sm sm:text-base">+91 98765 43210</p>
                  <p className="text-xs text-gray-400">Mon-Sat: 10AM - 7PM IST</p>
                </div>
              </div>
              <div className="flex items-start">
                <Mail size={16} className="mr-2 mt-1 sm:w-4 sm:h-5 flex-shrink-0" />
                <span className="text-sm sm:text-base break-all">vaquah.contact@gmail.com</span>
              </div>
              <div className="flex items-start">
                <MapPin size={16} className="mr-2 mt-1 sm:w-4 sm:h-5 flex-shrink-0" />
                <span className="text-sm sm:text-base">123 Cooling Street, Mumbai, Maharashtra - 400001, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment and Trust badges */}
        <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-6 sm:pt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            <div className="text-center sm:text-left">
              <p className="text-sm font-medium mb-3">Accept Payments Via</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                <div className="bg-white text-xs text-gray-800 px-3 py-1 rounded font-medium">UPI</div>
                <div className="bg-white text-xs text-gray-800 px-3 py-1 rounded font-medium">RuPay</div>
                <div className="bg-white text-xs text-gray-800 px-3 py-1 rounded font-medium">Visa</div>
                <div className="bg-white text-xs text-gray-800 px-3 py-1 rounded font-medium">MasterCard</div>
              </div>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-sm font-medium mb-3">Certified By</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                <div className="bg-white text-xs text-gray-800 px-3 py-1 rounded font-medium">BEE</div>
                <div className="bg-white text-xs text-gray-800 px-3 py-1 rounded font-medium">ISO 9001</div>
                <div className="bg-white text-xs text-gray-800 px-3 py-1 rounded font-medium">ISI</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-4 sm:pt-6 text-center text-sm">
          <p>© 2025 VaquaH. All Rights Reserved.</p>
          <div className="mt-2 flex flex-col sm:flex-row sm:justify-center sm:gap-4">
            <Link to="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
