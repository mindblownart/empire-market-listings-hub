
import React from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

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
          
          <div className="absolute top-6 left-6 right-6 flex flex-col md:flex-row justify-between items-start md:items-center">
            <Badge className="bg-blue-600 hover:bg-blue-700 mb-2 md:mb-0">
              {formatIndustryName(industry)}
            </Badge>
            
            {askingPrice && (
              <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-3 mt-2 md:mt-0">
                <div className="text-xs font-medium text-gray-600">Asking Price</div>
                <div className="text-lg md:text-xl font-bold text-blue-600">
                  {formatCurrency(askingPrice, currencyCode)}
                </div>
              </div>
            )}
          </div>
          
          <div className="absolute bottom-6 left-6 right-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 line-clamp-2">
              {businessName || 'Unnamed Business'}
            </h1>
            
            {location && (
              <div className="flex items-center text-white/90 mt-2">
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
                  {formatCountryName(location)}
                </span>
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
        <Badge className="w-fit mb-2 bg-blue-600 hover:bg-blue-700">
          {formatIndustryName(industry)}
        </Badge>
        
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
              {formatCountryName(location)}
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
