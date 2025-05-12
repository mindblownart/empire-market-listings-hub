
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Favorite } from '@/types/supabase';

export const useFavorites = (userId?: string) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    
    const fetchFavorites = async () => {
      setIsLoading(true);
      try {
        // Using type assertion to bypass TypeScript limitations
        const { data, error } = await supabase
          .from('favorites')
          .select('listing_id')
          .eq('user_id', userId) as any;
          
        if (error) throw error;
        
        // Ensure we have an array of listing_ids
        setFavorites(Array.isArray(data) ? data.map((item: any) => item.listing_id) : []);
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
        // Remove from favorites
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userId)
          .eq('listing_id', listingId) as any;
          
        setFavorites(favorites.filter(id => id !== listingId));
      } else {
        // Add to favorites
        await supabase
          .from('favorites')
          .insert({
            user_id: userId,
            listing_id: listingId
          }) as any;
          
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
