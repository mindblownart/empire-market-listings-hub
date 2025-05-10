
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { formatCurrency } from '@/lib/formatters';

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
  currencyCode = 'USD'
}: BusinessCardProps) => {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-full object-cover"
        />
      </div>
      <CardContent className="p-5">
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
      <CardFooter className="p-5 pt-0">
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
