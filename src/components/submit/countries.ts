
// Country data with flag codes and currency codes
export interface CountryData {
  name: string;
  flagCode: string;
  currencyCode: string;
}

export const countries: CountryData[] = [
  { name: "United States", flagCode: "us", currencyCode: "USD" },
  { name: "United Kingdom", flagCode: "gb", currencyCode: "GBP" },
  { name: "Singapore", flagCode: "sg", currencyCode: "SGD" },
  { name: "Australia", flagCode: "au", currencyCode: "AUD" },
  { name: "Canada", flagCode: "ca", currencyCode: "CAD" },
  { name: "Germany", flagCode: "de", currencyCode: "EUR" },
  { name: "France", flagCode: "fr", currencyCode: "EUR" },
  { name: "Japan", flagCode: "jp", currencyCode: "JPY" },
  { name: "India", flagCode: "in", currencyCode: "INR" },
  { name: "Malaysia", flagCode: "my", currencyCode: "MYR" },
  { name: "China", flagCode: "cn", currencyCode: "CNY" },
  { name: "Indonesia", flagCode: "id", currencyCode: "IDR" },
  { name: "Thailand", flagCode: "th", currencyCode: "THB" },
  { name: "Vietnam", flagCode: "vn", currencyCode: "VND" },
  { name: "Philippines", flagCode: "ph", currencyCode: "PHP" },
  { name: "Hong Kong", flagCode: "hk", currencyCode: "HKD" },
  { name: "South Korea", flagCode: "kr", currencyCode: "KRW" },
  { name: "Brazil", flagCode: "br", currencyCode: "BRL" },
  { name: "Mexico", flagCode: "mx", currencyCode: "MXN" },
  { name: "Spain", flagCode: "es", currencyCode: "EUR" },
  { name: "Italy", flagCode: "it", currencyCode: "EUR" },
  { name: "Netherlands", flagCode: "nl", currencyCode: "EUR" },
  { name: "Belgium", flagCode: "be", currencyCode: "EUR" },
  { name: "Switzerland", flagCode: "ch", currencyCode: "CHF" },
  { name: "Sweden", flagCode: "se", currencyCode: "SEK" },
  { name: "Norway", flagCode: "no", currencyCode: "NOK" },
  { name: "Denmark", flagCode: "dk", currencyCode: "DKK" },
  { name: "Ireland", flagCode: "ie", currencyCode: "EUR" },
  { name: "New Zealand", flagCode: "nz", currencyCode: "NZD" },
  { name: "United Arab Emirates", flagCode: "ae", currencyCode: "AED" },
  { name: "Saudi Arabia", flagCode: "sa", currencyCode: "SAR" },
  { name: "South Africa", flagCode: "za", currencyCode: "ZAR" },
  { name: "Russia", flagCode: "ru", currencyCode: "RUB" },
  { name: "Turkey", flagCode: "tr", currencyCode: "TRY" }
];

// Convert countries to options format for SearchableSelect
export const countryOptions = countries.map(country => ({
  value: country.flagCode,
  label: country.name,
  flagCode: country.flagCode
}));

// Find country by flag code
export const findCountryByFlagCode = (flagCode: string): CountryData | undefined => {
  return countries.find(country => country.flagCode === flagCode);
};

// Get full country name from country code
export const getCountryNameFromCode = (code?: string): string => {
  if (!code) return 'Global';
  
  // Handle case sensitivity and trim
  const normalizedCode = code.toLowerCase().trim();
  
  // Find the country by flag code
  const country = countries.find(c => c.flagCode.toLowerCase() === normalizedCode);
  
  // Return the country name if found, otherwise return the code with first letter capitalized
  return country ? country.name : code.charAt(0).toUpperCase() + code.slice(1);
};
