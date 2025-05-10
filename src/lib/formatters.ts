
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
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
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
    return new Intl.NumberFormat(locale, {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2, // Always show 2 decimal places
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
