import React, { useState, useRef, useCallback, useEffect } from 'react';
import MediaItem from './MediaItem';
import VideoPreviewModal from './VideoPreviewModal';
import { extractVideoInfo } from './video-utils';
import { MediaItemType, MediaFile } from './types';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Image, Video, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  onFilesSelect?: (files: FileList) => void;
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
  onFilesSelect,
  isDragging = false,
}) => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [currentVideoPreview, setCurrentVideoPreview] = useState<{
    embedUrl: string;
    platform: string | null;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Calculate total media count
  const totalImageCount = images.length + newImages.length;
  const hasVideo = !!videoUrl || !!newVideo;
  const totalMediaCount = totalImageCount + (hasVideo ? 1 : 0);
  
  // Convert images and newImages to MediaItemType format
  const [mediaItems, setMediaItems] = useState<MediaItemType[]>([]);
  
  // Update media items when props change
  useEffect(() => {
    const buildMediaItems = () => {
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
      return items.slice(0, 11);
    };
    
    const newMediaItems = buildMediaItems();
    setMediaItems(newMediaItems);
    
    // Cleanup function for URL.createObjectURL
    return () => {
      newImages.forEach(file => {
        if (file instanceof File) {
          try {
            URL.revokeObjectURL(URL.createObjectURL(file));
          } catch (e) {
            // Ignore revocation errors
          }
        }
      });
      
      if (newVideo) {
        try {
          URL.revokeObjectURL(URL.createObjectURL(newVideo));
        } catch (e) {
          // Ignore revocation errors
        }
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
  const moveItem = useCallback((dragIndex: number, hoverIndex: number) => {
    // Don't allow moving to/from video slot (index 1)
    if (dragIndex === 1 || hoverIndex === 1) return;
    
    setMediaItems(prevItems => {
      // Create a new array to avoid direct mutation
      const newItems = [...prevItems];
      
      // Get the item being dragged
      const draggedItem = newItems[dragIndex];
      if (draggedItem.type === 'empty') return prevItems;
      
      // Remove the item from its original position
      newItems.splice(dragIndex, 1);
      
      // Insert the item at the new position
      newItems.splice(hoverIndex, 0, draggedItem);
      
      // Update primary status based on position
      if (hoverIndex === 0 || dragIndex === 0) {
        // First, ensure no item is primary
        newItems.forEach(item => {
          if (item.isPrimary) {
            item.isPrimary = false;
          }
        });
        
        // Then set the first item as primary
        if (newItems[0].type === 'image' && !newItems[0].isEmpty) {
          newItems[0].isPrimary = true;
        }
      }
      
      // Update parent components if needed
      if (onReorderImages || onReorderNewImages) {
        const existingImages: string[] = [];
        const newImageFiles: File[] = [];
        
        // Collect reordered images
        newItems.forEach(item => {
          if (item.type === 'image' && !item.isEmpty) {
            if (!item.isNew && item.preview) {
              existingImages.push(item.preview);
            } else if (item.isNew && item.file) {
              newImageFiles.push(item.file as File);
            }
          }
        });
        
        // Update parent components
        if (onReorderImages) onReorderImages([...existingImages]);
        if (onReorderNewImages) onReorderNewImages(newImageFiles);
        
        // Update primary image index
        if (onSetPrimaryImage && newItems[0].type === 'image' && !newItems[0].isEmpty) {
          let primaryIndex = 0;
          
          // Find the primary image index relative to its origin array
          if (!newItems[0].isNew && newItems[0].originalIndex !== undefined) {
            primaryIndex = newItems[0].originalIndex;
          } else if (newItems[0].isNew && newItems[0].file) {
            const mediaFile = newItems[0].file as MediaFile;
            const newImagesWithIds = newImages.map((file, idx) => {
              const typedFile = file as MediaFile;
              return { file: typedFile, id: typedFile.id || `new-image-${idx}`, index: idx };
            });
            
            const fileItem = newImagesWithIds.find(item => 
              item.id === mediaFile.id || 
              (item.file.name === mediaFile.name && item.file.size === mediaFile.size)
            );
            
            if (fileItem) {
              primaryIndex = fileItem.index;
            }
          }
          
          onSetPrimaryImage(primaryIndex);
        }
      }
      
      return newItems;
    });
  }, [onReorderImages, onReorderNewImages, onSetPrimaryImage, newImages]);
  
  // Handle deletion
  const handleDelete = useCallback((id: string) => {
    const index = mediaItems.findIndex(item => item.id === id);
    if (index === -1) return;
    
    const item = mediaItems[index];
    if (item.isEmpty) return;
    
    if (item.type === 'image') {
      if (item.isNew) {
        // Find index in newImages array
        let newIndex = -1;
        
        // Try to find by id first
        if (item.file) {
          const mediaFile = item.file as MediaFile;
          const newImagesWithIds = newImages.map((file, idx) => {
            const typedFile = file as MediaFile;
            return { file: typedFile, id: typedFile.id || `new-image-${idx}`, index: idx };
          });
          
          const fileItem = newImagesWithIds.find(nim => 
            nim.id === mediaFile.id || 
            (nim.file.name === mediaFile.name && nim.file.size === mediaFile.size)
          );
          
          if (fileItem) {
            newIndex = fileItem.index;
          }
        }
        
        // Fallback to original index
        if (newIndex === -1 && item.originalIndex !== undefined) {
          newIndex = item.originalIndex;
        }
        
        if (newIndex !== -1 && onDeleteNewImage) {
          onDeleteNewImage(newIndex);
        }
      } else {
        // Handle existing image deletion
        const existingIndex = item.originalIndex !== undefined ? 
          item.originalIndex : 
          parseInt(id.replace('existing-image-', ''));
          
        if (onDeleteImage && !isNaN(existingIndex)) {
          onDeleteImage(existingIndex);
        }
      }
    } else if (item.type === 'video') {
      // Handle video deletion
      if (item.isNew) {
        if (onDeleteNewVideo) onDeleteNewVideo();
      } else {
        if (onDeleteVideo) onDeleteVideo();
      }
    }
  }, [mediaItems, newImages, onDeleteImage, onDeleteNewImage, onDeleteVideo, onDeleteNewVideo]);

  // Handle file drop on a specific slot
  const handleSlotDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onFilesDrop && e.dataTransfer.files.length > 0) {
      onFilesDrop(e.dataTransfer.files);
    }
  };

  // Handle file selection via button
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && onFilesSelect) {
      onFilesSelect(e.target.files);
      // Reset the input value to allow selecting the same file again
      e.target.value = '';
    }
  };
  
  // If no items yet, show empty state with 11 slots
  if (totalMediaCount === 0) {
    return (
      <TooltipProvider>
        <div className="space-y-4">
          <div 
            className="grid grid-cols-5 gap-3"
            onDragOver={e => e.preventDefault()}
            style={{ minHeight: '200px' }}
          >
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
          
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              onClick={handleFileSelect} 
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Select Files
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              className="hidden"
              accept="image/jpeg,image/png,image/webp,video/mp4"
              multiple
            />
          </div>
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
          style={{ minHeight: '200px' }}
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
                    isFixed={index === 1} // Only video slot (index 1) is fixed
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
            {totalImageCount > 0 && <span> ({totalImageCount} images{hasVideo ? ', 1 video' : ''})</span>}
          </div>
          
          <Button 
            variant="outline" 
            onClick={handleFileSelect} 
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Select Files
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            className="hidden"
            accept="image/jpeg,image/png,image/webp,video/mp4"
            multiple
          />
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
