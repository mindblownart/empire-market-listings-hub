
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useFormData } from '@/contexts/FormDataContext';
import { useBusinessSubmission } from '@/hooks/useBusinessSubmission';

interface FormContainerProps {
  children: React.ReactNode;
}

const FormContainer: React.FC<FormContainerProps> = ({ children }) => {
  const navigate = useNavigate();
  const { formData } = useFormData();
  const { handleSubmit, isSubmitting } = useBusinessSubmission();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(formData);
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

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      {children}

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
  );
};

export default FormContainer;
