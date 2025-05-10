
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CurrencyInput } from '@/components/ui/currency-input';
import { BusinessFormData } from '@/contexts/FormDataContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

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
  
  // Generate years for dropdown (1980 to current year)
  const years = [];
  for (let year = currentYear; year >= 1980; year--) {
    years.push(year.toString());
  }
  
  // Generate employee count options
  const generateEmployeeOptions = () => {
    const options = [];
    
    // Individual numbers from 1-9
    for (let i = 1; i <= 9; i++) {
      options.push(i.toString());
    }
    
    // Tens from 10-90
    for (let i = 10; i <= 90; i += 10) {
      options.push(i.toString());
    }
    
    // Hundreds from 100-900
    for (let i = 100; i <= 900; i += 100) {
      options.push(i.toString());
    }
    
    // Add 1000+
    options.push("1000+");
    
    return options;
  };
  
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
          <Select
            value={formData.yearEstablished}
            onValueChange={(value) => handleSelectChange('yearEstablished', value)}
          >
            <SelectTrigger 
              id="business-yearestablished" 
              className={validationErrors.yearEstablished ? "border-red-500 focus-visible:ring-red-500" : ""}
              onKeyDown={(e) => handleKeyDown(e, 'business-employees')}
            >
              <SelectValue placeholder="e.g. 2010" />
            </SelectTrigger>
            <SelectContent className="max-h-[240px]">
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validationErrors.yearEstablished && (
            <p className="text-sm font-medium text-red-500">{validationErrors.yearEstablished}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="business-employees">Number of Employees</Label>
          <Select
            value={formData.employees}
            onValueChange={(value) => handleSelectChange('employees', value)}
          >
            <SelectTrigger 
              id="business-employees" 
              className={validationErrors.employees ? "border-red-500 focus-visible:ring-red-500" : ""}
              onKeyDown={(e) => handleKeyDown(e, 'description')}
            >
              <SelectValue placeholder="e.g. 25" />
            </SelectTrigger>
            <SelectContent className="max-h-[240px]">
              {employeeOptions.map((count) => (
                <SelectItem key={count} value={count}>
                  {count}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validationErrors.employees && (
            <p className="text-sm font-medium text-red-500">{validationErrors.employees}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialDetails;
