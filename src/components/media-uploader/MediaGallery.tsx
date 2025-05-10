
import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import MediaItem from './MediaItem';
import VideoPreviewModal from './VideoPreviewModal';
import { extractVideoInfo, getVideoEmbedUrl } from './video-utils';
import { MediaItemType } from './types';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MediaGalleryProps {
  images: string[];
  newImages?: File[];
  videoUrl?: string | null;
  newVideo?: File | null;
  onSetPrimaryImage?: (index: number) => void;
  onReorderImages?: (reorderedImages: string[]) => void;
  onReorderNewImages?: (reorderedImages: File[]) => void;
  onDeleteImage?: (index: number) => void;
  onDeleteNewImage?: (index: number) => void;
  onDeleteVideo?: () => void;
  onDeleteNewVideo?: () => void;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ 
  images = [], 
  newImages = [],
  videoUrl,
  newVideo,
  onSetPrimaryImage,
  onReorderImages,
  onReorderNewImages,
  onDeleteImage,
  onDeleteNewImage,
  onDeleteVideo,
  onDeleteNewVideo
}) => {
  // Calculate total media count
  const totalImageCount = images.length + newImages.length;
  const hasVideo = !!videoUrl || !!newVideo;
  const totalMediaCount = totalImageCount + (hasVideo ? 1 : 0);
  
  // Convert images and newImages to MediaItemType format
  const [mediaItems, setMediaItems] = useState<MediaItemType[]>([]);
  
  // Update media items when props change
  useEffect(() => {
    const items: MediaItemType[] = [];
    
    // Add existing images first
    images.forEach((url, index) => {
      items.push({
        id: `existing-image-${index}`,
        type: 'image',
        preview: url,
        isPrimary: index === 0, // First image is primary
        originalIndex: index,
        isNew: false
      });
    });
    
    // Add new images
    newImages.forEach((file, index) => {
      items.push({
        id: `new-image-${index}`,
        type: 'image',
        file,
        preview: URL.createObjectURL(file),
        isPrimary: items.length === 0, // Only primary if there are no other images
        originalIndex: index,
        isNew: true
      });
    });
    
    // Insert video at position 1 or 0 (if no images)
    if (videoUrl) {
      const videoInfo = extractVideoInfo(videoUrl);
      const videoItem: MediaItemType = {
        id: 'existing-video',
        type: 'video',
        url: videoUrl,
        preview: videoInfo.platform && videoInfo.id 
          ? `https://img.youtube.com/vi/${videoInfo.id}/hqdefault.jpg` // Simplified thumbnail logic
          : '',
        videoInfo,
        isNew: false
      };
      
      // Insert video at position 1 if we have items, otherwise at 0
      if (items.length > 0) {
        items.splice(1, 0, videoItem);
      } else {
        items.push(videoItem);
      }
    }
    else if (newVideo) {
      const videoItem: MediaItemType = {
        id: 'new-video',
        type: 'video',
        file: newVideo,
        preview: URL.createObjectURL(newVideo),
        videoInfo: { platform: 'file', id: null },
        isNew: true
      };
      
      // Insert video at position 1 if we have items, otherwise at 0
      if (items.length > 0) {
        items.splice(1, 0, videoItem);
      } else {
        items.push(videoItem);
      }
    }
    
    setMediaItems(items);
    
    // Cleanup function for URL.createObjectURL
    return () => {
      newImages.forEach(file => {
        const url = URL.createObjectURL(file);
        URL.revokeObjectURL(url);
      });
      
      if (newVideo) {
        URL.revokeObjectURL(URL.createObjectURL(newVideo));
      }
    };
  }, [images, newImages, videoUrl, newVideo]);
  
  // State for video preview modal
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [currentVideoPreview, setCurrentVideoPreview] = useState<{
    embedUrl: string;
    platform: string | null;
  } | null>(null);
  
  // Handle reordering of items
  const moveItem = (dragIndex: number, hoverIndex: number) => {
    // Don't allow moving the primary image or video (positions 0 and 1)
    if (dragIndex <= 1 || hoverIndex <= 1) return;
    
    const draggedItem = mediaItems[dragIndex];
    
    setMediaItems(prevItems => {
      const newItems = [...prevItems];
      // Remove item at dragIndex
      newItems.splice(dragIndex, 1);
      // Insert at hoverIndex
      newItems.splice(hoverIndex, 0, draggedItem);
      
      // After reordering, update the parent component if needed
      if (onReorderImages || onReorderNewImages) {
        const existingImages: string[] = [];
        const newImageFiles: File[] = [];
        
        // Extract images in their new order, skipping the video
        newItems.forEach(item => {
          if (item.type === 'image') {
            if (!item.isNew && item.preview) {
              existingImages.push(item.preview);
            } else if (item.isNew && item.file) {
              newImageFiles.push(item.file as File);
            }
          }
        });
        
        // Call the appropriate reorder callbacks
        if (onReorderImages) onReorderImages(existingImages);
        if (onReorderNewImages) onReorderNewImages(newImageFiles);
      }
      
      return newItems;
    });
  };
  
  // Handle deletion
  const handleDelete = (id: string) => {
    const index = mediaItems.findIndex(item => item.id === id);
    if (index === -1) return;
    
    const item = mediaItems[index];
    
    // Call the appropriate delete callback
    if (item.type === 'image') {
      if (item.isNew) {
        // For new images, find the original index among new images
        const newIndex = parseInt(id.replace('new-image-', ''));
        if (onDeleteNewImage) onDeleteNewImage(newIndex);
      } else {
        // For existing images, find the original index
        const existingIndex = parseInt(id.replace('existing-image-', ''));
        if (onDeleteImage) onDeleteImage(existingIndex);
      }
    } else if (item.type === 'video') {
      if (item.isNew) {
        if (onDeleteNewVideo) onDeleteNewVideo();
      } else {
        if (onDeleteVideo) onDeleteVideo();
      }
    }
  };
  
  // Handle video preview
  const handleVideoPreview = (item: MediaItemType) => {
    if (item.type === 'video') {
      if (item.videoInfo?.platform === 'file' && item.file) {
        // Local file video preview
        const url = URL.createObjectURL(item.file);
        setCurrentVideoPreview({
          embedUrl: url,
          platform: 'file'
        });
      } else if (item.videoInfo) {
        // YouTube/Vimeo video preview
        const embedUrl = getVideoEmbedUrl(item.videoInfo.platform, item.videoInfo.id);
        setCurrentVideoPreview({
          embedUrl,
          platform: item.videoInfo.platform
        });
      }
      setIsVideoModalOpen(true);
    }
  };
  
  // Handle setting an image as primary
  const handleSetPrimary = (id: string) => {
    const itemIndex = mediaItems.findIndex(item => item.id === id);
    if (itemIndex === -1) return;
    
    const item = mediaItems[itemIndex];
    if (item.type !== 'image') return;
    
    // Find the original index of the image (for existing images only)
    if (!item.isNew && onSetPrimaryImage) {
      const originalIndex = parseInt(id.replace('existing-image-', ''));
      onSetPrimaryImage(originalIndex);
    }
    
    // Update the UI to reflect the new primary
    setMediaItems(prevItems => {
      return prevItems.map(item => ({
        ...item,
        isPrimary: item.id === id
      }));
    });
  };
  
  return (
    <div className="space-y-4">
      <DndProvider backend={HTML5Backend}>
        {mediaItems.length > 0 ? (
          <div>
            <ScrollArea className="w-full pb-4">
              <div className="flex gap-4 pb-2 pr-4" style={{ minHeight: '150px' }}>
                {mediaItems.map((item, index) => (
                  <div key={item.id} className="flex-shrink-0" style={{ width: '150px' }}>
                    <MediaItem
                      item={item}
                      index={index}
                      moveItem={moveItem}
                      onDelete={handleDelete}
                      onVideoPreview={handleVideoPreview}
                      onSetPrimary={handleSetPrimary}
                      isFixed={index <= 1} // Primary image and video are fixed
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="text-sm text-gray-500 flex justify-between mt-1">
              <div>
                <span className="font-medium">{totalMediaCount}</span> of <span className="font-medium">11</span> media slots used 
                {totalImageCount > 0 && <span> ({totalImageCount} images{hasVideo ? ', 1 video' : ''})</span>}
              </div>
              <div className="text-xs italic">
                Primary image and video positions are fixed
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 border border-dashed rounded-md">
            <p className="text-gray-500">No media available</p>
          </div>
        )}
      </DndProvider>
      
      {/* Video Preview Modal */}
      <VideoPreviewModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        embedUrl={currentVideoPreview?.embedUrl || ''}
        platform={currentVideoPreview?.platform || null}
      />
    </div>
  );
};

export default MediaGallery;
