import React, { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { Info } from 'lucide-react';
import { MediaItem, MediaFile } from './types';
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
  
  // Convert existing images to MediaItem format
  const images: MediaItem[] = [
    // Existing images first
    ...existingImages.map((url, index): MediaItem => ({
      id: `existing-image-${index}`,
      type: 'image',
      preview: url,
      url: url,
      isPrimary: index === 0,
    })),
    // Then newly uploaded images
    ...newImages.map((file, index): MediaItem => {
      const mediaFile = file as MediaFile;
      return {
        id: mediaFile.id || `new-image-${index}`,
        type: 'image',
        file: mediaFile,
        preview: URL.createObjectURL(mediaFile),
        isPrimary: existingImages.length === 0 && index === 0,
        isNew: true
      };
    })
  ];
  
  // Process video item
  const videoItem: MediaItem | null = existingVideoUrl ? {
    id: 'existing-video',
    type: 'video',
    url: existingVideoUrl,
    preview: extractVideoInfo(existingVideoUrl).platform === 'youtube' 
      ? `https://img.youtube.com/vi/${extractVideoInfo(existingVideoUrl).id}/hqdefault.jpg`
      : 'https://via.placeholder.com/400x300?text=Video+Thumbnail',
    isPrimary: false,
    videoInfo: extractVideoInfo(existingVideoUrl)
  } : newVideo ? {
    id: `new-video-${newVideo.name}`,
    type: 'video',
    file: newVideo,
    preview: URL.createObjectURL(newVideo),
    isPrimary: false,
    videoInfo: { platform: 'file', id: null }
  } : null;
  
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
    const availableImageSlots = maxImages - images.length;
    const videoSlotAvailable = !videoItem;
    
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
        } else if (imageFiles.length + images.length >= maxImages) {
          toast.warning('Maximum images reached', {
            description: `You can only upload up to ${maxImages} images`
          });
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
  }, [images.length, maxImages, newImages, videoItem, existingVideoUrl, onImagesChange, onVideoChange, onVideoUrlChange]);
  
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
  const handleImagesChange = useCallback((updatedItems: MediaItem[]) => {
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
  
  // Handle video change
  const handleVideoChange = useCallback((updatedVideo: MediaItem | null) => {
    if (!updatedVideo) {
      if (existingVideoUrl && onDeleteExistingVideo) {
        // Delete existing video URL
        onDeleteExistingVideo();
      } else if (newVideo) {
        // Delete new video file
        setNewVideo(null);
        onVideoChange(null);
      }
    }
    // We don't need to handle the case of adding a video here
    // as that's handled by processFiles
  }, [existingVideoUrl, newVideo, onDeleteExistingVideo, onVideoChange]);
  
  // Handle image deletion
  const handleDeleteImage = useCallback((index: number) => {
    const existingCount = existingImages.length;
    
    if (index < existingCount) {
      // It's an existing image
      if (onDeleteExistingImage) {
        onDeleteExistingImage(index);
      }
    } else {
      // It's a new image
      const newIndex = index - existingCount;
      const updatedNewImages = [...newImages];
      updatedNewImages.splice(newIndex, 1);
      setNewImages(updatedNewImages);
      onImagesChange(updatedNewImages);
    }
  }, [existingImages.length, newImages, onDeleteExistingImage, onImagesChange]);

  return (
    <div 
      className="space-y-4"
      onDragEnter={handleDrag}
    >
      <MediaGallery
        images={images}
        videoItem={videoItem}
        onImagesChange={handleImagesChange}
        onVideoChange={handleVideoChange}
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
          <p>• You can drag and drop to reorder images (video stays in fixed position)</p>
        </div>
      </div>
    </div>
  );
};

export default MediaUpload;
