
import * as React from "react";
import { useMergedRef } from "@/hooks/useMergedRef";
import { CurrencyFormatter } from "./currency-formatter";
import { useCurrencyConverter } from "@/hooks/useCurrencyConverter";

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
    const inputRef = React.useRef<HTMLInputElement>(null);
    const mergedRef = useMergedRef(ref, inputRef);
    
    // Handle currency conversion when needed
    const { isConversionFailed } = useCurrencyConverter({
      originalValue,
      originalCurrency,
      targetCurrency: currencyCode,
      onConversionComplete: onChange,
    });
    
    return (
      <CurrencyFormatter
        {...props}
        ref={mergedRef}
        value={value}
        onChange={onChange}
        currencyCode={currencyCode}
        locale={locale}
        isConversionFailed={isConversionFailed}
        className={className}
      />
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";
