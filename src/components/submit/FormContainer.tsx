
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
}

const FormContainer: React.FC<FormContainerProps> = ({ 
  children, 
  onSubmit,
  submitLabel,
  isSubmitting,
  onPreview,
  previewDisabled = false
}) => {
  const navigate = useNavigate();
  const { formData } = useFormData();
  const { handleSubmit, isSubmitting: defaultIsSubmitting } = useBusinessSubmission();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (onSubmit) {
        await onSubmit();
        toast.success("Changes saved successfully!");
        
        // Store updated data in sessionStorage for preview page and for returning to form
        sessionStorage.setItem('previewFormData', JSON.stringify(formData));
        sessionStorage.setItem('lastSavedFormData', JSON.stringify(formData));
        
        // If we have ordered images, make sure to preserve that order
        const imageOrdering = sessionStorage.getItem('imageOrder');
        if (imageOrdering) {
          sessionStorage.setItem('previewImageOrdering', imageOrdering);
          // Also save for returning to form
          sessionStorage.setItem('lastSavedImageOrdering', imageOrdering);
        }
      } else {
        const result = await handleSubmit(formData);
        if (result) {
          // Store data for preview if submission is successful
          sessionStorage.setItem('previewFormData', JSON.stringify(formData));
          sessionStorage.setItem('lastSavedFormData', JSON.stringify(formData));
          toast.success("Business listing submitted successfully!");
        }
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to save changes. Please try again.");
    }
  };

  // Handle preview click - ensure all form data is captured before navigating
  const handlePreview = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Store current form data in sessionStorage to preserve across navigation
    sessionStorage.setItem('previewFormData', JSON.stringify(formData));
    
    // We'll allow preview without validation
    // but let's show a toast if there are major issues
    if (!formData.businessName || !formData.industry || !formData.location) {
      toast.warning("Your preview is missing important information. Consider adding more details.");
    }
    
    // Save current image ordering for preview consistency
    const imageOrdering = sessionStorage.getItem('imageOrder');
    if (imageOrdering) {
      sessionStorage.setItem('previewImageOrdering', imageOrdering);
    }
    
    // Use custom preview handler if provided, otherwise use default behavior
    if (onPreview) {
      onPreview();
    } else {
      navigate('/preview-listing');
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
