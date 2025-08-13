import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <span className="ml-2 text-2xl font-bold">Rubica</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Your trusted platform for discovering and connecting with professional services. 
              Find quality service providers in your area.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/listings" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Browse Services
                </Link>
              </li>
              <li>
                <Link to="/create-listing" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Post a Service
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Popular Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/category/beauty-wellness" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Beauty & Wellness
                </Link>
              </li>
              <li>
                <Link to="/category/fitness-sports" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Fitness & Sports
                </Link>
              </li>
              <li>
                <Link to="/category/education" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Education & Training
                </Link>
              </li>
              <li>
                <Link to="/category/entertainment" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Entertainment
                </Link>
              </li>
              <li>
                <Link to="/category/professional-services" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Professional Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300 text-sm">support@rubica.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300 text-sm">+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300 text-sm">
                  123 Business Street<br />
                  Delhi, India 110001
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-gray-400 text-sm">
                © 2024 Rubica. All rights reserved.
              </p>
              <div className="flex items-center space-x-1 text-gray-400 text-sm">
                <span>Made with</span>
                <Heart className="w-4 h-4 text-red-500" />
                <span>in India</span>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center space-x-6 text-sm">
              <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-gray-400 hover:text-white transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;