import React from 'react';
import { Link } from 'react-router-dom';
const Footer = () => {
  return <footer className="py-6 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-start gap-4 md:gap-6 items-start text-sm text-gray-500">
          <Link to="/" className="text-gray-500 hover:text-gray-900 transition-colors">
            © EmpireMarket
          </Link>
          <Link to="/privacy" className="hover:text-gray-900 transition-colors">
            Privacy & terms
          </Link>
        </div>
      </div>
    </footer>;
};
export default Footer;