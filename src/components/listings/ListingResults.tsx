
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import BusinessCard from '@/components/BusinessCard';

interface Business {
  id: string;
  title: string;
  price: string;
  description: string;
  category: string;
  location: string;
  revenue: string;
  imageUrl: string;
  currencyCode: string;
  isNew: boolean;
  isHot: boolean;
  isOwnListing: boolean;
  userId: string | undefined;
}

interface ListingResultsProps {
  isLoading: boolean;
  businesses: Business[];
  filteredBusinesses: Business[];
  currentItems: Business[];
  onDeleteBusiness: () => void;
}

const ListingResults: React.FC<ListingResultsProps> = ({ 
  isLoading, 
  businesses, 
  filteredBusinesses,
  currentItems, 
  onDeleteBusiness 
}) => {
  const hasListings = businesses.length > 0;

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading listings...</p>
      </div>
    );
  }

  if (!hasListings) {
    return (
      <div className="text-center py-20 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-xl font-medium text-gray-900 mb-4">No businesses have been listed yet. Be the first to submit yours!</h3>
        <p className="text-gray-600 mb-6 max-w-lg mx-auto">
          Our marketplace is ready for your business listing. Submit your business details to find the right buyer.
        </p>
        <Button asChild className="px-6 py-6 text-lg">
          <Link to="/submit">Submit a Business</Link>
        </Button>
      </div>
    );
  }

  if (currentItems.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
        <p className="text-gray-600">
          No listings match your search. Try adjusting filters or check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {currentItems.map(business => (
        <BusinessCard 
          key={business.id} 
          {...business} 
          onDelete={onDeleteBusiness} 
        />
      ))}
    </div>
  );
};

export default ListingResults;
