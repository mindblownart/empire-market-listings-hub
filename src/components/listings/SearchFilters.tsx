
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import CountryDropdown from '@/components/CountryDropdown';
import PriceRangeDropdowns from '@/components/PriceRangeDropdowns';
import SearchControls from '@/components/ui/search-controls';

// Categories for filtering
const categories = [{
  value: 'all',
  label: 'All Industries'
}, {
  value: 'tech',
  label: 'Technology'
}, {
  value: 'retail',
  label: 'Retail'
}, {
  value: 'food',
  label: 'Food & Beverage'
}, {
  value: 'health',
  label: 'Health & Wellness'
}, {
  value: 'manufacturing',
  label: 'Manufacturing'
}, {
  value: 'service',
  label: 'Service'
}, {
  value: 'travel',
  label: 'Travel'
}, {
  value: 'fitness',
  label: 'Fitness'
}];

interface SearchFiltersProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSearch: () => void;
  category: string;
  onCategoryChange: (value: string) => void;
  country: string;
  onCountryChange: (value: string) => void;
  minPrice: number;
  maxPrice: number;
  onMinPriceChange: (value: number) => void;
  onMaxPriceChange: (value: number) => void;
  newListingsOnly: boolean;
  onNewListingsChange: (checked: boolean) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchTerm,
  onSearchChange,
  onClearSearch,
  category,
  onCategoryChange,
  country,
  onCountryChange,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  newListingsOnly,
  onNewListingsChange,
  onApplyFilters,
  onClearFilters,
}) => {
  return (
    <div className="bg-white shadow-sm border border-gray-100 rounded-lg mb-10">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-100">
        <SearchControls 
          value={searchTerm}
          onChange={onSearchChange}
          onClearSearch={onClearSearch}
          placeholder="Search businesses by name or description..."
        />
      </div>

      {/* Filter Controls */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Price Range</label>
          <PriceRangeDropdowns
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinChange={onMinPriceChange}
            onMaxChange={onMaxPriceChange}
          />
        </div>

        {/* Industry */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Industry</label>
          <Select value={category} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Industries" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
          <CountryDropdown
            value={country}
            onChange={onCountryChange}
            className="w-full"
          />
        </div>

        {/* Listing Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Listing Status</label>
          <div className="flex items-center space-x-2 mt-1.5">
            <Checkbox
              id="newListings"
              checked={newListingsOnly}
              onCheckedChange={(checked) => onNewListingsChange(checked === true)}
            />
            <label
              htmlFor="newListings"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              New Listings Only
            </label>
          </div>
        </div>
      </div>

      {/* Filter Actions */}
      <div className="p-4 border-t border-gray-100 flex justify-end space-x-2">
        <Button 
          variant="outline" 
          onClick={onClearFilters}
          className="flex items-center gap-1"
        >
          <X className="h-4 w-4" /> Clear All
        </Button>
        <Button onClick={onApplyFilters}>
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default SearchFilters;
