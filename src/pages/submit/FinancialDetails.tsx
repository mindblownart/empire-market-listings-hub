
import React from 'react';
import { BusinessFormData } from '@/contexts/FormDataContext';
import CurrencyField from '@/components/submit/CurrencyField';
import SelectField from '@/components/submit/SelectField';

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
  
  // Generate years for dropdown (1950 to current year, in descending order)
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const options = [];
    for (let year = currentYear; year >= 1950; year--) {
      options.push({ value: year.toString(), label: year.toString() });
    }
    return options;
  };
  
  // Generate employee count options with steps
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
        <CurrencyField
          id="business-askingprice"
          label="Asking Price"
          value={formData.askingPrice}
          onChange={handleNumericInputChange('askingPrice')}
          onKeyDown={handleKeyDown}
          nextFieldId="business-annualrevenue"
          currencyCode={currentCurrency}
          locale={currentLocale}
          validationError={validationErrors.askingPrice}
          originalValue={formData.originalValues.askingPrice}
          originalCurrency={formData.originalValues.currencyCode}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-4">
        <CurrencyField
          id="business-annualrevenue"
          label="Annual Revenue"
          value={formData.annualRevenue}
          onChange={handleNumericInputChange('annualRevenue')}
          onKeyDown={handleKeyDown}
          nextFieldId="business-annualprofit"
          currencyCode={currentCurrency}
          locale={currentLocale}
          validationError={validationErrors.annualRevenue}
          originalValue={formData.originalValues.annualRevenue}
          originalCurrency={formData.originalValues.currencyCode}
        />
        
        <CurrencyField
          id="business-annualprofit"
          label="Annual Profit"
          value={formData.annualProfit}
          onChange={handleNumericInputChange('annualProfit')}
          onKeyDown={handleKeyDown}
          nextFieldId="business-yearestablished"
          currencyCode={currentCurrency}
          locale={currentLocale}
          validationError={validationErrors.annualProfit}
          originalValue={formData.originalValues.annualProfit}
          originalCurrency={formData.originalValues.currencyCode}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-4">
        <SelectField
          id="business-yearestablished"
          label="Year Established"
          value={formData.yearEstablished}
          options={yearOptions}
          onChange={(value) => handleSelectChange('yearEstablished', value)}
          onKeyDown={handleKeyDown}
          nextFieldId="business-employees"
          validationError={validationErrors.yearEstablished}
          placeholder="e.g. 2010"
        />
        
        <SelectField
          id="business-employees"
          label="Number of Employees"
          value={formData.employees}
          options={employeeOptions}
          onChange={(value) => handleSelectChange('employees', value)}
          onKeyDown={handleKeyDown}
          nextFieldId="description"
          validationError={validationErrors.employees}
          placeholder="e.g. 25"
        />
      </div>
    </div>
  );
};

export default FinancialDetails;
