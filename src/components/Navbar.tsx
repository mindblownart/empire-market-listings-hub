
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-white">
              <span className={`transition-colors ${isScrolled ? 'text-primary-dark' : 'text-white'}`}>
                EmpireMarket
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link to="/listings" className={`transition-colors ${isScrolled ? 'text-gray-700 hover:text-primary-dark' : 'text-white hover:text-gray-200'}`}>
              Browse Listings
            </Link>
            <Link to="/submit" className={`transition-colors ${isScrolled ? 'text-gray-700 hover:text-primary-dark' : 'text-white hover:text-gray-200'}`}>
              Submit a Business
            </Link>
            <Link to="/how-it-works" className={`transition-colors ${isScrolled ? 'text-gray-700 hover:text-primary-dark' : 'text-white hover:text-gray-200'}`}>
              How It Works
            </Link>
            <Link to="/pricing" className={`transition-colors ${isScrolled ? 'text-gray-700 hover:text-primary-dark' : 'text-white hover:text-gray-200'}`}>
              Pricing
            </Link>
            <Link to="/login" className={`transition-colors ${isScrolled ? 'text-gray-700 hover:text-primary-dark' : 'text-white hover:text-gray-200'}`}>
              Login
            </Link>
            <Button className="bg-primary hover:bg-primary-light">
              Sign Up
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-md ${isScrolled ? 'text-gray-700' : 'text-white'}`}
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 bg-white p-4 rounded-lg shadow-lg">
            <div className="flex flex-col space-y-4">
              <Link to="/listings" className="text-gray-700 hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                Browse Listings
              </Link>
              <Link to="/submit" className="text-gray-700 hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                Submit a Business
              </Link>
              <Link to="/how-it-works" className="text-gray-700 hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                How It Works
              </Link>
              <Link to="/pricing" className="text-gray-700 hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                Pricing
              </Link>
              <Link to="/login" className="text-gray-700 hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                Login
              </Link>
              <Button className="bg-primary hover:bg-primary-light w-full" onClick={() => setIsMobileMenuOpen(false)}>
                Sign Up
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
