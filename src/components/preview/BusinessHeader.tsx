
import React from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

interface BusinessHeaderProps {
  businessName: string;
  industry: string;
  locationName?: string;
  flagCode?: string;
  primaryImage?: string;
  askingPrice?: string;
  currencyCode?: string;
}

export const BusinessHeader: React.FC<BusinessHeaderProps> = ({
  businessName,
  industry,
  locationName,
  flagCode,
  primaryImage,
  askingPrice,
  currencyCode = 'USD',
}) => {
  // Render hero banner with image or fallback card
  if (primaryImage) {
    return (
      <div className="w-full overflow-hidden rounded-lg shadow-md">
        <AspectRatio ratio={21/9} className="bg-gray-200">
          <img 
            src={primaryImage} 
            alt={businessName || 'Business banner'} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full p-8">
            <Badge className="mb-2 bg-blue-600">{industry || 'Uncategorized'}</Badge>
            <h1 className="text-4xl font-bold text-white mb-2">{businessName || 'Unnamed Business'}</h1>
            {locationName && (
              <div className="flex items-center text-white mt-2">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="flex items-center">
                  {flagCode && (
                    <span className="mr-2 text-xl">
                      {String.fromCodePoint(
                        ...[...flagCode.toUpperCase()].map(
                          char => char.charCodeAt(0) + 127397
                        )
                      )}
                    </span>
                  )}
                  {locationName}
                </span>
              </div>
            )}
          </div>
          
          {/* Asking Price Box */}
          {askingPrice && (
            <div className="absolute top-8 right-8">
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="text-sm font-medium text-gray-600">Asking Price</div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(askingPrice, currencyCode)}
                </div>
              </div>
            </div>
          )}
        </AspectRatio>
      </div>
    );
  }

  // Fallback card header when no image is available
  return (
    <Card className="mb-8 shadow-md">
      <CardHeader className="relative">
        <Badge className="w-fit mb-2">{industry || 'Uncategorized'}</Badge>
        <CardTitle className="text-2xl">{businessName || 'Unnamed Business'}</CardTitle>
        {locationName && (
          <div className="flex items-center text-gray-600 mt-1">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="flex items-center">
              {flagCode && (
                <span className="mr-2 text-xl">
                  {String.fromCodePoint(
                    ...[...flagCode.toUpperCase()].map(
                      char => char.charCodeAt(0) + 127397
                    )
                  )}
                </span>
              )}
              {locationName}
            </span>
          </div>
        )}
        
        {/* Asking Price Box */}
        {askingPrice && (
          <div className="absolute top-4 right-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm font-medium text-gray-600">Asking Price</div>
              <div className="text-xl font-bold text-blue-600">
                {formatCurrency(askingPrice, currencyCode)}
              </div>
            </div>
          </div>
        )}
      </CardHeader>
    </Card>
  );
};
