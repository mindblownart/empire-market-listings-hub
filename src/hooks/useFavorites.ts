
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const useFavorites = (userId?: string) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, needsLogin: true };
    }
    
    try {
      const isFavorited = favorites.includes(listingId);
      
      if (isFavorited) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listingId);
          
        if (error) throw error;
        
        // Optimistically update the UI
        setFavorites(favorites.filter(id => id !== listingId));
        
        toast({
          title: "Removed from favorites",
          description: "Listing removed from your saved items",
        });
        
        return { success: true, isFavorited: false, needsLogin: false };
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            listing_id: listingId
          });
          
        if (error) throw error;
        
        // Optimistically update the UI
        setFavorites([...favorites, listingId]);
        
        toast({
          title: "Saved to favorites",
          description: "Listing added to your favorites",
        });
        
        return { success: true, isFavorited: true, needsLogin: false };
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again later",
        variant: "destructive",
      });
      return { success: false, needsLogin: false };
    }
  };
  
  return {
    favorites,
    toggleFavorite,
    isLoading,
    isFavorite: (listingId: string) => favorites.includes(listingId)
  };
};
