
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Check, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { countryOptions } from '@/components/submit/countries';

interface PhoneInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

interface PhoneCountry {
  value: string;
  label: string;
  flagCode: string;
  dialCode: string;
  format: string;
  maxLength: number;
}

// Phone number formats and validation rules by country
const phoneCountries: PhoneCountry[] = [
  { value: 'us', label: 'United States', flagCode: 'us', dialCode: '+1', format: '### ### ####', maxLength: 10 },
  { value: 'sg', label: 'Singapore', flagCode: 'sg', dialCode: '+65', format: '#### ####', maxLength: 8 },
  { value: 'uk', label: 'United Kingdom', flagCode: 'gb', dialCode: '+44', format: '## #### ####', maxLength: 10 },
  { value: 'au', label: 'Australia', flagCode: 'au', dialCode: '+61', format: '# #### ####', maxLength: 9 },
  { value: 'ca', label: 'Canada', flagCode: 'ca', dialCode: '+1', format: '### ### ####', maxLength: 10 },
  { value: 'de', label: 'Germany', flagCode: 'de', dialCode: '+49', format: '### ########', maxLength: 11 },
  { value: 'fr', label: 'France', flagCode: 'fr', dialCode: '+33', format: '# ## ## ## ##', maxLength: 9 },
  { value: 'jp', label: 'Japan', flagCode: 'jp', dialCode: '+81', format: '## #### ####', maxLength: 10 },
  { value: 'cn', label: 'China', flagCode: 'cn', dialCode: '+86', format: '### #### ####', maxLength: 11 },
  { value: 'in', label: 'India', flagCode: 'in', dialCode: '+91', format: '## #### #####', maxLength: 10 },
  { value: 'my', label: 'Malaysia', flagCode: 'my', dialCode: '+60', format: '## ### ####', maxLength: 9 },
];

