import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  SearchableSelect
} from '@/components/ui/select';
import { CurrencyInput } from '@/components/ui/currency-input';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BusinessMediaUploader from '@/components/BusinessMediaUploader';
import { Eye } from 'lucide-react';
import { useFormData } from '@/contexts/FormDataContext';
import { toast } from "sonner";
import { z } from "zod";

type CountryData = {
  name: string;
  flagCode: string;
  currencyCode: string;
};

const Submit = () => {
  const navigate = useNavigate();
  const { formData, updateFormData } = useFormData();
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
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
  
  // Get current currency based on selected country
  const currentCurrency = countries.find(country => country.flagCode === formData.location)?.currencyCode || "USD";
  const currentLocale = formData.location === 'us' ? 'en-US' : 
                        formData.location === 'gb' ? 'en-GB' : 
                        formData.location === 'au' ? 'en-AU' : 'en-US';
  
  // Handle country change
  const handleCountryChange = (value: string) => {
    const selectedCountry = countries.find(c => c.flagCode === value);
    updateFormData({ 
      location: value,
      locationName: selectedCountry?.name,
      flagCode: selectedCountry?.flagCode,
      currencyCode: selectedCountry?.currencyCode
    });
    validateField('location', value);
  };

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

  // Handle input changes for numeric fields
  const handleNumericInputChange = (fieldName: string) => (value: string) => {
    console.log(`Numeric input change: field=${fieldName}, value=${value}`);
    updateFormData({ [fieldName]: value });
    validateField(fieldName, value);
  };

  // Handle text input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    console.log(`Text input change: field=${name}, value=${value}`);
    updateFormData({ [name]: value });
    validateField(name, value);
  };
  
  // Handle select changes
  const handleSelectChange = (id: string, value: string) => {
    updateFormData({ [id]: value });
    validateField(id, value);
  };

  // Validate all fields before submission
  const validateAllFields = () => {
    const fields = [
      { name: 'businessName', value: formData.businessName },
      { name: 'industry', value: formData.industry },
      { name: 'location', value: formData.location },
      { name: 'askingPrice', value: formData.askingPrice },
      { name: 'annualRevenue', value: formData.annualRevenue },
      { name: 'annualProfit', value: formData.annualProfit },
      { name: 'description', value: formData.description }
    ];
    
    let isValid = true;
    
    fields.forEach(field => {
      if (!validateField(field.name, field.value)) {
        isValid = false;
      }
    });
    
    return isValid;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateAllFields()) {
      toast.success("Business listing submitted successfully!");
      navigate('/');
    } else {
      toast.error("Please fix the errors in the form before submitting.");
      // Focus on the first field with an error
      const firstErrorField = Object.keys(validationErrors).find(
        field => validationErrors[field]
      );
      if (firstErrorField) {
        const element = document.getElementById(`business-${firstErrorField}`);
        if (element) element.focus();
      }
    }
  };

  // Handle preview click
  const handlePreview = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/preview-listing');
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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold mb-6 text-center">Submit Your Business</h1>
          <p className="text-gray-600 mb-10 text-center max-w-2xl mx-auto">
            List your business on EmpireMarket to reach qualified buyers and simplify your business sale journey.
          </p>
          
          <div className="bg-white rounded-xl shadow-md p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
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

              <div className="grid gap-4 md:grid-cols-2">
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
                <div className="space-y-2">
                  <Label htmlFor="business-askingprice">Asking Price ({currentCurrency})</Label>
                  <CurrencyInput 
                    id="business-askingprice" 
                    value={formData.askingPrice}
                    onChange={handleNumericInputChange('askingPrice')}
                    onKeyDown={(e) => handleKeyDown(e, 'business-annualrevenue')}
                    currencyCode={currentCurrency}
                    locale={currentLocale}
                    placeholder={`Enter asking price in ${currentCurrency}`}
                    aria-invalid={!!validationErrors.askingPrice}
                    className={validationErrors.askingPrice ? "border-red-500 focus-visible:ring-red-500" : ""}
                    autoComplete="off"
                  />
                  {validationErrors.askingPrice && (
                    <p className="text-sm font-medium text-red-500">{validationErrors.askingPrice}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="business-annualrevenue">Annual Revenue ({currentCurrency})</Label>
                  <CurrencyInput
                    id="business-annualrevenue" 
                    value={formData.annualRevenue}
                    onChange={handleNumericInputChange('annualRevenue')}
                    onKeyDown={(e) => handleKeyDown(e, 'business-annualprofit')}
                    currencyCode={currentCurrency}
                    locale={currentLocale}
                    placeholder={`Enter annual revenue in ${currentCurrency}`}
                    aria-invalid={!!validationErrors.annualRevenue}
                    className={validationErrors.annualRevenue ? "border-red-500 focus-visible:ring-red-500" : ""}
                    autoComplete="off"
                  />
                  {validationErrors.annualRevenue && (
                    <p className="text-sm font-medium text-red-500">{validationErrors.annualRevenue}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-annualprofit">Annual Profit ({currentCurrency})</Label>
                  <CurrencyInput
                    id="business-annualprofit"
                    value={formData.annualProfit}
                    onChange={handleNumericInputChange('annualProfit')}
                    onKeyDown={(e) => handleKeyDown(e, 'description')}
                    currencyCode={currentCurrency}
                    locale={currentLocale}
                    placeholder={`Enter annual profit in ${currentCurrency}`}
                    aria-invalid={!!validationErrors.annualProfit}
                    className={validationErrors.annualProfit ? "border-red-500 focus-visible:ring-red-500" : ""}
                    autoComplete="off"
                  />
                  {validationErrors.annualProfit && (
                    <p className="text-sm font-medium text-red-500">{validationErrors.annualProfit}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Business Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Provide a detailed description of your business..."
                  className={`min-h-[120px] ${validationErrors.description ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  value={formData.description}
                  onChange={handleInputChange}
                />
                {validationErrors.description && (
                  <p className="text-sm font-medium text-red-500">{validationErrors.description}</p>
                )}
              </div>

              {/* Business Media Section */}
              <div className="pt-4 border-t border-gray-100">
                <h2 className="text-xl font-semibold mb-4">Business Media</h2>
                <BusinessMediaUploader 
                  initialImages={formData.businessImages}
                  initialVideo={formData.businessVideo}
                  initialVideoUrl={formData.businessVideoUrl}
                  onImagesChange={(images) => updateFormData({ businessImages: images })}
                  onVideoChange={(video) => updateFormData({ businessVideo: video })}
                  onVideoUrlChange={(url) => updateFormData({ businessVideoUrl: url })}
                />
              </div>

              <h2 className="text-xl font-semibold mb-4 pt-4 border-t border-gray-100">Contact Information</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input 
                    id="full-name" 
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => updateFormData({ fullName: e.target.value })}
                    onKeyDown={(e) => handleKeyDown(e, 'email')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => updateFormData({ email: e.target.value })}
                    onKeyDown={(e) => handleKeyDown(e, 'phone')}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) => updateFormData({ phone: e.target.value })}
                    onKeyDown={(e) => handleKeyDown(e, 'role')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role in Business</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleSelectChange('role', value)}
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owner">Owner</SelectItem>
                      <SelectItem value="broker">Broker</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

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
                >
                  Submit Business Listing
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Submit;
