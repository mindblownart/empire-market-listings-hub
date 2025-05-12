
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const ListingLoading: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Loading...</h2>
          <p className="mt-2 text-gray-600">Please wait while we load the business details.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};
