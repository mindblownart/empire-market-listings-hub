
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
import { useBusinessSubmission } from '@/hooks/useBusinessSubmission';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EditListing = () => {
  const { id } = useParams<{ id: string; }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { formData, updateFormData, resetFormData } = useFormData();
  const { validationErrors, validateField } = useBusinessSubmission();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch the listing data
  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        
        // Verify user has permission to edit this listing
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          toast({
            title: "Authentication required",
            description: "Please log in to edit listings.",
            variant: "destructive",
          });
          navigate('/login');
          return;
        }
        
        // Fetch the listing data
        const { data: listing, error } = await supabase
          .from('business_listings')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          throw error;
        }
        
        // Check if the current user is the owner
        if (listing.user_id !== session.user.id) {
          toast({
            title: "Access denied",
            description: "You don't have permission to edit this listing.",
            variant: "destructive",
          });
          navigate('/listings');
          return;
        }
        
        // Format the data for the form
        updateFormData({
          businessName: listing.business_name,
          category: listing.category,
          location: listing.location,
          yearEstablished: listing.year_established?.toString() || '',
          employees: listing.employees || '',
          askingPrice: listing.asking_price,
          annualRevenue: listing.annual_revenue,
          annualProfit: listing.annual_profit,
          currencyCode: listing.currency_code,
          businessDescription: listing.description || '',
          businessHighlights: listing.highlights || [],
          businessImages: listing.gallery_images || [],
          primaryImageUrl: listing.primary_image_url || '',
          businessVideoUrl: listing.video_url || '',
          contactName: listing.contact_name || '',
          contactEmail: listing.contact_email || '',
          contactPhone: listing.contact_phone || '',
          contactRole: listing.contact_role || '',
        });
      } catch (error) {
        console.error('Error fetching listing:', error);
        setError('Failed to load listing. Please try again.');
        toast({
          title: "Error loading listing",
          description: "There was a problem loading this business listing. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchListing();
    
    // Reset form when unmounting
    return () => {
      resetFormData();
    };
  }, [id, navigate, toast, updateFormData, resetFormData]);
  
  // Handle form submission
  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      
      // Prepare the update data
      const updateData = {
        business_name: formData.businessName,
        category: formData.category,
        location: formData.location,
        year_established: formData.yearEstablished ? parseInt(formData.yearEstablished) : null,
        employees: formData.employees,
        asking_price: formData.askingPrice,
        annual_revenue: formData.annualRevenue,
        annual_profit: formData.annualProfit,
        currency_code: formData.currencyCode,
        description: formData.businessDescription,
        highlights: formData.businessHighlights,
        gallery_images: formData.businessImages,
        primary_image_url: formData.primaryImageUrl,
        video_url: formData.businessVideoUrl,
        contact_name: formData.contactName,
        contact_email: formData.contactEmail,
        contact_phone: formData.contactPhone,
        contact_role: formData.contactRole,
        updated_at: new Date().toISOString(),
      };
      
      // Update the listing in Supabase
      const { error } = await supabase
        .from('business_listings')
        .update(updateData)
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Listing updated successfully",
        description: "Your business listing has been updated.",
        variant: "default",
      });
      
      // Navigate back to the listing detail page
      navigate(`/business/${id}`);
    } catch (error) {
      console.error('Error updating listing:', error);
      toast({
        title: "Error updating listing",
        description: "There was a problem updating your listing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
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
            <Button 
              className="mt-6" 
              onClick={() => navigate('/listings')}
            >
              Return to Listings
            </Button>
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
            <h1 className="text-3xl font-bold mb-6 text-center">Edit Business Listing</h1>
            <p className="text-gray-600 mb-10 text-center max-w-2xl mx-auto">
              Update your business listing details below.
            </p>
            
            <div className="bg-white rounded-xl shadow-md p-8">
              <FormContainer onSubmit={handleSubmit} submitLabel={isSaving ? "Saving..." : "Save Changes"} isSubmitting={isSaving}>
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
                  <BusinessMediaUploader 
                    initialImages={formData.businessImages}
                    initialVideo={null} // We don't have the video file, just the URL
                    initialVideoUrl={formData.businessVideoUrl}
                    onImagesChange={(images) => updateFormData({ businessImages: images })}
                    onVideoChange={(video) => updateFormData({ businessVideo: video })}
                    onVideoUrlChange={(url) => updateFormData({ businessVideoUrl: url })}
                  />
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
