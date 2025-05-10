
import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
          <SelectItem value="tech">Technology</SelectItem>
          <SelectItem value="food">Food & Beverage</SelectItem>
          <SelectItem value="retail">Retail</SelectItem>
          <SelectItem value="manufacturing">Manufacturing</SelectItem>
          <SelectItem value="health">Health & Wellness</SelectItem>
          <SelectItem value="service">Professional Services</SelectItem>
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm font-medium text-red-500">{error}</p>
      )}
    </div>
  );
};

export default IndustryField;
