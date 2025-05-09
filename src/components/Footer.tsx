
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-gray-200 py-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="space-y-6 mb-8 md:mb-0">
            <Link to="/" className="text-2xl font-bold">EmpireMarket</Link>
            <p className="text-gray-500 max-w-sm">
              The premier marketplace for buying and selling established businesses. 
              We connect serious entrepreneurs with quality business opportunities.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold mb-3">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/listings" className="text-gray-500 hover:text-gray-900 transition-colors text-sm">Browse Listings</Link></li>
                <li><Link to="/how-it-works" className="text-gray-500 hover:text-gray-900 transition-colors text-sm">How It Works</Link></li>
                <li><Link to="/success-stories" className="text-gray-500 hover:text-gray-900 transition-colors text-sm">Success Stories</Link></li>
                <li><Link to="/pricing" className="text-gray-500 hover:text-gray-900 transition-colors text-sm">Pricing</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold mb-3">Resources</h3>
              <ul className="space-y-2">
                <li><Link to="/buyer-guide" className="text-gray-500 hover:text-gray-900 transition-colors text-sm">Buyer Guide</Link></li>
                <li><Link to="/seller-guide" className="text-gray-500 hover:text-gray-900 transition-colors text-sm">Seller Guide</Link></li>
                <li><Link to="/blog" className="text-gray-500 hover:text-gray-900 transition-colors text-sm">Blog</Link></li>
                <li><Link to="/faq" className="text-gray-500 hover:text-gray-900 transition-colors text-sm">FAQ</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold mb-3">Contact</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-gray-500 hover:text-gray-900 transition-colors text-sm">About Us</Link></li>
                <li><Link to="/support" className="text-gray-500 hover:text-gray-900 transition-colors text-sm">Support</Link></li>
                <li><Link to="/partners" className="text-gray-500 hover:text-gray-900 transition-colors text-sm">Partners</Link></li>
                <li><Link to="/careers" className="text-gray-500 hover:text-gray-900 transition-colors text-sm">Careers</Link></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-10 pt-6">
          <div className="flex flex-col md:flex-row justify-start gap-6 items-center md:items-start">
            <span className="text-sm text-gray-500">© {new Date().getFullYear()} EmpireMarket</span>
            <Link to="/privacy" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Privacy & terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
