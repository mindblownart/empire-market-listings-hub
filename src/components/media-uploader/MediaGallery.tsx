import React from 'react';
import MediaItem from './MediaItem';
import VideoPreviewModal from './VideoPreviewModal';
import { extractVideoInfo } from './video-utils';
import { MediaItemType, MediaFile } from './types';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Image, Video, Plus } from 'lucide-react';

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
  onFilesDrop?: (files: FileList) => void;
  isDragging?: boolean;
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
  onDeleteNewVideo,
  onFilesDrop,
  isDragging = false,
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
    
    // Always add primary slot first (either with image or empty)
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
    
    // Always add video slot second (either with video or empty)
    if (videoUrl) {
      const videoInfo = extractVideoInfo(videoUrl);
      items.push({
        id: 'existing-video',
        type: 'video',
        url: videoUrl,
        preview: videoInfo.platform && videoInfo.id 
          ? `https://img.youtube.com/vi/${videoInfo.id}/hqdefault.jpg`
          : '',
        videoInfo,
        isNew: false
      });
    } else if (newVideo) {
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
    
    // Always add empty slots to reach exactly 11 total slots (10 images + 1 video)
    const currentItemCount = items.length;
    const emptySlots = Math.max(0, 11 - currentItemCount);
    
    for (let i = 0; i < emptySlots; i++) {
      items.push({
        id: `empty-slot-${i}-${Date.now()}`,
        type: 'empty',
        isEmpty: true,
        preview: '',
        isNew: false
      });
    }
    
    // Ensure we have exactly 11 slots total (trim if needed)
    const finalItems = items.slice(0, 11);
    setMediaItems(finalItems);
    
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
    // Don't allow moving to/from first two positions
    if (dragIndex <= 1 || hoverIndex <= 1) return;
    
    const draggedItem = mediaItems[dragIndex];
    if (draggedItem.type === 'empty') return;
    
    setMediaItems(prevItems => {
      const newItems = [...prevItems];
      newItems.splice(dragIndex, 1);
      newItems.splice(hoverIndex, 0, draggedItem);
      
      if (onReorderImages || onReorderNewImages) {
        const existingImages: string[] = [];
        const newImageFiles: File[] = [];
        
        // First image is always primary
        if (images.length > 0) {
          existingImages.push(images[0]);
        }
        
        // Collect reordered images
        newItems.forEach((item, idx) => {
          // Skip first two positions (primary and video)
          if (idx > 1 && item.type === 'image' && !item.isEmpty) {
            if (!item.isNew && item.preview) {
              existingImages.push(item.preview);
            } else if (item.isNew && item.file) {
              newImageFiles.push(item.file as File);
            }
          }
        });
        
        // Update parent components if needed
        if (onReorderImages) onReorderImages([...existingImages]);
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
    
    if (item.type === 'image') {
      if (item.isNew) {
        const newImagesIds = newImages.map((img, idx) => {
          const mediaFile = img as MediaFile;
          return mediaFile.id || `new-image-${idx}`;
        });
        
        const fileId = item.file?.id;
        const newIndex = fileId ? newImagesIds.indexOf(fileId) : -1;
        
        if (newIndex !== -1 && onDeleteNewImage) {
          onDeleteNewImage(newIndex);
        }
      } else {
        const existingIndex = item.originalIndex !== undefined ? item.originalIndex : parseInt(id.replace('existing-image-', ''));
        if (onDeleteImage && existingIndex !== undefined) {
          onDeleteImage(existingIndex);
        }
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
    
    let originalIndex;
    if (item.isNew) {
      const match = id.match(/new-image-(\d+)/);
      originalIndex = match ? parseInt(match[1]) : null;
    } else {
      const match = id.match(/existing-image-(\d+)/);
      originalIndex = match ? parseInt(match[1]) : null;
    }
    
    if (originalIndex !== null && onSetPrimaryImage) {
      onSetPrimaryImage(originalIndex);
    }
  };

  // Handle file drop on a specific slot
  const handleSlotDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onFilesDrop && e.dataTransfer.files.length > 0) {
      onFilesDrop(e.dataTransfer.files);
    }
  };
  
  // If no items yet, show empty state with 11 slots
  if (totalMediaCount === 0) {
    return (
      <TooltipProvider>
        <div className="grid grid-cols-5 gap-3" onDragOver={e => e.preventDefault()}>
          {/* Primary Image Slot */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div 
                className="relative aspect-square rounded-md border-2 border-dashed border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center"
                onDrop={(e) => handleSlotDrop(e, 0)}
                onDragOver={(e) => e.preventDefault()}
              >
                <div className="text-center p-2">
                  <Image className="w-8 h-8 mx-auto text-gray-300 mb-1" />
                  <p className="text-xs text-gray-400">Primary Image</p>
                </div>
                <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
                  Primary
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">Drop files here for primary image</TooltipContent>
          </Tooltip>
          
          {/* Video Slot */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div 
                className="relative aspect-square rounded-md border-2 border-dashed border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center"
                onDrop={(e) => handleSlotDrop(e, 1)}
                onDragOver={(e) => e.preventDefault()}
              >
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
            <TooltipContent side="top">Drop video file here</TooltipContent>
          </Tooltip>
          
          {/* 9 Empty Image Slots */}
          {Array.from({ length: 9 }).map((_, i) => (
            <Tooltip key={i}>
              <TooltipTrigger asChild>
                <div 
                  className="aspect-square rounded-md border-2 border-dashed border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center"
                  onDrop={(e) => handleSlotDrop(e, i + 2)}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <div className="text-center p-2">
                    <Plus className="w-6 h-6 mx-auto text-gray-300 mb-1" />
                    <p className="text-xs text-gray-400">Add image</p>
                    <p className="text-xs text-gray-300">Drop files here</p>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">Drop files here</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    );
  }
  
  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div 
          className={`grid grid-cols-5 gap-2 ${isDragging ? 'border-2 border-dashed border-primary rounded-lg p-2' : ''}`}
          onDragOver={(e) => e.preventDefault()}
        >
          {mediaItems.map((item, index) => (
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
                    onDelete={handleDelete}
                    onVideoPreview={handleVideoPreview}
                    onSetPrimary={handleSetPrimary}
                    isFixed={index <= 1} // Primary image and video are fixed
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                {item.isEmpty ? (
                  index === 1 ? 'Video slot (optional)' : 'Drop files here'
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
