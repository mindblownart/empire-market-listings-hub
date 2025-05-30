
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useFormValidation } from './useFormValidation';
import { uploadBusinessMedia } from '../utils/businessMediaUpload';
import { BusinessFormData } from '../contexts/FormDataContext';

export const useBusinessSubmission = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { validationErrors, validateField, validateAllFields, clearValidationErrors } = useFormValidation();
  
  // Validate that at least one image is uploaded
  const validateMedia = (formData: BusinessFormData): boolean => {
    const hasImages = formData.businessImages && formData.businessImages.length > 0;
    const hasVideo = formData.businessVideo !== null || (formData.businessVideoUrl && formData.businessVideoUrl.trim() !== '');
    
    if (!hasImages && !hasVideo) {
      toast.error("At least one image or video is required");
      return false;
    }
    
    return true;
  };
  
  // Handle form submission
  const handleSubmit = async (formData: BusinessFormData) => {
    if (!validateAllFields(formData) || !validateMedia(formData)) {
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
    
    // Prevent double submission
    if (isSubmitting) {
      return false;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error("Authentication error:", userError);
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
        user_id: user.id,
        // Initialize media fields
        primary_image_url: null,
        gallery_images: null,
        video_url: null,
        // Add video metadata if available
        video_metadata: formData.businessVideo ? {
          name: formData.businessVideo.name,
          size: formData.businessVideo.size,
          type: formData.businessVideo.type,
        } : null
      };
      
      // Handle image uploads if there are any
      if (formData.businessImages && formData.businessImages.length > 0) {
        console.log("Uploading business media...");
        try {
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
          } else {
            toast.error("Failed to upload images. Please try again.");
            return false;
          }
        } catch (uploadError) {
          console.error("Error uploading media:", uploadError);
          toast.error("Failed to upload media files. Please try again.");
          return false;
        }
      }
      
      // Handle video URL or file
      if (formData.businessVideo) {
        try {
          // Wait until video is processed and uploaded
          const videoUpload = await uploadBusinessMedia([formData.businessVideo], true);
          if (videoUpload.videoUrl) {
            businessData.video_url = videoUpload.videoUrl;
          }
        } catch (videoError) {
          console.error("Error uploading video:", videoError);
          toast.error("Video upload failed. Please try again with a different file or use a video URL instead.");
          setIsSubmitting(false);
          return false;
        }
      } else if (formData.businessVideoUrl) {
        // Use the provided video URL directly
        businessData.video_url = formData.businessVideoUrl;
      }
      
      // Store final image ordering in session storage
      if (orderedImages.length > 0) {
        sessionStorage.setItem('previewImageUrls', JSON.stringify(orderedImages));
        sessionStorage.setItem('previewImageOrdering', JSON.stringify(orderedImages));
        sessionStorage.setItem('lastSavedImageOrdering', JSON.stringify(orderedImages));
      }
      
      // Store video URL in session storage
      if (businessData.video_url) {
        sessionStorage.setItem('previewVideoUrl', businessData.video_url);
      }
      
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
        if (businessData.video_url) {
          sessionStorage.setItem('previewVideoUrl', businessData.video_url);
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