const PhoneInput: React.FC<PhoneInputProps> = ({ 
  id, 
  value, 
  onChange,
  error 
}) => {
  const [countryOpen, setCountryOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<PhoneCountry>(phoneCountries[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [focused, setFocused] = useState(false);

  // Parse the initial value to extract country code and phone number
  useEffect(() => {
    if (value) {
      // Try to match the phone number with a country code
      const countryMatch = phoneCountries.find(country => 
        value.startsWith(country.dialCode)
      );
      
      if (countryMatch) {
        setSelectedCountry(countryMatch);
        setPhoneNumber(value.replace(countryMatch.dialCode, '').trim());
      } else {
        // If no match, just set the phone number as is
        setPhoneNumber(value);
      }
    }
  }, []);

  // Update the combined value whenever country or phone number changes
  useEffect(() => {
    const formattedValue = phoneNumber ? 
      `${selectedCountry.dialCode} ${phoneNumber}`.trim() : 
      '';
    
    if (formattedValue !== value) {
      onChange(formattedValue);
    }
  }, [selectedCountry, phoneNumber]);

  // Handle phone number input change
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // Only allow digits
    const cleaned = input.replace(/\D/g, '');
    
    // Enforce max length based on country
    if (cleaned.length <= selectedCountry.maxLength) {
      setPhoneNumber(formatPhoneByCountry(cleaned, selectedCountry));
    }
  };

  // Format phone number based on country format
  const formatPhoneByCountry = (phoneDigits: string, country: PhoneCountry): string => {
    if (!phoneDigits) return '';
    
    // Simple formatting for different countries
    switch(country.value) {
      case 'us':
      case 'ca':
        if (phoneDigits.length <= 3) return phoneDigits;
        if (phoneDigits.length <= 6) return `${phoneDigits.slice(0, 3)} ${phoneDigits.slice(3)}`;
        return `${phoneDigits.slice(0, 3)} ${phoneDigits.slice(3, 6)} ${phoneDigits.slice(6)}`;
      
      case 'sg':
        if (phoneDigits.length <= 4) return phoneDigits;
        return `${phoneDigits.slice(0, 4)} ${phoneDigits.slice(4)}`;
      
      case 'uk':
        if (phoneDigits.length <= 2) return phoneDigits;
        if (phoneDigits.length <= 6) return `${phoneDigits.slice(0, 2)} ${phoneDigits.slice(2)}`;
        return `${phoneDigits.slice(0, 2)} ${phoneDigits.slice(2, 6)} ${phoneDigits.slice(6)}`;
      
      case 'au':
        if (phoneDigits.length <= 1) return phoneDigits;
        if (phoneDigits.length <= 5) return `${phoneDigits.slice(0, 1)} ${phoneDigits.slice(1)}`;
        return `${phoneDigits.slice(0, 1)} ${phoneDigits.slice(1, 5)} ${phoneDigits.slice(5)}`;
      
      case 'de':
        if (phoneDigits.length <= 3) return phoneDigits;
        return `${phoneDigits.slice(0, 3)} ${phoneDigits.slice(3)}`;
      
      case 'fr':
        if (phoneDigits.length <= 1) return phoneDigits;
        if (phoneDigits.length <= 3) return `${phoneDigits.slice(0, 1)} ${phoneDigits.slice(1)}`;
        if (phoneDigits.length <= 5) return `${phoneDigits.slice(0, 1)} ${phoneDigits.slice(1, 3)} ${phoneDigits.slice(3)}`;
        if (phoneDigits.length <= 7) return `${phoneDigits.slice(0, 1)} ${phoneDigits.slice(1, 3)} ${phoneDigits.slice(3, 5)} ${phoneDigits.slice(5)}`;
        return `${phoneDigits.slice(0, 1)} ${phoneDigits.slice(1, 3)} ${phoneDigits.slice(3, 5)} ${phoneDigits.slice(5, 7)} ${phoneDigits.slice(7)}`;
      
      // Default formatting for other countries
      default:
        // Simple grouping in chunks of 2-3 digits
        let formatted = '';
        for (let i = 0; i < phoneDigits.length; i += 3) {
          formatted += `${phoneDigits.slice(i, Math.min(i + 3, phoneDigits.length))} `;
        }
        return formatted.trim();
    }
  };

  // Validation message based on country
  const getValidationMessage = (): string => {
    if (!phoneNumber) return '';
    
    const digitCount = phoneNumber.replace(/\D/g, '').length;
    
    if (digitCount < selectedCountry.maxLength) {
      return `${selectedCountry.label} numbers require ${selectedCountry.maxLength} digits. You entered ${digitCount}.`;
    }
    
    return '';
  };

  // Handle country selection
  const handleCountrySelect = (country: PhoneCountry) => {
    setSelectedCountry(country);
    setCountryOpen(false);
  };

  // Validation state
  const validationMessage = getValidationMessage();
  const hasValidationError = validationMessage.length > 0 && phoneNumber.length > 0;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Phone Number</Label>
      <div className="flex">
        <Popover open={countryOpen} onOpenChange={setCountryOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              role="combobox"
              aria-expanded={countryOpen}
              className={cn(
                "flex items-center justify-between gap-1 rounded-l-md border border-r-0 border-input bg-background px-3 py-2 text-sm focus:outline-none",
                error ? "border-red-500" : ""
              )}
              style={{ minWidth: "100px" }}
            >
              <div className="flex items-center gap-2">
                <span className={`fi fi-${selectedCountry.flagCode} rounded-sm`}></span>
                <span className="hidden sm:inline">{selectedCountry.dialCode}</span>
              </div>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search country..." />
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-y-auto">
                {phoneCountries.map((country) => (
                  <CommandItem
                    key={country.value}
                    value={country.label}
                    onSelect={() => handleCountrySelect(country)}
                    className="flex items-center gap-2"
                  >
                    <span className={`fi fi-${country.flagCode} rounded-sm`}></span>
                    <span>{country.label}</span>
                    <span className="ml-auto text-gray-500">{country.dialCode}</span>
                    {selectedCountry.value === country.value && (
                      <Check className="h-4 w-4 ml-2" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
        
        <Input
          id={id}
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={focused ? `Example: ${selectedCountry.format.replace(/#/g, '0')}` : 'Enter phone number'}
          className={cn(
            "rounded-l-none",
            (error || hasValidationError) ? "border-red-500 focus-visible:ring-red-500" : ""
          )}
          autoComplete="tel"
          inputMode="tel"
          maxLength={selectedCountry.maxLength + (selectedCountry.maxLength / 3)} // Account for spaces in formatting
        />
      </div>
      
      {error ? (
        <p className="text-sm font-medium text-red-500">{error}</p>
      ) : hasValidationError ? (
        <p className="text-sm font-medium text-amber-500">{validationMessage}</p>
      ) : phoneNumber && !hasValidationError ? (
        <p className="text-sm font-medium text-green-600">Valid {selectedCountry.label} phone number</p>
      ) : null}
    </div>
  );
};

export default PhoneInput;
