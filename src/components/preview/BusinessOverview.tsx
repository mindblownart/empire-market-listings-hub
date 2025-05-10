
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
        <CardHeader className="border-b">
          <CardTitle>Business Overview</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">
              {description || 'No description provided.'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Business Highlights (if any) */}
      {highlights.length > 0 && (
        <Card className="shadow-md mt-8">
          <CardHeader className="border-b">
            <CardTitle>Business Highlights</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="list-disc pl-6 space-y-2">
              {highlights.map((highlight, index) => (
                <li key={index} className="text-gray-700">{highlight}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </>
  );
};
