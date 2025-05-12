
import React from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, LaptopIcon, UtensilsIcon, ShoppingBagIcon, FactoryIcon, HeartPulseIcon, BriefcaseIcon } from 'lucide-react';
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
  
  // Function to get the appropriate icon based on industry
  const getCategoryIcon = (industryCode?: string) => {
    if (!industryCode) return <BriefcaseIcon className="h-4 w-4" />;
    
    const iconMapping: Record<string, JSX.Element> = {
      'tech': <LaptopIcon className="h-4 w-4" />,
      'food': <UtensilsIcon className="h-4 w-4" />,
      'retail': <ShoppingBagIcon className="h-4 w-4" />,
      'manufacturing': <FactoryIcon className="h-4 w-4" />,
      'health': <HeartPulseIcon className="h-4 w-4" />,
      'service': <BriefcaseIcon className="h-4 w-4" />
    };
    
    return iconMapping[industryCode.toLowerCase()] || <BriefcaseIcon className="h-4 w-4" />;
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
          
          {/* Category Tag - Updated with dynamic icon */}
          <div className="absolute top-4 left-4 md:top-6 md:left-6">
            <Badge variant="category" size="lg" className="flex items-center gap-1.5">
              {getCategoryIcon(industry)}
              <span>{formatIndustryName(industry)}</span>
            </Badge>
          </div>
          
          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
            <div className="space-y-2 max-w-[65%]">
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
              <div className="flex-shrink-0">
                <Badge variant="price" size="lg" className="flex flex-col items-start">
                  <span className="text-xs font-medium text-gray-500">Asking Price</span>
                  <span className="text-lg font-bold text-blue-700">
                    {formatCurrency(askingPrice, currencyCode)}
                  </span>
                </Badge>
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
        {/* Category badge with dynamic icon */}
        <div className="w-fit mb-4">
          <Badge variant="category" size="md" className="flex items-center gap-1.5">
            {getCategoryIcon(industry)}
            <span>{formatIndustryName(industry)}</span>
          </Badge>
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
            <Badge variant="price" size="lg" className="flex flex-col items-start">
              <span className="text-xs font-medium text-gray-500">Asking Price</span>
              <span className="text-lg font-bold text-blue-700">
                {formatCurrency(askingPrice, currencyCode)}
              </span>
            </Badge>
          )}
        </div>
      </CardHeader>
    </Card>
  );
};
