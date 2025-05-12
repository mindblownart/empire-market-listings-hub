
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

type ValidationErrors = Record<string, string>;

export const useFormValidation = () => {
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  
  // Validate a single field
  const validateField = useCallback((field: string, value: any) => {
    let error = '';
    
    switch (field) {
      case 'businessName':
        if (!value || !value.trim()) error = 'Business name is required';
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
      case 'annualProfit':
        if (!value) {
          error = field === 'annualRevenue' ? 'Annual revenue is required' : 'Annual profit is required';
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
        if (value && value.trim().length < 10) {
          error = 'Description must be at least 10 characters long';
        }
        break;
      case 'fullName':
        if (!value || !value.trim()) error = 'Full name is required';
        break;
      case 'email':
        if (!value || !value.trim()) {
          error = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;
      case 'phone':
        if (!value || !value.trim()) {
          error = 'Phone number is required';
        } else if (!value.includes('+')) {
          error = 'Phone number must include country code (e.g., +1)';
        } else {
          // Remove the country code part (everything after the +)
          const nationalNumber = value.replace(/^\+\d+\s*/, '');
          // Remove all non-digit characters
          const digitsOnly = nationalNumber.replace(/\D/g, '');
          
          // Basic validation: make sure there are at least 5 digits after the country code
          if (digitsOnly.length < 5) {
            error = 'Phone number is too short';
          } else if (digitsOnly.length > 15) {
            // International standard: phone numbers should be 15 digits or less
            error = 'Phone number is too long';
          }
        }
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
  }, []);

  // Validate all fields before submission
  const validateAllFields = useCallback((formData: any) => {
    let isValid = true;
    const allErrors: ValidationErrors = {};
    const requiredFields = [
      { name: 'businessName', value: formData.businessName, label: 'Business name' },
      { name: 'industry', value: formData.industry, label: 'Industry' },
      { name: 'location', value: formData.location, label: 'Location' },
      { name: 'askingPrice', value: formData.askingPrice, label: 'Asking price' },
      { name: 'annualRevenue', value: formData.annualRevenue, label: 'Annual revenue' },
      { name: 'annualProfit', value: formData.annualProfit, label: 'Annual profit' },
      { name: 'yearEstablished', value: formData.yearEstablished, label: 'Year established' },
      { name: 'employees', value: formData.employees, label: 'Employee count' },
      { name: 'fullName', value: formData.fullName, label: 'Full name' },
      { name: 'email', value: formData.email, label: 'Email' },
      { name: 'phone', value: formData.phone, label: 'Phone number' },
      { name: 'role', value: formData.role, label: 'Role' }
    ];
    
    // Track missing fields for the toast message
    const missingFields: string[] = [];
    
    requiredFields.forEach(field => {
      const fieldIsValid = validateField(field.name, field.value);
      if (!fieldIsValid) {
        isValid = false;
        missingFields.push(field.label);
      }
      
      if (validationErrors[field.name]) {
        allErrors[field.name] = validationErrors[field.name];
      }
    });
    
    // Update all validation errors at once
    setValidationErrors(allErrors);
    
    // Show detailed toast for missing fields if validation fails
    if (!isValid && missingFields.length > 0) {
      const missingFieldsList = missingFields.slice(0, 3).join(', ') + 
        (missingFields.length > 3 ? ` and ${missingFields.length - 3} more` : '');
      
      toast.error(`Please complete all required fields`, {
        description: `Missing information: ${missingFieldsList}`
      });
    }
    
    return isValid;
  }, [validateField, validationErrors]);

  // Clear all validation errors
  const clearValidationErrors = useCallback(() => {
    setValidationErrors({});
  }, []);

  return { 
    validationErrors, 
    validateField, 
    validateAllFields, 
    clearValidationErrors 
  };
};
