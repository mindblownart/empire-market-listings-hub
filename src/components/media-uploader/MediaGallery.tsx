
import React, { useState, useCallback } from 'react';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Image, Video, Plus } from 'lucide-react';
import MediaItem from './MediaItem';
import VideoPreviewModal from './VideoPreviewModal';
import { MediaItem as MediaItemType } from './types';
import { extractVideoInfo } from './video-utils';

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
    
    // Remove the item from its original position
    newItems.splice(dragIndex, 1);
    
    // Insert the item at the new position
    newItems.splice(hoverIndex, 0, draggedItem);
    
    // Update primary status based on position
    // First image (index 0) is always primary
    newItems.forEach((item, idx) => {
      item.isPrimary = idx === 0 && item.type === 'image' && !item.isEmpty;
    });
    
    // Update state via callback
    onReorder(newItems);
  }, [items, onReorder]);
  
  // Handle slot drop
  const handleSlotDrop = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    onDrop(e);
  }, [onDrop]);

  // Create empty grid placeholders to ensure a clean grid layout
  // Making sure we have a 2-row, 6-column grid with video slot fixed at index 1
  const ensureCompleteGrid = () => {
    const result = [...items];
    
    // Check if we need to add or ensure a video slot at index 1
    if (result.length >= 1) {
      // If index 1 doesn't exist or isn't a video slot
      if (result.length === 1 || (result[1]?.type !== 'video' && result[1]?.type !== 'empty')) {
        // Create empty video slot for position 1
        const videoSlot: MediaItemType = {
          id: `empty-video-slot-${Date.now()}`,
          type: 'empty',
          isEmpty: true,
          preview: '',
          isPrimary: false
        };
        
        // Insert at index 1
        result.splice(1, 0, videoSlot);
      }
    }
    
    // Fill remaining slots with empty placeholders up to 12 (2 rows of 6)
    while (result.length < 12) {
      result.push({
        id: `empty-slot-${result.length}-${Date.now()}`,
        type: 'empty',
        isEmpty: true,
        preview: '',
        isPrimary: false
      });
    }
    
    // Trim to exactly 12 items
    return result.slice(0, 12);
  };
  
  // Get the complete grid with all slots properly filled
  const completeGrid = ensureCompleteGrid();

  // Handle empty state
  if (totalMediaCount === 0) {
    return (
      <TooltipProvider>
        <div 
          className={`grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 ${isDragging ? 'border-2 border-dashed border-primary rounded-lg p-2' : ''}`}
          onDragOver={e => e.preventDefault()}
          onDrop={onDrop}
        >
          {/* Primary Image Slot */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative aspect-square rounded-md border-2 border-dashed border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center">
                <div className="text-center p-2">
                  <Image className="w-8 h-8 mx-auto text-gray-300 mb-1" />
                  <p className="text-xs text-gray-400">Primary Image</p>
                </div>
                <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
                  Primary
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">Drop image here for primary</TooltipContent>
          </Tooltip>
          
          {/* Video Slot */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative aspect-square rounded-md border-2 border-dashed border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center">
                <div className="text-center p-2">
                  <Video className="w-8 h-8 mx-auto text-gray-300 mb-1" />
                  <p className="text-xs text-gray-400">Video</p>
                  <p className="text-xs text-gray-300">(Optional)</p>
                </div>
                <div className="absolute top-2 left-2 bg-gray-500/70 text-white text-xs px-2 py-1 rounded-full">
                  Video Slot
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">Drop video here</TooltipContent>
          </Tooltip>
          
          {/* 10 Empty Image Slots */}
          {Array.from({ length: 10 }).map((_, i) => (
            <Tooltip key={i}>
              <TooltipTrigger asChild>
                <div className="aspect-square rounded-md border-2 border-dashed border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center">
                  <div className="text-center p-2">
                    <Plus className="w-6 h-6 mx-auto text-gray-300 mb-1" />
                    <p className="text-xs text-gray-400">Add image</p>
                    <p className="text-xs text-gray-300">Drop here</p>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">Drop image here</TooltipContent>
            </Tooltip>
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
  
  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div 
          className={`grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 ${isDragging ? 'border-2 border-dashed border-primary rounded-lg p-2' : ''}`}
          onDragOver={(e) => e.preventDefault()}
          style={{ minHeight: '200px' }}
        >
          {completeGrid.slice(0, 12).map((item, index) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleSlotDrop(e, index)}
                  className="h-full"
                >
                  <MediaItem
                    item={item}
                    index={index}
                    moveItem={moveItem}
                    onDelete={() => onDelete(item.id)}
                    onPreview={() => handleVideoPreview(item)}
                    // Only the video slot (index 1) is fixed
                    isFixed={index === 1}
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
