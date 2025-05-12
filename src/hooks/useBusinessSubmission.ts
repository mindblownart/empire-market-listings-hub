
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useFormValidation } from './useFormValidation';
import { uploadBusinessMedia } from '@/utils/businessMediaUpload';
import { BusinessFormData } from '@/contexts/FormDataContext';

export const useBusinessSubmission = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { validationErrors, validateField, validateAllFields, clearValidationErrors } = useFormValidation();
  
  // Handle form submission
  const handleSubmit = async (formData: BusinessFormData) => {
    if (validateAllFields(formData)) {
      setIsSubmitting(true);
      
      try {
        // Get the current user
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast.error("You must be logged in to submit a business listing");
          navigate('/login', { state: { redirect: '/submit' } });
          return false;
        }
        
        // Get image ordering from session storage if available
        let orderedImages: string[] = [];
        const imageOrdering = sessionStorage.getItem('imageOrder');
        
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
          is_featured: false,
          // Initialize media fields
          primary_image_url: null,
          gallery_images: null,
          video_url: null
        };
        
        // Handle image uploads if there are any
        if (formData.businessImages && formData.businessImages.length > 0) {
          const mediaUrls = await uploadBusinessMedia(formData.businessImages);
          
          // Get the uploaded image URLs
          if (mediaUrls.galleryImages && mediaUrls.galleryImages.length > 0) {
            orderedImages = [...mediaUrls.galleryImages];
            
            // Apply custom ordering if available
            if (imageOrdering) {
              try {
                const orderMap = JSON.parse(imageOrdering);
                if (Array.isArray(orderMap) && orderMap.length > 0) {
                  // Some images might be in the ordering but not in the uploaded images
                  // (e.g. if we're keeping existing images)
                  const existingImages = orderMap.filter(url => 
                    !orderedImages.includes(url) && url.startsWith('http')
                  );
                  
                  // Combine existing and new images
                  orderedImages = [...existingImages, ...orderedImages];
                }
              } catch (error) {
                console.error("Error parsing image ordering:", error);
              }
            }
            
            // Add media URLs to business data
            businessData.primary_image_url = orderedImages[0];
            businessData.gallery_images = orderedImages;
          }
          
          businessData.video_url = formData.businessVideoUrl || null;
        }
        
        // Store final image ordering in session storage
        sessionStorage.setItem('previewImageUrls', JSON.stringify(orderedImages));
        sessionStorage.setItem('previewImageOrdering', JSON.stringify(orderedImages));
        sessionStorage.setItem('lastSavedImageOrdering', JSON.stringify(orderedImages));
        
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
          return false;
        } else {
          toast.success("Business listing submitted successfully!");
          
          // Store updated data for preview consistency
          sessionStorage.setItem('previewFormData', JSON.stringify(formData));
          sessionStorage.setItem('lastSavedFormData', JSON.stringify(formData));
          if (orderedImages.length > 0) {
            sessionStorage.setItem('previewImageUrls', JSON.stringify(orderedImages));
            sessionStorage.setItem('lastSavedImageOrdering', JSON.stringify(orderedImages));
          }
          if (formData.businessVideoUrl) {
            sessionStorage.setItem('previewVideoUrl', formData.businessVideoUrl);
          }
          
          // Navigate to preview instead of the listing page
          navigate('/preview-listing');
          return true;
        }
      } catch (error) {
        console.error('Error submitting business listing:', error);
        toast.error("There was an unexpected error. Please try again.");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    } else {
      toast.error("Please fix the errors in the form before submitting.", {
        style: {
          border: '1px solid #f87171',
          borderRadius: '0.375rem',
          background: '#fff',
          color: '#ef4444',
        },
      });
      
      // Focus on the first field with an error
      const firstErrorField = Object.keys(validationErrors).find(
        field => validationErrors[field]
      );
      
      if (firstErrorField) {
        const elementId = firstErrorField === 'businessName' ? 'business-name' : 
                          `business-${firstErrorField.toLowerCase().replace(/([A-Z])/g, '-$1').toLowerCase()}`;
        const element = document.getElementById(elementId);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.focus();
          }, 100);
        }
      }
      return false;
    }
  };
  
  return { 
    handleSubmit, 
    isSubmitting, 
    validationErrors, 
    validateField, 
    validateAllFields, 
    clearValidationErrors 
  };
};
