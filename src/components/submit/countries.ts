
export interface CountryOption {
  value: string;
  label: string;
  flagCode: string;
  currencyCode: string;
  dialCode: string; // Added dial code
}

export const countries = [
  { value: 'us', label: 'United States', flagCode: 'us', currencyCode: 'USD', dialCode: '1' },
  { value: 'gb', label: 'United Kingdom', flagCode: 'gb', currencyCode: 'GBP', dialCode: '44' },
  { value: 'ca', label: 'Canada', flagCode: 'ca', currencyCode: 'CAD', dialCode: '1' },
  { value: 'au', label: 'Australia', flagCode: 'au', currencyCode: 'AUD', dialCode: '61' },
  { value: 'de', label: 'Germany', flagCode: 'de', currencyCode: 'EUR', dialCode: '49' },
  { value: 'fr', label: 'France', flagCode: 'fr', currencyCode: 'EUR', dialCode: '33' },
  { value: 'es', label: 'Spain', flagCode: 'es', currencyCode: 'EUR', dialCode: '34' },
  { value: 'it', label: 'Italy', flagCode: 'it', currencyCode: 'EUR', dialCode: '39' },
  { value: 'nl', label: 'Netherlands', flagCode: 'nl', currencyCode: 'EUR', dialCode: '31' },
  { value: 'be', label: 'Belgium', flagCode: 'be', currencyCode: 'EUR', dialCode: '32' },
  { value: 'ch', label: 'Switzerland', flagCode: 'ch', currencyCode: 'CHF', dialCode: '41' },
  { value: 'se', label: 'Sweden', flagCode: 'se', currencyCode: 'SEK', dialCode: '46' },
  { value: 'no', label: 'Norway', flagCode: 'no', currencyCode: 'NOK', dialCode: '47' },
  { value: 'dk', label: 'Denmark', flagCode: 'dk', currencyCode: 'DKK', dialCode: '45' },
  { value: 'fi', label: 'Finland', flagCode: 'fi', currencyCode: 'EUR', dialCode: '358' },
  { value: 'at', label: 'Austria', flagCode: 'at', currencyCode: 'EUR', dialCode: '43' },
  { value: 'ie', label: 'Ireland', flagCode: 'ie', currencyCode: 'EUR', dialCode: '353' },
  { value: 'pt', label: 'Portugal', flagCode: 'pt', currencyCode: 'EUR', dialCode: '351' },
  { value: 'gr', label: 'Greece', flagCode: 'gr', currencyCode: 'EUR', dialCode: '30' },
  { value: 'pl', label: 'Poland', flagCode: 'pl', currencyCode: 'PLN', dialCode: '48' },
  { value: 'cz', label: 'Czech Republic', flagCode: 'cz', currencyCode: 'CZK', dialCode: '420' },
  { value: 'hu', label: 'Hungary', flagCode: 'hu', currencyCode: 'HUF', dialCode: '36' },
  { value: 'ru', label: 'Russia', flagCode: 'ru', currencyCode: 'RUB', dialCode: '7' },
  { value: 'jp', label: 'Japan', flagCode: 'jp', currencyCode: 'JPY', dialCode: '81' },
  { value: 'cn', label: 'China', flagCode: 'cn', currencyCode: 'CNY', dialCode: '86' },
  { value: 'in', label: 'India', flagCode: 'in', currencyCode: 'INR', dialCode: '91' },
  { value: 'br', label: 'Brazil', flagCode: 'br', currencyCode: 'BRL', dialCode: '55' },
  { value: 'mx', label: 'Mexico', flagCode: 'mx', currencyCode: 'MXN', dialCode: '52' },
  { value: 'ar', label: 'Argentina', flagCode: 'ar', currencyCode: 'ARS', dialCode: '54' },
  { value: 'za', label: 'South Africa', flagCode: 'za', currencyCode: 'ZAR', dialCode: '27' },
  { value: 'ng', label: 'Nigeria', flagCode: 'ng', currencyCode: 'NGN', dialCode: '234' },
  { value: 'eg', label: 'Egypt', flagCode: 'eg', currencyCode: 'EGP', dialCode: '20' },
  { value: 'sa', label: 'Saudi Arabia', flagCode: 'sa', currencyCode: 'SAR', dialCode: '966' },
  { value: 'ae', label: 'United Arab Emirates', flagCode: 'ae', currencyCode: 'AED', dialCode: '971' },
  { value: 'sg', label: 'Singapore', flagCode: 'sg', currencyCode: 'SGD', dialCode: '65' },
  { value: 'hk', label: 'Hong Kong', flagCode: 'hk', currencyCode: 'HKD', dialCode: '852' },
  { value: 'nz', label: 'New Zealand', flagCode: 'nz', currencyCode: 'NZD', dialCode: '64' },
  { value: 'kr', label: 'South Korea', flagCode: 'kr', currencyCode: 'KRW', dialCode: '82' },
  { value: 'tr', label: 'Turkey', flagCode: 'tr', currencyCode: 'TRY', dialCode: '90' },
  { value: 'id', label: 'Indonesia', flagCode: 'id', currencyCode: 'IDR', dialCode: '62' },
  { value: 'my', label: 'Malaysia', flagCode: 'my', currencyCode: 'MYR', dialCode: '60' },
  { value: 'th', label: 'Thailand', flagCode: 'th', currencyCode: 'THB', dialCode: '66' },
  { value: 'vn', label: 'Vietnam', flagCode: 'vn', currencyCode: 'VND', dialCode: '84' },
  { value: 'ph', label: 'Philippines', flagCode: 'ph', currencyCode: 'PHP', dialCode: '63' },
];

export const countryOptions = countries.map(country => ({
  value: country.value,
  label: country.label,
  flagCode: country.flagCode,
}));

// Function to format a phone number based on country
export function formatPhoneNumber(phoneNumberString: string, countryCode: string = 'us'): string {
  const cleaned = phoneNumberString.replace(/\D/g, '');
  
  // Exit early if the string is empty
  if (!cleaned) return '';
  
  // Country-specific formatting
  switch (countryCode) {
    case 'us':
    case 'ca':
      // Format: (123) 456-7890
      if (cleaned.length <= 3) {
        return cleaned;
      } else if (cleaned.length <= 6) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
      } else {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
      }
    
    case 'gb':
      // Format: 07xxx xxx xxx (mobile)
      if (cleaned.length <= 5) {
        return cleaned;
      } else if (cleaned.length <= 8) {
        return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
      } else {
        return `${cleaned.slice(0, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
      }
      
    case 'sg':
      // Format: 8123 4567
      if (cleaned.length <= 4) {
        return cleaned;
      } else {
        return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 8)}`;
      }
    
    case 'au':
      // Format: 0412 345 678
      if (cleaned.length <= 4) {
        return cleaned;
      } else if (cleaned.length <= 7) {
        return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
      } else {
        return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
      }
      
    // Add more country-specific formats as needed
    
    default:
      // Generic grouping by 3 digits
      return cleaned.replace(/(\d{3})(?=\d)/g, '$1 ').trim();
  }
}

// Function to get country name from country code
export function getCountryNameFromCode(code?: string): string {
  if (!code) return 'Not specified';

  const country = countries.find(c => c.flagCode === code);
  return country ? country.label : 'Unknown';
}

export function findCountryByFlagCode(flagCode: string) {
  return countries.find(c => c.flagCode === flagCode);
}

// Function to get country by dial code
export function findCountryByDialCode(dialCode: string) {
  return countries.find(c => c.dialCode === dialCode.replace('+', ''));
}
