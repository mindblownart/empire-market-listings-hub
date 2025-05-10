
import React, { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { Info } from 'lucide-react';
import { MediaItem, MediaFile, VideoInfo } from './types';
import { extractVideoInfo } from './video-utils';
import MediaGallery from './MediaGallery';

interface MediaUploadProps {
  existingImages?: string[];
  existingVideoUrl?: string | null;
  onImagesChange: (images: MediaFile[]) => void;
  onVideoChange: (video: MediaFile | null) => void;
  onVideoUrlChange: (url: string | null) => void;
  maxImages?: number;
  onDeleteExistingImage?: (index: number) => void;
  onDeleteExistingVideo?: () => void;
  onImagesReorder?: (images: string[]) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

const MediaUpload: React.FC<MediaUploadProps> = ({
  existingImages = [],
  existingVideoUrl = null,
  onImagesChange,
  onVideoChange,
  onVideoUrlChange,
  maxImages = 10,
  onDeleteExistingImage,
  onDeleteExistingVideo,
  onImagesReorder,
}) => {
  const [newImages, setNewImages] = useState<MediaFile[]>([]);
  const [newVideo, setNewVideo] = useState<MediaFile | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Convert to MediaItem format - with correct typing
  const items: MediaItem[] = [];
  
  // Add existing images first
  existingImages.forEach((url, index) => {
    items.push({
      id: `existing-image-${index}`,
      type: 'image',
      preview: url,
      url: url,
      isPrimary: index === 0,
    });
  });
  
  // Add newly uploaded images
  newImages.forEach((file, index) => {
    const mediaFile = file as MediaFile;
    items.push({
      id: mediaFile.id || `new-image-${index}`,
      type: 'image',
      file: mediaFile,
      preview: URL.createObjectURL(mediaFile),
      isPrimary: existingImages.length === 0 && index === 0,
      isNew: true
    });
  });
  
  // Make sure the video is at position 1 if it exists
  const allItems = [...items];
  
  // Process video item
  const videoInfo = existingVideoUrl ? extractVideoInfo(existingVideoUrl) : null;
  const videoItem: MediaItem | null = existingVideoUrl ? {
    id: 'existing-video',
    type: 'video',
    url: existingVideoUrl,
    preview: videoInfo?.platform === 'youtube' 
      ? `https://img.youtube.com/vi/${videoInfo?.id || ''}/hqdefault.jpg`
      : 'https://via.placeholder.com/400x300?text=Video+Thumbnail',
    isPrimary: false,
    videoInfo: videoInfo as VideoInfo
  } : newVideo ? {
    id: `new-video-${newVideo.name}`,
    type: 'video',
    file: newVideo,
    preview: URL.createObjectURL(newVideo),
    isPrimary: false,
    videoInfo: { platform: 'file', id: null }
  } : null;
  
  // Insert video at position 1 if it exists
  if (videoItem) {
    // If there are no items or just 1 item, we need to ensure correct positioning
    if (allItems.length === 0) {
      // Add an empty slot for primary image
      allItems.push({
        id: 'empty-primary',
        type: 'empty',
        preview: '',
        isPrimary: true,
        isEmpty: true
      });
      // Then add video
      allItems.push(videoItem);
    } else if (allItems.length === 1) {
      // Already have primary image, add video at position 1
      allItems.splice(1, 0, videoItem);
    } else {
      // Replace whatever is at position 1 with the video
      // But first check if position 1 is already a video
      if (allItems[1]?.type !== 'video') {
        // It's not a video, so insert and push everything else down
        allItems.splice(1, 0, videoItem);
        
        // Make sure we don't exceed the limit
        if (allItems.length > maxImages + 2) { // +2 because of primary and video
          allItems.pop();
        }
      } else {
        // Already a video at position 1, replace it
        allItems[1] = videoItem;
      }
    }
  }
  
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
    
    // Calculate available slots
    const availableImageSlots = maxImages - (existingImages.length + newImages.length);
    const videoSlotAvailable = !existingVideoUrl && !newVideo;
    
    // Process all files
    Array.from(files).forEach(file => {
      // Process images
      if (ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        if (imageFiles.length < availableImageSlots) {
          if (file.size <= MAX_FILE_SIZE) {
            const mediaFile = file as MediaFile;
            mediaFile.id = `image-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
            imageFiles.push(mediaFile);
          } else {
            toast.error(`Image too large: ${file.name}`, {
              description: 'Maximum file size is 5MB'
            });
          }
        } else {
          toast.warning('Maximum images reached', {
            description: `You can only upload up to ${maxImages} images`
          });
          return; // Skip processing this file
        }
      } 
      // Process video
      else if (ACCEPTED_VIDEO_TYPES.includes(file.type)) {
        if (videoSlotAvailable) {
          if (file.size <= MAX_VIDEO_SIZE) {
            const mediaFile = file as MediaFile;
            mediaFile.id = `video-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
            videoFile = mediaFile;
          } else {
            toast.error(`Video too large: ${file.name}`, {
              description: 'Maximum video size is 50MB'
            });
          }
        } else {
          toast.warning('Video slot already used', {
            description: 'Please remove the existing video first'
          });
        }
      } else {
        toast.error(`Unsupported file type: ${file.name}`, {
          description: 'Please upload JPG, PNG, WebP images or MP4 videos'
        });
      }
    });
    
    // Update state with new files
    if (imageFiles.length > 0) {
      const updatedImages = [...newImages, ...imageFiles];
      setNewImages(updatedImages);
      onImagesChange(updatedImages);
    }
    
    if (videoFile) {
      setNewVideo(videoFile);
      onVideoChange(videoFile);
      
      // Clear any existing video URL
      if (existingVideoUrl) {
        onVideoUrlChange(null);
      }
    }
    
    setDragActive(false);
  }, [existingImages.length, maxImages, newImages, existingVideoUrl, newVideo, onImagesChange, onVideoChange, onVideoUrlChange]);
  
  // Handle drop event
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
    
    setDragActive(false);
  }, [processFiles]);
  
  // Handle file input change
  const handleFileSelect = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);
  
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = ''; // Reset file input
    }
  }, [processFiles]);
  
  // Handle image reordering
  const handleReorder = useCallback((updatedItems: MediaItem[]) => {
    // Split items into existing and new
    const updatedExistingImages: string[] = [];
    const updatedNewImages: MediaFile[] = [];
    
    // Process each item
    updatedItems.forEach(item => {
      if (item.id.startsWith('existing-image-')) {
        // Existing image - get URL
        if (item.url) {
          updatedExistingImages.push(item.url);
        }
      } else if (item.isNew && item.file) {
        // New image - get file
        updatedNewImages.push(item.file);
      }
    });
    
    // Update state
    setNewImages(updatedNewImages);
    onImagesChange(updatedNewImages);
    
    // Notify parent about reordered existing images
    if (onImagesReorder && updatedExistingImages.length > 0) {
      onImagesReorder(updatedExistingImages);
    }
  }, [onImagesChange, onImagesReorder]);
  
  // Handle item deletion
  const handleDelete = useCallback((id: string) => {
    if (id.startsWith('existing-image-')) {
      // Handle existing image deletion
      const index = parseInt(id.replace('existing-image-', ''), 10);
      if (onDeleteExistingImage) {
        onDeleteExistingImage(index);
      }
    } else if (id.startsWith('existing-video')) {
      // Handle existing video deletion
      if (onDeleteExistingVideo) {
        onDeleteExistingVideo();
      }
    } else if (id.startsWith('new-video-')) {
      // Handle new video deletion
      setNewVideo(null);
      onVideoChange(null);
    } else {
      // Handle new image deletion
      const updatedNewImages = newImages.filter(img => 
        img.id !== id && id !== `new-image-${img.name}`
      );
      setNewImages(updatedNewImages);
      onImagesChange(updatedNewImages);
    }
  }, [newImages, onDeleteExistingImage, onDeleteExistingVideo, onImagesChange, onVideoChange]);

  return (
    <div 
      className="space-y-4"
      onDragEnter={handleDrag}
    >
      <MediaGallery
        items={allItems}
        onReorder={handleReorder}
        onDelete={handleDelete}
        onFileSelect={handleFileSelect}
        onDrop={handleDrop}
        isDragging={dragActive}
        maxImages={maxImages}
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
      
      {/* File Upload Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex gap-3">
        <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-gray-700 space-y-1">
          <p>• Images: Up to {maxImages} images, 1200px+ width recommended for best quality (5MB max)</p>
          <p>• Video: One video file (MP4, 50MB max) or YouTube/Vimeo URL</p>
          <p>• First image is always the Primary Image</p>
          <p>• You can drag and drop to reorder images (video always stays in fixed position)</p>
        </div>
      </div>
    </div>
  );
};

export default MediaUpload;
