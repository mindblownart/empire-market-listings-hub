
import * as React from "react";
import { Input } from "./input";
import { formatLiveCurrency, unformatNumber } from "@/lib/formatters";
import { convertCurrencyLive } from "@/lib/exchangeRates";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

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
    const [cursorPosition, setCursorPosition] = React.useState<number | null>(null);
    const [isFocused, setIsFocused] = React.useState<boolean>(false);
    const [isConversionFailed, setIsConversionFailed] = React.useState<boolean>(false);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const mergedRef = useMergedRef(ref, inputRef);
    
    // Convert value when currency changes and original values exist
    React.useEffect(() => {
      // Only perform conversion if we have an original value and currency
      if (originalValue && originalCurrency && currencyCode !== originalCurrency) {
        const convertValue = async () => {
          try {
            const { convertedAmount, rateSource } = await convertCurrencyLive(
              originalValue,
              originalCurrency,
              currencyCode
            );
            
            // Update the value
            onChange(convertedAmount);
            
            // Show fallback warning if needed
            if (rateSource === 'fallback') {
              setIsConversionFailed(true);
              toast.warning("Unable to fetch live rates. Using estimated conversion.", {
                duration: 5000,
                position: "bottom-center",
              });
            } else {
              setIsConversionFailed(false);
            }
          } catch (error) {
            console.error('Error converting currency:', error);
            setIsConversionFailed(true);
            toast.error("Currency conversion error. Using estimated rates.", {
              duration: 5000,
              position: "bottom-center",
            });
          }
        };
        
        convertValue();
      }
    }, [currencyCode, originalValue, originalCurrency, onChange]);
    
    // Update display value whenever value changes from outside
    React.useEffect(() => {
      if (value !== undefined) {
        const formattedValue = formatLiveCurrency(value, currencyCode, locale);
        setDisplayValue(formattedValue);
      }
    }, [value, currencyCode, locale]);
    
    // Calculate cursor position after formatting
    const calculateCursorPosition = (
      previousValue: string,
      newValue: string,
      previousPosition: number,
      operation: 'insert' | 'delete'
    ): number => {
      if (previousPosition === null) return newValue.length;
      
      const prevValueBeforeCursor = previousValue.substring(0, previousPosition);
      const prevCleanValue = unformatNumber(prevValueBeforeCursor);
      
      // Calculate how many formatting characters have been added
      const formattingCharsBeforeCursor = prevValueBeforeCursor.length - prevCleanValue.length;
      
      // Determine offset based on operation type
      const offset = operation === 'insert' ? 1 : -1;
      
      // Currency code + symbol + space adds chars at the beginning
      const prefixLength = currencyCode.length + 2; // "USD $" format
      
      // Calculate new cursor position considering prefixes and formatting
      const currencyPrefixOffset = prefixLength;
      
      // Determine position in the new formatted value
      let newPosition = prevCleanValue.length + currencyPrefixOffset + formattingCharsBeforeCursor;
      
      // Adjust for operation
      if (operation === 'insert') {
        // Count how many formatting chars are added before the insertion point
        const newFormattedValue = formatLiveCurrency(value, currencyCode, locale);
        const newCleanValue = unformatNumber(newFormattedValue);
        
        // Calculate formatting chars in the new value
        const formattingCharsInNewValue = newFormattedValue.length - newCleanValue.length - currencyPrefixOffset;
        
        // Adjust for additional formatting chars (like commas) that might have been added
        const additionalFormattingChars = formattingCharsInNewValue - formattingCharsBeforeCursor;
        newPosition += Math.max(0, additionalFormattingChars);
      }
      
      return Math.max(currencyPrefixOffset, Math.min(newPosition, newValue.length));
    };
    
    // Handle input changes with live formatting
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newInputValue = e.target.value;
      const cursorPos = e.target.selectionStart || 0;
      const operation = newInputValue.length > displayValue.length ? 'insert' : 'delete';
      
      // Extract the numeric value (remove all formatting)
      let numericValue = unformatNumber(newInputValue);
      
      // Safety check: ensure we're working with valid numbers or empty string
      if (numericValue === "" || /^[0-9]*\.?[0-9]*$/.test(numericValue)) {
        // Format the value for display
        const formattedValue = formatLiveCurrency(numericValue, currencyCode, locale);
        
        // Calculate cursor position to prevent jumps
        const newCursorPos = calculateCursorPosition(
          displayValue,
          formattedValue,
          cursorPos,
          operation
        );
        
        // Update state
        setDisplayValue(formattedValue);
        setCursorPosition(newCursorPos);
        
        // Pass the raw numeric value to parent
        onChange(numericValue);
      }
    };
    
    // Handle focus events
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      if (props.onFocus) {
        props.onFocus(e);
      }
    };
    
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      
      // Ensure proper formatting on blur
      const numericValue = value;
      const formattedValue = formatLiveCurrency(numericValue, currencyCode, locale);
      setDisplayValue(formattedValue);
      
      if (props.onBlur) {
        props.onBlur(e);
      }
    };
    
    // Restore cursor position after render
    React.useEffect(() => {
      if (cursorPosition !== null && inputRef.current && isFocused) {
        inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
        setCursorPosition(null);
      }
    }, [displayValue, cursorPosition, isFocused]);
    
    // Get placeholder with currency code
    const getPlaceholder = () => {
      if (props.placeholder) return props.placeholder;
      return `Enter amount`;
    };
    
    return (
      <div className="relative">
        <Input
          {...props}
          ref={mergedRef}
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          inputMode="decimal"
          className={className}
          placeholder={getPlaceholder()}
        />
        {isConversionFailed && !isFocused && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-amber-500">
            <AlertTriangle className="h-4 w-4" />
          </div>
        )}
      </div>
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";
