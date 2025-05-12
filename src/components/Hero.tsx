
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';

const Hero = () => {
  return (
    <section className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white py-20">
      <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center">
        <div className="lg:w-1/2 space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Find Your Next Business Opportunity
          </h1>
          <p className="text-lg md:text-xl opacity-90 max-w-lg">
            Browse through hundreds of businesses for sale or list your business to 
            find the perfect buyer on Empire Market.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/listings">
              <Button size="lg" variant="secondary">
                Browse Listings
              </Button>
            </Link>
            <Link to="/submit">
              <Button size="lg">
                Sell Your Business
              </Button>
            </Link>
          </div>
        </div>
        <div className="lg:w-1/2 mt-10 lg:mt-0 flex justify-center">
          <img 
            src="/lovable-uploads/singapore-night-skyline.jpg" 
            alt="Business opportunities" 
            className="rounded-lg shadow-xl max-w-md w-full object-cover h-80"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
