
import React from 'react';
import { BusinessFormData } from '@/contexts/FormDataContext';
import { BusinessNameField, IndustryField, CountrySelector } from '@/components/submit';
import { findCountryByFlagCode } from '@/components/submit/countries';

interface BusinessDetailsProps {
  formData: BusinessFormData;
  updateFormData: (data: Partial<BusinessFormData>) => void;
  validationErrors: Record<string, string>;
  validateField: (field: string, value: any) => boolean;
}

const BusinessDetails: React.FC<BusinessDetailsProps> = ({
  formData,
  updateFormData,
  validationErrors,
  validateField
}) => {
  // Handle text input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // For employees field, only allow numbers
    if (name === 'employees' && value !== '') {
      const numericValue = value.replace(/\D/g, '');
      updateFormData({ [name]: numericValue });
      validateField(name, numericValue);
      return;
    }

    // For year established, only allow 4-digit year
    if (name === 'yearEstablished' && value !== '') {
      const numericValue = value.replace(/\D/g, '').slice(0, 4);
      updateFormData({ [name]: numericValue });
      validateField(name, numericValue);
      return;
    }
    
    updateFormData({ [name]: value });
    validateField(name, value);
  };
  
  // Handle select changes
  const handleSelectChange = (id: string, value: string) => {
    updateFormData({ [id]: value });
    validateField(id, value);
  };

  // Handle country change
  const handleCountryChange = (value: string) => {
    const selectedCountry = findCountryByFlagCode(value);
    
    // Check if this is actually a change in currency
    const newCurrencyCode = selectedCountry?.currencyCode;
    const currentCurrencyCode = formData.currencyCode;
    
    // Prepare the update
    const updateData: Partial<BusinessFormData> = {
      location: value,
      locationName: selectedCountry?.name,
      flagCode: selectedCountry?.flagCode,
      currencyCode: newCurrencyCode,
    };
    
    // If the currency is changing and we have monetary values,
    // save the original values before the conversion
    if (newCurrencyCode !== currentCurrencyCode) {
      // Store original values if this is the first currency change
      // or update them if they're already set but the currency is changing
      if (!formData.originalValues.currencyCode || 
          formData.originalValues.currencyCode === currentCurrencyCode) {
        updateData.originalValues = {
          askingPrice: formData.askingPrice,
          annualRevenue: formData.annualRevenue,
          annualProfit: formData.annualProfit,
          currencyCode: currentCurrencyCode || 'USD',
        };
      }
    }
    
    // First update the location to trigger UI updates
    updateFormData(updateData);
    
    validateField('location', value);
  };

  // Handle key press in fields to enable tabbing in the proper order
  const handleKeyDown = (e: React.KeyboardEvent, nextFieldId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextField = document.getElementById(nextFieldId);
      if (nextField) nextField.focus();
    }
  };
  
  return (
    <>
      <h2 className="text-xl font-semibold mb-4">Business Details</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <BusinessNameField 
          value={formData.businessName}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          error={validationErrors.businessName}
        />
        
        <IndustryField 
          value={formData.industry}
          onChange={(value) => handleSelectChange('industry', value)}
          onKeyDown={handleKeyDown}
          error={validationErrors.industry}
        />
      </div>
      
      <div className="space-y-2 mt-4">
        <CountrySelector 
          value={formData.location}
          onChange={handleCountryChange}
          error={validationErrors.location}
        />
      </div>
    </>
  );
};

export default BusinessDetails;
