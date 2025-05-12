
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

interface PreviewHeaderActionsProps {
  onBackToForm: () => void;
  onSubmitListing: () => void;
}

const PreviewHeaderActions: React.FC<PreviewHeaderActionsProps> = ({ 
  onBackToForm, 
  onSubmitListing 
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <Button 
        variant="ghost"
        className="flex items-center gap-2"
        onClick={onBackToForm}
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Edit Form
      </Button>
      
      <div className="flex items-center gap-4">
        <Button 
          variant="outline"
          onClick={onBackToForm}
        >
          Edit Listing
        </Button>
        
        <Button 
          onClick={onSubmitListing}
        >
          Submit Listing
        </Button>
      </div>
    </div>
  );
};

export default PreviewHeaderActions;
