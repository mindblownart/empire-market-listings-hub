
import React from 'react';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/select';
import { countryOptions } from './countries';

interface CountrySelectorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({
  value,
  onChange,
  error
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="location">Location</Label>
      <SearchableSelect
        options={countryOptions}
        value={value}
        onValueChange={onChange}
        placeholder="Select your country"
        required
        className={error ? "border-red-500" : ""}
      />
      {error && (
        <p className="text-sm font-medium text-red-500">{error}</p>
      )}
    </div>
  );
};

export default CountrySelector;
