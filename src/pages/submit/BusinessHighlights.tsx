import React, { useState } from 'react';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Plus, X } from 'lucide-react';
import { BusinessFormData } from '../../contexts/FormDataContext';

interface BusinessHighlightsProps {
  formData: BusinessFormData;
  updateFormData: (data: Partial<BusinessFormData>) => void;
}

const BusinessHighlights: React.FC<BusinessHighlightsProps> = ({
  formData,
  updateFormData
}) => {
  const [currentHighlight, setCurrentHighlight] = useState<string>('');
  const MAX_HIGHLIGHTS = 5;

  const handleAddHighlight = () => {
    if (!currentHighlight.trim() || formData.highlights.length >= MAX_HIGHLIGHTS) return;
    
    const newHighlights = [...formData.highlights, currentHighlight.trim()];
    updateFormData({ highlights: newHighlights });
    setCurrentHighlight('');
  };

  const handleRemoveHighlight = (index: number) => {
    const newHighlights = [...formData.highlights];
    newHighlights.splice(index, 1);
    updateFormData({ highlights: newHighlights });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddHighlight();
    }
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="highlights">Business Highlights</Label>
      
      <div className="space-y-2">
        {formData.highlights.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.highlights.map((highlight, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="pl-3 pr-2 py-2 text-sm flex items-center gap-1 bg-gray-100"
              >
                {highlight}
                <button
                  type="button"
                  onClick={() => handleRemoveHighlight(index)}
                  className="ml-1 rounded-full hover:bg-gray-200 p-0.5"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Input
            id="highlights"
            value={currentHighlight}
            onChange={(e) => setCurrentHighlight(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Highlight key strengths, achievements, or features"
            className="flex-grow"
            disabled={formData.highlights.length >= MAX_HIGHLIGHTS}
          />
          <Button 
            type="button" 
            onClick={handleAddHighlight}
            disabled={!currentHighlight.trim() || formData.highlights.length >= MAX_HIGHLIGHTS}
            size="sm"
            className="bg-primary hover:bg-primary-light"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
        
        <p className="text-xs text-gray-500">
          {formData.highlights.length < MAX_HIGHLIGHTS 
            ? `Add up to ${MAX_HIGHLIGHTS - formData.highlights.length} more highlight${MAX_HIGHLIGHTS - formData.highlights.length !== 1 ? 's' : ''}`
            : 'Maximum number of highlights reached'}
        </p>
        <p className="text-xs text-gray-500">
          Examples: "Loyal customer base", "Prime location", "Fully automated operations"
        </p>
      </div>
    </div>
  );
};

export default BusinessHighlights;
