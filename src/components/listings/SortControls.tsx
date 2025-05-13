
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Sort options
const sortOptions = [{
  value: 'newest',
  label: 'Newest'
}, {
  value: 'price-high',
  label: 'Price High to Low'
}, {
  value: 'price-low',
  label: 'Price Low to High'
}, {
  value: 'revenue-high',
  label: 'Revenue High to Low'
}];

interface SortControlsProps {
  sortBy: string;
  onSortChange: (value: string) => void;
}

const SortControls: React.FC<SortControlsProps> = ({ sortBy, onSortChange }) => {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-6">
      <div className="ml-auto">
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SortControls;
