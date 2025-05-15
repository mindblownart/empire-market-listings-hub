
import React, { useState, useCallback } from 'react';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import VideoPreviewModal from './VideoPreviewModal';
import { MediaItemType } from './types';
import { 
  MediaGrid, 
  GalleryControls, 
  FileUploadInfo 
} from './gallery';
import { MAX_IMAGES, VIDEO_SLOT_INDEX } from './utils/constants';

interface MediaGalleryProps {
  items: MediaItemType[];
  onReorder: (reorderedItems: MediaItemType[]) => void;
  onDelete: (id: string) => void;
  onFileSelect: () => void;
  onAddVideo?: () => void;
  onDrop: (e: React.DragEvent) => void;
  isDragging?: boolean;
  isProcessing?: boolean;
  maxImages?: number;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ 
  items = [], 
  onReorder,
  onDelete,
  onFileSelect,
  onAddVideo,
  onDrop,
  isDragging = false,
  isProcessing = false,
  maxImages = MAX_IMAGES,
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
    // Don't allow moving to/from video slot (index VIDEO_SLOT_INDEX)
    if (dragIndex === VIDEO_SLOT_INDEX || hoverIndex === VIDEO_SLOT_INDEX) return;
    
    // Create a new array to avoid direct mutation
    const newItems = [...items];
    
    // Get the item being dragged
    const draggedItem = newItems[dragIndex];
    
    // Don't proceed if it's an empty slot
    if (draggedItem.isEmpty) return;
    
    // Perform a proper swap (not duplication)
    newItems.splice(dragIndex, 1); // Remove dragged item
    newItems.splice(hoverIndex, 0, draggedItem); // Insert at new position
    
    // Update primary status based on position
    // First image (index 0) is always primary
    newItems.forEach((item, idx) => {
      item.isPrimary = idx === 0 && item.type === 'image' && !item.isEmpty;
    });
    
    // Update state via callback
    onReorder(newItems);
  }, [items, onReorder]);
  
  // Create a complete grid with empty slots where needed
  const completeGrid = [...items];
  
  // Ensure we always have at least the required number of slots (up to MAX_IMAGES + 1 for video slot)
  while (completeGrid.length < MAX_IMAGES + 1) {
    completeGrid.push({
      id: `empty-slot-${completeGrid.length}`,
      type: 'empty',
      preview: '',
      isPrimary: false,
      isEmpty: true
    });
  }
  
  // Handle video slot click for empty video slot
  const handleVideoSlotClick = useCallback(() => {
    // Check if we have a video already
    if (videoItem) {
      // Preview existing video
      handleVideoPreview(videoItem);
    } else if (onAddVideo) {
      // Add video via URL
      onAddVideo();
    } else {
      // Default to file selection
      onFileSelect();
    }
  }, [videoItem, handleVideoPreview, onAddVideo, onFileSelect]);
  
  return (
    <TooltipProvider>
      <div className="space-y-4">
        <MediaGrid
          items={completeGrid}
          moveItem={moveItem}
          onDelete={onDelete}
          onPreview={handleVideoPreview}
          onVideoSlotClick={handleVideoSlotClick}
          isDragging={isDragging}
          onDrop={onDrop}
        />
        
        <GalleryControls
          totalMediaCount={totalMediaCount}
          imageItems={imageItems.length}
          videoItem={!!videoItem}
          onAddVideo={onAddVideo}
          onFileSelect={onFileSelect}
          isProcessing={isProcessing}
        />
        
        <FileUploadInfo />
        
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
