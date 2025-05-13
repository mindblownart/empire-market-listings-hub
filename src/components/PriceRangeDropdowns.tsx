
import React, { useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Define consistent price range options
const priceOptions = [
  { value: '0', label: 'Any' },
  { value: '50000', label: '$50K' },
  { value: '100000', label: '$100K' },
  { value: '250000', label: '$250K' },
  { value: '500000', label: '$500K' },
  { value: '1000000', label: '$1M' },
  { value: '2000000', label: '$2M' },
  { value: '5000000', label: '$5M' },
  { value: '10000000', label: '$10M' },
];

// Define quick range options for presets
export const priceRangePresets = [
  { value: 'any', label: 'Any Price', min: 0, max: 10000000 },
  { value: 'below-50k', label: 'Below $50,000', min: 0, max: 50000 },
  { value: '50k-100k', label: '$50,000 – $100,000', min: 50000, max: 100000 },
  { value: '100k-250k', label: '$100,000 – $250,000', min: 100000, max: 250000 },
  { value: '250k-500k', label: '$250,000 – $500,000', min: 250000, max: 500000 },
  { value: '500k-1m', label: '$500,000 – $1M', min: 500000, max: 1000000 },
  { value: '1m-2m', label: '$1M – $2M', min: 1000000, max: 2000000 },
  { value: '2m-5m', label: '$2M – $5M', min: 2000000, max: 5000000 },
  { value: 'above-5m', label: 'Above $5M', min: 5000000, max: 10000000 },
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
  // Handle initial state synchronization
  useEffect(() => {
    // Ensure max is not less than min
    if (maxPrice < minPrice) {
      onMaxChange(minPrice);
    }
  }, [minPrice, maxPrice, onMaxChange]);

  // Filter min options based on selected max
  const getMinOptions = () => {
    if (!maxPrice) return priceOptions;
    return priceOptions.filter(option => parseInt(option.value) <= maxPrice);
  };

  // Filter max options based on selected min
  const getMaxOptions = () => {
    if (!minPrice) return priceOptions;
    return priceOptions.filter(option => parseInt(option.value) >= minPrice);
  };

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
          {getMinOptions().map((option) => (
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
          {getMaxOptions().map((option) => (
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
