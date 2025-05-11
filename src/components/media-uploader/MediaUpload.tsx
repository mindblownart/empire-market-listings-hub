
import React, { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { Info } from 'lucide-react';
import { MediaItem, MediaFile, VideoInfo } from './types';
import { extractVideoInfo } from './video-utils';
import MediaGallery from './MediaGallery';
import { 
  ACCEPTED_IMAGE_TYPES, 
  ACCEPTED_VIDEO_TYPES, 
  processFiles,
  fileToMediaFile,
  filesToMediaFiles
} from './media-processing';

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
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [processingFiles, setProcessingFiles] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Convert to MediaItem format with correct typing
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
    items.push({
      id: file.id,
      type: 'image',
      file: file,
      preview: file.preview || URL.createObjectURL(file),
      isPrimary: existingImages.length === 0 && index === 0,
      isNew: true
    });
  });
  
  // Make sure the video is at position 1 if it exists
  const allItems = [...items];
  
  // Process video item
  const videoInfo = existingVideoUrl ? extractVideoInfo(existingVideoUrl) : null;
  
  // Create video item with correct type handling
  let videoItem: MediaItem | null = null;
  
  if (existingVideoUrl && videoInfo) {
    videoItem = {
      id: 'existing-video',
      type: 'video',
      url: existingVideoUrl,
      preview: videoInfo.platform === 'youtube' 
        ? `https://img.youtube.com/vi/${videoInfo.id || ''}/hqdefault.jpg`
        : 'https://via.placeholder.com/400x300?text=Video+Thumbnail',
      isPrimary: false,
      videoInfo: videoInfo as VideoInfo
    };
  } else if (newVideo) {
    videoItem = {
      id: newVideo.id,
      type: 'video',
      file: newVideo,
      preview: videoThumbnail || URL.createObjectURL(newVideo),
      isPrimary: false,
      videoInfo: { platform: 'file', id: null }
    };
  }
  
  // Insert video at position 1 if it exists
  if (videoItem) {
    // Ensure video is always in slot 2 (index 1)
    // If there are 0 items, add an empty slot first, then the video
    if (allItems.length === 0) {
      allItems.push({
        id: 'empty-primary',
        type: 'empty',
        preview: '',
        isPrimary: true,
        isEmpty: true
      });
      allItems.push(videoItem);
    } 
    // If there's exactly 1 item, add video as second item
    else if (allItems.length === 1) {
      allItems.push(videoItem);
    }
    // If there are 2+ items
    else {
      // If position 1 already has a video, replace it
      if (allItems[1]?.type === 'video') {
        allItems[1] = videoItem;
      }
      // Otherwise, insert video at position 1, shifting everything else
      else {
        allItems.splice(1, 0, videoItem);
      }
    }
  }
  // If no video, ensure an empty video slot at position 1
  else if (allItems.length >= 1 && allItems[1]?.type !== 'empty') {
    allItems.splice(1, 0, {
      id: `empty-video-${Date.now()}`,
      type: 'empty',
      preview: '',
      isPrimary: false,
      isEmpty: true
    });
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
  const handleFilesSelected = useCallback(async (files: FileList) => {
    if (!files || files.length === 0) return;
    
    setProcessingFiles(true);
    
    try {
      const result = await processFiles(
        files, 
        existingImages.length + newImages.length,
        !!existingVideoUrl || !!newVideo
      );
      
      // Update images state
      if (result.acceptedImages.length > 0) {
        const updatedImages = [...newImages, ...result.acceptedImages];
        setNewImages(updatedImages);
        onImagesChange(updatedImages);
        
        toast.success(`${result.acceptedImages.length} image(s) processed`, {
          description: 'Images have been optimized for better performance.'
        });
      }
      
      // Update video state
      if (result.videoFile) {
        setNewVideo(result.videoFile);
        setVideoThumbnail(result.videoThumbnail);
        onVideoChange(result.videoFile);
        
        // Clear any existing video URL
        if (existingVideoUrl) {
          onVideoUrlChange(null);
        }
        
        toast.success('Video processed', {
          description: 'Video preview is now available.'
        });
      } else if (result.videoRejected) {
        toast.error('Video processing failed', {
          description: 'Please check file requirements and try again.'
        });
      }
      
      if (result.rejectedImages.length > 0) {
        toast.warning(`${result.rejectedImages.length} image(s) couldn't be processed`, {
          description: 'Please try with smaller or different images.'
        });
      }
    } catch (error) {
      console.error('Error processing files:', error);
      toast.error('Error processing files', {
        description: 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setProcessingFiles(false);
      setDragActive(false);
    }
  }, [existingImages.length, existingVideoUrl, newImages, newVideo, onImagesChange, onVideoChange, onVideoUrlChange]);
  
  // Handle drop event
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  }, [handleFilesSelected]);
  
  // Handle file input change
  const handleFileSelect = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);
  
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesSelected(e.target.files);
      e.target.value = ''; // Reset file input
    }
  }, [handleFilesSelected]);
  
  // Handle video URL input
  const handleVideoUrlInput = useCallback(() => {
    // Only allow if no video exists
    if (newVideo || existingVideoUrl) {
      toast.info('Please remove the existing video first');
      return;
    }
    
    // Prompt for URL
    const url = prompt('Enter YouTube or Vimeo video URL:');
    if (!url) return;
    
    // Validate URL (basic check)
    const isValidUrl = url.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\/.+/);
    if (!isValidUrl) {
      toast.error('Invalid video URL', {
        description: 'Please enter a valid YouTube or Vimeo URL.'
      });
      return;
    }
    
    // Update state
    onVideoUrlChange(url);
    toast.success('Video URL added', {
      description: 'Your video has been linked to this listing.'
    });
  }, [newVideo, existingVideoUrl, onVideoUrlChange]);
  
  // Handle image reordering
  const handleReorder = useCallback((updatedItems: MediaItem[]) => {
    // Split items into existing and new
    const updatedExistingImages: string[] = [];
    const updatedNewImages: MediaFile[] = [];
    
    // Process each item - respecting the primary image as first position
    updatedItems.forEach(item => {
      if (item.type !== 'video' && item.type !== 'empty') {
        if (item.id.startsWith('existing-image-')) {
          // Existing image - get URL
          if (item.url) {
            updatedExistingImages.push(item.url);
          }
        } else if (item.isNew && item.file) {
          // New image - get file
          updatedNewImages.push(item.file);
        }
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
      setVideoThumbnail(null);
      onVideoChange(null);
    } else {
      // Handle new image deletion
      const updatedNewImages = newImages.filter(img => img.id !== id);
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
        onAddVideo={handleVideoUrlInput}
        onDrop={handleDrop}
        isDragging={dragActive}
        isProcessing={processingFiles}
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
          <p>• Images: JPG, PNG, WebP format (max 10 images, automatically optimized to ≤1MB)</p>
          <p>• Video: One MP4 video file (≤20MB, 720p) or YouTube/Vimeo link</p>
          <p>• First image is always the Primary Image shown in search results</p>
          <p>• You can drag and drop to reorder images (video stays in slot 2)</p>
        </div>
      </div>
    </div>
  );
};

export default MediaUpload;
