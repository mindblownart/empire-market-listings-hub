
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
  SelectValue
} from '@/components/ui/select';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BusinessMediaUpload from '@/components/BusinessMediaUpload';
import { ChevronDown } from 'lucide-react';

type CountryCurrency = {
  [key: string]: string;
};

type CountryData = {
  name: string;
  flag: string;
  currencyCode: string;
};

const Submit = () => {
  const [selectedCountry, setSelectedCountry] = useState<string>("United States");
  const [businessImages, setBusinessImages] = useState<File[]>([]);
  const [businessVideo, setBusinessVideo] = useState<File | null>(null);
  const [businessVideoUrl, setBusinessVideoUrl] = useState<string>("");
  
  // Country data with flags and currency codes
  const countries: CountryData[] = [
    { name: "United States", flag: "🇺🇸", currencyCode: "USD" },
    { name: "United Kingdom", flag: "🇬🇧", currencyCode: "GBP" },
    { name: "Singapore", flag: "🇸🇬", currencyCode: "SGD" },
    { name: "Australia", flag: "🇦🇺", currencyCode: "AUD" },
    { name: "Canada", flag: "🇨🇦", currencyCode: "CAD" },
    { name: "Germany", flag: "🇩🇪", currencyCode: "EUR" },
    { name: "France", flag: "🇫🇷", currencyCode: "EUR" },
    { name: "Japan", flag: "🇯🇵", currencyCode: "JPY" },
    { name: "India", flag: "🇮🇳", currencyCode: "INR" },
    { name: "Malaysia", flag: "🇲🇾", currencyCode: "MYR" }
  ];
  
  // Get current currency based on selected country
  const currentCurrency = countries.find(country => country.name === selectedCountry)?.currencyCode || "USD";
  
  // Get current flag based on selected country
  const currentFlag = countries.find(country => country.name === selectedCountry)?.flag || "🇺🇸";
  
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between" id="location">
                        <span className="flex items-center gap-2 truncate">
                          <span className="text-base">{currentFlag}</span>
                          <span>{selectedCountry}</span>
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full min-w-[240px]" align="start">
                      {countries.map((country) => (
                        <DropdownMenuItem 
                          key={country.name}
                          onClick={() => handleCountryChange(country.name)}
                          className="flex items-center gap-2 cursor-pointer py-2"
                        >
                          <span className="text-base">{country.flag}</span>
                          <span>{country.name}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
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
