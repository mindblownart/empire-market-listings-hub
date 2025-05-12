
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandGroup, CommandItem } from '@/components/ui/command';
import { Check, ChevronDown, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { countries } from './countries';

// Extend country data with phone code info
interface CountryPhoneData {
  name: string;
  flagCode: string;
  dialCode: string;
  phoneLength: number;
}

// Map of country codes to phone data
const countryPhoneData: Record<string, CountryPhoneData> = {
  us: { name: "United States", flagCode: "us", dialCode: "+1", phoneLength: 10 },
  gb: { name: "United Kingdom", flagCode: "gb", dialCode: "+44", phoneLength: 10 },
  sg: { name: "Singapore", flagCode: "sg", dialCode: "+65", phoneLength: 8 },
  au: { name: "Australia", flagCode: "au", dialCode: "+61", phoneLength: 9 },
  ca: { name: "Canada", flagCode: "ca", dialCode: "+1", phoneLength: 10 },
  de: { name: "Germany", flagCode: "de", dialCode: "+49", phoneLength: 10 },
  fr: { name: "France", flagCode: "fr", dialCode: "+33", phoneLength: 9 },
  jp: { name: "Japan", flagCode: "jp", dialCode: "+81", phoneLength: 10 },
  in: { name: "India", flagCode: "in", dialCode: "+91", phoneLength: 10 },
  my: { name: "Malaysia", flagCode: "my", dialCode: "+60", phoneLength: 9 },
  cn: { name: "China", flagCode: "cn", dialCode: "+86", phoneLength: 11 },
  id: { name: "Indonesia", flagCode: "id", dialCode: "+62", phoneLength: 10 },
  th: { name: "Thailand", flagCode: "th", dialCode: "+66", phoneLength: 9 },
  vn: { name: "Vietnam", flagCode: "vn", dialCode: "+84", phoneLength: 9 },
  ph: { name: "Philippines", flagCode: "ph", dialCode: "+63", phoneLength: 10 },
  hk: { name: "Hong Kong", flagCode: "hk", dialCode: "+852", phoneLength: 8 },
  kr: { name: "South Korea", flagCode: "kr", dialCode: "+82", phoneLength: 10 },
  br: { name: "Brazil", flagCode: "br", dialCode: "+55", phoneLength: 10 },
  mx: { name: "Mexico", flagCode: "mx", dialCode: "+52", phoneLength: 10 },
  es: { name: "Spain", flagCode: "es", dialCode: "+34", phoneLength: 9 },
  it: { name: "Italy", flagCode: "it", dialCode: "+39", phoneLength: 10 },
  nl: { name: "Netherlands", flagCode: "nl", dialCode: "+31", phoneLength: 9 },
  be: { name: "Belgium", flagCode: "be", dialCode: "+32", phoneLength: 9 },
  ch: { name: "Switzerland", flagCode: "ch", dialCode: "+41", phoneLength: 9 },
  se: { name: "Sweden", flagCode: "se", dialCode: "+46", phoneLength: 9 },
  no: { name: "Norway", flagCode: "no", dialCode: "+47", phoneLength: 8 },
  dk: { name: "Denmark", flagCode: "dk", dialCode: "+45", phoneLength: 8 },
  ie: { name: "Ireland", flagCode: "ie", dialCode: "+353", phoneLength: 9 },
  nz: { name: "New Zealand", flagCode: "nz", dialCode: "+64", phoneLength: 9 },
  ae: { name: "United Arab Emirates", flagCode: "ae", dialCode: "+971", phoneLength: 9 },
  sa: { name: "Saudi Arabia", flagCode: "sa", dialCode: "+966", phoneLength: 9 },
  za: { name: "South Africa", flagCode: "za", dialCode: "+27", phoneLength: 9 },
  ru: { name: "Russia", flagCode: "ru", dialCode: "+7", phoneLength: 10 },
  tr: { name: "Turkey", flagCode: "tr", dialCode: "+90", phoneLength: 10 },
};

// Convert countries to phone data array for the dropdown
const countryPhoneOptions = countries.map(country => {
  const countryCode = country.flagCode;
  const phoneData = countryPhoneData[countryCode] || 
    { name: country.name, flagCode: countryCode, dialCode: "+", phoneLength: 10 };
  
  return phoneData;
});

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  label?: string;
  id?: string;
  error?: string;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  onBlur,
  label = "Phone Number",
  id = "phone",
  error,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryPhoneData>(countryPhoneData.us);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formattedNumber, setFormattedNumber] = useState('');
  const [validationMessage, setValidationMessage] = useState('');

  // Parse initial value if it exists
  useEffect(() => {
    if (value) {
      // Try to detect country code from value
      for (const country of Object.values(countryPhoneData)) {
        if (value.startsWith(country.dialCode)) {
          setSelectedCountry(country);
          const numberPart = value.substring(country.dialCode.length).trim();
          setPhoneNumber(numberPart.replace(/\D/g, ''));
          break;
        }
      }
    }
  }, []);

  // Update formatted number when phone number changes
  useEffect(() => {
    // Only numbers allowed
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    // Format the full international number
    const formatted = selectedCountry.dialCode + ' ' + cleanNumber;
    setFormattedNumber(formatted);
    
    // Validate phone length
    if (cleanNumber.length > 0 && cleanNumber.length !== selectedCountry.phoneLength) {
      setValidationMessage(`${selectedCountry.name} numbers should be ${selectedCountry.phoneLength} digits`);
    } else {
      setValidationMessage('');
    }
    
    // Pass the full formatted value to parent component
    onChange(formatted);
  }, [phoneNumber, selectedCountry, onChange]);

  // Handle country selection
  const handleCountrySelect = (country: CountryPhoneData) => {
    setSelectedCountry(country);
    setOpen(false);
  };

  // Handle phone number input
  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers
    const onlyNumbers = e.target.value.replace(/\D/g, '');
    setPhoneNumber(onlyNumbers);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      
      <div className="flex">
        {/* Country Selector */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex h-10 items-center gap-1 rounded-l-md border border-r-0 border-input bg-background px-3 text-sm focus:ring-1 focus:ring-ring",
                error ? "border-red-500" : ""
              )}
              aria-expanded={open}
            >
              <span className={`fi fi-${selectedCountry.flagCode}`}></span>
              <span className="hidden sm:inline">{selectedCountry.dialCode}</span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[220px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search country..." />
              <CommandList>
                <CommandGroup className="max-h-[300px] overflow-auto">
                  {countryPhoneOptions.map((country) => (
                    <CommandItem
                      key={country.flagCode}
                      value={country.name}
                      onSelect={() => handleCountrySelect(country)}
                    >
                      <span className={`fi fi-${country.flagCode} mr-2`}></span>
                      <span>{country.name} </span>
                      <span className="ml-1 text-gray-500">{country.dialCode}</span>
                      {selectedCountry.flagCode === country.flagCode && (
                        <Check className="ml-auto h-4 w-4" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        
        {/* Phone Number Input */}
        <Input
          id={id}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          className={cn(
            "rounded-l-none",
            error || validationMessage ? "border-red-500 focus-visible:ring-red-500" : ""
          )}
          placeholder={`${selectedCountry.phoneLength} digits`}
          value={phoneNumber}
          onChange={handlePhoneInput}
          onBlur={onBlur}
          maxLength={selectedCountry.phoneLength}
        />
      </div>
      
      {/* Show validation error message */}
      {(validationMessage || error) && (
        <p className="text-sm font-medium text-red-500">{error || validationMessage}</p>
      )}
      
      {/* Show formatted preview when valid */}
      {phoneNumber.length > 0 && !validationMessage && (
        <div className="text-sm text-gray-500 flex items-center gap-1.5">
          <Phone className="h-3 w-3" /> 
          <span>Will display as: <span className="font-medium">{formattedNumber}</span></span>
        </div>
      )}
    </div>
  );
};

export default PhoneInput;
