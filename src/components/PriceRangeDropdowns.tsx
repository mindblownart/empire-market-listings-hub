
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Define price range options
const minPriceOptions = [
  { value: '0', label: 'Min' },
  { value: '10000', label: '$10K' },
  { value: '50000', label: '$50K' },
  { value: '100000', label: '$100K' },
  { value: '250000', label: '$250K' },
  { value: '500000', label: '$500K' },
  { value: '1000000', label: '$1M' },
];

const maxPriceOptions = [
  { value: '2000000', label: 'Max' },
  { value: '50000', label: '$50K' },
  { value: '100000', label: '$100K' },
  { value: '250000', label: '$250K' },
  { value: '500000', label: '$500K' },
  { value: '1000000', label: '$1M' },
  { value: '2000000', label: '$2M' },
  { value: '5000000', label: '$5M' },
];

// Define quick range options
export const priceRangePresets = [
  { value: 'any', label: 'Any Price', min: 0, max: 5000000 },
  { value: 'below-50k', label: 'Below $50,000', min: 0, max: 50000 },
  { value: '50k-100k', label: '$50,000 – $100,000', min: 50000, max: 100000 },
  { value: '100k-250k', label: '$100,000 – $250,000', min: 100000, max: 250000 },
  { value: '250k-500k', label: '$250,000 – $500,000', min: 250000, max: 500000 },
  { value: '500k-1m', label: '$500,000 – $1M', min: 500000, max: 1000000 },
  { value: '1m-2m', label: '$1M – $2M', min: 1000000, max: 2000000 },
  { value: 'above-2m', label: 'Above $2M', min: 2000000, max: 5000000 },
];

interface PriceRangeDropdownsProps {
  minPrice: number;
  maxPrice: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
  className?: string;
}

const PriceRangeDropdowns: React.FC<PriceRangeDropdownsProps> = ({
  minPrice,
  maxPrice,
  onMinChange,
  onMaxChange,
  className
}) => {
  return (
    <div className={`flex gap-2 ${className}`}>
      <Select
        value={minPrice.toString()}
        onValueChange={(value) => onMinChange(parseInt(value))}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Min" />
        </SelectTrigger>
        <SelectContent>
          {minPriceOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={maxPrice.toString()}
        onValueChange={(value) => onMaxChange(parseInt(value))}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Max" />
        </SelectTrigger>
        <SelectContent>
          {maxPriceOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PriceRangeDropdowns;
