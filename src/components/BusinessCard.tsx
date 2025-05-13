
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Bookmark, BookmarkCheck, Edit, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { useFavorites } from '@/hooks/useFavorites';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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
  isOwnListing?: boolean;
  userId?: string;
  onDelete?: () => void; // Callback to refresh listings after delete
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
  isHot,
  isOwnListing,
  userId,
  onDelete
}: BusinessCardProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Use our custom hook to handle favorites
  const { isFavorite, toggleFavorite, isProcessing } = useFavorites(userId);
  
  // Calculate if the current listing is favorited - only declare this variable once
  const isFavorited = userId ? isFavorite(id) : false;
  const isProcessingFavorite = isProcessing?.[id] || false;

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const result = await toggleFavorite(id);
    
    if (!result?.success && result?.needsLogin) {
      setIsLoginDialogOpen(true);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from('business_listings')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Listing deleted successfully",
        description: "Your business listing has been removed.",
        variant: "default",
      });
      
      if (onDelete) {
        onDelete();
      } else {
        // Fallback if no callback provided
        navigate('/listings');
      }
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast({
        title: "Error deleting listing",
        description: "There was a problem deleting your listing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
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
            {isOwnListing && (
              <Badge className="bg-purple-500 text-white">
                Your Listing
              </Badge>
            )}
          </div>
          
          {/* Favorite button with bookmark icon - only show for listings that aren't owned by the current user */}
          {!isOwnListing && userId && (
            <button 
              className={`absolute top-2 right-2 z-20 p-1.5 rounded-full bg-white/80 hover:bg-white shadow-sm cursor-pointer transition-colors`}
              onClick={handleFavoriteToggle}
              disabled={isProcessingFavorite}
              aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
            >
              {isFavorited ? (
                <BookmarkCheck className="h-5 w-5 text-yellow-400" />
              ) : (
                <Bookmark className="h-5 w-5 text-gray-500" />
              )}
            </button>
          )}
          
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
        
        <CardFooter className="p-5 pt-0 mt-auto flex flex-col gap-2">
          <Link to={`/business/${id}`} className="w-full">
            <Button variant="default" className="w-full bg-primary hover:bg-primary-light">
              View Details
            </Button>
          </Link>
          
          {isOwnListing && (
            <div className="flex w-full gap-2">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/edit-listing/${id}`);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600" 
                onClick={(e) => {
                  e.preventDefault(); 
                  setIsDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this listing?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your business listing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

export default BusinessCard;
