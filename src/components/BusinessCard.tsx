
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { Badge } from '@/components/ui/badge';

interface BusinessCardProps {
  id: string;
  title: string;
  price: string;
  description: string;
  category: string;
  location: string;
  revenue: string;
  imageUrl: string;
  currencyCode?: string;
  isNew?: boolean;
  isHot?: boolean;
}

const BusinessCard = ({
  id,
  title,
  price,
  description,
  category,
  location,
  revenue,
  imageUrl,
  currencyCode = 'USD',
  isNew,
  isHot
}: BusinessCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  
  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg h-full flex flex-col">
      <div className="relative h-48 overflow-hidden">
        {/* Badge container - positioned absolute to contain both badges */}
        <div className="absolute top-2 left-2 z-10 flex gap-2">
          {isNew && (
            <Badge className="bg-blue-500 text-white">
              New
            </Badge>
          )}
          {isHot && (
            <Badge className="bg-red-500 text-white">
              Hot
            </Badge>
          )}
        </div>
        
        {/* Favorite button */}
        <button 
          className="absolute top-2 right-2 z-10 p-1.5 bg-white/80 hover:bg-white rounded-full shadow-sm"
          onClick={toggleFavorite}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {isFavorite ? (
            <BookmarkCheck className="h-5 w-5 text-primary" />
          ) : (
            <Bookmark className="h-5 w-5 text-gray-500" />
          )}
        </button>
        
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-full object-cover"
        />
      </div>
      
      <CardContent className="p-5 flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold line-clamp-1">{title}</h3>
          <span className="text-primary font-bold">{formatCurrency(price, currencyCode)}</span>
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center">
            <span className="bg-gray-100 px-2 py-1 rounded-full">
              {category}
            </span>
          </div>
          <div className="flex items-center">
            <span className="bg-gray-100 px-2 py-1 rounded-full">
              {location}
            </span>
          </div>
          <div className="flex items-center col-span-2">
            <span className="bg-gray-100 px-2 py-1 rounded-full">
              Revenue: {formatCurrency(revenue, currencyCode)}
            </span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-5 pt-0 mt-auto">
        <Link to={`/listing/${id}`} className="w-full">
          <Button variant="default" className="w-full bg-primary hover:bg-primary-light">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default BusinessCard;
