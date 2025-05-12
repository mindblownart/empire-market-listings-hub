
import React, { useState } from 'react';
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
  onValidate?: () => boolean; // Custom validation function
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
  const [isValidating, setIsValidating] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsValidating(true);
      
      // Run custom validation if provided
      if (onValidate && !onValidate()) {
        setIsValidating(false);
        return;
      }
      
      if (onSubmit) {
        await onSubmit();
        // The navigation will now be handled in the onSubmit function itself
      } else {
        const result = await handleSubmit(formData);
        if (result) {
          // Store data for preview if submission is successful
          sessionStorage.setItem('previewFormData', JSON.stringify(formData));
          sessionStorage.setItem('lastSavedFormData', JSON.stringify(formData));
          
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
    } finally {
      setIsValidating(false);
    }
  };

  // Handle preview click with improved validation
  const handlePreview = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    try {
      setIsValidating(true);
      
      // Run validation if onValidate is provided
      let isValid = true;
      
      if (onValidate) {
        isValid = onValidate();
        if (!isValid) {
          setIsValidating(false);
          return;
        }
      }
      
      // Run default validation for required fields only if custom validation passed
      if (isValid) {
        const requiredFieldsValid = validateAllFields(formData);
        
        if (!requiredFieldsValid) {
          toast.error("Please complete all required fields before previewing.", {
            description: "Check for highlighted fields that need attention."
          });
          setIsValidating(false);
          return;
        }
      }
      
      // Store current form data in sessionStorage to preserve across navigation
      sessionStorage.setItem('previewFormData', JSON.stringify(formData));
      sessionStorage.setItem('lastSavedFormData', JSON.stringify(formData));
      
      // Save current image ordering for preview consistency
      const imageOrdering = sessionStorage.getItem('imageOrder');
      if (imageOrdering) {
        sessionStorage.setItem('previewImageOrdering', imageOrdering);
        sessionStorage.setItem('lastSavedImageOrdering', imageOrdering);
      }
      
      // Save video URL for preview if it exists
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
      console.error("Preview error:", error);
      toast.error("There was a problem generating the preview");
    } finally {
      setIsValidating(false);
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
          disabled={previewDisabled || isValidating}
        >
          <Eye className="h-5 w-5" /> 
          {isValidating ? 'Validating...' : 'Preview'}
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
