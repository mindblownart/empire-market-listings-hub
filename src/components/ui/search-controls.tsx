
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchControlsProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClearSearch?: () => void;
  value: string;
  className?: string;
  placeholder?: string;
}

export function SearchControls({
  onClearSearch,
  value,
  className,
  placeholder = "Search...",
  onChange,
  ...props
}: SearchControlsProps) {
  return (
    <div className={cn("relative w-full", className)}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input 
        type="search" 
        placeholder={placeholder} 
        className="pl-10 pr-10" 
        value={value} 
        onChange={onChange}
        {...props}
      />
      {value && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="absolute right-0 top-0 h-full rounded-l-none p-0 w-10"
          onClick={onClearSearch}
          type="button"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

export default SearchControls;
