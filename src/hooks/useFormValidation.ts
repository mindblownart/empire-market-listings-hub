
import { useState } from 'react';

type ValidationErrors = Record<string, string>;

export const useFormValidation = () => {
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  
  // Validate a single field
  const validateField = (field: string, value: any) => {
    let error = '';
    
    switch (field) {
      case 'businessName':
        if (!value?.trim()) error = 'Business name is required';
        break;
      case 'industry':
        if (!value) error = 'Industry is required';
        break;
      case 'location':
        if (!value) error = 'Location is required';
        break;
      case 'askingPrice':
        if (!value) {
          error = 'Asking price is required';
        } else if (value && !/^[0-9]+(\.[0-9]{1,2})?$/.test(value)) {
          error = 'Please enter a valid number';
        }
        break;
      case 'annualRevenue':
        if (!value) {
          error = 'Annual revenue is required';
        } else if (value && !/^[0-9]+(\.[0-9]{1,2})?$/.test(value)) {
          error = 'Please enter a valid number';
        }
        break;
      case 'annualProfit':
        if (!value) {
          error = 'Annual profit is required';
        } else if (value && !/^[0-9]+(\.[0-9]{1,2})?$/.test(value)) {
          error = 'Please enter a valid number';
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
        if (!value?.trim()) {
          error = 'Business description is required';
        } else if (value.trim().length < 10) {
          error = 'Description must be at least 10 characters long';
        }
        break;
      case 'fullName':
        if (!value?.trim()) error = 'Full name is required';
        break;
      case 'email':
        if (!value?.trim()) {
          error = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;
      case 'phone':
        if (!value?.trim()) error = 'Phone number is required';
        break;
      case 'role':
        if (!value) error = 'Role is required';
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
      { name: 'employees', value: formData.employees },
      { name: 'fullName', value: formData.fullName },
      { name: 'email', value: formData.email },
      { name: 'phone', value: formData.phone },
      { name: 'role', value: formData.role }
    ];
    
    let isValid = true;
    
    // Reset all errors before validation
    const newErrors: ValidationErrors = {};
    
    fields.forEach(field => {
      const valid = validateField(field.name, field.value);
      if (!valid) {
        isValid = false;
      }
    });
    
    return isValid;
  };

  // Clear all validation errors
  const clearValidationErrors = () => {
    setValidationErrors({});
  };

  return { validationErrors, validateField, validateAllFields, clearValidationErrors };
};
