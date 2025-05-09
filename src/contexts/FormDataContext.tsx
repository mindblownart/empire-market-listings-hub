
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
  businessImages: File[];
  businessVideo: File | null;
  businessVideoUrl: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  // Metadata for display
  locationName?: string;
  flagCode?: string;
  currencyCode?: string;
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
  businessImages: [],
  businessVideo: null,
  businessVideoUrl: '',
  fullName: '',
  email: '',
  phone: '',
  role: '',
  locationName: 'United States',
  flagCode: 'us',
  currencyCode: 'USD'
};

const FormDataContext = createContext<FormDataContextType | undefined>(undefined);

export const FormDataProvider = ({ children }: { children: ReactNode }) => {
  const [formData, setFormData] = useState<BusinessFormData>(initialFormData);

  const updateFormData = (data: Partial<BusinessFormData>) => {
    setFormData(prevData => ({
      ...prevData,
      ...data
    }));
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
