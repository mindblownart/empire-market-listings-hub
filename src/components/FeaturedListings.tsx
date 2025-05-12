
import React from 'react';
import { BusinessListing } from '@/types/supabase';
import { Skeleton } from './ui/skeleton';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';

interface FeaturedListingsProps {
  listings: BusinessListing[];
  isLoading: boolean;
  userId?: string;
}

const FeaturedListings: React.FC<FeaturedListingsProps> = ({ listings, isLoading, userId }) => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Featured Business Listings</h2>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {listings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative overflow-hidden">
                  {listing.primary_image_url ? (
                    <img 
                      src={listing.primary_image_url} 
                      alt={listing.business_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">No Image</span>
                    </div>
                  )}
                  {listing.is_hot && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Hot
                    </div>
                  )}
                </div>
                <CardHeader>
                  <h3 className="text-xl font-semibold">{listing.business_name}</h3>
                  <p className="text-gray-500">{listing.location}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg">{listing.asking_price}</span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs">
                      {listing.category}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-600 line-clamp-2">
                    {listing.description || 'No description provided'}
                  </p>
                </CardContent>
                <CardFooter>
                  <Link 
                    to={`/listing/${listing.id}`}
                    className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
                  >
                    View Details
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-lg text-gray-500">No featured listings available at the moment.</p>
          </div>
        )}
        
        <div className="mt-12 text-center">
          <Link 
            to="/listings"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
          >
            View All Listings
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedListings;
