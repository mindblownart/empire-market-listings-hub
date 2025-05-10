import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BusinessMediaUploader from '@/components/media-uploader';
import { useFormData } from '@/contexts/FormDataContext';
import AuthCheck from '@/components/auth/AuthCheck';
import FormContainer from '@/components/submit/FormContainer';
import BusinessDetails from './submit/BusinessDetails';
import FinancialDetails from './submit/FinancialDetails';
import BusinessDescription from './submit/BusinessDescription';
import BusinessHighlights from './submit/BusinessHighlights';
import ContactInformation from './submit/ContactInformation';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFormValidation } from '@/hooks/useFormValidation';

const EditListing = () => {
  const { id } = useParams<{ id: string; }>();
  const navigate = useNavigate();
  const { formData, updateFormData, resetFormData } = useFormData();
  const { validationErrors, validateField } = useFormValidation();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [originalListing, setOriginalListing] = useState<any>(null);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);

  // Fetch the listing data
  const fetchListing = async () => {
    if (!id) {
      setError('No listing ID provided');
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Verify user has permission to edit this listing
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast.error("Authentication required", {
          description: "Please log in to edit listings.",
        });
        navigate('/login');
        return;
      }
      
      console.log("Fetching listing with ID:", id);
      
      // Fetch the listing data
      const { data: listing, error } = await supabase
        .from('business_listings')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching listing:', error);
        setError(`Error fetching listing: ${error.message}`);
        setIsLoading(false);
        return;
      }
      
      console.log("Listing data retrieved:", listing);
      
      if (!listing) {
        setError('Listing not found');
        setIsLoading(false);
        return;
      }
      
      // Check if the current user is the owner
      if (listing.user_id !== session.user.id) {
        toast.error("Access denied", {
          description: "You don't have permission to edit this listing.",
        });
        navigate('/listings');
        return;
      }

      // Store the original listing for reference
      setOriginalListing(listing);

      // Store image URLs separately
      if (listing.gallery_images && Array.isArray(listing.gallery_images)) {
        setImageUrls(listing.gallery_images);
        // Check if primary_image_index is set
        if (typeof listing.primary_image_index === 'number') {
          setPrimaryImageIndex(listing.primary_image_index);
        }
      }
      
      // Format the data for the form - use the properties that match BusinessFormData
      updateFormData({
        businessName: listing.business_name,
        industry: listing.category,
        location: listing.location,
        yearEstablished: listing.year_established?.toString() || '',
        employees: listing.employees || '',
        askingPrice: listing.asking_price,
        annualRevenue: listing.annual_revenue,
        annualProfit: listing.annual_profit,
        currencyCode: listing.currency_code,
        description: listing.description || '',
        highlights: listing.highlights || [],
        businessImages: [],  // We'll handle the URLs separately
        businessVideo: null,
        businessVideoUrl: listing.video_url || '',
        fullName: listing.contact_name || '',
        email: listing.contact_email || '',
        phone: listing.contact_phone || '',
        role: listing.contact_role || '',
        originalValues: {
          askingPrice: listing.asking_price,
          annualRevenue: listing.annual_revenue,
          annualProfit: listing.annual_profit,
          currencyCode: listing.currency_code,
        }
      });
      
      setIsLoading(false);
      
    } catch (error) {
      console.error('Error in fetchListing:', error);
      setError('Failed to load listing. Please try again.');
      toast.error("Error loading listing", {
        description: "There was a problem loading this business listing. Please try again."
      });
      setIsLoading(false);
    }
  };

  // Fetch the listing data on mount
  useEffect(() => {
    console.log("EditListing mounted, ID:", id);
    fetchListing();
    
    // Reset form when unmounting
    return () => {
      resetFormData();
    };
  }, [id]);
  
  // Handle form submission
  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      
      // Prepare the update data
      const updateData = {
        business_name: formData.businessName,
        category: formData.industry,
        location: formData.location,
        year_established: formData.yearEstablished ? parseInt(formData.yearEstablished) : null,
        employees: formData.employees || null,
        asking_price: formData.askingPrice,
        annual_revenue: formData.annualRevenue,
        annual_profit: formData.annualProfit,
        currency_code: formData.currencyCode || 'USD',
        description: formData.description || null,
        highlights: formData.highlights && formData.highlights.length > 0 ? formData.highlights : null,
        contact_name: formData.fullName || null,
        contact_email: formData.email || null,
        contact_phone: formData.phone || null,
        contact_role: formData.role || null,
        updated_at: new Date().toISOString(),
        // Keep the existing image URLs - we're not modifying them in this simplified version
        gallery_images: imageUrls,
        video_url: formData.businessVideoUrl || null,
        // Store the primary image index
        primary_image_index: primaryImageIndex
      };
      
      console.log("Updating listing with data:", updateData);
      
      // Update the listing in Supabase
      const { error } = await supabase
        .from('business_listings')
        .update(updateData)
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      toast.success("Listing updated successfully", {
        description: "Your business listing has been updated."
      });
      
      // Navigate back to the listing detail page
      navigate(`/business/${id}`);
    } catch (error) {
      console.error('Error updating listing:', error);
      toast.error("Error updating listing", {
        description: "There was a problem updating your listing. Please try again."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackClick = () => {
    navigate(`/business/${id}`);
  };

  const handleRetry = () => {
    fetchListing();
  };

  // Handle setting primary image
  const handleSetPrimaryImage = (index: number) => {
    if (index >= 0 && index < imageUrls.length) {
      setPrimaryImageIndex(index);
      toast.success("Primary image updated", {
        description: "This image will appear first in your listing."
      });
    }
  };

  // Handle preview click - this function will be passed to FormContainer
  const handlePreview = () => {
    // Store the current listing ID in localStorage so the preview page knows which listing we're editing
    if (id) {
      localStorage.setItem('editingListingId', id);
      
      // Also store image URLs since they're not in formData, including the primary image index
      const imageData = {
        urls: imageUrls,
        primaryIndex: primaryImageIndex
      };
      localStorage.setItem('editingListingImages', JSON.stringify(imageData));
      
      // Store video URL if available
      if (formData.businessVideoUrl) {
        localStorage.setItem('editingListingVideoUrl', formData.businessVideoUrl);
      }
    }
    
    // Navigate to preview
    navigate('/preview-listing');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold">Loading...</h2>
            <p className="mt-2 text-gray-600">Loading your business listing for editing.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-500">Error</h2>
            <p className="mt-2 text-gray-600">{error}</p>
            <div className="flex gap-3 mt-6 justify-center">
              <Button 
                onClick={handleRetry}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" /> Retry
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/listings')}
              >
                Return to Listings
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <AuthCheck>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <div className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <Button 
              variant="ghost" 
              onClick={handleBackClick}
              className="mb-6 flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Listing
            </Button>
            
            <h1 className="text-3xl font-bold mb-6 text-center">Edit Business Listing</h1>
            <p className="text-gray-600 mb-10 text-center max-w-2xl mx-auto">
              Update your business listing details below.
            </p>
            
            <div className="bg-white rounded-xl shadow-md p-8">
              <FormContainer 
                onSubmit={handleSubmit}
                submitLabel={isSaving ? "Saving..." : "Save Changes"}
                isSubmitting={isSaving}
                onPreview={handlePreview}
              >
                <BusinessDetails 
                  formData={formData}
                  updateFormData={updateFormData}
                  validationErrors={validationErrors}
                  validateField={validateField}
                />

                <FinancialDetails 
                  formData={formData}
                  updateFormData={updateFormData}
                  validationErrors={validationErrors}
                  validateField={validateField}
                />

                <BusinessDescription 
                  formData={formData}
                  updateFormData={updateFormData}
                  validationErrors={validationErrors}
                  validateField={validateField}
                />
                
                <BusinessHighlights
                  formData={formData}
                  updateFormData={updateFormData}
                />

                <div className="pt-4 border-t border-gray-100">
                  <h2 className="text-xl font-semibold mb-4">Business Media</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Media Gallery</h3>
                      <p className="mb-4 text-sm text-gray-500">
                        Manage your media gallery below. The primary image is displayed first. 
                        You can change the primary image by clicking "Set Primary" on any image.
                      </p>
                      
                      <BusinessMediaUploader 
                        initialImages={[]}
                        initialVideo={null} 
                        initialVideoUrl={formData.businessVideoUrl}
                        onImagesChange={() => {}} // Disabled for now
                        onVideoChange={(video) => updateFormData({ businessVideo: video })}
                        onVideoUrlChange={(url) => updateFormData({ businessVideoUrl: url })}
                        disableImageUpload={true}
                        galleryImages={imageUrls}
                        onSetPrimaryImage={handleSetPrimaryImage}
                      />
                    </div>
                  </div>
                </div>

                <ContactInformation 
                  formData={formData}
                  updateFormData={updateFormData}
                />
              </FormContainer>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    </AuthCheck>
  );
};

export default EditListing;
