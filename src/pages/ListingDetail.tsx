
import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { BusinessListing } from '@/types/supabase';
import { useToast } from '@/components/ui/use-toast';
import {
  DeleteConfirmationDialog,
  ListingNotFound,
  ListingLoading,
  ListingHeader,
  ListingContent
} from '@/components/listing-detail';

const ListingDetail = () => {
  const { id } = useParams<{ id: string; }>();
  const { toast } = useToast();
  const location = useLocation();
  const [isCurrentUserOwner, setIsCurrentUserOwner] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Log the ID to confirm it's defined
  console.log('Listing ID:', id);

  // Fetch business listing data from Supabase with refetch on mount
  const { data: business, isLoading, error, refetch } = useQuery({
    queryKey: ['business', id],
    queryFn: async () => {
      if (!id) throw new Error('Listing ID is not defined');
      
      const { data, error } = await supabase
        .from('business_listings')
        .select('*')
        .eq('id', id)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching listing:', error);
        throw error;
      }
      
      return data as BusinessListing | null;
    },
    enabled: !!id,
    staleTime: 0, // Always consider the data stale to force refetch
  });

  // Always refetch the data when the component mounts or when returning from editing
  useEffect(() => {
    refetch();
  }, [refetch, location.pathname]);

  // Check if current user is the owner of the listing
  useEffect(() => {
    const checkOwnership = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && business) {
        setIsCurrentUserOwner(session.user.id === business.user_id);
      } else {
        setIsCurrentUserOwner(false);
      }
    };
    
    checkOwnership();
  }, [business]);

  // Show error toast if there was a problem fetching the data
  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading listing",
        description: "There was a problem loading this business listing. Please try again.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Show loading state while fetching data
  if (isLoading) {
    return <ListingLoading />;
  }

  // Show not found state if no business was found
  if (!business) {
    return <ListingNotFound />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-20 px-4 pb-12">
        <div className="container mx-auto max-w-7xl">
          <ListingHeader
            id={id || ''}
            isCurrentUserOwner={isCurrentUserOwner}
            onDeleteClick={() => setIsDeleteDialogOpen(true)}
          />
          
          <ListingContent business={business} />
        </div>
      </main>
      
      <Footer />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        id={id || ''}
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
      />
    </div>
  );
};

export default ListingDetail;
