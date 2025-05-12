import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { BusinessHeader, BusinessOverview, BusinessDetails, MediaGallery, ContactInformation } from '@/components/preview';
import { ChevronLeft, Edit, Trash2, Briefcase } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { BusinessListing } from '@/types/supabase';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const ListingDetail = () => {
  const { id } = useParams<{ id: string; }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCurrentUserOwner, setIsCurrentUserOwner] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
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

  // Handle delete listing
  const handleDelete = async () => {
    if (!id) return;
    
    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from('business_listings')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Listing deleted successfully",
        description: "Your business listing has been removed.",
        variant: "default",
      });
      
      navigate('/listings');
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast({
        title: "Error deleting listing",
        description: "There was a problem deleting your listing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

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
  }

  // Show not found state if no business was found
  if (!business) {
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
  }

  // Use primary_image_url as the hero image
  // If it's not available, don't try to use the first gallery image
  const heroImage = business.primary_image_url;
  const hasVideo = !!business.video_url;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-20 px-4 pb-12">
        <div className="container mx-auto max-w-7xl">
          {/* Back Button - Now positioned above all other elements */}
          <div className="mb-4">
            <Link to="/listings" className="flex items-center text-gray-600 hover:text-primary transition-colors">
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span>Back to Listings</span>
            </Link>
          </div>
          
          {/* Header Row with Title and Action Buttons aligned horizontally */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            {/* Business Overview Heading - Left aligned */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center mb-4 sm:mb-0">
              <Briefcase className="h-6 w-6 mr-2 text-primary" />
              Business Overview
            </h1>
            
            {/* Owner Actions - Right aligned */}
            {isCurrentUserOwner && (
              <div className="flex gap-3 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => navigate(`/edit-listing/${id}`)}
                >
                  <Edit className="h-4 w-4" />
                  Edit Listing
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Listing
                </Button>
              </div>
            )}
          </div>
          
          {/* 1. Hero Section with Business Header and Asking Price */}
          <div className="mb-6">
            <BusinessHeader 
              businessName={business.business_name} 
              industry={business.category} 
              location={business.location} 
              flagCode={business.location === "Singapore" ? "SG" : "GL"} 
              primaryImage={heroImage} 
              askingPrice={business.asking_price} 
              currencyCode={business.currency_code} 
            />
          </div>
          
          {/* Revised layout with 2 columns starting right below the hero */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Media Gallery and Business Overview */}
            <div className="lg:col-span-2 space-y-6">
              {/* Media Gallery exactly aligned with Business Overview */}
              <MediaGallery 
                galleryImages={business.gallery_images || []} 
                videoURL={business.video_url || undefined} 
                autoplayVideo={true} 
                skipPrimaryImage={true} // Skip primary image since it's shown in hero
              />
              
              {/* Business Overview & Highlights */}
              <BusinessOverview 
                askingPrice={business.asking_price}
                annualRevenue={business.annual_revenue}
                annualProfit={business.annual_profit}
                currencyCode={business.currency_code}
                description={business.description || ''} 
                highlights={business.highlights || []} 
              />
            </div>
            
            {/* Right Column - Business Details & Contact Information */}
            <div className="space-y-6">
              <BusinessDetails 
                annualRevenue={business.annual_revenue} 
                annualProfit={business.annual_profit} 
                currencyCode={business.currency_code} 
                location={business.location} 
                industry={business.category} 
                yearEstablished={business.year_established?.toString() || 'N/A'} 
                employees={business.employees || 'N/A'} 
              />
              
              <ContactInformation 
                contactName={business.contact_name || 'Contact not provided'} 
                contactEmail={business.contact_email || 'Email not provided'} 
                contactPhone={business.contact_phone || 'Phone not provided'} 
                contactRole={business.contact_role || 'Role not specified'} 
              />
              
              {/* Contact Seller Button */}
              <Button className="w-full bg-[#9b87f5] hover:bg-[#8673e0] py-6 h-auto text-white text-lg font-medium">
                Contact Seller
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this listing?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your business listing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ListingDetail;
