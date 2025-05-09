
import React from 'react';
import { Link } from 'react-router-dom';

const HomeFooter = () => {
  return (
    <footer className="bg-[#072746] text-white py-12 w-full">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1 */}
          <div>
            <h3 className="font-bold text-xl mb-4">EmpireMarket</h3>
            <p className="text-gray-300">The leading marketplace for buying and selling businesses</p>
          </div>
          
          {/* Column 2 */}
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <nav className="flex flex-col space-y-2">
              <Link to="/#listings" className="text-gray-300 hover:text-white transition-colors">Browse Listings</Link>
              <Link to="/#how-it-works" className="text-gray-300 hover:text-white transition-colors">How It Works</Link>
              <Link to="/" className="text-gray-300 hover:text-white transition-colors">Success Stories</Link>
              <Link to="/pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</Link>
            </nav>
          </div>
          
          {/* Column 3 */}
          <div>
            <h3 className="font-bold text-lg mb-4">Resources</h3>
            <nav className="flex flex-col space-y-2">
              <Link to="/" className="text-gray-300 hover:text-white transition-colors">Buyer Guide</Link>
              <Link to="/" className="text-gray-300 hover:text-white transition-colors">Seller Guide</Link>
              <Link to="/" className="text-gray-300 hover:text-white transition-colors">Blog</Link>
              <Link to="/" className="text-gray-300 hover:text-white transition-colors">FAQ</Link>
            </nav>
          </div>
          
          {/* Column 4 */}
          <div>
            <h3 className="font-bold text-lg mb-4">Contact</h3>
            <nav className="flex flex-col space-y-2">
              <Link to="/" className="text-gray-300 hover:text-white transition-colors">About Us</Link>
              <Link to="/" className="text-gray-300 hover:text-white transition-colors">Support</Link>
              <Link to="/" className="text-gray-300 hover:text-white transition-colors">Partners</Link>
              <Link to="/" className="text-gray-300 hover:text-white transition-colors">Careers</Link>
            </nav>
          </div>
        </div>
        
        <div className="mt-12 pt-4 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-start gap-4 md:gap-6 items-start text-sm text-gray-400">
            <Link to="/" className="text-gray-400 hover:text-white transition-colors">
              © EmpireMarket
            </Link>
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy & terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;
