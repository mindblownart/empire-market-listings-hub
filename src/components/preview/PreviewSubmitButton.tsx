
import React from 'react';
import { Button } from '@/components/ui/button';

interface PreviewSubmitButtonProps {
  onSubmitListing: () => void;
}

const PreviewSubmitButton: React.FC<PreviewSubmitButtonProps> = ({ onSubmitListing }) => {
  return (
    <div className="mt-8 border-t pt-8 flex justify-center">
      <Button 
        size="lg"
        onClick={onSubmitListing}
        className="px-8 py-6 text-lg"
      >
        Submit Business Listing
      </Button>
    </div>
  );
};

export default PreviewSubmitButton;
