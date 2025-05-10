
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the form data type
export type BusinessFormData = {
  businessName: string;
  industry: string;
  location: string;
  askingPrice: string;
  annualRevenue: string;
  annualProfit: string;
  description: string;
  highlights: string[]; // Added highlights array
  businessImages: File[];
  businessVideo: File | null;
  businessVideoUrl: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  yearEstablished: string;
  employees: string;
  // Metadata for display
  locationName?: string;
  flagCode?: string;
  currencyCode?: string;
  // Original values in the initial currency (for conversion)
  originalValues: {
    askingPrice: string;
    annualRevenue: string;
    annualProfit: string;
    currencyCode: string;
  };
};

// Map of countries to their currency codes
const countryCurrencyMap: Record<string, string> = {
  us: 'USD',
  gb: 'GBP',
  de: 'EUR',
  fr: 'EUR',
  es: 'EUR',
  it: 'EUR',
  jp: 'JPY',
  au: 'AUD',
  ca: 'CAD',
  sg: 'SGD',
  in: 'INR',
  my: 'MYR',
};

type FormDataContextType = {
  formData: BusinessFormData;
  updateFormData: (data: Partial<BusinessFormData>) => void;
  resetFormData: () => void;
};

const initialFormData: BusinessFormData = {
  businessName: '',
  industry: '',
  location: 'us',
  askingPrice: '',
  annualRevenue: '',
  annualProfit: '',
  description: '',
  highlights: [], // Initialize highlights as empty array
  businessImages: [],
  businessVideo: null,
  businessVideoUrl: '',
  fullName: '',
  email: '',
  phone: '',
  role: '',
  yearEstablished: '',
  employees: '',
  locationName: 'United States',
  flagCode: 'us',
  currencyCode: 'USD',
  originalValues: {
    askingPrice: '',
    annualRevenue: '',
    annualProfit: '',
    currencyCode: 'USD',
  }
};

const FormDataContext = createContext<FormDataContextType | undefined>(undefined);

export const FormDataProvider = ({ children }: { children: ReactNode }) => {
  const [formData, setFormData] = useState<BusinessFormData>(initialFormData);

  const updateFormData = (data: Partial<BusinessFormData>) => {
    console.log('Updating form data:', data);
    setFormData(prevData => {
      // Create the new data object by spreading the previous data and new data
      const newData = { ...prevData, ...data };
      
      // Handle currency code updates when location changes
      if (data.location && data.location !== prevData.location) {
        const newCurrencyCode = countryCurrencyMap[data.location] || 'USD';
        newData.currencyCode = newCurrencyCode;
      }
      
      // Track original values when directly changing a monetary value
      // but not when location/currency is changing or when setting original values explicitly
      if (
        (data.askingPrice !== undefined || 
         data.annualRevenue !== undefined || 
         data.annualProfit !== undefined) && 
        !data.originalValues && 
        !data.location && 
        !data.currencyCode
      ) {
        newData.originalValues = {
          ...prevData.originalValues,
          askingPrice: data.askingPrice !== undefined ? data.askingPrice : prevData.originalValues.askingPrice,
          annualRevenue: data.annualRevenue !== undefined ? data.annualRevenue : prevData.originalValues.annualRevenue,
          annualProfit: data.annualProfit !== undefined ? data.annualProfit : prevData.originalValues.annualProfit,
          currencyCode: prevData.currencyCode || 'USD',
        };
      }
      
      return newData;
    });
  };

  const resetFormData = () => {
    setFormData(initialFormData);
  };

  return (
    <FormDataContext.Provider value={{ formData, updateFormData, resetFormData }}>
      {children}
    </FormDataContext.Provider>
  );
};

export const useFormData = () => {
  const context = useContext(FormDataContext);
  if (context === undefined) {
    throw new Error('useFormData must be used within a FormDataProvider');
  }
  return context;
};
