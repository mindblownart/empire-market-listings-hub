
import React from 'react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const ListingNotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Listing Not Found</h2>
          <p className="mt-2 text-gray-600">The business listing you're looking for doesn't exist or has been removed.</p>
          <Button className="mt-6 bg-primary hover:bg-primary-light" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
};
