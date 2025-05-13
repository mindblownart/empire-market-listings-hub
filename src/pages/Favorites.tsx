
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import BusinessCard from '@/components/BusinessCard';
import { BusinessListing } from '@/types/supabase';
import { useFavorites } from '@/hooks/useFavorites';
import Navbar from '@/components/Navbar';
import { HomeFooter } from '@/components/HomeFooter';
import { Badge } from '@/components/ui/badge';
import { Heart } from 'lucide-react';

const Favorites = () => {
  const [user, setUser] = useState<any>(null);
  const [favoriteListings, setFavoriteListings] = useState<BusinessListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Use our custom hook to get and manage favorites
  const { favorites, isLoading: favoritesLoading } = useFavorites(user?.id);

  // Check if user is authenticated
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate('/login', { state: { redirect: '/favorites' } });
        return;
      }
      
      setUser(data.session.user);
    };
    
    checkUser();
  }, [navigate]);

  // Fetch favorite listings whenever favorites list changes
  useEffect(() => {
    const fetchFavoriteListings = async () => {
      if (!user || !favorites.length) {
        setFavoriteListings([]);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('business_listings')
          .select('*')
          .in('id', favorites)
          .eq('is_published', true);
          
        if (error) {
          console.error('Error fetching favorite listings:', error);
          throw error;
        }
        
        setFavoriteListings(data || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (!favoritesLoading && user) {
      fetchFavoriteListings();
    }
  }, [favorites, user, favoritesLoading]);

  // Handle listing refresh after removing a favorite
  const handleListingUpdate = () => {
    // The useFavorites hook will handle the state update automatically
    // through the realtime subscription, so we don't need to do anything here
  };

  // Empty state message when no favorites
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <Heart className="h-16 w-16 text-gray-300 mb-4" />
      <h3 className="text-xl font-medium text-gray-800 mb-2">You haven't saved any businesses yet.</h3>
      <p className="text-gray-600">Click the ♡ icon to favorite listings!</p>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16 px-4 md:px-8">
        <div className="container mx-auto">
          <div className="flex flex-col items-start mb-8">
            <h1 className="text-3xl font-bold text-[#2F3542]">💛 Your Saved Businesses</h1>
            <p className="text-gray-600 mt-2">
              You have saved {favoriteListings.length} {favoriteListings.length === 1 ? 'business' : 'businesses'}.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : favoriteListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteListings.map((listing) => (
                <BusinessCard
                  key={listing.id}
                  id={listing.id}
                  title={listing.business_name}
                  price={listing.asking_price}
                  description={listing.description || ''}
                  category={listing.category}
                  location={listing.location}
                  revenue={listing.annual_revenue}
                  imageUrl={listing.primary_image_url || '/placeholder.svg'}
                  currencyCode={listing.currency_code}
                  isNew={listing.is_new}
                  isHot={listing.is_hot}
                  isOwnListing={listing.user_id === user?.id}
                  userId={user?.id}
                  onDelete={handleListingUpdate}
                />
              ))}
            </div>
          ) : (
            renderEmptyState()
          )}
        </div>
      </main>
      
      <HomeFooter />
    </div>
  );
};

export default Favorites;
