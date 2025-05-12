/**
 * Formats a number with thousands separators and currency symbol
 * @param value - The number to format
 * @param currencyCode - The currency code (e.g., USD, EUR)
 * @param locale - The locale to use for formatting (default: 'en-US')
 * @returns Formatted string with currency and thousands separators
 */
export function formatCurrency(value: string | number, currencyCode: string, locale: string = 'en-US'): string {
  // Handle empty values
  if (value === '' || value === undefined || value === null) return '';
  
  try {
    // Parse the value to a number
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numericValue)) return '';
    
    // Format with currency and thousands separators using Intl.NumberFormat
    // Set minimumFractionDigits and maximumFractionDigits to 0 to remove decimal places
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numericValue);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return String(value);
  }
}

/**
 * Formats a number with thousands separators based on locale
 * @param value - The number to format
 * @param locale - The locale to use for formatting (default: 'en-US')
 * @returns Formatted string with thousands separators
 */
export function formatNumberWithCommas(value: string | number, locale: string = 'en-US'): string {
  // Handle empty values
  if (value === '' || value === undefined || value === null) return '';
  
  try {
    // Parse the value to a number
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numericValue)) return '';
    
    // Format with thousands separators using Intl.NumberFormat
    // Set minimumFractionDigits and maximumFractionDigits to 0 to remove decimal places
    return new Intl.NumberFormat(locale, {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0, // Changed to 0 to remove decimal places
    }).format(numericValue);
  } catch (error) {
    console.error('Error formatting number:', error);
    return String(value);
  }
}

/**
 * Unformats a number by removing non-numeric characters (except decimal point)
 * @param formattedValue - The formatted string (e.g. "1,234.56")
 * @returns Clean numeric string (e.g. "1234.56")
 */
export function unformatNumber(formattedValue: string): string {
  // Replace all non-digit characters except decimal point
  return formattedValue.replace(/[^\d.]/g, '');
}

/**
 * Get currency symbol for a currency code
 * @param currencyCode - The currency code (USD, EUR, etc.)
 * @returns The currency symbol ($, €, etc.)
 */
export function getCurrencySymbol(currencyCode: string): string {
  switch (currencyCode) {
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'GBP': return '£';
    case 'JPY': return '¥';
    case 'AUD': return 'A$';
    case 'CAD': return 'C$';
    case 'SGD': return 'S$';
    case 'INR': return '₹';
    case 'MYR': return 'RM';
    default: return '$';
  }
}

/**
 * Format a number as currency with live typing support
 * @param value - The numeric string to format
 * @param currencyCode - The currency code to use
 * @param locale - The locale to use
 * @returns Formatted currency string
 */
export function formatLiveCurrency(value: string, currencyCode: string, locale: string = 'en-US'): string {
  if (!value) return '';
  
  try {
    // Remove any existing formatting (commas, currency symbols, etc.)
    const cleanValue = unformatNumber(value);
    if (cleanValue === '') return '';
    
    // Check if the value is a valid number
    const numValue = parseFloat(cleanValue);
    if (isNaN(numValue)) return '';
    
    // Get currency display prefix
    const currencySymbol = getCurrencySymbol(currencyCode);
    const prefix = `${currencyCode} ${currencySymbol}`;
    
    // Format the number with proper commas and decimals
    let formattedAmount: string;
    
    // Handle special case when user is typing decimals
    if (cleanValue.endsWith('.')) {
      // Allow typing a decimal point
      formattedAmount = new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(numValue) + '.';
    } else if (cleanValue.includes('.')) {
      // Handle decimal values with specific decimal places
      const parts = cleanValue.split('.');
      const decimalDigits = parts[1].length;
      
      formattedAmount = new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimalDigits,
        maximumFractionDigits: decimalDigits
      }).format(numValue);
    } else {
      // Regular whole numbers - no decimal places
      formattedAmount = new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(numValue);
    }
    
    return `${prefix} ${formattedAmount}`;
  } catch (error) {
    console.error('Error formatting live currency:', error);
    return value;
  }
}

/**
 * Formats a phone number in US format: (123) 456-7890
 * @param phoneNumberString - The phone number string to format
 * @returns Formatted phone number string
 */
export function formatPhoneNumber(phoneNumberString: string): string {
  const cleaned = phoneNumberString.replace(/\D/g, '');
  
  // Handle empty input
  if (!cleaned) return '';
  
  let formatted = '';
  
  if (cleaned.length <= 3) {
    return cleaned;
  } else if (cleaned.length <= 6) {
    formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  } else {
    formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  }
  
  return formatted;
}
