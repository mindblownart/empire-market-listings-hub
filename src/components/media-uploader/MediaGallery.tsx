
import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import MediaItem from './MediaItem';
import VideoPreviewModal from './VideoPreviewModal';
import { extractVideoInfo, getVideoEmbedUrl } from './video-utils';
import { MediaItemType } from './types';

interface MediaGalleryProps {
  images: string[];
  videoUrl?: string | null;
  onSetPrimaryImage?: (index: number) => void;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ 
  images, 
  videoUrl,
  onSetPrimaryImage 
}) => {
  const [mediaItems, setMediaItems] = useState<MediaItemType[]>(() => {
    const items: MediaItemType[] = [];
    
    // Process all images into media items
    images.forEach((url, index) => {
      items.push({
        id: `existing-image-${index}`,
        type: 'image',
        preview: url,
        isPrimary: index === 0, // First image is primary
        originalIndex: index
      });
    });
    
    // Extract video info if available
    if (videoUrl) {
      const videoInfo = extractVideoInfo(videoUrl);
      const videoItem: MediaItemType = {
        id: 'existing-video',
        type: 'video',
        url: videoUrl,
        preview: videoInfo.platform && videoInfo.id 
          ? `https://img.youtube.com/vi/${videoInfo.id}/hqdefault.jpg` // Simplified thumbnail logic
          : '',
        videoInfo
      };
      
      // Insert video at position 1 if we have items
      if (items.length > 0) {
        items.splice(1, 0, videoItem);
      } else {
        items.push(videoItem);
      }
    }
    
    return items;
  });
  
  // State for video preview modal
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [currentVideoPreview, setCurrentVideoPreview] = useState<{
    embedUrl: string;
    platform: string | null;
  } | null>(null);
  
  // Handle reordering of items
  const moveItem = (dragIndex: number, hoverIndex: number) => {
    // Don't allow moving the primary image or video
    if (dragIndex <= 1 || hoverIndex <= 1) return;
    
    const draggedItem = mediaItems[dragIndex];
    
    setMediaItems((prevItems) => {
      const newItems = [...prevItems];
      // Remove item at dragIndex
      newItems.splice(dragIndex, 1);
      // Insert at hoverIndex
      newItems.splice(hoverIndex, 0, draggedItem);
      return newItems;
    });
  };
  
  // Handle deletion (disabled for this view-only gallery)
  const handleDelete = (id: string) => {
    // In a view-only gallery, we might want to disable deletion
    console.log('Delete requested for item:', id);
  };
  
  // Handle video preview
  const handleVideoPreview = (item: MediaItemType) => {
    if (item.type === 'video' && item.videoInfo) {
      const embedUrl = getVideoEmbedUrl(item.videoInfo.platform, item.videoInfo.id);
      setCurrentVideoPreview({
        embedUrl,
        platform: item.videoInfo.platform
      });
      setIsVideoModalOpen(true);
    }
  };
  
  // Handle setting an image as primary
  const handleSetPrimary = (id: string) => {
    const itemIndex = mediaItems.findIndex(item => item.id === id);
    if (itemIndex === -1) return;
    
    const item = mediaItems[itemIndex];
    if (item.type !== 'image') return;
    
    // Find the original index of the image (excluding the video)
    const originalIndex = item.originalIndex !== undefined 
      ? item.originalIndex 
      : mediaItems.filter(i => i.type === 'image' && i.id !== id).length;
    
    // Call the parent handler if provided
    if (onSetPrimaryImage) {
      onSetPrimaryImage(originalIndex);
    }
    
    // Update the media items to reflect the new primary
    setMediaItems(prevItems => {
      return prevItems.map(item => ({
        ...item,
        isPrimary: item.id === id
      }));
    });
  };
  
  // If no media, show a placeholder
  if (mediaItems.length === 0) {
    return (
      <div className="text-center p-4 border border-dashed rounded-md">
        <p className="text-gray-500">No media available</p>
      </div>
    );
  }
  
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {mediaItems.map((item, index) => (
          <MediaItem
            key={item.id}
            item={item}
            index={index}
            moveItem={moveItem}
            onDelete={handleDelete}
            onVideoPreview={handleVideoPreview}
            onSetPrimary={handleSetPrimary}
            isFixed={index <= 1} // Primary image and video are fixed
          />
        ))}
      </div>
      
      {/* Video Preview Modal */}
      <VideoPreviewModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        embedUrl={currentVideoPreview?.embedUrl || ''}
        platform={currentVideoPreview?.platform || null}
      />
    </DndProvider>
  );
};

export default MediaGallery;
