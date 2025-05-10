
import React, { useState, useCallback, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Image, Video, Plus } from 'lucide-react';
import MediaItem from './MediaItem';
import VideoPreviewModal from './VideoPreviewModal';
import { MediaItemType } from './types';

interface MediaGalleryProps {
  items: MediaItemType[];
  onReorder: (reorderedItems: MediaItemType[]) => void;
  onDelete: (id: string) => void;
  onVideoPreview?: (item: MediaItemType) => void;
  onFileSelect: () => void;
  onDrop: (e: React.DragEvent) => void;
  isDragging?: boolean;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ 
  items = [], 
  onReorder,
  onDelete,
  onVideoPreview,
  onFileSelect,
  onDrop,
  isDragging = false,
}) => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [currentVideoPreview, setCurrentVideoPreview] = useState<{
    embedUrl: string;
    platform: string | null;
  } | null>(null);
  
  // Calculate media counts
  const mediaItems = [...items];
  const imageCount = mediaItems.filter(item => !item.isEmpty && item.type === 'image').length;
  const hasVideo = mediaItems.some(item => !item.isEmpty && item.type === 'video');
  const totalMediaCount = imageCount + (hasVideo ? 1 : 0);
  
  // Make sure we always have exactly 12 slots (3x4 grid)
  while (mediaItems.length < 12) {
    mediaItems.push({
      id: `empty-slot-${mediaItems.length}`,
      type: 'empty',
      isEmpty: true,
      preview: '',
      isNew: false
    });
  }
  
  // Ensure video slot is always at index 1
  useEffect(() => {
    const videoIndex = mediaItems.findIndex(item => item.type === 'video' && !item.isEmpty);
    const emptyVideoSlotIndex = mediaItems.findIndex(item => item.type === 'video' && item.isEmpty);
    
    // If no video item or empty video slot exists, create one at index 1
    if (videoIndex === -1 && emptyVideoSlotIndex === -1) {
      const newItems = [...mediaItems];
      newItems.splice(1, 0, {
        id: 'empty-video-slot',
        type: 'video',
        isEmpty: true,
        preview: '',
        isNew: false
      });
      // Remove the last empty slot to maintain 12 total
      if (newItems.length > 12) {
        newItems.pop();
      }
      onReorder(newItems);
    }
    // If video is not at index 1, move it there
    else if (videoIndex !== -1 && videoIndex !== 1) {
      const newItems = [...mediaItems];
      const videoItem = newItems.splice(videoIndex, 1)[0];
      newItems.splice(1, 0, videoItem);
      onReorder(newItems);
    }
    // If empty video slot is not at index 1, move it there
    else if (emptyVideoSlotIndex !== -1 && emptyVideoSlotIndex !== 1) {
      const newItems = [...mediaItems];
      const emptyVideoSlot = newItems.splice(emptyVideoSlotIndex, 1)[0];
      newItems.splice(1, 0, emptyVideoSlot);
      onReorder(newItems);
    }
  }, []);

  // Handle video preview
  const handleVideoPreview = useCallback((item: MediaItemType) => {
    if (item.type === 'video' && !item.isEmpty) {
      if (item.videoInfo?.platform === 'file' && item.file) {
        // Local file video preview
        const url = URL.createObjectURL(item.file);
        setCurrentVideoPreview({
          embedUrl: url,
          platform: 'file'
        });
      } else if (item.videoInfo) {
        // YouTube/Vimeo video preview
        const embedUrl = item.url || '';
        setCurrentVideoPreview({
          embedUrl,
          platform: item.videoInfo.platform
        });
      }
      setIsVideoModalOpen(true);
    }
  }, []);
  
  // Handle reordering of items
  const moveItem = useCallback((dragIndex: number, hoverIndex: number) => {
    // Don't allow moving to/from video slot (index 1)
    if (dragIndex === 1 || hoverIndex === 1) return;
    
    // Create a new array to avoid direct mutation
    const newItems = [...mediaItems];
    
    // Get the item being dragged
    const draggedItem = newItems[dragIndex];
    if (draggedItem.type === 'empty' || draggedItem.isEmpty) return;
    
    // Remove the item from its original position
    newItems.splice(dragIndex, 1);
    
    // Insert the item at the new position
    newItems.splice(hoverIndex, 0, draggedItem);
    
    // Automatically update primary status based on position
    newItems.forEach((item, idx) => {
      if (idx === 0 && item.type === 'image' && !item.isEmpty) {
        item.isPrimary = true;
      } else if (item.isPrimary) {
        item.isPrimary = false;
      }
    });
    
    // Update state via callback
    onReorder(newItems);
    
  }, [mediaItems, onReorder]);
  
  // Handle slot drop
  const handleSlotDrop = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    onDrop(e);
  }, [onDrop]);

  // Handle empty state
  if (totalMediaCount === 0) {
    return (
      <DndProvider backend={HTML5Backend}>
        <TooltipProvider>
          <div 
            className={`grid grid-cols-3 sm:grid-cols-4 gap-3 ${isDragging ? 'border-2 border-dashed border-primary rounded-lg p-2' : ''}`}
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
      </DndProvider>
    );
  }
  
  return (
    <DndProvider backend={HTML5Backend}>
      <TooltipProvider>
        <div className="space-y-4">
          <div 
            className={`grid grid-cols-3 sm:grid-cols-4 gap-2 ${isDragging ? 'border-2 border-dashed border-primary rounded-lg p-2' : ''}`}
            onDragOver={(e) => e.preventDefault()}
            style={{ minHeight: '200px' }}
          >
            {mediaItems.slice(0, 12).map((item, index) => (
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
                      onDelete={onDelete}
                      onVideoPreview={handleVideoPreview}
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
              {imageCount > 0 && <span> ({imageCount} images{hasVideo ? ', 1 video' : ''})</span>}
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
            embedUrl={currentVideoPreview?.embedUrl || ''}
            platform={currentVideoPreview?.platform || null}
          />
        </div>
      </TooltipProvider>
    </DndProvider>
  );
};

export default MediaGallery;
