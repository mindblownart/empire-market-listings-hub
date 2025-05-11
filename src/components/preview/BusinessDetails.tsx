
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Building2, CalendarDays, Users } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

interface BusinessDetailsProps {
  annualRevenue?: string;
  annualProfit?: string;
  currencyCode?: string;
  location?: string;
  industry?: string;
  yearEstablished?: string;
  employees?: string;
  description?: string;
  highlights?: string[];
}

export const BusinessDetails: React.FC<BusinessDetailsProps> = ({
  annualRevenue,
  annualProfit,
  currencyCode = 'USD',
  location,
  industry,
  yearEstablished,
  employees,
  description,
  highlights = [],
}) => {
  // Helper function to format country name
  const formatCountryName = (code?: string): string => {
    if (!code) return 'Global';
    
    const countryMapping: Record<string, string> = {
      'us': 'United States',
      'uk': 'United Kingdom',
      'gb': 'United Kingdom',
      'ca': 'Canada',
      'au': 'Australia',
      'sg': 'Singapore',
      'hk': 'Hong Kong',
      'jp': 'Japan',
      'my': 'Malaysia',
      'id': 'Indonesia',
      'in': 'India',
      'cn': 'China',
    };
    
    return countryMapping[code.toLowerCase()] || code;
  };
  
  // Helper function to format industry name
  const formatIndustry = (industryCode?: string): string => {
    if (!industryCode) return 'Not specified';
    
    const industryMapping: Record<string, string> = {
      'tech': 'Technology',
      'food': 'Food & Beverage',
      'retail': 'Retail',
      'manufacturing': 'Manufacturing',
      'health': 'Health & Wellness',
      'service': 'Professional Services',
    };
    
    return industryMapping[industryCode.toLowerCase()] || industryCode;
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="border-b py-4">
        <CardTitle>Business Details</CardTitle>
      </CardHeader>
      <CardContent className="pt-4 pb-4">
        <dl className="space-y-3">
          <div className="flex items-center">
            <dt className="flex items-center w-1/2 text-gray-500">
              <MapPin className="h-4 w-4 mr-2 flex-shrink-0" /> Country
            </dt>
            <dd className="w-1/2 font-medium">
              {formatCountryName(location)}
            </dd>
          </div>
          <div className="flex items-center">
            <dt className="flex items-center w-1/2 text-gray-500">
              <Building2 className="h-4 w-4 mr-2 flex-shrink-0" /> Industry
            </dt>
            <dd className="w-1/2 font-medium capitalize">
              {formatIndustry(industry)}
            </dd>
          </div>
          <div className="flex items-center">
            <dt className="flex items-center w-1/2 text-gray-500">
              <CalendarDays className="h-4 w-4 mr-2 flex-shrink-0" /> Established
            </dt>
            <dd className="w-1/2 font-medium">
              {yearEstablished || 'Not provided'}
            </dd>
          </div>
          <div className="flex items-center">
            <dt className="flex items-center w-1/2 text-gray-500">
              <Users className="h-4 w-4 mr-2 flex-shrink-0" /> Employees
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
