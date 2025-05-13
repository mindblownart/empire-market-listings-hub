
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

export const useFavorites = (userId?: string) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();

  // Fetch user's favorites when component mounts or userId changes
  useEffect(() => {
    if (!userId) return;
    
    const fetchFavorites = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('favorites')
          .select('listing_id')
          .eq('user_id', userId);
          
        if (error) throw error;
        
        console.log('Fetched favorites:', data);
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
      .channel('favorites-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'favorites',
          filter: `user_id=eq.${userId}` 
        },
        (payload) => {
          console.log('Realtime favorites change:', payload);
          
          // Immediate UI update based on the realtime event type
          if (payload.eventType === 'DELETE') {
            // If a favorite was deleted, remove it from the favorites array immediately
            const removedListingId = payload.old?.listing_id;
            if (removedListingId) {
              console.log('Removing listing from favorites:', removedListingId);
              setFavorites(prev => prev.filter(id => id !== removedListingId));
            }
          } else if (payload.eventType === 'INSERT') {
            // If a favorite was added, add it to the favorites array immediately
            const addedListingId = payload.new?.listing_id;
            if (addedListingId) {
              console.log('Adding listing to favorites:', addedListingId);
              setFavorites(prev => [...prev, addedListingId]);
            }
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);
  
  const toggleFavorite = async (listingId: string) => {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, needsLogin: true };
    }
    
    // Set processing state for this specific listing
    setIsProcessing(prev => ({ ...prev, [listingId]: true }));
    
    try {
      const isFavorited = favorites.includes(listingId);
      
      // Optimistically update the UI immediately before the request completes
      if (isFavorited) {
        // Remove from favorites UI immediately
        setFavorites(favorites.filter(id => id !== listingId));
      } else {
        // Add to favorites UI immediately
        setFavorites([...favorites, listingId]);
      }
      
      // Then perform the actual database operation
      if (isFavorited) {
        // Remove from favorites in database
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listingId);
          
        if (error) {
          console.error('Error removing favorite:', error);
          // Revert optimistic update if there was an error
          setFavorites(prev => [...prev, listingId]);
          throw error;
        }
        
        toast({
          title: "Removed from favorites",
          description: "Listing removed from your saved items",
        });
        
        return { success: true, isFavorited: false, needsLogin: false };
      } else {
        // Add to favorites in database
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            listing_id: listingId
          });
          
        if (error) {
          console.error('Error adding favorite:', error);
          // Revert optimistic update if there was an error
          setFavorites(prev => prev.filter(id => id !== listingId));
          throw error;
        }
        
        toast({
          title: "Saved to favorites",
          description: "Listing added to your favorites",
        });
        
        return { success: true, isFavorited: true, needsLogin: false };
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Something went wrong",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
      return { success: false, needsLogin: false };
    } finally {
      // Clear processing state for this listing
      setIsProcessing(prev => ({ ...prev, [listingId]: false }));
    }
  };
  
  return {
    favorites,
    toggleFavorite,
    isLoading,
    isProcessing,
    isFavorite: (listingId: string) => favorites.includes(listingId)
  };
};
