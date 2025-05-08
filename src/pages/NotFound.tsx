
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center bg-gray-50">
        <div className="text-center px-4">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-3xl font-semibold mt-4">Page Not Found</h2>
          <p className="mt-4 text-gray-600 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link to="/">
            <Button className="mt-8 bg-primary hover:bg-primary-light">
              Back to Home
            </Button>
          </Link>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotFound;
