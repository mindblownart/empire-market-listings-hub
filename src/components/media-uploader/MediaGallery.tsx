
import React from 'react';
import MediaItem from './MediaItem';
import VideoPreviewModal from './VideoPreviewModal';
import { extractVideoInfo } from './video-utils';
import { MediaItemType, MediaFile } from './types';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Image, Video } from 'lucide-react';

interface MediaGalleryProps {
  images?: string[];
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
  const [isVideoModalOpen, setIsVideoModalOpen] = React.useState(false);
  const [currentVideoPreview, setCurrentVideoPreview] = React.useState<{
    embedUrl: string;
    platform: string | null;
  } | null>(null);
  
  // Calculate total media count
  const totalImageCount = images.length + newImages.length;
  const hasVideo = !!videoUrl || !!newVideo;
  const totalMediaCount = totalImageCount + (hasVideo ? 1 : 0);
  
  // Convert images and newImages to MediaItemType format
  const [mediaItems, setMediaItems] = React.useState<MediaItemType[]>([]);
  
  // Update media items when props change
  React.useEffect(() => {
    const items: MediaItemType[] = [];
    
    // Add primary image first (either first existing image or first new image)
    if (images.length > 0) {
      items.push({
        id: `existing-image-0`,
        type: 'image',
        preview: images[0],
        isPrimary: true,
        originalIndex: 0,
        isNew: false
      });
    } else if (newImages.length > 0) {
      const mediaFile = newImages[0] as MediaFile;
      if (!mediaFile.id) {
        mediaFile.id = `new-image-0-${Date.now()}`;
      }
      
      items.push({
        id: `new-image-0`,
        type: 'image',
        file: mediaFile,
        preview: URL.createObjectURL(mediaFile),
        isPrimary: true,
        originalIndex: 0,
        isNew: true
      });
    } else {
      // Add empty primary slot
      items.push({
        id: 'empty-primary-slot',
        type: 'image',
        isEmpty: true,
        preview: '',
        isPrimary: true,
        isNew: false
      });
    }
    
    // Always add video slot (either with video or empty)
    if (videoUrl) {
      const videoInfo = extractVideoInfo(videoUrl);
      items.push({
        id: 'existing-video',
        type: 'video',
        url: videoUrl,
        preview: videoInfo.platform && videoInfo.id 
          ? `https://img.youtube.com/vi/${videoInfo.id}/hqdefault.jpg` // Simplified thumbnail logic
          : '',
        videoInfo,
        isNew: false
      });
    } else if (newVideo) {
      // Add ID to newVideo as well
      const mediaFile = newVideo as MediaFile;
      if (!mediaFile.id) {
        mediaFile.id = `new-video-${Date.now()}`;
      }
      
      items.push({
        id: 'new-video',
        type: 'video',
        file: mediaFile,
        preview: URL.createObjectURL(newVideo),
        videoInfo: { platform: 'file', id: null },
        isNew: true
      });
    } else {
      // Add empty video slot
      items.push({
        id: 'empty-video-slot',
        type: 'video',
        isEmpty: true,
        preview: '',
        videoInfo: { platform: null, id: null },
        isNew: false
      });
    }
    
    // Add remaining existing images (skipping the first one)
    if (images.length > 1) {
      for (let i = 1; i < images.length; i++) {
        items.push({
          id: `existing-image-${i}`,
          type: 'image',
          preview: images[i],
          isPrimary: false,
          originalIndex: i,
          isNew: false
        });
      }
    }
    
    // Add remaining new images (skipping the first one if it was added as primary)
    if (newImages.length > 0) {
      const startIdx = images.length > 0 ? 0 : 1; // Skip first new image if it became primary
      for (let i = startIdx; i < newImages.length; i++) {
        const mediaFile = newImages[i] as MediaFile;
        if (!mediaFile.id) {
          mediaFile.id = `new-image-${i}-${Date.now()}`;
        }
        
        items.push({
          id: `new-image-${i}`,
          type: 'image',
          file: mediaFile,
          preview: URL.createObjectURL(newImages[i]),
          isPrimary: false,
          originalIndex: i,
          isNew: true
        });
      }
    }
    
    // Add empty slots to reach 11 total slots (10 images + 1 video)
    const emptySlots = Math.max(0, 11 - items.length);
    for (let i = 0; i < emptySlots; i++) {
      items.push({
        id: `empty-slot-${i}`,
        type: 'empty',
        isEmpty: true,
        preview: '',
        isNew: false
      });
    }
    
    setMediaItems(items);
    
    // Cleanup function for URL.createObjectURL
    return () => {
      newImages.forEach(file => {
        if (file instanceof File) {
          URL.revokeObjectURL(URL.createObjectURL(file));
        }
      });
      
      if (newVideo) {
        URL.revokeObjectURL(URL.createObjectURL(newVideo));
      }
    };
  }, [images, newImages, videoUrl, newVideo]);
  
