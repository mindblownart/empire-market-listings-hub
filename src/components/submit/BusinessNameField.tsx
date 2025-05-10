
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface BusinessNameFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent, nextFieldId: string) => void;
  error?: string;
}

const BusinessNameField: React.FC<BusinessNameFieldProps> = ({ 
  value, 
  onChange, 
  onKeyDown, 
  error 
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="business-name">Business Name</Label>
      <Input 
        id="business-name" 
        name="businessName"
        type="text" 
        placeholder="Enter business name"
        value={value}
        onChange={onChange}
        onKeyDown={(e) => onKeyDown(e, 'industry')}
        aria-invalid={!!error}
        className={error ? "border-red-500 focus-visible:ring-red-500" : ""}
        autoComplete="off"
      />
      {error && (
        <p className="text-sm font-medium text-red-500">{error}</p>
      )}
    </div>
  );
};

export default BusinessNameField;
