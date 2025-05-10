
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CurrencyInput } from '@/components/ui/currency-input';
import { BusinessFormData } from '@/contexts/FormDataContext';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FinancialDetailsProps {
  formData: BusinessFormData;
  updateFormData: (data: Partial<BusinessFormData>) => void;
  validationErrors: Record<string, string>;
  validateField: (field: string, value: any) => boolean;
}

const FinancialDetails: React.FC<FinancialDetailsProps> = ({
  formData,
  updateFormData,
  validationErrors,
  validateField
}) => {
  // Get current currency based on selected country
  const currentCurrency = formData.currencyCode || "USD";
  const currentLocale = formData.location === 'us' ? 'en-US' : 
                      formData.location === 'gb' ? 'en-GB' : 
                      formData.location === 'au' ? 'en-AU' : 'en-US';
  
  // Handle input changes for numeric fields
  const handleNumericInputChange = (fieldName: string) => (value: string) => {
    updateFormData({ [fieldName]: value });
    validateField(fieldName, value);
  };
  
  // Handle select changes
  const handleSelectChange = (id: string, value: string) => {
    updateFormData({ [id]: value });
    validateField(id, value);
  };

  // Handle key press in fields to enable tabbing in the proper order
  const handleKeyDown = (e: React.KeyboardEvent, nextFieldId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextField = document.getElementById(nextFieldId);
      if (nextField) nextField.focus();
    }
  };
  
  // Get current year for the year established dropdown
  const currentYear = new Date().getFullYear();
  
  // Generate years for dropdown (1950 to current year, in descending order)
  const generateYearOptions = () => {
    const options = [];
    for (let year = currentYear; year >= 1950; year--) {
      options.push({ value: year.toString(), label: year.toString() });
    }
    return options;
  };
  
  // Generate employee count options with steps (1-50: step 1, 51-200: step 10, 201-1000: step 100, and 1000+)
  const generateEmployeeOptions = () => {
    const options = [];
    
    // 1-50: step of 1
    for (let i = 1; i <= 50; i++) {
      options.push({ value: i.toString(), label: i.toString() });
    }
    
    // 51-200: step of 10
    for (let i = 60; i <= 200; i += 10) {
      options.push({ value: i.toString(), label: i.toString() });
    }
    
    // 201-1000: step of 100
    for (let i = 300; i <= 1000; i += 100) {
      options.push({ value: i.toString(), label: i.toString() });
    }
    
    // Add 1000+
    options.push({ value: "1000+", label: "1000+" });
    
    return options;
  };
  
  const yearOptions = generateYearOptions();
  const employeeOptions = generateEmployeeOptions();
  
  return (
    <div>
      <div className="grid gap-4 md:grid-cols-1">
        <div className="space-y-2">
          <Label htmlFor="business-askingprice">Asking Price ({currentCurrency})</Label>
          <CurrencyInput 
            id="business-askingprice" 
            value={formData.askingPrice}
            onChange={handleNumericInputChange('askingPrice')}
            onKeyDown={(e) => handleKeyDown(e, 'business-annualrevenue')}
            currencyCode={currentCurrency}
            locale={currentLocale}
            placeholder={`Enter asking price in ${currentCurrency}`}
            aria-invalid={!!validationErrors.askingPrice}
            className={validationErrors.askingPrice ? "border-red-500 focus-visible:ring-red-500" : ""}
            autoComplete="off"
            originalValue={formData.originalValues.askingPrice}
            originalCurrency={formData.originalValues.currencyCode}
          />
          {validationErrors.askingPrice && (
            <p className="text-sm font-medium text-red-500">{validationErrors.askingPrice}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-4">
        <div className="space-y-2">
          <Label htmlFor="business-annualrevenue">Annual Revenue ({currentCurrency})</Label>
          <CurrencyInput
            id="business-annualrevenue" 
            value={formData.annualRevenue}
            onChange={handleNumericInputChange('annualRevenue')}
            onKeyDown={(e) => handleKeyDown(e, 'business-annualprofit')}
            currencyCode={currentCurrency}
            locale={currentLocale}
            placeholder={`Enter annual revenue in ${currentCurrency}`}
            aria-invalid={!!validationErrors.annualRevenue}
            className={validationErrors.annualRevenue ? "border-red-500 focus-visible:ring-red-500" : ""}
            autoComplete="off"
            originalValue={formData.originalValues.annualRevenue}
            originalCurrency={formData.originalValues.currencyCode}
          />
          {validationErrors.annualRevenue && (
            <p className="text-sm font-medium text-red-500">{validationErrors.annualRevenue}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="business-annualprofit">Annual Profit ({currentCurrency})</Label>
          <CurrencyInput
            id="business-annualprofit"
            value={formData.annualProfit}
            onChange={handleNumericInputChange('annualProfit')}
            onKeyDown={(e) => handleKeyDown(e, 'business-yearestablished')}
            currencyCode={currentCurrency}
            locale={currentLocale}
            placeholder={`Enter annual profit in ${currentCurrency}`}
            aria-invalid={!!validationErrors.annualProfit}
            className={validationErrors.annualProfit ? "border-red-500 focus-visible:ring-red-500" : ""}
            autoComplete="off"
            originalValue={formData.originalValues.annualProfit}
            originalCurrency={formData.originalValues.currencyCode}
          />
          {validationErrors.annualProfit && (
            <p className="text-sm font-medium text-red-500">{validationErrors.annualProfit}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-4">
        <div className="space-y-2">
          <Label htmlFor="business-yearestablished">Year Established</Label>
          <Popover>
            <PopoverTrigger asChild>
              <button
                id="business-yearestablished"
                type="button"
                role="combobox"
                aria-expanded="false"
                className={cn(
                  "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                  validationErrors.yearEstablished ? "border-red-500 focus-visible:ring-red-500" : ""
                )}
                onKeyDown={(e) => handleKeyDown(e, 'business-employees')}
              >
                {formData.yearEstablished || <span className="text-muted-foreground">e.g. 2010</span>}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Search year..." className="h-9" />
                <CommandList>
                  <CommandEmpty>No year found.</CommandEmpty>
                  <CommandGroup className="max-h-[300px] overflow-auto">
                    {yearOptions.map((year) => (
                      <CommandItem
                        key={year.value}
                        value={year.value}
                        onSelect={() => {
                          handleSelectChange('yearEstablished', year.value);
                          document.getElementById('business-employees')?.focus();
                        }}
                      >
                        {year.label}
                        {formData.yearEstablished === year.value && (
                          <Check className="ml-auto h-4 w-4" />
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {validationErrors.yearEstablished && (
            <p className="text-sm font-medium text-red-500">{validationErrors.yearEstablished}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="business-employees">Number of Employees</Label>
          <Popover>
            <PopoverTrigger asChild>
              <button
                id="business-employees"
                type="button"
                role="combobox"
                aria-expanded="false"
                className={cn(
                  "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                  validationErrors.employees ? "border-red-500 focus-visible:ring-red-500" : ""
                )}
                onKeyDown={(e) => handleKeyDown(e, 'description')}
              >
                {formData.employees || <span className="text-muted-foreground">e.g. 25</span>}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Search number..." className="h-9" />
                <CommandList>
                  <CommandEmpty>No number found.</CommandEmpty>
                  <CommandGroup className="max-h-[300px] overflow-auto">
                    {employeeOptions.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={() => {
                          handleSelectChange('employees', option.value);
                          document.getElementById('description')?.focus();
                        }}
                      >
                        {option.label}
                        {formData.employees === option.value && (
                          <Check className="ml-auto h-4 w-4" />
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {validationErrors.employees && (
            <p className="text-sm font-medium text-red-500">{validationErrors.employees}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialDetails;
