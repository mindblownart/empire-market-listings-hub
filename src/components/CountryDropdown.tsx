
import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { SearchableSelect } from '@/components/ui/select';
import { countries, CountryOption } from '@/components/submit/countries';

// Create a streamlined list of countries (top countries + regions)
const popularCountries = [
  { value: 'all', label: 'All Countries', flagCode: 'gl' },
  { value: 'us', label: 'United States', flagCode: 'us' },
  { value: 'gb', label: 'United Kingdom', flagCode: 'gb' },
  { value: 'ca', label: 'Canada', flagCode: 'ca' },
  { value: 'au', label: 'Australia', flagCode: 'au' },
  { value: 'sg', label: 'Singapore', flagCode: 'sg' },
  { value: 'de', label: 'Germany', flagCode: 'de' },
  { value: 'fr', label: 'France', flagCode: 'fr' },
  { value: 'jp', label: 'Japan', flagCode: 'jp' },
  { value: 'cn', label: 'China', flagCode: 'cn' },
  { value: 'in', label: 'India', flagCode: 'in' },
];

interface CountryDropdownProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const CountryDropdown: React.FC<CountryDropdownProps> = ({ value, onChange, className }) => {
  // For the listings page, we want a more streamlined experience with popular countries
  // Use the searchable select for a better user experience with flags
  return (
    <div className={className}>
      <SearchableSelect
        options={popularCountries}
        value={value}
        onValueChange={onChange}
        placeholder="All Countries"
      />
    </div>
  );
};

export default CountryDropdown;
