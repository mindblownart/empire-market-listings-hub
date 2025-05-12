
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Define a Favorite type
interface Favorite {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
}

export const useFavorites = (userId?: string) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    
    const fetchFavorites = async () => {
      setIsLoading(true);
      try {
        // Using a more generic approach with any to avoid type errors
        const { data, error } = await supabase
          .from('favorites')
          .select('listing_id')
          .eq('user_id', userId);
          
        if (error) throw error;
        
        setFavorites(data?.map((item: any) => item.listing_id) || []);
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFavorites();
    
    // Set up realtime subscription for favorites
    const channel = supabase
      .channel('public:favorites')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'favorites',
          filter: `user_id=eq.${userId}` 
        },
        () => {
          fetchFavorites();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);
  
  const toggleFavorite = async (listingId: string) => {
    if (!userId) return false;
    
    const isFavorite = favorites.includes(listingId);
    
    try {
      if (isFavorite) {
        // Remove from favorites using a more generic approach
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userId)
          .eq('listing_id', listingId);
          
        setFavorites(favorites.filter(id => id !== listingId));
      } else {
        // Add to favorites using a more generic approach
        await supabase
          .from('favorites')
          .insert({
            user_id: userId,
            listing_id: listingId
          });
          
        setFavorites([...favorites, listingId]);
      }
      
      return true;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return false;
    }
  };
  
  return {
    favorites,
    toggleFavorite,
    isLoading,
    isFavorite: (listingId: string) => favorites.includes(listingId)
  };
};
