
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Edit, Trash2, Briefcase, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/hooks/useFavorites';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ListingHeaderProps {
  id: string;
  isCurrentUserOwner: boolean;
  onDeleteClick: () => void;
  userId?: string;
}

export const ListingHeader: React.FC<ListingHeaderProps> = ({
  id,
  isCurrentUserOwner,
  onDeleteClick,
  userId
}) => {
  const navigate = useNavigate();
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites(userId);
  
  const isFavorited = userId ? isFavorite(id) : false;
  
  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const result = await toggleFavorite(id);
    
    if (!result.success && result.needsLogin) {
      setIsLoginDialogOpen(true);
    }
  };
  
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
        
        {/* Action Buttons */}
        <div className="flex gap-3 w-full sm:w-auto">
          {/* Favorite Button for non-owners */}
          {!isCurrentUserOwner && (
            <Button
              variant="outline"
              className={`flex items-center gap-2 ${
                isFavorited 
                  ? 'bg-yellow-400 border-yellow-400 text-white hover:bg-yellow-500 hover:border-yellow-500' 
                  : 'hover:bg-gray-100'
              }`}
              onClick={handleFavoriteToggle}
            >
              <Bookmark className={`h-4 w-4 ${isFavorited ? 'text-white' : 'text-gray-500'}`} />
              {isFavorited ? 'Saved' : 'Save'}
            </Button>
          )}
          
          {/* Owner Actions */}
          {isCurrentUserOwner && (
            <>
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
            </>
          )}
        </div>
      </div>
      
      {/* Login Dialog */}
      <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign in to save favorites</DialogTitle>
            <DialogDescription>
              You need to be logged in to save listings to your favorites.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsLoginDialogOpen(false)} 
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                setIsLoginDialogOpen(false);
                navigate('/login');
              }}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90"
            >
              Sign in
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
