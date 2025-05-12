import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useFormData } from '@/contexts/FormDataContext';
import { useBusinessSubmission } from '@/hooks/useBusinessSubmission';

interface FormContainerProps {
  children: React.ReactNode;
  onSubmit?: () => Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
  onPreview?: () => void; // Custom preview handler
  previewDisabled?: boolean; // New prop to disable preview button
  onValidate?: () => boolean; // New prop for custom validation
}

const FormContainer: React.FC<FormContainerProps> = ({ 
  children, 
  onSubmit,
  submitLabel,
  isSubmitting,
  onPreview,
  previewDisabled = false,
  onValidate
}) => {
  const navigate = useNavigate();
  const { formData } = useFormData();
  const { handleSubmit, isSubmitting: defaultIsSubmitting, validateAllFields } = useBusinessSubmission();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Run custom validation if provided
      if (onValidate && !onValidate()) {
        return;
      }
      
      if (onSubmit) {
        await onSubmit();
        // The navigation will now be handled in the onSubmit function itself
        // We no longer need to navigate here as that's controlled by the parent component
      } else {
        const result = await handleSubmit(formData);
        if (result) {
          // Store data for preview if submission is successful
          sessionStorage.setItem('previewFormData', JSON.stringify({
            ...formData,
            // Remove circular references that can't be serialized
            businessImages: undefined,
            businessVideo: null
          }));
          sessionStorage.setItem('lastSavedFormData', JSON.stringify({
            ...formData,
            // Remove circular references that can't be serialized
            businessImages: undefined,
            businessVideo: null
          }));
          
          // Navigation to preview is now handled in useBusinessSubmission
        }
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to save changes. Please try again.", {
        style: {
          border: '1px solid #f87171',
          borderRadius: '0.375rem',
          background: '#fff',
          color: '#ef4444',
        },
      });
    }
  };

  // Handle preview click - ensure all form data is captured before navigating
  const handlePreview = (e: React.MouseEvent) => {
    e.preventDefault();
    
    try {
      console.log("Starting preview preparation...");
      
      // Run validation if onValidate is provided
      if (onValidate && !onValidate()) {
        return;
      }
      
      // Run default validation for required fields
      if (!validateAllFields(formData)) {
        toast.error("Please complete all required fields before previewing.", {
          style: {
            border: '1px solid #f87171',
            borderRadius: '0.375rem',
            background: '#fff',
            color: '#ef4444',
          },
        });
        return;
      }
      
      // FIXED: JSON serialization issue with File objects
      // Create a safe version of form data without circular references
      const safeFormData = {
        ...formData,
        businessImages: undefined,
        businessVideo: null,
        // Keep other properties intact
        businessName: formData.businessName,
        industry: formData.industry,
        location: formData.location,
        askingPrice: formData.askingPrice,
        annualRevenue: formData.annualRevenue,
        annualProfit: formData.annualProfit,
        description: formData.description,
        highlights: formData.highlights,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        yearEstablished: formData.yearEstablished,
        employees: formData.employees,
        locationName: formData.locationName,
        flagCode: formData.flagCode,
        currencyCode: formData.currencyCode
      };
      
      console.log("Prepared safe form data for storage:", safeFormData);
      
      // Store the safe form data
      try {
        sessionStorage.setItem('previewFormData', JSON.stringify(safeFormData));
        sessionStorage.setItem('lastSavedFormData', JSON.stringify(safeFormData));
        console.log("Successfully stored form data in session storage");
      } catch (serializeError) {
        console.error("Error serializing form data:", serializeError);
        toast.error("Error preparing preview data");
        return;
      }
      
      // Save current image ordering for preview consistency
      const imageOrdering = sessionStorage.getItem('imageOrder');
      console.log("Image ordering from session:", imageOrdering);
      
      if (imageOrdering) {
        sessionStorage.setItem('previewImageOrdering', imageOrdering);
        sessionStorage.setItem('lastSavedImageOrdering', imageOrdering);
        console.log("Image ordering saved for preview:", imageOrdering);
      }
      
      // FIXED: Ensure video URL is properly handled
      // Critical fix: Ensure video URL always gets saved to session storage for preview
      if (formData.businessVideoUrl && formData.businessVideoUrl.trim() !== '') {
        try {
          console.log("Storing video URL in session storage:", formData.businessVideoUrl);
          sessionStorage.setItem('previewVideoUrl', formData.businessVideoUrl);
          console.log("Video URL saved for preview:", formData.businessVideoUrl);
        } catch (videoError) {
          console.error("Error storing video URL:", videoError);
        }
      } else {
        // Ensure we clear any previous video URL if none exists now
        console.log("No video URL found, clearing from session storage");
        sessionStorage.removeItem('previewVideoUrl');
      }
      
      // Use custom preview handler if provided, otherwise use default behavior
      if (onPreview) {
        onPreview();
      } else {
        navigate('/preview-listing');
      }
    } catch (error) {
      console.error("Error preparing preview data:", error);
      toast.error("Unable to create preview. Please try again.", {
        description: "There was an error processing your form data for preview."
      });
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleFormSubmit}>
      {children}

      <div className="pt-4 flex justify-center gap-4">
        <Button 
          type="button" 
          variant="outline" 
          className="px-10 py-6 text-lg flex items-center gap-2 transition-all hover:bg-gray-100" 
          onClick={handlePreview}
          disabled={previewDisabled}
        >
          <Eye className="h-5 w-5" /> Preview
        </Button>
        <Button 
          type="submit" 
          className="bg-primary hover:bg-primary-light px-10 py-6 text-lg transition-all focus:ring-2 focus:ring-primary focus:ring-offset-2"
          disabled={isSubmitting !== undefined ? isSubmitting : defaultIsSubmitting}
        >
          {submitLabel || (isSubmitting !== undefined ? (isSubmitting ? 'Submitting...' : 'Submit') : (defaultIsSubmitting ? 'Submitting...' : 'Submit Business Listing'))}
        </Button>
      </div>
    </form>
  );
};

export default FormContainer;
