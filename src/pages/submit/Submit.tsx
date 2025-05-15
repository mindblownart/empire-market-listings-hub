
import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useFormData } from '../../contexts/FormDataContext';
import AuthCheck from '../../components/auth/AuthCheck';
import FormContainer from '../../components/submit/FormContainer';
import BusinessDetails from './BusinessDetails';
import FinancialDetails from './FinancialDetails';
import BusinessDescription from './BusinessDescription';
import BusinessHighlights from './BusinessHighlights';
import ContactInformation from './ContactInformation';
import { useBusinessSubmission } from '../../hooks/useBusinessSubmission';
import { MediaUpload } from '../../components/media-uploader';
import DragContext from '../../components/media-uploader/DragContext';
import { MediaFile } from '../../components/media-uploader/types';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { MAX_TOTAL_MEDIA } from '../../components/media-uploader/utils/constants';

const Submit = () => {
  const { formData, updateFormData } = useFormData();
  const { validationErrors, validateField, validateAllFields } = useBusinessSubmission();
  const [formValid, setFormValid] = useState(false);
  
  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        toast.error("You must be logged in to submit a business listing", {
          description: "Please log in to continue",
        });
      }
    };
    
    checkAuth();
  }, []);
  
  // Check for returning from preview
  useEffect(() => {
    // When returning from preview, retrieve stored form and media data
    const previewFormData = sessionStorage.getItem('previewFormData');
    const previewImageOrdering = sessionStorage.getItem('previewImageOrdering');
    const previewVideoUrl = sessionStorage.getItem('previewVideoUrl');
    
    if (previewFormData) {
      try {
        const parsedData = JSON.parse(previewFormData);
        console.log("Retrieved form data from preview:", parsedData);
        // Only update non-file fields from storage
        // Files are handled separately
        updateFormData({
          ...parsedData,
          // Don't override these with null values
          businessImages: formData.businessImages || [],
          businessVideo: formData.businessVideo || null
        });
      } catch (error) {
        console.error("Error parsing preview form data:", error);
      }
    }
    
    if (previewVideoUrl) {
      updateFormData({ businessVideoUrl: previewVideoUrl });
    }
  }, []);
  
  // Handler for reordering images
  const handleImagesReorder = (reorderedImages: string[]) => {
    // Store reordering in sessionStorage for persistence
    sessionStorage.setItem('imageOrder', JSON.stringify(reorderedImages));
    sessionStorage.setItem('previewImageOrdering', JSON.stringify(reorderedImages));
    // Also store for returning to form after preview
    sessionStorage.setItem('lastSavedImageOrdering', JSON.stringify(reorderedImages));
    console.log("Images reordered in Submit component:", reorderedImages);
  };
  
  // Validate that media is provided
  const validateMedia = () => {
    const hasMedia = 
      (formData.businessImages && formData.businessImages.length > 0) ||
      formData.businessVideo !== null || 
      (formData.businessVideoUrl && formData.businessVideoUrl.trim() !== '');
      
    if (!hasMedia) {
      toast.error("At least one image or video is required", {
        description: "Please upload at least one image or video of your business"
      });
      return false;
    }
    
    // Validate total media count
    const totalMediaCount = 
      (formData.businessImages ? formData.businessImages.length : 0) + 
      ((formData.businessVideo || (formData.businessVideoUrl && formData.businessVideoUrl.trim() !== '')) ? 1 : 0);
      
    if (totalMediaCount > MAX_TOTAL_MEDIA) {
      toast.error(`Maximum of ${MAX_TOTAL_MEDIA} media items allowed`, {
        description: `Please reduce the number of media items to ${MAX_TOTAL_MEDIA} or fewer`
      });
      return false;
    }
    
    return true;
  };
  
  // Custom validation function for the form
  const validateForm = () => {
    const fieldsValid = validateAllFields(formData);
    const mediaValid = validateMedia();
    const isValid = fieldsValid && mediaValid;
    setFormValid(isValid);
    return isValid;
  };
  
  return (
    <AuthCheck>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <div className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-3xl font-bold mb-6 text-center">Submit Your Business</h1>
            <p className="text-gray-600 mb-10 text-center max-w-2xl mx-auto">
              List your business on EmpireMarket to reach qualified buyers and simplify your business sale journey.
            </p>
            
            <div className="bg-white rounded-xl shadow-md p-8">
              <FormContainer onValidate={validateForm}>
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
                  <p className="text-sm text-gray-600 mb-4">
                    Add photos and videos of your business. The first image will be your primary image
                    shown in search results. You can drag and drop to reorder images.
                  </p>
                  <DragContext>
                    <MediaUpload 
                      onImagesChange={(images: MediaFile[]) => updateFormData({ businessImages: images })}
                      onVideoChange={(video: MediaFile | null) => updateFormData({ businessVideo: video })}
                      onVideoUrlChange={(url: string | null) => updateFormData({ businessVideoUrl: url || '' })}
                      onImagesReorder={handleImagesReorder}
                      maxImages={MAX_TOTAL_MEDIA - 1} // Reserve 1 slot for video
                      existingImages={[]} // This will be populated from sessionStorage if returning from preview
                      existingVideoUrl={formData.businessVideoUrl} // This will be populated from sessionStorage if returning from preview
                    />
                  </DragContext>
                  {!formValid && (!formData.businessImages || formData.businessImages.length === 0) && !formData.businessVideoUrl && (
                    <p className="text-sm font-medium text-red-500 mt-2">
                      At least one image or video is required
                    </p>
                  )}
                </div>

                <ContactInformation 
                  formData={formData}
                  updateFormData={updateFormData}
                  validationErrors={validationErrors}
                  validateField={validateField}
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

export default Submit;
