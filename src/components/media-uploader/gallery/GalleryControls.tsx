
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Video, Loader2 } from 'lucide-react';

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
    <div className="flex justify-between items-center mt-1">
      <div className="text-sm text-gray-500">
        <span className="font-medium">{totalMediaCount}</span> of <span className="font-medium">11</span> media slots used 
        {imageItems > 0 && <span> ({imageItems} images{videoItem ? ', 1 video' : ''})</span>}
      </div>
      
      <div className="flex gap-2">
        {onAddVideo && !videoItem && (
          <Button 
            variant="outline" 
            onClick={onAddVideo} 
            className="flex items-center gap-2"
          >
            <Video className="h-4 w-4" /> Add Video URL
          </Button>
        )}
        
        <Button 
          variant="outline" 
          onClick={onFileSelect} 
          className="flex items-center gap-2"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {isProcessing ? 'Processing...' : 'Select Files'}
        </Button>
      </div>
    </div>
  );
};

export default GalleryControls;
