
import * as React from "react";
import { convertCurrencyLive } from "@/lib/exchangeRates";
import { toast } from "sonner";

interface UseCurrencyConverterProps {
  originalValue?: string;
  originalCurrency?: string;
  targetCurrency: string;
  onConversionComplete: (convertedValue: string) => void;
}

export function useCurrencyConverter({
  originalValue,
  originalCurrency,
  targetCurrency,
  onConversionComplete,
}: UseCurrencyConverterProps) {
  const [isConversionFailed, setIsConversionFailed] = React.useState<boolean>(false);

  // Convert value when currency changes and original values exist
  React.useEffect(() => {
    // Only perform conversion if we have an original value and currency
    if (originalValue && originalCurrency && targetCurrency !== originalCurrency) {
      const convertValue = async () => {
        try {
          const { convertedAmount, rateSource } = await convertCurrencyLive(
            originalValue,
            originalCurrency,
            targetCurrency
          );
          
          // Update the value
          onConversionComplete(convertedAmount);
          
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
  }, [targetCurrency, originalValue, originalCurrency, onConversionComplete]);

  return { isConversionFailed };
}
