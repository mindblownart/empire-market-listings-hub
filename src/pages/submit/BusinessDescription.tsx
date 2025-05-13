import React from 'react';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { BusinessFormData } from '../../contexts/FormDataContext';

interface BusinessDescriptionProps {
  formData: BusinessFormData;
  updateFormData: (data: Partial<BusinessFormData>) => void;
  validationErrors: Record<string, string>;
  validateField: (field: string, value: any) => boolean;
}

const BusinessDescription: React.FC<BusinessDescriptionProps> = ({
  formData,
  updateFormData,
  validationErrors,
  validateField
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
    validateField(name, value);
  };
  
  return (
    <div className="space-y-2">
      <Label htmlFor="description">Business Description</Label>
      <Textarea 
        id="description" 
        name="description"
        placeholder="Provide a detailed description of your business..."
        className={`min-h-[120px] ${validationErrors.description ? "border-red-500 focus-visible:ring-red-500" : ""}`}
        value={formData.description}
        onChange={handleInputChange}
      />
      {validationErrors.description && (
        <p className="text-sm font-medium text-red-500">{validationErrors.description}</p>
      )}
    </div>
  );
};

export default BusinessDescription;
