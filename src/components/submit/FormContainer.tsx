
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
  isSubmitting: externalIsSubmitting,
  onPreview,
  previewDisabled = false,
  onValidate
}) => {
  const navigate = useNavigate();
  const { formData } = useFormData();
  const { handleSubmit, isSubmitting: hookIsSubmitting, validateAllFields } = useBusinessSubmission();

  // Use external isSubmitting prop if provided, otherwise use the hook's isSubmitting state
  const isSubmitting = externalIsSubmitting !== undefined ? externalIsSubmitting : hookIsSubmitting;

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
      } else {
        console.log("Submitting form data:", formData);
        const result = await handleSubmit(formData);
        if (result) {
          console.log("Form submission successful!");
          // Navigation is now handled in useBusinessSubmission
        } else {
          console.log("Form submission returned false");
        }
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to save changes. Please try again.", {
        description: error instanceof Error ? error.message : "Unknown error",
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
    
    try {
      // Store current form data in sessionStorage to preserve across navigation
      // Remove circular references that can't be serialized
      const safeFormData = {
        ...formData,
        businessImages: undefined,
        businessVideo: null
      };
      
      sessionStorage.setItem('previewFormData', JSON.stringify(safeFormData));
      sessionStorage.setItem('lastSavedFormData', JSON.stringify(safeFormData));
      
      // We'll allow preview without validation
      // but let's show a toast if there are major issues
      if (!formData.businessName || !formData.industry || !formData.location) {
        toast.warning("Your preview is missing important information. Consider adding more details.");
      }
      
      // Save current image ordering for preview consistency
      const imageOrdering = sessionStorage.getItem('imageOrder');
      if (imageOrdering) {
        sessionStorage.setItem('previewImageOrdering', imageOrdering);
        sessionStorage.setItem('lastSavedImageOrdering', imageOrdering);
      }
      
      // Store video URL separately to ensure it's available in preview
      if (formData.businessVideoUrl) {
        sessionStorage.setItem('previewVideoUrl', formData.businessVideoUrl);
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
          disabled={previewDisabled || isSubmitting}
        >
          <Eye className="h-5 w-5" /> Preview
        </Button>
        <Button 
          type="submit" 
          className="bg-primary hover:bg-primary-light px-10 py-6 text-lg transition-all focus:ring-2 focus:ring-primary focus:ring-offset-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </div>
          ) : (
            submitLabel || 'Submit Business Listing'
          )}
        </Button>
      </div>
    </form>
  );
};

export default FormContainer;
