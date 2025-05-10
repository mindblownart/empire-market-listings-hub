
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

interface BusinessOverviewProps {
  description: string;
  highlights: string[];
}

export const BusinessOverview: React.FC<BusinessOverviewProps> = ({
  description,
  highlights
}) => {
  return (
    <>
      {/* Business Overview */}
      <Card className="shadow-md">
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

      {/* Business Highlights (if any) */}
      {highlights && highlights.length > 0 && (
        <Card className="shadow-md mt-6">
          <CardHeader className="border-b py-4">
            <CardTitle>Business Highlights</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 pb-4">
            <ul className="space-y-2">
              {highlights.map((highlight, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
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
