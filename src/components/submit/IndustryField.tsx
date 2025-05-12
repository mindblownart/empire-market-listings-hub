
import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LaptopIcon, UtensilsIcon, ShoppingBagIcon, FactoryIcon, HeartPulseIcon, BriefcaseIcon } from 'lucide-react';

interface IndustryFieldProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent, nextFieldId: string) => void;
  error?: string;
}

const IndustryField: React.FC<IndustryFieldProps> = ({
  value,
  onChange,
  onKeyDown,
  error
}) => {
  // Function to get industry label with icon
  const getIndustryLabel = (code: string, label: string) => {
    const iconMap: Record<string, JSX.Element> = {
      'tech': <LaptopIcon className="h-4 w-4 mr-2" />,
      'food': <UtensilsIcon className="h-4 w-4 mr-2" />,
      'retail': <ShoppingBagIcon className="h-4 w-4 mr-2" />,
      'manufacturing': <FactoryIcon className="h-4 w-4 mr-2" />,
      'health': <HeartPulseIcon className="h-4 w-4 mr-2" />,
      'service': <BriefcaseIcon className="h-4 w-4 mr-2" />
    };

    return (
      <div className="flex items-center">
        {iconMap[code]}
        <span>{label}</span>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="industry">Industry</Label>
      <Select
        value={value}
        onValueChange={(value) => onChange(value)}
      >
        <SelectTrigger 
          id="industry" 
          className={error ? "border-red-500 focus-visible:ring-red-500" : ""}
          onKeyDown={(e) => onKeyDown(e, 'location')}
        >
          <SelectValue placeholder="Select industry" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="tech">
            {getIndustryLabel('tech', 'Technology')}
          </SelectItem>
          <SelectItem value="food">
            {getIndustryLabel('food', 'Food & Beverage')}
          </SelectItem>
          <SelectItem value="retail">
            {getIndustryLabel('retail', 'Retail')}
          </SelectItem>
          <SelectItem value="manufacturing">
            {getIndustryLabel('manufacturing', 'Manufacturing')}
          </SelectItem>
          <SelectItem value="health">
            {getIndustryLabel('health', 'Health & Wellness')}
          </SelectItem>
          <SelectItem value="service">
            {getIndustryLabel('service', 'Professional Services')}
          </SelectItem>
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm font-medium text-red-500">{error}</p>
      )}
    </div>
  );
};

export default IndustryField;
