
import React, { useState, useCallback } from 'react';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import MediaItem from './MediaItem';
import VideoPreviewModal from './VideoPreviewModal';
import { MediaItem as MediaItemType } from './types';

interface MediaGalleryProps {
  items: MediaItemType[];
  onReorder: (reorderedItems: MediaItemType[]) => void;
  onDelete: (id: string) => void;
  onFileSelect: () => void;
  onDrop: (e: React.DragEvent) => void;
  isDragging?: boolean;
  maxImages?: number;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ 
  items = [], 
  onReorder,
  onDelete,
  onFileSelect,
  onDrop,
  isDragging = false,
  maxImages = 10,
}) => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>('');
  const [videoType, setVideoType] = useState<string | null>(null);
  
  // Calculate media counts
  const imageItems = items.filter(item => !item.isEmpty && item.type === 'image');
  const videoItem = items.find(item => !item.isEmpty && item.type === 'video');
  const totalMediaCount = imageItems.length + (videoItem ? 1 : 0);
  
  // Handle video preview
  const handleVideoPreview = useCallback((item: MediaItemType) => {
    if (item.type === 'video' && !item.isEmpty) {
      if (item.videoInfo?.platform === 'file' && item.file) {
        // Local file video preview
        const url = URL.createObjectURL(item.file);
        setCurrentVideoUrl(url);
        setVideoType('file');
      } else if (item.videoInfo && item.url) {
        // YouTube/Vimeo video preview
        setCurrentVideoUrl(item.url);
        setVideoType(item.videoInfo.platform || null);
      }
      setIsVideoModalOpen(true);
    }
  }, []);
  
  // Handle reordering of items with proper swapping
  const moveItem = useCallback((dragIndex: number, hoverIndex: number) => {
    // Don't allow moving to/from video slot (index 1)
    if (dragIndex === 1 || hoverIndex === 1) return;
    
    // Create a new array to avoid direct mutation
    const newItems = [...items];
    
    // Get the item being dragged
    const draggedItem = newItems[dragIndex];
    
    // Don't proceed if it's an empty slot
    if (draggedItem.isEmpty) return;
    
    // Get the hover item (could be an empty slot)
    const hoverItem = newItems[hoverIndex];
    
    // Remove the dragged item from its original position
    newItems.splice(dragIndex, 1);
    
    // Insert the dragged item at the new position
    newItems.splice(hoverIndex, 0, draggedItem);
    
    // Update primary status based on position
    // First image (index 0) is always primary
    newItems.forEach((item, idx) => {
      item.isPrimary = idx === 0 && item.type === 'image' && !item.isEmpty;
    });
    
    // Update state via callback
    onReorder(newItems);
  }, [items, onReorder]);
  
  // Handle empty state
  if (items.length === 0 || totalMediaCount === 0) {
    return (
      <TooltipProvider>
        <div 
          className={`grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 ${isDragging ? 'border-2 border-dashed border-primary rounded-lg p-2' : ''}`}
          onDragOver={e => e.preventDefault()}
          onDrop={onDrop}
        >
          {/* Empty slots */}
          {Array.from({ length: 12 }).map((_, i) => (
            <MediaItem
              key={`empty-slot-${i}`}
              item={{
                id: `empty-slot-${i}`,
                type: 'empty',
                preview: '',
                isPrimary: i === 0,
                isEmpty: true
              }}
              index={i}
              moveItem={moveItem}
              onDelete={() => {}}
              isFixed={i === 1} // Slot 1 is fixed for video
            />
          ))}
        </div>
        
        <div className="flex justify-center mt-4">
          <Button 
            variant="outline" 
            onClick={onFileSelect} 
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Select Files
          </Button>
        </div>
      </TooltipProvider>
    );
  }
  
  // Create a complete grid with empty slots where needed
  const completeGrid = [...items];
  
  // Ensure we always have at least 12 slots (2 rows of 6)
  while (completeGrid.length < 12) {
    completeGrid.push({
      id: `empty-slot-${completeGrid.length}`,
      type: 'empty',
      preview: '',
      isPrimary: false,
      isEmpty: true
    });
  }
  
  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div 
          className={`grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 ${isDragging ? 'border-2 border-dashed border-primary rounded-lg p-2' : ''}`}
          onDragOver={(e) => e.preventDefault()}
        >
          {completeGrid.map((item, index) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDrop(e);
                  }}
                  className="h-full"
                >
                  <MediaItem
                    item={item}
                    index={index}
                    moveItem={moveItem}
                    onDelete={() => onDelete(item.id)}
                    onPreview={() => handleVideoPreview(item)}
                    isFixed={index === 1} // Video slot is fixed
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                {item.isEmpty ? (
                  index === 1 ? 'Video slot (optional)' : 'Drop files here'
                ) : (
                  index === 0 ? 'Primary image (drag to reorder)' : 
                  index === 1 ? 'Video (fixed position)' : 
                  `Image ${index} (can be reordered)`
                )}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
        
        <div className="flex justify-between items-center mt-1">
          <div className="text-sm text-gray-500">
            <span className="font-medium">{totalMediaCount}</span> of <span className="font-medium">11</span> media slots used 
            {imageItems.length > 0 && <span> ({imageItems.length} images{videoItem ? ', 1 video' : ''})</span>}
          </div>
          
          <Button 
            variant="outline" 
            onClick={onFileSelect} 
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Select Files
          </Button>
        </div>
        
        {/* Video Preview Modal */}
        <VideoPreviewModal
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          url={currentVideoUrl}
          platform={videoType}
        />
      </div>
    </TooltipProvider>
  );
};

export default MediaGallery;
