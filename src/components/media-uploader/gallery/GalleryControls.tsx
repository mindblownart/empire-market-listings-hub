
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Upload, Film, Loader2 } from 'lucide-react';
import { MAX_IMAGES } from '../utils/constants';

interface GalleryControlsProps {
  totalMediaCount: number;
  imageItems: number;
  videoItem: boolean;
  onAddVideo?: () => void;
  onFileSelect: () => void;
  isProcessing: boolean;
}

const GalleryControls: React.FC<GalleryControlsProps> = ({
  totalMediaCount,
  imageItems,
  videoItem,
  onAddVideo,
  onFileSelect,
  isProcessing
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        onClick={onFileSelect}
        variant="outline"
        size="sm"
        className="flex items-center gap-1.5"
        disabled={imageItems >= MAX_IMAGES || isProcessing}
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
        {isProcessing ? 'Processing...' : 'Add Images'}
        {!isProcessing && (
          <span className="text-xs text-gray-500 ml-1">
            ({imageItems}/{MAX_IMAGES})
          </span>
        )}
      </Button>

      {!videoItem && onAddVideo && (
        <Button
          onClick={onAddVideo}
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5"
          disabled={isProcessing}
        >
          <Film className="h-4 w-4" />
          Add Video URL
        </Button>
      )}

      <span className="ml-auto text-xs text-gray-500 self-center">
        {totalMediaCount} {totalMediaCount === 1 ? 'item' : 'items'} uploaded
      </span>
    </div>
  );
};

export default GalleryControls;
