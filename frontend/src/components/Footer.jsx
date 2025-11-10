import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company info */}
          <div className="col-span-1">
            <h2 className="text-2xl font-bold text-white mb-4">VaquaH</h2>
            <p className="mb-4 text-sm leading-relaxed">
              Premium Split AC solutions for Indian homes and businesses. Quality products, expert installation, and reliable services.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors"><Facebook size={20} /></a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors"><Twitter size={20} /></a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors"><Instagram size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-xl font-bold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/products" className="hover:text-white transition-colors">Products</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Services</Link></li>
              <li><Link to="/appointments/new" className="hover:text-white transition-colors">Book Appointment</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div className="col-span-1">
            <h3 className="text-xl font-bold text-white mb-4">Customer Support</h3>
            <ul className="space-y-2">
              <li><Link to="/faqs" className="hover:text-white transition-colors">FAQs</Link></li>
              <li><Link to="/warranty" className="hover:text-white transition-colors">Warranty Policy</Link></li>
              <li><Link to="/shipping" className="hover:text-white transition-colors">Shipping Info</Link></li>
              <li><Link to="/returns" className="hover:text-white transition-colors">Returns & Refunds</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Track Your Order</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-span-1">
            <h3 className="text-xl font-bold text-white mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <Phone size={18} className="mr-2 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm">+91 9999999999</p>
                  <p className="text-xs text-gray-400">Mon-Sat: 10AM - 7PM IST</p>
                </div>
              </div>
              <div className="flex items-start">
                <Mail size={18} className="mr-2 mt-1 flex-shrink-0" />
                <span className="text-sm">vaquah.contact@gmail.com</span>
              </div>
              <div className="flex items-start">
                <MapPin size={18} className="mr-2 mt-1 flex-shrink-0" />
                <span className="text-sm">Vadodara Gujarat -390023, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment and Trust badges */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-6 lg:space-y-0">
            <div className="text-center lg:text-left">
              <p className="text-sm font-medium mb-3">Accept Payments Via</p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                <div className="bg-white text-xs text-gray-800 px-3 py-2 rounded-md font-medium">UPI</div>
                <div className="bg-white text-xs text-gray-800 px-3 py-2 rounded-md font-medium">RuPay</div>
                <div className="bg-white text-xs text-gray-800 px-3 py-2 rounded-md font-medium">Visa</div>
                <div className="bg-white text-xs text-gray-800 px-3 py-2 rounded-md font-medium">MasterCard</div>
              </div>
            </div>
            <div className="text-center lg:text-left">
              <p className="text-sm font-medium mb-3">Certified By</p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                <div className="bg-white text-xs text-gray-800 px-3 py-2 rounded-md font-medium">BEE</div>
                <div className="bg-white text-xs text-gray-800 px-3 py-2 rounded-md font-medium">ISO 9001</div>
                <div className="bg-white text-xs text-gray-800 px-3 py-2 rounded-md font-medium">ISI</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-6 text-center">
          <p className="text-sm mb-3">© 2025 VaquaH. All Rights Reserved.</p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <Link to="/privacy-policy" className="hover:text-white transition-colors text-sm">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors text-sm">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