  // Handle video preview
  const handleVideoPreview = (item: MediaItemType) => {
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
  };
  
  // Handle reordering of items
  const moveItem = (dragIndex: number, hoverIndex: number) => {
    // Don't allow moving the primary image (position 0) or video slot (position 1)
    if (dragIndex <= 1 || hoverIndex <= 1) return;
    
    const draggedItem = mediaItems[dragIndex];
    if (draggedItem.type === 'empty') return;
    
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
        
        // Extract images in their new order, skipping the primary, video and empty slots
        newItems.forEach(item => {
          if (item.type === 'image' && !item.isPrimary) {
            if (!item.isNew && item.preview) {
              existingImages.push(item.preview);
            } else if (item.isNew && item.file) {
              newImageFiles.push(item.file as File);
            }
          }
        });
        
        // Call the appropriate reorder callbacks
        if (onReorderImages) onReorderImages([images[0], ...existingImages]);
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
    if (item.isEmpty) return;
    
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

  // Handle set primary
  const handleSetPrimary = (id: string) => {
    const index = mediaItems.findIndex(item => item.id === id);
    if (index === -1 || index <= 1) return;
    
    const item = mediaItems[index];
    if (item.isEmpty || item.type !== 'image') return;
    
    // Find the original index for this image
    let originalIndex;
    if (item.isNew) {
      // For new images
      const match = id.match(/new-image-(\d+)/);
      originalIndex = match ? parseInt(match[1]) : null;
    } else {
      // For existing images
      const match = id.match(/existing-image-(\d+)/);
      originalIndex = match ? parseInt(match[1]) : null;
    }
    
    if (originalIndex !== null && onSetPrimaryImage) {
      onSetPrimaryImage(originalIndex);
    }
  };
  
  // If no items yet, show empty state
  if (totalMediaCount === 0) {
    return (
      <div className="min-h-[150px] border-2 border-dashed rounded-lg flex items-center justify-center p-6 text-center">
        <div>
          <div className="flex justify-center items-center mb-3">
            <div className="bg-gray-100 rounded-full p-4">
              <Image className="h-6 w-6 text-gray-400" />
            </div>
          </div>
          <p className="text-gray-600">Add photos and video to showcase your business</p>
          <p className="text-xs text-gray-500 mt-1">Drag files or click Select files to upload</p>
        </div>
      </div>
    );
  }
  
  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {mediaItems.slice(0, 10).map((item, index) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <div>
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
              </TooltipTrigger>
              <TooltipContent side="top">
                {item.isEmpty ? (
                  index === 1 ? 'Video slot (optional)' : 'Empty slot'
                ) : (
                  index === 0 ? 'Primary image (fixed position)' : 
                  index === 1 ? 'Video (fixed position)' : 
                  `Image ${index} (can be reordered)`
                )}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
        
        <div className="text-sm text-gray-500 flex justify-between mt-1">
          <div>
            <span className="font-medium">{totalMediaCount}</span> of <span className="font-medium">11</span> media slots used 
            {totalImageCount > 0 && <span> ({totalImageCount} images{hasVideo ? ', 1 video' : ''})</span>}
          </div>
          <div className="text-xs italic">
            Primary image and video positions are fixed
          </div>
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
  );
};

export default MediaGallery;
