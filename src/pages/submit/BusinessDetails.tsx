
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SearchableSelect
} from '@/components/ui/select';
import { BusinessFormData } from '@/contexts/FormDataContext';

type CountryData = {
  name: string;
  flagCode: string;
  currencyCode: string;
};

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
  // Country data with flag codes and currency codes
  const countries: CountryData[] = [
    { name: "United States", flagCode: "us", currencyCode: "USD" },
    { name: "United Kingdom", flagCode: "gb", currencyCode: "GBP" },
    { name: "Singapore", flagCode: "sg", currencyCode: "SGD" },
    { name: "Australia", flagCode: "au", currencyCode: "AUD" },
    { name: "Canada", flagCode: "ca", currencyCode: "CAD" },
    { name: "Germany", flagCode: "de", currencyCode: "EUR" },
    { name: "France", flagCode: "fr", currencyCode: "EUR" },
    { name: "Japan", flagCode: "jp", currencyCode: "JPY" },
    { name: "India", flagCode: "in", currencyCode: "INR" },
    { name: "Malaysia", flagCode: "my", currencyCode: "MYR" }
  ];
  
  // Country options for SearchableSelect
  const countryOptions = countries.map(country => ({
    value: country.flagCode,
    label: country.name,
    flagCode: country.flagCode
  }));
  
  // Handle country change
  const handleCountryChange = (value: string) => {
    const selectedCountry = countries.find(c => c.flagCode === value);
    
    // First update the location to trigger UI updates
    updateFormData({ 
      location: value,
      locationName: selectedCountry?.name,
      flagCode: selectedCountry?.flagCode,
      currencyCode: selectedCountry?.currencyCode
    });
    
    validateField('location', value);
  };

  // Handle text input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
    validateField(name, value);
  };
  
  // Handle select changes
  const handleSelectChange = (id: string, value: string) => {
    updateFormData({ [id]: value });
    validateField(id, value);
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
        <div className="space-y-2">
          <Label htmlFor="business-name">Business Name</Label>
          <Input 
            id="business-name" 
            name="businessName"
            type="text" 
            placeholder="Enter business name"
            value={formData.businessName}
            onChange={handleInputChange}
            onKeyDown={(e) => handleKeyDown(e, 'industry')}
            aria-invalid={!!validationErrors.businessName}
            className={validationErrors.businessName ? "border-red-500 focus-visible:ring-red-500" : ""}
            autoComplete="off"
          />
          {validationErrors.businessName && (
            <p className="text-sm font-medium text-red-500">{validationErrors.businessName}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="industry">Industry</Label>
          <Select
            value={formData.industry}
            onValueChange={(value) => handleSelectChange('industry', value)}
          >
            <SelectTrigger 
              id="industry" 
              className={validationErrors.industry ? "border-red-500 focus-visible:ring-red-500" : ""}
              onKeyDown={(e) => handleKeyDown(e, 'location')}
            >
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tech">Technology</SelectItem>
              <SelectItem value="food">Food & Beverage</SelectItem>
              <SelectItem value="retail">Retail</SelectItem>
              <SelectItem value="manufacturing">Manufacturing</SelectItem>
              <SelectItem value="health">Health & Wellness</SelectItem>
              <SelectItem value="service">Professional Services</SelectItem>
            </SelectContent>
          </Select>
          {validationErrors.industry && (
            <p className="text-sm font-medium text-red-500">{validationErrors.industry}</p>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <SearchableSelect
          options={countryOptions}
          value={formData.location}
          onValueChange={handleCountryChange}
          placeholder="Select your country"
          required
        />
        {validationErrors.location && (
          <p className="text-sm font-medium text-red-500">{validationErrors.location}</p>
        )}
      </div>
    </>
  );
};

export default BusinessDetails;
