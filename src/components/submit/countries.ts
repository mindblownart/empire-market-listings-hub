
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
  { name: "Malaysia", flagCode: "my", currencyCode: "MYR" }
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
