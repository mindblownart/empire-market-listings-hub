
import { useState } from 'react';

type ValidationErrors = Record<string, string>;

export const useFormValidation = () => {
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  
  // Validate a single field
  const validateField = (field: string, value: any) => {
    let error = '';
    
    switch (field) {
      case 'businessName':
        if (!value.trim()) error = 'Business name is required';
        break;
      case 'industry':
        if (!value) error = 'Industry is required';
        break;
      case 'location':
        if (!value) error = 'Location is required';
        break;
      case 'askingPrice':
      case 'annualRevenue':
      case 'annualProfit':
        if (value && !/^[0-9]+(\.[0-9]{1,2})?$/.test(value)) {
          error = 'Please enter a valid number (e.g., 1000 or 1000.50)';
        }
        break;
      case 'yearEstablished':
        if (!value) {
          error = 'Please select a year';
        }
        break;
      case 'employees':
        if (!value) {
          error = 'Please select employee count';
        }
        break; 
      case 'description':
        if (value && value.trim().length < 10) {
          error = 'Description must be at least 10 characters long';
        }
        break;
      default:
        break;
    }
    
    setValidationErrors(prev => ({
      ...prev,
      [field]: error
    }));
    
    return !error;
  };

  // Validate all fields before submission
  const validateAllFields = (formData: any) => {
    const fields = [
      { name: 'businessName', value: formData.businessName },
      { name: 'industry', value: formData.industry },
      { name: 'location', value: formData.location },
      { name: 'askingPrice', value: formData.askingPrice },
      { name: 'annualRevenue', value: formData.annualRevenue },
      { name: 'annualProfit', value: formData.annualProfit },
      { name: 'description', value: formData.description },
      { name: 'yearEstablished', value: formData.yearEstablished },
      { name: 'employees', value: formData.employees }
    ];
    
    let isValid = true;
    
    fields.forEach(field => {
      if (!validateField(field.name, field.value)) {
        isValid = false;
      }
    });
    
    return isValid;
  };

  return { validationErrors, validateField, validateAllFields };
};
