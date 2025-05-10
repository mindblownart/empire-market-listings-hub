
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { toast } from "sonner";
import { supabase } from '@/lib/supabase';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BusinessMediaUploader from '@/components/media-uploader';
import { useFormData } from '@/contexts/FormDataContext';
import BusinessDetails from './BusinessDetails';
import FinancialDetails from './FinancialDetails';
import BusinessDescription from './BusinessDescription';
import BusinessHighlights from './BusinessHighlights';
import ContactInformation from './ContactInformation';
import { BusinessListing } from '@/types/supabase';

const Submit = () => {
  const navigate = useNavigate();
  const { formData, updateFormData } = useFormData();
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check if the user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        // User is not logged in, redirect to login page with return path
        navigate('/login', { state: { redirect: '/submit' } });
      } else {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  // Validate a single field
  const validateField = (field: string, value: any) => {
    let error = '';
    
    switch (field) {
      case 'businessName':
        if (!value.trim()) error = 'Business name is required';
        break;
      case 'industry':
        if (!value) error = 'Industry is required';
        break;
      case 'location':
        if (!value) error = 'Location is required';
        break;
      case 'askingPrice':
      case 'annualRevenue':
      case 'annualProfit':
        if (value && !/^[0-9]+(\.[0-9]{1,2})?$/.test(value)) {
          error = 'Please enter a valid number (e.g., 1000 or 1000.50)';
        }
        break;
      case 'yearEstablished':
        // For yearEstablished dropdown
        if (!value) {
          error = 'Please select a year';
        }
        break;
      case 'employees':
        // For employees dropdown
        if (!value) {
          error = 'Please select employee count';
        }
        break; 
      case 'description':
        if (value && value.trim().length < 10) {
          error = 'Description must be at least 10 characters long';
        }
        break;
      default:
        break;
    }
    
    setValidationErrors(prev => ({
      ...prev,
      [field]: error
    }));
    
    return !error;
  };

  // Validate all fields before submission
  const validateAllFields = () => {
    const fields = [
      { name: 'businessName', value: formData.businessName },
      { name: 'industry', value: formData.industry },
      { name: 'location', value: formData.location },
      { name: 'askingPrice', value: formData.askingPrice },
      { name: 'annualRevenue', value: formData.annualRevenue },
      { name: 'annualProfit', value: formData.annualProfit },
      { name: 'description', value: formData.description },
      { name: 'yearEstablished', value: formData.yearEstablished },
      { name: 'employees', value: formData.employees }
    ];
    
    let isValid = true;
    
    fields.forEach(field => {
      if (!validateField(field.name, field.value)) {
        isValid = false;
      }
    });
    
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateAllFields()) {
      setIsSubmitting(true);
      
      try {
        // Get the current user
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast.error("You must be logged in to submit a business listing");
          navigate('/login', { state: { redirect: '/submit' } });
          return;
        }
        
        // Prepare business listing data with proper type conversions
        const businessData = {
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
          is_published: true,
          is_new: true,
          is_hot: false,
          is_featured: false
        };
        
        // Handle image uploads if there are any
        let primaryImageUrl = '';
        let galleryImages: string[] = [];
        
        if (formData.businessImages && formData.businessImages.length > 0) {
          // Upload the first image as the primary image
          const primaryImage = formData.businessImages[0];
          const primaryImageFileName = `${Date.now()}_${primaryImage.name}`;
          
          const { data: primaryImageData, error: primaryImageError } = await supabase.storage
            .from('business_media')
            .upload(primaryImageFileName, primaryImage);
            
          if (primaryImageError) {
            console.error('Error uploading primary image:', primaryImageError);
            toast.error("There was an error uploading your primary image.");
          } else {
            // Get the public URL of the uploaded image
            const { data: publicUrlData } = supabase.storage
              .from('business_media')
              .getPublicUrl(primaryImageFileName);
              
            primaryImageUrl = publicUrlData.publicUrl;
            
            // Upload any additional images
            if (formData.businessImages.length > 1) {
              const additionalImages = formData.businessImages.slice(1);
              const imageUploadPromises = additionalImages.map(async (image, index) => {
                const fileName = `${Date.now()}_${index}_${image.name}`;
                
                const { data, error } = await supabase.storage
                  .from('business_media')
                  .upload(fileName, image);
                  
                if (error) {
                  console.error(`Error uploading image ${index}:`, error);
                  return null;
                }
                
                const { data: urlData } = supabase.storage
                  .from('business_media')
                  .getPublicUrl(fileName);
                  
                return urlData.publicUrl;
              });
              
              const uploadedImageUrls = await Promise.all(imageUploadPromises);
              galleryImages = uploadedImageUrls.filter(url => url !== null) as string[];
            }
          }
        }
        
        // Add media URLs to business data
        businessData.primary_image_url = primaryImageUrl || null;
        businessData.gallery_images = galleryImages.length > 0 ? galleryImages : null;
        businessData.video_url = formData.businessVideoUrl || null;
        
        console.log("Submitting business data:", businessData);
        
        // Insert the business listing into the database
        const { data: insertedBusiness, error: insertError } = await supabase
          .from('business_listings')
          .insert(businessData)
          .select()
          .single();
          
        if (insertError) {
          console.error('Error inserting business listing:', insertError);
          toast.error(`Error: ${insertError.message || "There was an error submitting your business listing."}`);
        } else {
          toast.success("Business listing submitted successfully!");
          navigate(`/listing/${insertedBusiness.id}`);
        }
      } catch (error) {
        console.error('Error submitting business listing:', error);
        toast.error("There was an unexpected error. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      toast.error("Please fix the errors in the form before submitting.");
      // Focus on the first field with an error
      const firstErrorField = Object.keys(validationErrors).find(
        field => validationErrors[field]
      );
      if (firstErrorField) {
        const element = document.getElementById(`business-${firstErrorField}`);
        if (element) element.focus();
      }
    }
  };

  // Handle preview click
  const handlePreview = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // We'll allow preview without validation
    // but let's show a toast if there are major issues
    if (!formData.businessName || !formData.industry || !formData.location) {
      toast.warning("Your preview is missing important information. Consider adding more details.");
    }
    
    navigate('/preview-listing');
  };

  // If still checking authentication status, show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold mb-6 text-center">Submit Your Business</h1>
          <p className="text-gray-600 mb-10 text-center max-w-2xl mx-auto">
            List your business on EmpireMarket to reach qualified buyers and simplify your business sale journey.
          </p>
          
          <div className="bg-white rounded-xl shadow-md p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
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
                  initialVideo={formData.businessVideo}
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

              <div className="pt-4 flex justify-center gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="px-10 py-6 text-lg flex items-center gap-2 transition-all hover:bg-gray-100" 
                  onClick={handlePreview}
                >
                  <Eye className="h-5 w-5" /> Preview
                </Button>
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-primary-light px-10 py-6 text-lg transition-all focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Business Listing'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Submit;
