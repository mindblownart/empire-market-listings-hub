
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ChevronDown } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { countries, CountryOption, formatPhoneNumber } from '@/components/submit/countries';

interface PhoneInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

interface ParsedPhoneValue {
  countryCode: string;
  dialCode: string;
  nationalNumber: string;
}

// Phone number format validation by country
const phoneValidation: Record<string, { pattern: RegExp, length: number[] }> = {
  'us': { pattern: /^[0-9]+$/, length: [10] },
  'sg': { pattern: /^[0-9]+$/, length: [8] },
  'gb': { pattern: /^[0-9]+$/, length: [10, 11] },
  'au': { pattern: /^[0-9]+$/, length: [9, 10] },
  'ca': { pattern: /^[0-9]+$/, length: [10] },
  'de': { pattern: /^[0-9]+$/, length: [10, 11] },
  'fr': { pattern: /^[0-9]+$/, length: [9] },
  // Add more country-specific validation as needed
};

// Default to US format if country-specific validation isn't available
const defaultValidation = { pattern: /^[0-9]+$/, length: [7, 8, 9, 10, 11, 12] };

const PhoneInput: React.FC<PhoneInputProps> = ({ 
  id, 
  value, 
  onChange,
  error 
}) => {
  const [focused, setFocused] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string>('');
  
  // Parse the initial value to extract country code and number
  const parsePhoneValue = (input: string): ParsedPhoneValue => {
    // Default to US if no value or can't determine country
    if (!input) {
      return { countryCode: 'us', dialCode: '+1', nationalNumber: '' };
    }
    
    // Check if input starts with a plus sign and try to match a country
    if (input.startsWith('+')) {
      for (const country of countries) {
        const dialCode = `+${country.dialCode}`;
        if (input.startsWith(dialCode)) {
          return {
            countryCode: country.value,
            dialCode: dialCode,
            nationalNumber: input.slice(dialCode.length).replace(/\D/g, '')
          };
        }
      }
    }
    
    // If no match or doesn't start with +, assume US and clean the input
    return { 
      countryCode: 'us', 
      dialCode: '+1', 
      nationalNumber: input.replace(/\D/g, '')
    };
  };
  
  // Parse the current value
  const [parsedValue, setParsedValue] = useState<ParsedPhoneValue>(parsePhoneValue(value));
  
  // Update parsed value when prop value changes
  useEffect(() => {
    setParsedValue(parsePhoneValue(value));
  }, [value]);
  
  // Get selected country info
  const selectedCountry = countries.find(c => c.value === parsedValue.countryCode);
  
  // Filter countries based on search term
  const filteredCountries = countries.filter(country => 
    country.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.dialCode.includes(searchTerm.replace('+', ''))
  );
  
  // Handle national number change
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Only allow digits
    const digits = inputValue.replace(/\D/g, '');
    
    // Get validation rules for selected country
    const validation = phoneValidation[parsedValue.countryCode] || defaultValidation;
    
    // If the input passes the pattern test, update the value
    if (validation.pattern.test(digits) || digits === '') {
      const newParsedValue = {
        ...parsedValue,
        nationalNumber: digits
      };
      
      setParsedValue(newParsedValue);
      
      // Format the full number for the onChange callback
      const formattedNumber = `${newParsedValue.dialCode}${newParsedValue.nationalNumber}`;
      onChange(formattedNumber);
      
      // Validate the length
      if (digits.length > 0 && !validation.length.includes(digits.length)) {
        const expectedLengths = validation.length.join(' or ');
        setValidationMessage(`Phone number should be ${expectedLengths} digits for ${selectedCountry?.label}`);
      } else {
        setValidationMessage('');
      }
    }
  };
  
  // Handle country selection
  const handleCountrySelect = (country: CountryOption) => {
    const newParsedValue = {
      countryCode: country.value,
      dialCode: `+${country.dialCode}`,
      nationalNumber: parsedValue.nationalNumber
    };
    
    setParsedValue(newParsedValue);
    
    // Format the full number for the onChange callback
    const formattedNumber = `${newParsedValue.dialCode}${newParsedValue.nationalNumber}`;
    onChange(formattedNumber);
    
    setOpen(false);
  };
  
  // Format display value for input
  const displayValue = parsedValue.nationalNumber;
  
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Phone Number</Label>
      <div className="flex">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button 
              type="button"
              variant="outline" 
              className="flex items-center gap-2 rounded-r-none border-r-0 min-w-[120px]"
              aria-label="Select country code"
            >
              <span className={`fi fi-${parsedValue.countryCode}`}></span>
              <span className="font-normal">{parsedValue.dialCode}</span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-[300px] max-h-[300px]" side="bottom" align="start">
            <div className="flex border-b">
              <div className="flex items-center px-3">
                <Search className="h-4 w-4 opacity-50" />
              </div>
              <input
                className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Search country..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="max-h-[225px] overflow-auto">
              {filteredCountries.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No country found.
                </div>
              ) : (
                <div className="grid">
                  {filteredCountries.map((country) => (
                    <div
                      key={country.value}
                      className="flex items-center gap-2 py-1.5 px-2 cursor-pointer hover:bg-accent hover:text-accent-foreground"
                      onClick={() => handleCountrySelect(country)}
                    >
                      <span className="min-w-[1.5rem]">
                        <span className={`fi fi-${country.value}`}></span>
                      </span>
                      <span>{country.label}</span>
                      <span className="ml-auto text-muted-foreground">+{country.dialCode}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
        
        <Input
          id={id}
          type="tel"
          value={displayValue}
          onChange={handleNumberChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={focused ? "Enter phone number" : "Enter phone number"}
          className={`rounded-l-none ${error || validationMessage ? "border-red-500 focus-visible:ring-red-500" : ""}`}
          autoComplete="tel-national"
          inputMode="numeric"
        />
      </div>
      
      {(error || validationMessage) && (
        <p className="text-sm font-medium text-red-500">{error || validationMessage}</p>
      )}
      
      {parsedValue.nationalNumber && !validationMessage && !error && (
        <p className="text-sm text-muted-foreground">
          Full number: {parsedValue.dialCode} {formatPhoneNumber(parsedValue.nationalNumber, parsedValue.countryCode)}
        </p>
      )}
    </div>
  );
};

export default PhoneInput;
