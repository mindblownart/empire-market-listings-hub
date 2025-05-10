
/**
 * Exchange rates for different currencies against USD
 * These are fixed rates for demo purposes and serve as fallback
 * In production, these would come from an API
 */
export const exchangeRates: Record<string, number> = {
  USD: 1.00,    // Base currency
  EUR: 0.93,    // 1 USD = 0.93 EUR
  GBP: 0.79,    // 1 USD = 0.79 GBP
  CAD: 1.38,    // 1 USD = 1.38 CAD
  AUD: 1.53,    // 1 USD = 1.53 AUD
  SGD: 1.36,    // 1 USD = 1.36 SGD
  JPY: 156.69,  // 1 USD = 156.69 JPY
  INR: 83.36,   // 1 USD = 83.36 INR
  MYR: 4.72,    // 1 USD = 4.72 MYR
};

// Cache for live exchange rates
let liveExchangeRatesCache: Record<string, number> | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

/**
 * Fetch live exchange rates from a public API
 * @returns Promise resolving to exchange rates object or null if fetch fails
 */
export async function fetchLiveExchangeRates(): Promise<Record<string, number> | null> {
  try {
    // If we have cached rates and they're less than an hour old, use those
    if (liveExchangeRatesCache && (Date.now() - lastFetchTime < CACHE_DURATION)) {
      return liveExchangeRatesCache;
    }
    
    // Using a free API for exchange rates (no API key needed)
    const response = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!response.ok) throw new Error('Failed to fetch exchange rates');
    
    const data = await response.json();
    
    if (data && data.rates) {
      liveExchangeRatesCache = data.rates;
      lastFetchTime = Date.now();
      console.log('Fetched live exchange rates:', liveExchangeRatesCache);
      return liveExchangeRatesCache;
    }
    
    throw new Error('Invalid exchange rate data format');
  } catch (error) {
    console.error('Error fetching live exchange rates:', error);
    return null;
  }
}

/**
 * Get the exchange rate between two currencies
 * First tries live rates, falls back to fixed rates if necessary
 * @param fromCurrency - The source currency
 * @param toCurrency - The target currency
 * @returns The exchange rate from source to target
 */
export async function getLiveExchangeRate(fromCurrency: string, toCurrency: string): Promise<{
  rate: number;
  source: 'live' | 'fallback';
}> {
  if (fromCurrency === toCurrency) return { rate: 1, source: 'live' };
  
  try {
    // Try to get live rates first
    const liveRates = await fetchLiveExchangeRates();
    
    if (liveRates) {
      const fromRate = liveRates[fromCurrency] || exchangeRates[fromCurrency] || 1;
      const toRate = liveRates[toCurrency] || exchangeRates[toCurrency] || 1;
      return { rate: toRate / fromRate, source: 'live' };
    }
  } catch (error) {
    console.error('Error getting live exchange rate:', error);
  }
  
  // Fall back to fixed rates
  const fromRate = exchangeRates[fromCurrency] || 1;
  const toRate = exchangeRates[toCurrency] || 1;
  return { rate: toRate / fromRate, source: 'fallback' };
}

/**
 * Get the exchange rate between two currencies (synchronous version)
 * @param fromCurrency - The source currency
 * @param toCurrency - The target currency
 * @returns The exchange rate from source to target
 */
export function getExchangeRate(fromCurrency: string, toCurrency: string): number {
  if (fromCurrency === toCurrency) return 1;
  
  // Both rates against USD
  const fromRate = exchangeRates[fromCurrency] || 1;
  const toRate = exchangeRates[toCurrency] || 1;
  
  // Convert fromCurrency to USD, then to toCurrency
  return toRate / fromRate;
}

/**
 * Convert an amount from one currency to another
 * @param amount - The amount to convert
 * @param fromCurrency - The source currency
 * @param toCurrency - The target currency
 * @returns The converted amount as a string with up to 2 decimal places
 */
export function convertCurrency(amount: string, fromCurrency: string, toCurrency: string): string {
  if (!amount || isNaN(parseFloat(amount))) return '';
  
  const numericAmount = parseFloat(amount);
  const exchangeRate = getExchangeRate(fromCurrency, toCurrency);
  const convertedAmount = numericAmount * exchangeRate;
  
  // Return with up to 2 decimal places as string
  return convertedAmount.toFixed(2).replace(/\.00$/, '');
}

/**
 * Convert an amount from one currency to another using live rates
 * @param amount - The amount to convert
 * @param fromCurrency - The source currency
 * @param toCurrency - The target currency
 * @returns A promise resolving to the converted amount and rate source
 */
export async function convertCurrencyLive(
  amount: string, 
  fromCurrency: string, 
  toCurrency: string
): Promise<{
  convertedAmount: string;
  rateSource: 'live' | 'fallback';
}> {
  if (!amount || isNaN(parseFloat(amount))) {
    return { convertedAmount: '', rateSource: 'fallback' };
  }
  
  const numericAmount = parseFloat(amount);
  const { rate, source } = await getLiveExchangeRate(fromCurrency, toCurrency);
  const convertedAmount = numericAmount * rate;
  
  // Return with up to 2 decimal places as string
  return { 
    convertedAmount: convertedAmount.toFixed(2).replace(/\.00$/, ''), 
    rateSource: source 
  };
}
