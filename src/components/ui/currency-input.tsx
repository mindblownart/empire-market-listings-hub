
import * as React from "react";
import { Input } from "./input";
import { formatNumberWithCommas, unformatNumber } from "@/lib/formatters";
import { convertCurrency } from "@/lib/exchangeRates";

// Create a useMergedRef hook to combine multiple refs
function useMergedRef<T>(...refs: (React.Ref<T> | undefined)[]): React.RefCallback<T> {
  return React.useCallback((value: T) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(value);
      } else if (ref != null) {
        (ref as React.MutableRefObject<T | null>).current = value;
      }
    });
  }, [refs]);
}

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
  return `${currencyCode} ${currencySymbols[currencyCode] || ""}`;
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
    const [cursorPosition, setCursorPosition] = React.useState<number | null>(null);
    const prevCurrencyRef = React.useRef<string>(currencyCode);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const mergedRef = useMergedRef(ref, inputRef);
    
    // Format initial value and handle external value changes
    React.useEffect(() => {
      if (value !== undefined) {
        const formattedValue = formatWithCurrency(value, currencyCode, locale);
        setDisplayValue(formattedValue);
      }
    }, [value, locale, currencyCode]);
    
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
        const formattedValue = formatWithCurrency(convertedValue, currencyCode, locale);
        setDisplayValue(formattedValue);
        
        // Pass the raw numeric value to parent
        onChange(convertedValue);
      }
      
      // Store current currency for next comparison
      prevCurrencyRef.current = currencyCode;
    }, [currencyCode, originalValue, originalCurrency, onChange, locale, isFirstMount]);
    
    // Format a numeric value with currency prefix
    const formatWithCurrency = (numericValue: string, currency: string, loc: string): string => {
      if (!numericValue || numericValue === "") return "";
      
      try {
        const num = parseFloat(numericValue);
        if (isNaN(num)) return "";
        
        // Format with currency symbol and thousands separators
        return `${getCurrencyPrefix(currency)} ${new Intl.NumberFormat(loc, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(num)}`;
      } catch (error) {
        console.error("Error formatting currency:", error);
        return numericValue;
      }
    };
    
    // Extract numeric value from formatted string
    const extractNumericValue = (formattedValue: string): string => {
      // Remove everything except digits and decimal point
      return formattedValue.replace(/[^\d.]/g, '');
    };
    
    // Calculate cursor position after formatting
    const calculateCursorPosition = (
      previousValue: string,
      newValue: string,
      previousPosition: number | null
    ): number => {
      if (previousPosition === null) return newValue.length;
      
      // Count additional chars added before cursor position
      const previousClean = previousValue.substring(0, previousPosition).replace(/[^\d.]/g, '');
      const additionalChars = newValue.length - previousValue.replace(/[^\d.]/g, '').length;
      
      return previousPosition + additionalChars;
    };
    
    // Handle input changes with formatting
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const cursorPos = e.target.selectionStart;
      
      // Extract numeric value
      const numericValue = extractNumericValue(inputValue);
      
      if (numericValue === "" || /^[0-9]*\.?[0-9]*$/.test(numericValue)) {
        // Format the value
        const formattedValue = formatWithCurrency(numericValue, currencyCode, locale);
        
        // Save cursor position for restoration
        setCursorPosition(calculateCursorPosition(displayValue, formattedValue, cursorPos));
        
        // Update display and parent value
        setDisplayValue(formattedValue);
        onChange(numericValue);
      }
    };
    
    // Restore cursor position after render
    React.useEffect(() => {
      if (cursorPosition !== null && inputRef.current) {
        inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
        setCursorPosition(null);
      }
    }, [displayValue, cursorPosition]);
    
    return (
      <Input
        {...props}
        ref={mergedRef}
        value={displayValue}
        onChange={handleChange}
        inputMode="decimal"
        className={className}
        placeholder={props.placeholder || `${getCurrencyPrefix(currencyCode)} 0.00`}
      />
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";
