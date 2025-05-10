import React, { useCallback, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Info } from 'lucide-react';
import { toast } from 'sonner';
import MediaGallery from './MediaGallery';
import { MediaFile } from './types';

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
  // State for uploaded files
  const [newImages, setNewImages] = useState<MediaFile[]>([]);
  const [newVideo, setNewVideo] = useState<MediaFile | null>(null);
  const [dragActive, setDragActive] = useState(false);
  
  // Calculate available slots
  const hasVideo = !!existingVideoUrl || !!newVideo;
  const existingImagesCount = existingImages.length;
  const newImagesCount = newImages.length;
  const totalImagesCount = existingImagesCount + newImagesCount;
  const availableImageSlots = MAX_IMAGES - totalImagesCount;
  
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
  
  // Process files when dropped or selected with improved deduplication
  const processFiles = useCallback((files: FileList) => {
    const imageFiles: MediaFile[] = [];
    let videoFile: MediaFile | null = null;
    
    // Count available slots
    const availableSlots = MAX_IMAGES - existingImagesCount - newImagesCount;
    let videoSlotAvailable = !hasVideo;
    
    // Process all files with duplicate prevention
    Array.from(files).forEach(file => {
      // Process images
      if (ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        // Check for duplicates by comparing file names and sizes
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
        } else if (existingImagesCount + newImagesCount + imageFiles.length >= MAX_IMAGES) {
          toast.warning('Maximum images reached', {
            description: `You can only upload a maximum of ${MAX_IMAGES} images.`
          });
        }
      } 
      // Process video
      else if (ACCEPTED_VIDEO_TYPES.includes(file.type)) {
        // Check if we already have a video
        if (videoSlotAvailable) {
          // Check for duplicate video by name and size
          if (newVideo && newVideo.name === file.name && newVideo.size === file.size) {
            toast.warning(`Duplicate video: ${file.name}`, {
              description: 'This video appears to already be uploaded'
            });
            return;
          }
          
          // Check file size
          if (file.size <= MAX_VIDEO_SIZE) {
            const mediaFile = file as MediaFile;
            mediaFile.id = `video-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            videoFile = mediaFile;
            videoSlotAvailable = false;
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
    
    // Check if we have any valid files to add
    if (imageFiles.length > 0) {
      // Check if adding these would exceed the limit
      if (existingImagesCount + newImagesCount + imageFiles.length > MAX_IMAGES) {
        toast.warning(`Only added ${availableSlots} images`, {
          description: `Maximum ${MAX_IMAGES} images allowed in total`
        });
      }
      
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
    
    // Reset drag state
    setDragActive(false);
  }, [existingImagesCount, newImagesCount, hasVideo, existingVideoUrl, newImages, onImagesChange, onVideoChange, onVideoUrlChange]);
  
  // Handle file drop on gallery
  const handleFilesDrop = useCallback((files: FileList) => {
    setDragActive(false);
    processFiles(files);
  }, [processFiles]);
  
  // Handle files selection from button
  const handleFilesSelect = useCallback((files: FileList) => {
    processFiles(files);
  }, [processFiles]);
  
  // Handle deleting a new image
  const handleDeleteNewImage = (index: number) => {
    setNewImages(prev => {
      const newImagesList = [...prev];
      newImagesList.splice(index, 1);
      onImagesChange(newImagesList);
      return newImagesList;
    });
  };
  
  // Handle deleting a new video
  const handleDeleteNewVideo = () => {
    setNewVideo(null);
    onVideoChange(null);
  };
  
  // Handle reordering of existing images
  const handleReorderImages = (reorderedImages: string[]) => {
    if (onImagesReorder) {
      onImagesReorder(reorderedImages);
    }
  };
  
  // Handle reordering of new images
  const handleReorderNewImages = (reorderedImages: File[]) => {
    const typedImages = reorderedImages.map(file => {
      const mediaFile = file as MediaFile;
      if (!mediaFile.id) {
        mediaFile.id = `reordered-image-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      }
      return mediaFile;
    });
    
    setNewImages(typedImages);
    onImagesChange(typedImages);
  };

  // Handle setting primary image
  const handleSetPrimaryImage = (index: number) => {
    if (onSetPrimaryImage) {
      onSetPrimaryImage(index);
    }
  };
  
  return (
    <DndProvider backend={HTML5Backend}>
      <div 
        className="space-y-4"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFilesDrop(e.dataTransfer.files);
          }
          setDragActive(false);
        }}
      >
        <MediaGallery 
          images={existingImages}
          newImages={newImages}
          videoUrl={existingVideoUrl}
          newVideo={newVideo}
          onSetPrimaryImage={handleSetPrimaryImage}
          onReorderImages={handleReorderImages}
          onReorderNewImages={handleReorderNewImages}
          onDeleteImage={onDeleteExistingImage}
          onDeleteNewImage={handleDeleteNewImage}
          onDeleteVideo={onDeleteExistingVideo}
          onDeleteNewVideo={handleDeleteNewVideo}
          onFilesDrop={handleFilesDrop}
          onFilesSelect={handleFilesSelect}
          isDragging={dragActive}
        />
        
        {/* Upload Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
          <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-700 space-y-1">
            <p>• Images: Up to 10 images, 1200px+ width recommended for best quality (5MB max)</p>
            <p>• Video: One video file (MP4, 50MB max) or YouTube/Vimeo URL</p>
            <p>• First image is always the Primary Image. Video is fixed in the second position.</p>
            <p>• You can drag and drop to reorder images (except video) or drop files directly onto the gallery.</p>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default MediaUpload;
