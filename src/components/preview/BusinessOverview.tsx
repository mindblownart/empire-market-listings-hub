
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, DollarSign, TrendingUp, LineChart } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

interface BusinessOverviewProps {
  askingPrice?: string;
  annualRevenue?: string;
  annualProfit?: string;
  currencyCode?: string;
  description?: string;
  highlights?: string[];
}

export const BusinessOverview: React.FC<BusinessOverviewProps> = ({
  askingPrice,
  annualRevenue,
  annualProfit,
  currencyCode = 'USD',
  description,
  highlights = []
}) => {
  return (
    <>
      {/* Financial Overview */}
      <Card className="shadow-md mb-6">
        <CardHeader className="border-b py-4">
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-primary" />
            Financial Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {askingPrice && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Asking Price</div>
                <div className="text-xl font-bold text-primary">
                  {formatCurrency(askingPrice, currencyCode)}
                </div>
              </div>
            )}
            
            {annualRevenue && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Annual Revenue</div>
                <div className="text-xl font-bold text-gray-800 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                  {formatCurrency(annualRevenue, currencyCode)}
                </div>
              </div>
            )}
            
            {annualProfit && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Annual Profit</div>
                <div className="text-xl font-bold text-gray-800 flex items-center">
                  <LineChart className="h-4 w-4 mr-1 text-green-500" />
                  {formatCurrency(annualProfit, currencyCode)}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Business Description */}
      {description && (
        <Card className="shadow-md mb-6">
          <CardHeader className="border-b py-4">
            <CardTitle>Business Overview</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 pb-4">
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">
                {description || 'No description provided.'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Business Highlights (if any) */}
      {highlights && highlights.length > 0 && (
        <Card className="shadow-md">
          <CardHeader className="border-b py-4">
            <CardTitle>Business Highlights</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 pb-4">
            <ul className="space-y-3">
              {highlights.map((highlight, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-3 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{highlight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </>
  );
};
