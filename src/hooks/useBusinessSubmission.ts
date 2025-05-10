
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
  const { validationErrors, validateField, validateAllFields } = useFormValidation();
  
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
          is_featured: false,
          // Initialize media fields
          primary_image_url: null,
          gallery_images: null,
          video_url: null
        };
        
        // Handle image uploads if there are any
        if (formData.businessImages && formData.businessImages.length > 0) {
          const mediaUrls = await uploadBusinessMedia(formData.businessImages);
          
          // Add media URLs to business data
          businessData.primary_image_url = mediaUrls.primaryImageUrl;
          businessData.gallery_images = mediaUrls.galleryImages;
          businessData.video_url = formData.businessVideoUrl || null;
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
          navigate(`/listing/${insertedBusiness.id}`);
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
      toast.error("Please fix the errors in the form before submitting.");
      // Focus on the first field with an error
      const firstErrorField = Object.keys(validationErrors).find(
        field => validationErrors[field]
      );
      if (firstErrorField) {
        const element = document.getElementById(`business-${firstErrorField}`);
        if (element) element.focus();
      }
      return false;
    }
  };
  
  return { handleSubmit, isSubmitting, validationErrors, validateField };
};
