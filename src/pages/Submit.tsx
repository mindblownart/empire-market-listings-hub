
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
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BusinessMediaUploader from '@/components/BusinessMediaUploader';
import { Eye } from 'lucide-react';
import { useFormData } from '@/contexts/FormDataContext';

type CountryData = {
  name: string;
  flagCode: string;
  currencyCode: string;
};

const Submit = () => {
  const navigate = useNavigate();
  const { formData, updateFormData } = useFormData();
  
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
  
  // Handle country change
  const handleCountryChange = (value: string) => {
    const selectedCountry = countries.find(c => c.flagCode === value);
    updateFormData({ 
      location: value,
      locationName: selectedCountry?.name,
      flagCode: selectedCountry?.flagCode,
      currencyCode: selectedCountry?.currencyCode
    });
  };

  // Update form data when inputs change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    const fieldName = id.replace('business-', '').replace('-', '');
    updateFormData({ [fieldName]: value });
  };
  
  // Handle select changes
  const handleSelectChange = (id: string, value: string) => {
    updateFormData({ [id]: value });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Your business listing has been submitted!');
    navigate('/');
  };

  // Handle preview click
  const handlePreview = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/preview-listing');
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
                    placeholder="Enter business name"
                    value={formData.businessName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select
                    value={formData.industry}
                    onValueChange={(value) => handleSelectChange('industry', value)}
                  >
                    <SelectTrigger id="industry">
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="asking-price">Asking Price ({currentCurrency})</Label>
                  <Input 
                    id="asking-price" 
                    placeholder={`Enter asking price in ${currentCurrency}`}
                    value={formData.askingPrice}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="annual-revenue">Annual Revenue ({currentCurrency})</Label>
                  <Input 
                    id="annual-revenue" 
                    placeholder={`Enter annual revenue in ${currentCurrency}`}
                    value={formData.annualRevenue}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="annual-profit">Annual Profit ({currentCurrency})</Label>
                  <Input 
                    id="annual-profit" 
                    placeholder={`Enter annual profit in ${currentCurrency}`}
                    value={formData.annualProfit}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Business Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Provide a detailed description of your business..."
                  className="min-h-[120px]"
                  value={formData.description}
                  onChange={handleInputChange}
                />
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
                  className="px-10 py-6 text-lg flex items-center gap-2" 
                  onClick={handlePreview}
                >
                  <Eye className="h-5 w-5" /> Preview
                </Button>
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-primary-light px-10 py-6 text-lg"
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
