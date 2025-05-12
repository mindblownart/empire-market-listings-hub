
import React from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { getCountryNameFromCode } from '@/components/submit/countries';

interface BusinessHeaderProps {
  businessName: string;
  industry: string;
  location?: string;
  yearEstablished?: string;
  employeeCount?: string;
  flagCode?: string;
  primaryImage?: string;
  askingPrice?: string;
  currencyCode?: string;
}

export const BusinessHeader: React.FC<BusinessHeaderProps> = ({
  businessName,
  industry,
  location,
  yearEstablished,
  employeeCount,
  flagCode,
  primaryImage,
  askingPrice,
  currencyCode = 'USD',
}) => {
  // Helper function to format industry name
  const formatIndustryName = (industryCode?: string): string => {
    if (!industryCode) return 'Business';
    
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

  // Render hero banner with image or fallback card
  if (primaryImage) {
    return (
      <div className="w-full overflow-hidden rounded-lg shadow-md relative">
        <AspectRatio ratio={21/9} className="bg-gradient-to-b from-gray-700 to-gray-900">
          <img 
            src={primaryImage} 
            alt={businessName || 'Business banner'} 
            className="w-full h-full object-cover"
            loading="eager" // Use eager loading for the hero image
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
          
          {/* Category Tag - Redesigned with blurred background */}
          <div className="absolute top-6 left-6">
            <div className="backdrop-blur-md bg-black/30 rounded-full px-4 py-2 shadow-lg">
              <span className="text-white font-semibold text-sm">
                {formatIndustryName(industry)}
              </span>
            </div>
          </div>
          
          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
            <div className="space-y-2 max-w-[70%]">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 line-clamp-2">
                {businessName || 'Unnamed Business'}
              </h1>
              
              {location && (
                <div className="flex items-center text-white/90">
                  <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
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
                    {getCountryNameFromCode(location)}
                  </span>
                </div>
              )}
            </div>
            
            {/* Asking Price - Repositioned and restyled */}
            {askingPrice && (
              <div className="bg-white rounded-xl shadow-md px-4 py-2">
                <div className="text-xs font-medium text-gray-500">Asking Price</div>
                <div className="text-lg md:text-xl font-bold text-blue-600">
                  {formatCurrency(askingPrice, currencyCode)}
                </div>
              </div>
            )}
          </div>
        </AspectRatio>
      </div>
    );
  }

  // Fallback card header when no image is available
  return (
    <Card className="mb-8 shadow-md">
      <CardHeader className="relative">
        {/* Category badge with new styling */}
        <div className="w-fit mb-4">
          <div className="bg-blue-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-full shadow-sm font-semibold text-sm">
            {formatIndustryName(industry)}
          </div>
        </div>
        
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <CardTitle className="text-2xl md:text-3xl">
              {businessName || 'Unnamed Business'}
            </CardTitle>
            
            {location && (
              <div className="flex items-center text-gray-600 mt-1">
                <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
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
                  {getCountryNameFromCode(location)}
                </span>
              </div>
            )}
          </div>
          
          {/* Asking Price with new styling */}
          {askingPrice && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-2">
              <div className="text-sm font-medium text-gray-500">Asking Price</div>
              <div className="text-xl font-bold text-blue-600">
                {formatCurrency(askingPrice, currencyCode)}
              </div>
            </div>
          )}
        </div>
      </CardHeader>
    </Card>
  );
};
