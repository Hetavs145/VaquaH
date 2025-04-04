
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company info */}
          <div className="col-span-1">
            <h2 className="text-2xl font-bold text-white mb-4">VaquaH</h2>
            <p className="mb-4">
              Premium Split AC solutions for Indian homes and businesses. Quality products, expert installation, and reliable services.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-white"><Facebook size={20} /></a>
              <a href="#" className="hover:text-white"><Twitter size={20} /></a>
              <a href="#" className="hover:text-white"><Instagram size={20} /></a>
              <a href="#" className="hover:text-white"><Youtube size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-xl font-bold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/products" className="hover:text-white">Products</Link></li>
              <li><Link to="/services" className="hover:text-white">Services</Link></li>
              <li><Link to="/appointments/new" className="hover:text-white">Book Appointment</Link></li>
              <li><Link to="/about-us" className="hover:text-white">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div className="col-span-1">
            <h3 className="text-xl font-bold text-white mb-4">Customer Support</h3>
            <ul className="space-y-2">
              <li><Link to="/faqs" className="hover:text-white">FAQs</Link></li>
              <li><Link to="/warranty" className="hover:text-white">Warranty Policy</Link></li>
              <li><Link to="/shipping" className="hover:text-white">Shipping Info</Link></li>
              <li><Link to="/returns" className="hover:text-white">Returns & Refunds</Link></li>
              <li><Link to="/track-order" className="hover:text-white">Track Your Order</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-span-1">
            <h3 className="text-xl font-bold text-white mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <Phone size={18} className="mr-2 mt-1" />
                <div>
                  <p>+91 98765 43210</p>
                  <p className="text-xs text-gray-400">Mon-Sat: 10AM - 7PM IST</p>
                </div>
              </div>
              <div className="flex items-start">
                <Mail size={18} className="mr-2 mt-1" />
                <span>vaquah.contact@gmail.com</span>
              </div>
              <div className="flex items-start">
                <MapPin size={18} className="mr-2 mt-1" />
                <span>123 Cooling Street, Mumbai, Maharashtra - 400001, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment and Trust badges */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-wrap justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm">Accept Payments Via</p>
              <div className="flex space-x-2 mt-2">
                <div className="bg-white text-xs text-gray-800 px-2 py-1 rounded">UPI</div>
                <div className="bg-white text-xs text-gray-800 px-2 py-1 rounded">RuPay</div>
                <div className="bg-white text-xs text-gray-800 px-2 py-1 rounded">Visa</div>
                <div className="bg-white text-xs text-gray-800 px-2 py-1 rounded">MasterCard</div>
              </div>
            </div>
            <div>
              <p className="text-sm">Certified By</p>
              <div className="flex space-x-2 mt-2">
                <div className="bg-white text-xs text-gray-800 px-2 py-1 rounded">BEE</div>
                <div className="bg-white text-xs text-gray-800 px-2 py-1 rounded">ISO 9001</div>
                <div className="bg-white text-xs text-gray-800 px-2 py-1 rounded">ISI</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm">
          <p>© 2025 VaquaH. All Rights Reserved.</p>
          <div className="mt-2">
            <Link to="/privacy-policy" className="hover:text-white mr-4">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
