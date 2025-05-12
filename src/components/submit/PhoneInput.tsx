
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { formatPhoneNumber } from '@/lib/formatters';

interface PhoneInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const PhoneInput: React.FC<PhoneInputProps> = ({ 
  id, 
  value, 
  onChange,
  error 
}) => {
  const [focused, setFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // Strip all non-numeric characters for processing
    const cleaned = input.replace(/\D/g, '');
    
    // Format for display
    const formatted = formatPhoneNumber(cleaned);
    
    // Update the state with formatted value
    onChange(formatted);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Phone Number</Label>
      <Input
        id={id}
        type="tel"
        value={value}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={focused ? '(555) 555-5555' : 'Enter phone number'}
        className={error ? "border-red-500 focus-visible:ring-red-500" : ""}
        autoComplete="tel"
      />
      {error && (
        <p className="text-sm font-medium text-red-500">{error}</p>
      )}
    </div>
  );
};

export default PhoneInput;
