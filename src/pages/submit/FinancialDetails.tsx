
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CurrencyInput } from '@/components/ui/currency-input';
import { BusinessFormData } from '@/contexts/FormDataContext';

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
  
  // Handle number-only inputs like employees
  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'employees' && value !== '') {
      // Only allow numbers
      const numericValue = value.replace(/\D/g, '');
      updateFormData({ [name]: numericValue });
      validateField(name, numericValue);
      return;
    }
    
    // For year established, only allow 4-digit year
    if (name === 'yearEstablished' && value !== '') {
      const numericValue = value.replace(/\D/g, '').slice(0, 4);
      updateFormData({ [name]: numericValue });
      validateField(name, numericValue);
      return;
    }
    
    updateFormData({ [name]: value });
    validateField(name, value);
  };

  // Handle key press in fields to enable tabbing in the proper order
  const handleKeyDown = (e: React.KeyboardEvent, nextFieldId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextField = document.getElementById(nextFieldId);
      if (nextField) nextField.focus();
    }
  };
  
  // Get current year for the year established max value
  const currentYear = new Date().getFullYear();
  
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
          <Input
            id="business-yearestablished"
            name="yearEstablished"
            type="text"
            inputMode="numeric"
            value={formData.yearEstablished}
            onChange={handleTextInputChange}
            onKeyDown={(e) => handleKeyDown(e, 'business-employees')}
            placeholder="e.g. 2010"
            maxLength={4}
            className={validationErrors.yearEstablished ? "border-red-500 focus-visible:ring-red-500" : ""}
            autoComplete="off"
          />
          {validationErrors.yearEstablished && (
            <p className="text-sm font-medium text-red-500">{validationErrors.yearEstablished}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="business-employees">Number of Employees</Label>
          <Input
            id="business-employees"
            name="employees"
            type="text"
            inputMode="numeric"
            value={formData.employees}
            onChange={handleTextInputChange}
            onKeyDown={(e) => handleKeyDown(e, 'description')}
            placeholder="e.g. 25"
            className={validationErrors.employees ? "border-red-500 focus-visible:ring-red-500" : ""}
            autoComplete="off"
          />
          {validationErrors.employees && (
            <p className="text-sm font-medium text-red-500">{validationErrors.employees}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialDetails;
