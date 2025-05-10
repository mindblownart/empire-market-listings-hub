import * as React from "react";
import { Input } from "./input";
import { formatNumberWithCommas, unformatNumber } from "@/lib/formatters";
import { convertCurrency } from "@/lib/exchangeRates";

export interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  currencyCode?: string;
  locale?: string;
  originalValue?: string;
  originalCurrency?: string;
}

// Map of currency codes to their symbols
const currencySymbols: Record<string, string> = {
  USD: "$",
  SGD: "S$",
  GBP: "£",
  EUR: "€",
  JPY: "¥",
  AUD: "A$",
  CAD: "C$",
  INR: "₹",
  MYR: "RM",
};

// Function to get the display prefix for a currency
const getCurrencyPrefix = (currencyCode: string): string => {
  if (currencyCode === "USD") return "USD $";
  if (currencyCode === "SGD") return "SGD $";
  if (currencyCode === "GBP") return "GBP £";
  if (currencyCode === "EUR") return "EUR €";
  if (currencyCode === "JPY") return "JPY ¥";
  if (currencyCode === "AUD") return "AUD $";
  if (currencyCode === "CAD") return "CAD $";
  if (currencyCode === "INR") return "INR ₹";
  if (currencyCode === "MYR") return "MYR RM";
  return `${currencyCode} `;
};

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ 
    value, 
    onChange, 
    currencyCode = "USD", 
    locale = "en-US", 
    originalValue,
    originalCurrency,
    className, 
    ...props 
  }, ref) => {
    // Store both raw value and formatted display value
    const [displayValue, setDisplayValue] = React.useState<string>("");
    const [isFirstMount, setIsFirstMount] = React.useState(true);
    const prevCurrencyRef = React.useRef<string>(currencyCode);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const mergedRef = React.useMergedRef(ref, inputRef);
    
    // Format the initial value when it changes externally
    React.useEffect(() => {
      if (value !== undefined) {
        setDisplayValue(value ? formatNumberWithCommas(value, locale) : "");
      }
    }, [value, locale]);
    
    // Handle currency code changes and perform conversion if needed
    React.useEffect(() => {
      // Skip on first mount to prevent unnecessary conversions
      if (isFirstMount) {
        setIsFirstMount(false);
        prevCurrencyRef.current = currencyCode;
        return;
      }
      
      // If currency changed and we have original values
      if (prevCurrencyRef.current !== currencyCode && 
          originalValue && originalValue !== "" && 
          originalCurrency && originalCurrency !== "") {
        
        // Convert from original currency to new currency
        const convertedValue = convertCurrency(
          originalValue,
          originalCurrency,
          currencyCode
        );
        
        // Update display value with proper formatting
        setDisplayValue(convertedValue ? formatNumberWithCommas(convertedValue, locale) : "");
        
        // Pass the raw numeric value to parent
        onChange(convertedValue);
      }
      
      // Store current currency for next comparison
      prevCurrencyRef.current = currencyCode;
      
    }, [currencyCode, originalValue, originalCurrency, onChange, locale, isFirstMount]);
    
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

    // Cursor position management
    React.useEffect(() => {
      // Fix cursor position after number formatting
      if (inputRef.current && document.activeElement === inputRef.current) {
        // Keep cursor position adjustment functionality
      }
    }, [displayValue]);
    
    // Get the currency prefix
    const currencyPrefix = getCurrencyPrefix(currencyCode);
    
    return (
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
          {currencyPrefix}
        </div>
        <Input
          {...props}
          ref={mergedRef}
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          inputMode="decimal"
          className={`pl-[${currencyPrefix.length * 0.6 + 3}rem] ${className}`}
          style={{ paddingLeft: `${currencyPrefix.length * 0.6 + 0.75}rem` }}
        />
      </div>
    );
  }
);

// Add the useMergedRef utility function
React.useMergedRef = <T extends HTMLElement>(
  ...refs: (React.Ref<T> | undefined)[]
): React.RefCallback<T> => (value) => {
  refs.forEach((ref) => {
    if (typeof ref === "function") {
      ref(value);
    } else if (ref != null) {
      (ref as React.MutableRefObject<T | null>).current = value;
    }
  });
};

CurrencyInput.displayName = "CurrencyInput";
