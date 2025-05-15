import React, { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { MediaItemType, MediaFile, VideoInfo } from './types';
import { extractVideoInfo } from './video-utils';
import MediaGallery from './MediaGallery';
import { 
  ACCEPTED_IMAGE_TYPES, 
  ACCEPTED_VIDEO_TYPES, 
  MAX_IMAGES,
  VIDEO_SLOT_INDEX,
  processFiles
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

// Hash cache for existing images to prevent duplicates
const imageHashCache: Map<string, string> = new Map();

const MediaUpload: React.FC<MediaUploadProps> = ({
  existingImages = [],
  existingVideoUrl = null,
  onImagesChange,
  onVideoChange,
  onVideoUrlChange,
  maxImages = MAX_IMAGES,
  onDeleteExistingImage,
  onDeleteExistingVideo,
  onImagesReorder,
}) => {
  const [newImages, setNewImages] = useState<MediaFile[]>([]);
  const [newVideo, setNewVideo] = useState<MediaFile | null>(null);
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [processingFiles, setProcessingFiles] = useState(false);
  const [existingImageHashes, setExistingImageHashes] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Precompute hashes for existing images when they change
  useEffect(() => {
    const loadExistingImageHashes = async () => {
      const hashes: string[] = [];
      
      // Create dummy hash values based on URLs for existing images
      // This is a simplification since we can't access the actual file data
      existingImages.forEach(url => {
        // Use URL as a simple hash for existing images
        // In a real implementation, you might want to store hashes when images are first uploaded
        const simpleHash = String(
          url.split('').reduce((acc, char) => {
            return ((acc << 5) - acc + char.charCodeAt(0)) | 0;
          }, 0)
        );
        hashes.push(simpleHash);
        imageHashCache.set(url, simpleHash);
      });
      
      setExistingImageHashes(hashes);
    };
    
    loadExistingImageHashes();
  }, [existingImages]);
  
  // Convert to MediaItem format with correct typing
  const items: MediaItemType[] = [];
  
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
  let videoItem: MediaItemType | null = null;
  
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
  
  // Ensure video is always in slot VIDEO_SLOT_INDEX
  if (videoItem) {
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
      // If position VIDEO_SLOT_INDEX already has a video, replace it
      if (allItems[VIDEO_SLOT_INDEX]?.type === 'video') {
        allItems[VIDEO_SLOT_INDEX] = videoItem;
      }
      // Otherwise, insert video at position VIDEO_SLOT_INDEX, shifting everything else
      else {
        allItems.splice(VIDEO_SLOT_INDEX, 0, videoItem);
      }
    }
  }
  // If no video, ensure an empty video slot at position VIDEO_SLOT_INDEX
  else if (allItems.length >= 1 && allItems[VIDEO_SLOT_INDEX]?.type !== 'empty') {
    allItems.splice(VIDEO_SLOT_INDEX, 0, {
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
        !!existingVideoUrl || !!newVideo,
        existingImageHashes
      );
      
      // Check for duplicates
      if (result.duplicateDetected) {
        toast.error("Duplicate image detected", {
          description: "This image has already been uploaded. Please choose another file."
        });
      }
      
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
  }, [existingImages.length, existingVideoUrl, newImages, newVideo, onImagesChange, onVideoChange, onVideoUrlChange, existingImageHashes]);
  
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
  
  // Handle reordering with enhanced order persistence
  const handleReorder = useCallback((updatedItems: MediaItemType[]) => {
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
      // Save the ordering to session storage for persistence across preview
      sessionStorage.setItem('imageOrder', JSON.stringify(updatedExistingImages)); 
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
    </div>
  );
};

export default MediaUpload;
