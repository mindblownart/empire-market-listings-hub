
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import { supabase } from '@/lib/supabase';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Check if we're on the home page
  const isHomePage = location.pathname === '/';
  // Check if we're on the submit page
  const isSubmitPage = location.pathname === '/submit';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    
    // Get current user
    const getUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    };
    
    getUser();
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Close mobile menu when changing routes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Smooth scroll function for hash links
  const scrollWithOffset = (el: HTMLElement) => {
    const yCoordinate = el.getBoundingClientRect().top + window.pageYOffset;
    const yOffset = -80; // Header height offset
    window.scrollTo({ top: yCoordinate + yOffset, behavior: 'smooth' });
  };

  // Check if we're on the signup or login page
  const isSignupPage = location.pathname === '/signup';
  const isLoginPage = location.pathname === '/login';
  const isPreviewPage = location.pathname === '/preview-listing';
  const isMinimalNavigation = isSignupPage || isLoginPage || isSubmitPage || isPreviewPage;

  // Handle submit business click - check if user is logged in
  const handleSubmitBusinessClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      navigate('/login', { state: { redirect: '/submit' } });
    }
  };

  // Determine text color class based on page and scroll state
  const getTextColorClass = () => {
    if (isHomePage && !isScrolled) {
      return 'text-white';
    }
    return 'text-[#2F3542]';
  };
  
  // Get hover color class based on page
  const getHoverColorClass = () => {
    if (isHomePage && !isScrolled) {
      return 'hover:text-gray-200';
    }
    return 'hover:text-[#1a1f29]';
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold">
              <span className={`${isHomePage && !isScrolled ? 'text-white' : 'text-[#5B3DF5]'} transition-colors`}>
                EmpireMarket
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {!isMinimalNavigation && (
              <>
                <HashLink 
                  smooth 
                  to="/#listings" 
                  scroll={scrollWithOffset}
                  className={`${getTextColorClass()} ${getHoverColorClass()} transition-colors`}
                >
                  Browse Listings
                </HashLink>
                <Link 
                  to="/submit" 
                  className={`${getTextColorClass()} ${getHoverColorClass()} transition-colors`}
                  onClick={handleSubmitBusinessClick}
                >
                  Submit a Business
                </Link>
                <HashLink 
                  smooth 
                  to="/#how-it-works" 
                  scroll={scrollWithOffset}
                  className={`${getTextColorClass()} ${getHoverColorClass()} transition-colors`}
                >
                  How It Works
                </HashLink>
                <Link to="/pricing" className={`${getTextColorClass()} ${getHoverColorClass()} transition-colors`}>
                  Pricing
                </Link>
              </>
            )}
            {!isSubmitPage && !isPreviewPage && (
              <>
                {!user ? (
                  <>
                    <Link to="/login" className={`${getTextColorClass()} ${getHoverColorClass()} transition-colors`}>
                      Login
                    </Link>
                    <Link to="/signup">
                      <Button className="bg-primary hover:bg-primary-light">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Button 
                    variant="ghost" 
                    className={`${getTextColorClass()} ${getHoverColorClass()} transition-colors`}
                    onClick={() => supabase.auth.signOut().then(() => navigate('/'))}
                  >
                    Log out
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button - Hidden on Submit and Preview pages */}
          {!isSubmitPage && !isPreviewPage && (
            <div className="md:hidden">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`p-2 rounded-md ${
                  isScrolled || !isHomePage ? 'text-[#2F3542]' : 'text-white'
                }`}
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
          )}
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 bg-white p-4 rounded-lg shadow-lg">
            <div className="flex flex-col space-y-4">
              {!isMinimalNavigation && (
                <>
                  <HashLink 
                    smooth 
                    to="/#listings" 
                    scroll={scrollWithOffset}
                    className="text-[#2F3542] hover:text-[#1a1f29] transition-colors" 
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Browse Listings
                  </HashLink>
                  <Link 
                    to="/submit" 
                    className="text-[#2F3542] hover:text-[#1a1f29] transition-colors" 
                    onClick={(e) => {
                      setIsMobileMenuOpen(false);
                      if (!user) {
                        e.preventDefault();
                        navigate('/login', { state: { redirect: '/submit' } });
                      }
                    }}
                  >
                    Submit a Business
                  </Link>
                  <HashLink 
                    smooth 
                    to="/#how-it-works" 
                    scroll={scrollWithOffset}
                    className="text-[#2F3542] hover:text-[#1a1f29] transition-colors" 
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    How It Works
                  </HashLink>
                  <Link to="/pricing" className="text-[#2F3542] hover:text-[#1a1f29] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                    Pricing
                  </Link>
                </>
              )}
              {!user ? (
                <>
                  <Link to="/login" className="text-[#2F3542] hover:text-[#1a1f29] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                    Login
                  </Link>
                  <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="bg-primary hover:bg-primary-light w-full">
                      Sign Up
                    </Button>
                  </Link>
                </>
              ) : (
                <Button 
                  variant="ghost" 
                  className="text-[#2F3542] hover:text-[#1a1f29] transition-colors w-full text-left justify-start"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    supabase.auth.signOut().then(() => navigate('/'));
                  }}
                >
                  Log out
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
