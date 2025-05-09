
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
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
import BusinessMediaUpload from '@/components/BusinessMediaUpload';
import { ChevronDown } from 'lucide-react';

type CountryData = {
  name: string;
  flagCode: string;
  currencyCode: string;
};

const Submit = () => {
  const [selectedCountry, setSelectedCountry] = useState<string>("us");
  const [businessImages, setBusinessImages] = useState<File[]>([]);
  const [businessVideo, setBusinessVideo] = useState<File | null>(null);
  const [businessVideoUrl, setBusinessVideoUrl] = useState<string>("");
  
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
  const currentCurrency = countries.find(country => country.flagCode === selectedCountry)?.currencyCode || "USD";
  
  // Handle country change
  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
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
            <form className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Business Details</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="business-name">Business Name</Label>
                  <Input id="business-name" placeholder="Enter business name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select>
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
                    value={selectedCountry}
                    onValueChange={handleCountryChange}
                    placeholder="Select your country"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="asking-price">Asking Price ({currentCurrency})</Label>
                  <Input id="asking-price" type="number" placeholder={`Enter asking price in ${currentCurrency}`} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="annual-revenue">Annual Revenue ({currentCurrency})</Label>
                  <Input id="annual-revenue" type="number" placeholder={`Enter annual revenue in ${currentCurrency}`} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="annual-profit">Annual Profit ({currentCurrency})</Label>
                  <Input id="annual-profit" type="number" placeholder={`Enter annual profit in ${currentCurrency}`} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Business Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Provide a detailed description of your business..."
                  className="min-h-[120px]"
                />
              </div>

              {/* Business Media Section */}
              <div className="pt-4 border-t border-gray-100">
                <h2 className="text-xl font-semibold mb-4">Business Media</h2>
                <BusinessMediaUpload 
                  onImagesChange={setBusinessImages}
                  onVideoChange={setBusinessVideo}
                  onVideoUrlChange={setBusinessVideoUrl}
                />
              </div>

              <h2 className="text-xl font-semibold mb-4 pt-4 border-t border-gray-100">Contact Information</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input id="full-name" placeholder="Enter your full name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter your email" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="Enter your phone number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role in Business</Label>
                  <Select>
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

              <div className="pt-4 flex justify-center">
                <Button className="bg-primary hover:bg-primary-light px-10 py-6 text-lg">
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
