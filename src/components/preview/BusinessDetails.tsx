
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/formatters';
import { MapPin, Building, Calendar, Users, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BusinessDetailsProps {
  annualRevenue?: string;
  annualProfit?: string;
  currencyCode?: string;
  location?: string;
  industry?: string;
  yearEstablished?: string;
  employees?: string;
  originalValues?: {
    annualRevenue?: string;
    annualProfit?: string;
    currencyCode?: string;
  };
  description?: string; // Added this field
  highlights?: string[]; // Added this field
}

export const BusinessDetails: React.FC<BusinessDetailsProps> = ({
  annualRevenue,
  annualProfit,
  currencyCode = 'USD',
  location,
  industry,
  yearEstablished,
  employees,
  originalValues,
  description, // Added this prop
  highlights = [], // Added this prop with default empty array
}) => {
  const [showFallbackWarning, setShowFallbackWarning] = useState<boolean>(false);
  
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

  // Show a warning if using fallback rates
  useEffect(() => {
    // We would typically check if the rates are from the fallback source
    // For now, we'll just assume no warning is needed for the preview
    setShowFallbackWarning(false);
    
    // Cleanup the warning after 5 seconds
    const timer = setTimeout(() => {
      setShowFallbackWarning(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [currencyCode]);

  return (
    <>
      {/* Business Description */}
      {description && (
        <Card className="shadow-md mb-6">
          <CardHeader className="border-b py-4">
            <CardTitle>Business Description</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 pb-4">
            <p className="text-gray-700 whitespace-pre-wrap">
              {description || 'No description provided.'}
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* Business Highlights */}
      {highlights && highlights.length > 0 && (
        <Card className="shadow-md mb-6">
          <CardHeader className="border-b py-4">
            <CardTitle>Business Highlights</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 pb-4">
            <ul className="space-y-2">
              {highlights.map((highlight, index) => (
                <li key={index} className="flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{highlight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-md">
        <CardHeader className="border-b py-4">
          <CardTitle>Business Details</CardTitle>
          {showFallbackWarning && (
            <Alert variant="warning" className="mt-2 bg-amber-50 text-amber-800 border-amber-200">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Unable to fetch live rates. Using estimated conversion.
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>
        <CardContent className="pt-4 pb-4">
          <dl className="space-y-3">
            <div className="flex items-center">
              <dt className="flex items-center w-1/2 text-gray-500">
                <MapPin className="h-4 w-4 mr-2" /> Annual Revenue
              </dt>
              <dd className="w-1/2 font-medium">
                {formatCurrency(annualRevenue || '0', currencyCode)}
              </dd>
            </div>
            <div className="flex items-center">
              <dt className="flex items-center w-1/2 text-gray-500">
                <MapPin className="h-4 w-4 mr-2" /> Annual Profit
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
                {location || 'Not specified'}
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
    </>
  );
};
