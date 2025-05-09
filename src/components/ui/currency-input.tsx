
import * as React from "react";
import { Input } from "./input";
import { formatNumberWithCommas, unformatNumber } from "@/lib/formatters";

export interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  currencyCode?: string;
  locale?: string;
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, currencyCode = "USD", locale = "en-US", className, ...props }, ref) => {
    // Store both raw value and formatted display value
    const [displayValue, setDisplayValue] = React.useState<string>("");
    
    // Format the initial value when it changes externally
    React.useEffect(() => {
      if (value !== undefined) {
        setDisplayValue(value ? formatNumberWithCommas(value, locale) : "");
      }
    }, [value, locale]);
    
    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      
      // Remove all non-numeric characters except decimal point
      const numericValue = unformatNumber(inputValue);
      
      // Validate: Allow empty string or valid number patterns with up to 2 decimal places
      if (numericValue === "" || /^[0-9]+(\.[0-9]{0,2})?$/.test(numericValue)) {
        // Update the display value with proper formatting
        setDisplayValue(numericValue ? formatNumberWithCommas(numericValue, locale) : "");
        
        // Pass the raw numeric value to parent
        onChange(numericValue);
      }
    };

    // Focus handler to select all text when focusing
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      if (props.onFocus) props.onFocus(e);
      e.target.select();
    };
    
    return (
      <Input
        {...props}
        ref={ref}
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        inputMode="decimal"
        className={className}
      />
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";
