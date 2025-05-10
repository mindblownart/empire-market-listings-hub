
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
  
  // Convert all media into a unified format
  const allItems = React.useMemo(() => {
    const items: MediaItemType[] = [];
    
    // First, add existing images - start with primary if it exists
    if (existingImages.length > 0) {
      // Primary image first (at index primaryImageIndex)
      const primaryImg = existingImages[primaryImageIndex];
      if (primaryImg) {
        items.push({
          id: `existing-image-${primaryImageIndex}`,
          type: 'image',
          preview: primaryImg,
          isPrimary: true,
          originalIndex: primaryImageIndex,
          isNew: false
        });
      }
      
      // Add remaining existing images
      existingImages.forEach((url, idx) => {
        if (idx !== primaryImageIndex) {
          items.push({
            id: `existing-image-${idx}`,
            type: 'image',
            preview: url,
            isPrimary: false,
            originalIndex: idx,
            isNew: false
          });
        }
      });
    }
    
    // Add newly uploaded images after existing ones
    newImages.forEach((file, idx) => {
      const mediaFile = file as MediaFile;
      if (!mediaFile.id) {
        mediaFile.id = `new-image-${idx}-${Date.now()}`;
      }
      
      items.push({
        id: `new-image-${idx}`,
        type: 'image',
        file: mediaFile,
        preview: URL.createObjectURL(mediaFile),
        isPrimary: items.length === 0, // First image is primary if no other images
        originalIndex: idx,
        isNew: true
      });
    });
    
    // Insert video or empty video slot at position 1
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
        id: 'new-video',
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
    
    // Count available slots
    const availableSlots = MAX_IMAGES - existingImages.length - newImages.length;
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
        } else if (existingImages.length + newImages.length + imageFiles.length >= MAX_IMAGES) {
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
  }, [existingImages.length, newImages, newVideo, existingVideoUrl, onImagesChange, onVideoChange, onVideoUrlChange]);
  
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
    let newPrimaryIndex = 0;
    
    // Process each item in the new order
    reorderedItems.forEach((item, idx) => {
      if (item.isEmpty) return; // Skip empty slots
      
      if (item.type === 'image') {
        if (!item.isNew && item.preview) {
          // This is an existing image
          updatedExistingImages.push(item.preview);
          
          // If this is the primary image (always at index 0), mark its position
          if (idx === 0) {
            newPrimaryIndex = updatedExistingImages.length - 1;
          }
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
      
      // Update primary image if it changed
      if (onSetPrimaryImage && primaryImageIndex !== newPrimaryIndex) {
        onSetPrimaryImage(newPrimaryIndex);
      }
    }
  }, [
    existingImages, 
    newImages, 
    newVideo, 
    existingVideoUrl, 
    primaryImageIndex, 
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
    else if (id.startsWith('new-image-')) {
      const indexStr = id.replace('new-image-', '').split('-')[0];
      const index = parseInt(indexStr, 10);
      
      if (!isNaN(index)) {
        setNewImages(prev => {
          const newArr = prev.filter((_, i) => i !== index);
          onImagesChange(newArr);
          return newArr;
        });
      }
    } 
    // Check if it's an existing video
    else if (id === 'existing-video') {
      if (onDeleteExistingVideo) {
        onDeleteExistingVideo();
      }
    } 
    // Check if it's a new video
    else if (id === 'new-video') {
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
        onVideoPreview={(item) => {
          if (item.type === 'video' && !item.isEmpty) {
            // Video preview logic here
          }
        }}
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
