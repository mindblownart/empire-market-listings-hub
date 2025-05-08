
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="col-span-1 lg:col-span-2">
            <Link to="/" className="text-2xl font-bold">EmpireMarket</Link>
            <p className="mt-4 text-gray-400 max-w-sm">
              The premier marketplace for buying and selling established businesses. 
              We connect serious entrepreneurs with quality business opportunities.
            </p>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/listings" className="text-gray-400 hover:text-white transition-colors">Browse Listings</Link></li>
              <li><Link to="/how-it-works" className="text-gray-400 hover:text-white transition-colors">How It Works</Link></li>
              <li><Link to="/success-stories" className="text-gray-400 hover:text-white transition-colors">Success Stories</Link></li>
              <li><Link to="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><Link to="/buyer-guide" className="text-gray-400 hover:text-white transition-colors">Buyer Guide</Link></li>
              <li><Link to="/seller-guide" className="text-gray-400 hover:text-white transition-colors">Seller Guide</Link></li>
              <li><Link to="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
              <li><Link to="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/support" className="text-gray-400 hover:text-white transition-colors">Support</Link></li>
              <li><Link to="/partners" className="text-gray-400 hover:text-white transition-colors">Partners</Link></li>
              <li><Link to="/careers" className="text-gray-400 hover:text-white transition-colors">Careers</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} EmpireMarket. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link to="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">Terms</Link>
            <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy</Link>
            <Link to="/security" className="text-gray-400 hover:text-white transition-colors text-sm">Security</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
