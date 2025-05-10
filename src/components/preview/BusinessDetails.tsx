
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumberWithCommas } from '@/lib/formatters';
import { DollarSign, MapPin, Building, Calendar, Users } from 'lucide-react';

// Function to get the display prefix for a currency
const getCurrencyDisplay = (currencyCode: string): string => {
  if (currencyCode === "USD") return "USD $";
  if (currencyCode === "SGD") return "SGD $";
  if (currencyCode === "GBP") return "GBP £";
  if (currencyCode === "EUR") return "EUR €";
  if (currencyCode === "JPY") return "JPY ¥";
  if (currencyCode === "AUD") return "AUD $";
  if (currencyCode === "CAD") return "CAD $";
  if (currencyCode === "INR") return "INR ₹";
  if (currencyCode === "MYR") return "MYR RM";
  return currencyCode;
};

// Format financial values with currency symbol, thousands separators, and 2 decimal places
const formatCurrencyValue = (value: string | undefined, currencyCode: string): string => {
  if (!value || value === "0" || value === "") return "0.00";
  
  // Format with commas and always show 2 decimal places
  const formattedValue = formatNumberWithCommas(parseFloat(value).toFixed(2));
  return formattedValue;
};

interface BusinessDetailsProps {
  askingPrice?: string;
  annualRevenue?: string;
  annualProfit?: string;
  currencyCode: string;
  locationName?: string;
  industry?: string;
  yearEstablished?: string;
  employees?: string;
}

export const BusinessDetails: React.FC<BusinessDetailsProps> = ({
  askingPrice,
  annualRevenue,
  annualProfit,
  currencyCode,
  locationName,
  industry,
  yearEstablished,
  employees,
}) => {
  // Get the formatted currency display
  const currencyDisplay = getCurrencyDisplay(currencyCode || "USD");

  // Helper function to format industry name
  const formatIndustry = (industryCode?: string): string => {
    if (!industryCode) return 'Not specified';
    
    return industryCode === 'tech' ? 'Technology' :
           industryCode === 'food' ? 'Food & Beverage' :
           industryCode === 'retail' ? 'Retail' :
           industryCode === 'manufacturing' ? 'Manufacturing' :
           industryCode === 'health' ? 'Health & Wellness' :
           industryCode === 'service' ? 'Professional Services' :
           industryCode;
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="border-b">
        <CardTitle>Business Details</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <dl className="space-y-4">
          <div className="flex items-center">
            <dt className="flex items-center w-1/2 text-gray-500">
              <DollarSign className="h-4 w-4 mr-2" /> Asking Price
            </dt>
            <dd className="w-1/2 font-medium">
              {currencyDisplay} {formatCurrencyValue(askingPrice, currencyCode || 'USD')}
            </dd>
          </div>
          <div className="flex items-center">
            <dt className="flex items-center w-1/2 text-gray-500">
              <DollarSign className="h-4 w-4 mr-2" /> Annual Revenue
            </dt>
            <dd className="w-1/2 font-medium">
              {currencyDisplay} {formatCurrencyValue(annualRevenue, currencyCode || 'USD')}
            </dd>
          </div>
          <div className="flex items-center">
            <dt className="flex items-center w-1/2 text-gray-500">
              <DollarSign className="h-4 w-4 mr-2" /> Annual Profit
            </dt>
            <dd className="w-1/2 font-medium">
              {currencyDisplay} {formatCurrencyValue(annualProfit, currencyCode || 'USD')}
            </dd>
          </div>
          <div className="flex items-center">
            <dt className="flex items-center w-1/2 text-gray-500">
              <MapPin className="h-4 w-4 mr-2" /> Country
            </dt>
            <dd className="w-1/2 font-medium">
              {locationName || 'Not specified'}
            </dd>
          </div>
          <div className="flex items-center">
            <dt className="flex items-center w-1/2 text-gray-500">
              <Building className="h-4 w-4 mr-2" /> Industry
            </dt>
            <dd className="w-1/2 font-medium capitalize">
              {formatIndustry(industry)}
            </dd>
          </div>
          <div className="flex items-center">
            <dt className="flex items-center w-1/2 text-gray-500">
              <Calendar className="h-4 w-4 mr-2" /> Year Established
            </dt>
            <dd className="w-1/2 font-medium">
              {yearEstablished || 'Not provided'}
            </dd>
          </div>
          <div className="flex items-center">
            <dt className="flex items-center w-1/2 text-gray-500">
              <Users className="h-4 w-4 mr-2" /> Employees
            </dt>
            <dd className="w-1/2 font-medium">
              {employees || 'Not provided'}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
};
