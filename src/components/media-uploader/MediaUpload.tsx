
import React, { useCallback, useState, useRef } from 'react';
import { Info } from 'lucide-react';
import { toast } from 'sonner';
import MediaGallery from './MediaGallery';
import { MediaFile, MediaItemType } from './types';
import { extractVideoInfo } from './video-utils';

interface MediaUploadProps {
  existingImages?: string[];
  existingVideoUrl?: string | null;
  primaryImageIndex?: number;
  onImagesChange: (images: MediaFile[]) => void; 
  onVideoChange: (video: MediaFile | null) => void;
  onVideoUrlChange: (url: string | null) => void;
  onSetPrimaryImage?: (index: number) => void;
  onDeleteExistingImage?: (index: number) => void;
  onDeleteExistingVideo?: () => void;
  onImagesReorder?: (images: string[]) => void;
}

const MAX_IMAGES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

const MediaUpload: React.FC<MediaUploadProps> = ({
  existingImages = [],
  existingVideoUrl = null,
  primaryImageIndex = 0,
  onImagesChange,
  onVideoChange,
  onVideoUrlChange,
  onSetPrimaryImage,
  onDeleteExistingImage,
  onDeleteExistingVideo,
  onImagesReorder
}) => {
  const [newImages, setNewImages] = useState<MediaFile[]>([]);
  const [newVideo, setNewVideo] = useState<MediaFile | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Convert all media into a unified format - This is the SINGLE SOURCE OF TRUTH for media
  const allItems = React.useMemo(() => {
    const items: MediaItemType[] = [];
    
    // First, add existing images - we'll reorganize them with primary first
    const existingImagesCopy = [...existingImages]; 
    
    // Primary image first (at index 0)
    if (existingImagesCopy.length > 0) {
      // If primaryImageIndex is set and valid, put that image first
      if (primaryImageIndex >= 0 && primaryImageIndex < existingImagesCopy.length) {
        // Add the primary image first
        const primaryImg = existingImagesCopy[primaryImageIndex];
        items.push({
          id: `existing-image-${primaryImageIndex}`,
          type: 'image',
          preview: primaryImg,
          isPrimary: true,
          originalIndex: primaryImageIndex,
          isNew: false
        });
        
        // Remove it so we don't add it again
        existingImagesCopy.splice(primaryImageIndex, 1);
      }
      
      // Add remaining existing images
      existingImagesCopy.forEach((url, idx) => {
        items.push({
          id: `existing-image-${idx + (primaryImageIndex < idx ? 0 : 1)}`,
          type: 'image',
          preview: url,
          isPrimary: false,
          originalIndex: idx + (primaryImageIndex < idx ? 0 : 1),
          isNew: false
        });
      });
    }
    
    // Add newly uploaded images after existing ones
    newImages.forEach((file, idx) => {
      const mediaFile = file as MediaFile;
      if (!mediaFile.id) {
        mediaFile.id = `new-image-${idx}-${Date.now()}`;
      }
      
      items.push({
        id: mediaFile.id,
        type: 'image',
        file: mediaFile,
        preview: URL.createObjectURL(mediaFile),
        isPrimary: items.length === 0, // First image is primary if no other images
        isNew: true
      });
    });
    
    // Insert video or empty video slot at position 1
    // First ensure we have at least 1 slot before inserting at index 1
    if (items.length === 0) {
      items.push({
        id: `empty-image-slot-${Date.now()}`,
        type: 'empty', 
        isEmpty: true,
        preview: '',
        isNew: false
      });
    }
    
    // Now check for video content
    if (existingVideoUrl) {
      const videoInfo = extractVideoInfo(existingVideoUrl);
      const videoItem: MediaItemType = {
        id: 'existing-video',
        type: 'video',
        url: existingVideoUrl,
        preview: videoInfo.platform && videoInfo.id 
          ? `https://img.youtube.com/vi/${videoInfo.id}/hqdefault.jpg`
          : '',
        videoInfo,
        isNew: false
      };
      
      if (items.length > 0) {
        items.splice(1, 0, videoItem);
      } else {
        items.push(videoItem);
      }
    } else if (newVideo) {
      const mediaFile = newVideo as MediaFile;
      if (!mediaFile.id) {
        mediaFile.id = `new-video-${Date.now()}`;
      }
      
      const videoItem: MediaItemType = {
        id: mediaFile.id,
        type: 'video',
        file: mediaFile,
        preview: URL.createObjectURL(newVideo),
        videoInfo: { platform: 'file', id: null },
        isNew: true
      };
      
      if (items.length > 0) {
        items.splice(1, 0, videoItem);
      } else {
        items.push(videoItem);
      }
    } else {
      // Add empty video slot at position 1
      const emptyVideoSlot: MediaItemType = {
        id: 'empty-video-slot',
        type: 'video',
        isEmpty: true,
        preview: '',
        videoInfo: { platform: null, id: null },
        isNew: false
      };
      
      if (items.length > 0) {
        items.splice(1, 0, emptyVideoSlot);
      } else {
        items.push(emptyVideoSlot);
      }
    }
    
    // Set isPrimary flag for the first item if it's an image
    if (items.length > 0 && items[0].type === 'image' && !items[0].isEmpty) {
      items[0].isPrimary = true;
    }
    
    return items;
  }, [existingImages, primaryImageIndex, newImages, existingVideoUrl, newVideo]);
  
  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);
  
  // Process files when dropped or selected
  const processFiles = useCallback((files: FileList) => {
    const imageFiles: MediaFile[] = [];
    let videoFile: MediaFile | null = null;
    
    // Count existing images (both stored and newly uploaded)
    const existingImageCount = existingImages.length;
    const totalNewImages = newImages.length;
    const availableSlots = MAX_IMAGES - existingImageCount - totalNewImages;
    
    // Check if video slot is available
    const videoSlotAvailable = !existingVideoUrl && !newVideo;
    
    // Process all files
    Array.from(files).forEach(file => {
      // Process images
      if (ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        // Check for duplicates
        const isDuplicate = newImages.some(existingFile => 
          existingFile.name === file.name && 
          existingFile.size === file.size
        );
        
        if (isDuplicate) {
          toast.warning(`Duplicate image: ${file.name}`, {
            description: 'This image appears to already be in your gallery'
          });
          return;
        }
        
        // Check if we still have room for images
        if (imageFiles.length < availableSlots) {
          // Check file size
          if (file.size <= MAX_FILE_SIZE) {
            const mediaFile = file as MediaFile;
            mediaFile.id = `image-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            imageFiles.push(mediaFile);
          } else {
            toast.error(`Image too large: ${file.name}`, {
              description: 'Maximum file size is 5MB'
            });
          }
        } else if (existingImageCount + totalNewImages + imageFiles.length >= MAX_IMAGES) {
          toast.warning('Maximum images reached', {
            description: `You can only upload a maximum of ${MAX_IMAGES} images.`
          });
        }
      } 
      // Process video
      else if (ACCEPTED_VIDEO_TYPES.includes(file.type)) {
        // Check if we already have a video
        if (videoSlotAvailable) {
          // Check file size
          if (file.size <= MAX_VIDEO_SIZE) {
            const mediaFile = file as MediaFile;
            mediaFile.id = `video-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            videoFile = mediaFile;
          } else {
            toast.error(`Video too large: ${file.name}`, {
              description: 'Maximum video size is 50MB'
            });
          }
        } else {
          toast.warning('Only one video allowed', {
            description: 'Please remove the existing video first'
          });
        }
      } else {
        toast.error(`Unsupported file type: ${file.name}`, {
          description: 'Please upload images (JPG, PNG, WebP) or videos (MP4)'
        });
      }
    });
    
    // Add valid images
    if (imageFiles.length > 0) {
      setNewImages(prev => [...prev, ...imageFiles]);
      onImagesChange([...newImages, ...imageFiles]);
      
      // If this is our first image, make it primary
      if (existingImageCount === 0 && totalNewImages === 0 && imageFiles.length > 0) {
        if (onSetPrimaryImage) {
          onSetPrimaryImage(0);
        }
      }
    }
    
    // Add video if valid
    if (videoFile) {
      setNewVideo(videoFile);
      onVideoChange(videoFile);
      
      // If we had a video URL, clear it
      if (existingVideoUrl) {
        onVideoUrlChange(null);
      }
    }
    
    setDragActive(false);
  }, [existingImages.length, newImages, newVideo, existingVideoUrl, onImagesChange, onVideoChange, onVideoUrlChange, onSetPrimaryImage]);
  
  // Handle drop event
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
    
    setDragActive(false);
  }, [processFiles]);
  
  // Handle file selection via button
  const handleFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      // Reset the input value to allow selecting the same file again
      e.target.value = '';
    }
  }, [processFiles]);
  
  // Handle reordering
  const handleReorder = useCallback((reorderedItems: MediaItemType[]) => {
    // Separate existing images, new images, and video
    const updatedExistingImages: string[] = [];
    const updatedNewImages: MediaFile[] = [];
    let updatedVideo: MediaFile | null = null;
    let updatedVideoUrl: string | null = null;
    
    // Process each item in the new order
    reorderedItems.forEach((item) => {
      if (item.isEmpty) return; // Skip empty slots
      
      if (item.type === 'image') {
        if (!item.isNew && item.preview) {
          // This is an existing image
          updatedExistingImages.push(item.preview);
        } else if (item.isNew && item.file) {
          // This is a new image
          updatedNewImages.push(item.file);
        }
      } else if (item.type === 'video') {
        if (item.isNew && item.file) {
          updatedVideo = item.file;
        } else if (!item.isNew && item.url) {
          updatedVideoUrl = item.url;
        }
      }
    });
    
    // Update state with the new order
    if (updatedNewImages.length > 0 || newImages.length > 0) {
      setNewImages(updatedNewImages);
      onImagesChange(updatedNewImages);
    }
    
    if (updatedVideo !== newVideo) {
      setNewVideo(updatedVideo);
      onVideoChange(updatedVideo);
    }
    
    if (updatedVideoUrl !== existingVideoUrl) {
      if (updatedVideoUrl === null && existingVideoUrl !== null) {
        onVideoUrlChange(null);
      } else if (updatedVideoUrl !== null) {
        onVideoUrlChange(updatedVideoUrl);
      }
    }
    
    // Update existing images with the new order
    if (existingImages.length > 0 && 
        (updatedExistingImages.length !== existingImages.length || 
         !updatedExistingImages.every((url, i) => url === existingImages[i]))) {
      if (onImagesReorder) {
        onImagesReorder(updatedExistingImages);
      }
      
      // First image is always primary - find its original index
      if (onSetPrimaryImage && updatedExistingImages.length > 0) {
        const primaryUrl = updatedExistingImages[0];
        const originalPrimaryIndex = existingImages.findIndex(url => url === primaryUrl);
        if (originalPrimaryIndex !== -1) {
          onSetPrimaryImage(originalPrimaryIndex);
        } else {
          // If not found (shouldn't happen), default to 0
          onSetPrimaryImage(0);
        }
      }
    }
  }, [
    existingImages, 
    newImages, 
    newVideo, 
    existingVideoUrl, 
    onImagesChange, 
    onVideoChange, 
    onVideoUrlChange, 
    onImagesReorder, 
    onSetPrimaryImage
  ]);
  
  // Handle item deletion
  const handleDelete = useCallback((id: string) => {
    // Check if it's an existing image
    if (id.startsWith('existing-image-')) {
      const indexStr = id.replace('existing-image-', '');
      const index = parseInt(indexStr, 10);
      
      if (!isNaN(index) && onDeleteExistingImage) {
        onDeleteExistingImage(index);
      }
    } 
    // Check if it's a new image
    else if (id.startsWith('new-image-') || id.startsWith('image-')) {
      setNewImages(prev => {
        const newArr = prev.filter(img => (img as MediaFile).id !== id);
        onImagesChange(newArr);
        return newArr;
      });
    } 
    // Check if it's an existing video
    else if (id === 'existing-video') {
      if (onDeleteExistingVideo) {
        onDeleteExistingVideo();
      }
    } 
    // Check if it's a new video
    else if (id === 'new-video' || id.startsWith('video-')) {
      setNewVideo(null);
      onVideoChange(null);
    }
  }, [onDeleteExistingImage, onDeleteExistingVideo, onImagesChange, onVideoChange]);
  
  return (
    <div 
      className="space-y-4"
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <MediaGallery
        items={allItems}
        onReorder={handleReorder}
        onDelete={handleDelete}
        onVideoPreview={handleVideoPreview}
        onFileSelect={handleFileSelect}
        onDrop={handleDrop}
        isDragging={dragActive}
      />
      
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        className="hidden"
        accept={[...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES].join(',')}
        multiple
      />
      
      {/* Upload Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
        <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-gray-700 space-y-1">
          <p>• Images: Up to 10 images, 1200px+ width recommended for best quality (5MB max)</p>
          <p>• Video: One video file (MP4, 50MB max) or YouTube/Vimeo URL</p>
          <p>• First image is always the Primary Image. Video is fixed in the second position.</p>
          <p>• You can drag and drop to reorder images or drop files directly onto the gallery.</p>
        </div>
      </div>
    </div>
  );
};

export default MediaUpload;
