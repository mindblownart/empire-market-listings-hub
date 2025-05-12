import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
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
import { MediaUpload } from '@/components/media-uploader';
import DragContext from '@/components/media-uploader/DragContext';
import { MediaFile } from '@/components/media-uploader/types';
import { uploadBusinessMedia } from '@/utils/businessMediaUpload';

// Define interface for the listing data to handle primary_image_index
interface ListingData {
  business_name: string;
  category: string;
  location: string;
  year_established?: number;
  employees?: string;
  asking_price: string;
  annual_revenue: string;
  annual_profit: string;
  currency_code: string;
  description?: string;
  highlights?: string[];
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_role?: string;
  gallery_images?: string[];
  video_url?: string;
  primary_image_index?: number;
  user_id: string;
  id?: string;
  created_at?: string;
  updated_at?: string;
  status?: string;
  [key: string]: any; // For any other properties we might encounter
}

const EditListing = () => {
  const { id } = useParams<{ id: string; }>();
  const navigate = useNavigate();
  const { formData, updateFormData, resetFormData } = useFormData();
  const { validationErrors, validateField } = useFormValidation();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [originalListing, setOriginalListing] = useState<ListingData | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false); // Add flag to track if data has been loaded
  
  // Check for returning from preview
  useEffect(() => {
    if (isLoading || !id || dataLoaded) return;
    
    // When returning from preview, check if we have last saved form data
    const checkForReturningFromPreview = () => {
      const lastSavedFormData = sessionStorage.getItem('lastSavedFormData');
      const lastSavedImageOrdering = sessionStorage.getItem('lastSavedImageOrdering');
      
      if (lastSavedFormData) {
        try {
          // Parse the saved form data
          const parsedData = JSON.parse(lastSavedFormData);
          console.log("Loading last saved form data:", parsedData);
          
          // Update form data with last saved values
          updateFormData(parsedData);
          
          // Load the last saved image ordering if available
          if (lastSavedImageOrdering) {
            try {
              const orderedImages = JSON.parse(lastSavedImageOrdering);
              if (Array.isArray(orderedImages) && orderedImages.length > 0) {
                setImageUrls(orderedImages);
                console.log("Restored image ordering from last saved state:", orderedImages);
              }
            } catch (error) {
              console.error("Error parsing saved image ordering:", error);
            }
          }
          
          return true;
        } catch (error) {
          console.error("Error parsing saved form data:", error);
        }
      }
      
      return false;
    };
    
    const wasReturningFromPreview = checkForReturningFromPreview();
    if (wasReturningFromPreview) {
      console.log("Successfully restored form state from preview return");
    }
  }, [isLoading, id, updateFormData, dataLoaded]);

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
      
      // Check if we're returning from preview first
      const lastSavedFormData = sessionStorage.getItem('lastSavedFormData');
      const lastSavedImageOrdering = sessionStorage.getItem('lastSavedImageOrdering');
      
      if (lastSavedFormData && lastSavedImageOrdering) {
        try {
          // Parse the saved form data
          const parsedData = JSON.parse(lastSavedFormData);
          
          // Update form data with last saved values
          updateFormData(parsedData);
          
          // Load the last saved image ordering
          const orderedImages = JSON.parse(lastSavedImageOrdering);
          if (Array.isArray(orderedImages) && orderedImages.length > 0) {
            setImageUrls(orderedImages);
            console.log("Loaded image ordering from session:", orderedImages);
          }
        } catch (error) {
          console.error("Error parsing saved data:", error);
          // Continue with normal fetching
        }
      }
      
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
      const typedListing = listing as unknown as ListingData;
      setOriginalListing(typedListing);

      // Only set image URLs and form data if we didn't already load them from session storage
      // This prevents overwriting user edits when the component reloads
      if (!lastSavedFormData || !lastSavedImageOrdering) {
        // Store image URLs separately and process primary image
        if (typedListing.gallery_images && Array.isArray(typedListing.gallery_images)) {
          let imageArray = [...typedListing.gallery_images];
          
          // Ensure primary image is first in the array
          if (typeof typedListing.primary_image_index === 'number' && 
              typedListing.primary_image_index < imageArray.length &&
              typedListing.primary_image_index !== 0) {
            // Move primary image to index 0
            const primaryImage = imageArray[typedListing.primary_image_index];
            imageArray.splice(typedListing.primary_image_index, 1);
            imageArray.unshift(primaryImage);
          }
          
          setImageUrls(imageArray);
        }
        
        // Only update form data if we didn't already load from session storage
        if (!lastSavedFormData) {
          // Format the data for the form
          updateFormData({
            businessName: typedListing.business_name,
            industry: typedListing.category,
            location: typedListing.location,
            yearEstablished: typedListing.year_established?.toString() || '',
            employees: typedListing.employees || '',
            askingPrice: typedListing.asking_price,
            annualRevenue: typedListing.annual_revenue,
            annualProfit: typedListing.annual_profit,
            currencyCode: typedListing.currency_code,
            description: typedListing.description || '',
            highlights: typedListing.highlights || [],
            businessImages: [],  // We'll handle the URLs separately
            businessVideo: null,
            businessVideoUrl: typedListing.video_url || '',
            fullName: typedListing.contact_name || '',
            email: typedListing.contact_email || '',
            phone: typedListing.contact_phone || '',
            role: typedListing.contact_role || '',
            originalValues: {
              askingPrice: typedListing.asking_price,
              annualRevenue: typedListing.annual_revenue,
              annualProfit: typedListing.annual_profit,
              currencyCode: typedListing.currency_code,
            }
          });
        }
      }
      
      setDataLoaded(true); // Mark data as loaded to prevent future overwrites
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
      
      // Validate form data
      const hasValidData = validateForm();
      if (!hasValidData) {
        setIsSaving(false);
        return;
      }

      // Handle new image uploads if there are any
      let updatedImageUrls = [...imageUrls];
      
      if (formData.businessImages && formData.businessImages.length > 0) {
        try {
          const mediaUrls = await uploadBusinessMedia(formData.businessImages);
          
          // Add new uploaded image URLs to the existing ones
          if (mediaUrls.galleryImages && mediaUrls.galleryImages.length > 0) {
            updatedImageUrls = [...updatedImageUrls, ...mediaUrls.galleryImages];
          }
          
          console.log("Updated image URLs:", updatedImageUrls);
        } catch (error) {
          console.error('Error uploading images:', error);
          toast.error("Error uploading images", {
            description: "There was a problem uploading your images. Please try again."
          });
          setIsSaving(false);
          return;
        }
      }
      
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
        // Use the updated image URLs
        gallery_images: updatedImageUrls,
        video_url: formData.businessVideoUrl || null,
        // Primary image is always first
        primary_image_index: 0
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
      
      // Clear session storage data that's no longer needed
      sessionStorage.removeItem('previewFormData');
      sessionStorage.removeItem('lastSavedFormData');
      sessionStorage.removeItem('previewImageUrls');
      sessionStorage.removeItem('previewImageOrdering');
      sessionStorage.removeItem('lastSavedImageOrdering');
      sessionStorage.removeItem('previewVideoUrl');
      localStorage.removeItem('editingListingId');
      
      // Navigate directly to the business detail page instead of the preview page
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

  // Validate the form
  const validateForm = () => {
    // Check required fields
    if (!formData.businessName) {
      toast.error("Business name is required");
      return false;
    }
    if (!formData.industry) {
      toast.error("Industry is required");
      return false;
    }
    if (!formData.location) {
      toast.error("Location is required");
      return false;
    }
    if (!formData.askingPrice) {
      toast.error("Asking price is required");
      return false;
    }
    if (!formData.annualRevenue) {
      toast.error("Annual revenue is required");
      return false;
    }
    if (!formData.annualProfit) {
      toast.error("Annual profit is required");
      return false;
    }
    
    return true;
  };

  // Handle deletion of existing images
  const handleDeleteExistingImage = (index: number) => {
    setImageUrls(prev => {
      const newImageUrls = [...prev];
      newImageUrls.splice(index, 1);
      return newImageUrls;
    });
    
    toast.success("Image deleted", {
      description: "The image has been removed from your listing."
    });
  };
  
  // Handle deletion of existing video
  const handleDeleteExistingVideo = () => {
    updateFormData({ businessVideoUrl: '' });
    toast.success("Video deleted", {
      description: "The video has been removed from your listing."
    });
  };

  // Handle reordering of existing images
  const handleReorderExistingImages = (reorderedImages: string[]) => {
    // Store the reordered images both in state and in sessionStorage
    setImageUrls(reorderedImages);
    
    // Also save the ordering to sessionStorage for preview and persistence
    sessionStorage.setItem('imageOrder', JSON.stringify(reorderedImages));
    sessionStorage.setItem('previewImageOrdering', JSON.stringify(reorderedImages));
    sessionStorage.setItem('lastSavedImageOrdering', JSON.stringify(reorderedImages)); // For returning to form
    
    // First image becomes primary automatically
    if (reorderedImages.length > 0) {
      // Only update the primary image in the backend when saving the form
      console.log("Images reordered with primary:", reorderedImages[0]);
    }
  };

  const handleBackClick = () => {
    navigate(`/business/${id}`);
  };

  const handleRetry = () => {
    fetchListing();
  };

  // Update the preview handler to store data but still navigate back to the business detail page
  const handlePreview = () => {
    // Store the current form data in sessionStorage
    sessionStorage.setItem('previewFormData', JSON.stringify(formData));
    sessionStorage.setItem('lastSavedFormData', JSON.stringify(formData)); 
    
    // Store image URLs and video URL in sessionStorage
    sessionStorage.setItem('previewImageUrls', JSON.stringify(imageUrls));
    sessionStorage.setItem('previewImageOrdering', JSON.stringify(imageUrls));
    sessionStorage.setItem('lastSavedImageOrdering', JSON.stringify(imageUrls)); 
    
    if (formData.businessVideoUrl) {
      sessionStorage.setItem('previewVideoUrl', formData.businessVideoUrl);
    }
    
    // Store the current listing ID in localStorage so the preview page knows which listing we're editing
    if (id) {
      localStorage.setItem('editingListingId', id);
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
                  
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 mb-4">
                      Add photos and videos of your business. The first image will be your primary image
                      shown in search results. You can drag and drop to reorder images.
                    </p>
                    
                    <DragContext>
                      <MediaUpload 
                        existingImages={imageUrls}
                        existingVideoUrl={formData.businessVideoUrl}
                        onImagesChange={(images: MediaFile[]) => updateFormData({ businessImages: images })}
                        onVideoChange={(video: MediaFile | null) => updateFormData({ businessVideo: video })}
                        onVideoUrlChange={(url: string | null) => updateFormData({ businessVideoUrl: url || '' })}
                        maxImages={10}
                        onDeleteExistingImage={handleDeleteExistingImage}
                        onDeleteExistingVideo={handleDeleteExistingVideo}
                        onImagesReorder={handleReorderExistingImages}
                      />
                    </DragContext>
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
