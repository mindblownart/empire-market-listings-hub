
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/formatters';
import { DollarSign, MapPin, Building, Calendar, Users } from 'lucide-react';

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
              {formatCurrency(askingPrice || '0', currencyCode)}
            </dd>
          </div>
          <div className="flex items-center">
            <dt className="flex items-center w-1/2 text-gray-500">
              <DollarSign className="h-4 w-4 mr-2" /> Annual Revenue
            </dt>
            <dd className="w-1/2 font-medium">
              {formatCurrency(annualRevenue || '0', currencyCode)}
            </dd>
          </div>
          <div className="flex items-center">
            <dt className="flex items-center w-1/2 text-gray-500">
              <DollarSign className="h-4 w-4 mr-2" /> Annual Profit
            </dt>
            <dd className="w-1/2 font-medium">
              {formatCurrency(annualProfit || '0', currencyCode)}
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
