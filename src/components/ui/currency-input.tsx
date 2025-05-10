
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
    const [isFocused, setIsFocused] = React.useState<boolean>(false);
    const [isFirstMount, setIsFirstMount] = React.useState(true);
    const prevCurrencyRef = React.useRef<string>(currencyCode);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const mergedRef = useMergedRef(ref, inputRef);
    
    // Format the initial value when it changes externally
    React.useEffect(() => {
      if (value !== undefined) {
        // Only format when not focused
        if (!isFocused) {
          setDisplayValue(value ? formatNumberWithCommas(value, locale) : "");
        } else {
          // When focused, just use the raw value
          setDisplayValue(value);
        }
      }
    }, [value, locale, isFocused]);
    
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
        
        // Update display value with proper formatting (only if not focused)
        if (!isFocused) {
          setDisplayValue(convertedValue ? formatNumberWithCommas(convertedValue, locale) : "");
        } else {
          setDisplayValue(convertedValue);
        }
        
        // Pass the raw numeric value to parent
        onChange(convertedValue);
      }
      
      // Store current currency for next comparison
      prevCurrencyRef.current = currencyCode;
      
    }, [currencyCode, originalValue, originalCurrency, onChange, locale, isFirstMount, isFocused]);
    
    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      
      // When editing, we work with the raw numeric input
      // Allow decimal point and digits
      if (/^[0-9]*\.?[0-9]*$/.test(inputValue) || inputValue === "") {
        setDisplayValue(inputValue);
        onChange(inputValue);
      }
    };

    // Focus handler
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      
      // When focusing, convert display value to raw numeric value
      if (value) {
        const rawValue = unformatNumber(value);
        setDisplayValue(rawValue);
      }
      
      if (props.onFocus) props.onFocus(e);
    };

    // Blur handler
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      
      // Format the value when input loses focus
      if (displayValue) {
        // Format with commas and decimals
        const formattedValue = formatNumberWithCommas(displayValue, locale);
        setDisplayValue(formattedValue);
      }
      
      if (props.onBlur) props.onBlur(e);
    };
    
    return (
      <div className="relative">
        {!isFocused && displayValue && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
            {getCurrencyPrefix(currencyCode)}
          </div>
        )}
        <Input
          {...props}
          ref={mergedRef}
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          inputMode="decimal"
          className={`${!isFocused && displayValue ? `pl-[${getCurrencyPrefix(currencyCode).length * 0.6 + 3}rem]` : ''} ${className}`}
          style={!isFocused && displayValue ? { paddingLeft: `${getCurrencyPrefix(currencyCode).length * 0.6 + 0.75}rem` } : {}}
          placeholder={props.placeholder || "Enter amount"}
        />
      </div>
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";
