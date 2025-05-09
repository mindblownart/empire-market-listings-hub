
/**
 * Exchange rates for different currencies against USD
 * These are fixed rates for demo purposes
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

/**
 * Get the exchange rate between two currencies
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
