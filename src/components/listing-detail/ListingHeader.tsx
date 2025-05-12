
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Edit, Trash2, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ListingHeaderProps {
  id: string;
  isCurrentUserOwner: boolean;
  onDeleteClick: () => void;
}

export const ListingHeader: React.FC<ListingHeaderProps> = ({
  id,
  isCurrentUserOwner,
  onDeleteClick,
}) => {
  const navigate = useNavigate();
  
  return (
    <>
      {/* Back Button */}
      <div className="mb-4">
        <Link to="/listings" className="flex items-center text-gray-600 hover:text-primary transition-colors">
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span>Back to Listings</span>
        </Link>
      </div>
      
      {/* Header Row with Title and Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        {/* Business Overview Heading */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center mb-4 sm:mb-0">
          <Briefcase className="h-6 w-6 mr-2 text-primary" />
          Business Overview
        </h1>
        
        {/* Owner Actions */}
        {isCurrentUserOwner && (
          <div className="flex gap-3 w-full sm:w-auto">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => navigate(`/edit-listing/${id}`)}
            >
              <Edit className="h-4 w-4" />
              Edit Listing
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
              onClick={onDeleteClick}
            >
              <Trash2 className="h-4 w-4" />
              Delete Listing
            </Button>
          </div>
        )}
      </div>
    </>
  );
};
