
import React, { useState, useCallback, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Upload, X, Info } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { MediaGallery } from './MediaGallery';
import { MediaItemType, MediaFile } from './types';
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

export const MediaUpload: React.FC<MediaUploadProps> = ({
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
  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);
  
  // Handle drop event
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const { files } = e.dataTransfer;
    if (files && files.length > 0) {
      processFiles(files);
    }
  }, [existingImagesCount, newImagesCount, hasVideo]);
  
  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const { files } = e.target;
    
    if (files && files.length > 0) {
      processFiles(files);
    }
    
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };
  
  // Process uploaded files
  const processFiles = (files: FileList) => {
    const imageFiles: MediaFile[] = [];
    let videoFile: MediaFile | null = null;
    
    // Count available slots
    const availableSlots = MAX_IMAGES - existingImagesCount - newImagesCount;
    let videoSlotAvailable = !hasVideo;
    
    // Process all files
    Array.from(files).forEach(file => {
      // Process images
      if (ACCEPTED_IMAGE_TYPES.includes(file.type)) {
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
            videoSlotAvailable = false;
          } else {
            toast.error(`Video too large: ${file.name}`, {
              description: 'Maximum video size is 50MB'
            });
          }
        } else {
          toast.error('Only one video allowed', {
            description: 'Please remove the existing video first'
          });
        }
      } else {
        toast.error(`Unsupported file type: ${file.name}`, {
          description: 'Please upload images (JPG, PNG, WebP, GIF) or videos (MP4, WebM, QuickTime)'
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
  };
  
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
  
  return (
    <div className="space-y-4">
      <DndProvider backend={HTML5Backend}>
        {/* Media Gallery for existing and new files */}
        <ScrollArea className="w-full">
          <MediaGallery 
            images={existingImages}
            newImages={newImages}
            videoUrl={existingVideoUrl}
            newVideo={newVideo}
            onSetPrimaryImage={onSetPrimaryImage}
            onReorderImages={handleReorderImages}
            onReorderNewImages={handleReorderNewImages}
            onDeleteImage={onDeleteExistingImage}
            onDeleteNewImage={handleDeleteNewImage}
            onDeleteVideo={onDeleteExistingVideo}
            onDeleteNewVideo={handleDeleteNewVideo}
          />
        </ScrollArea>
        
        {/* Upload Area */}
        <div 
          className={`border-2 ${dragActive ? 'border-primary bg-primary/5' : 'border-dashed border-gray-300'} 
            rounded-lg p-6 transition-colors duration-200 text-center`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="p-3 bg-primary/10 rounded-full">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            
            <div className="space-y-1">
              <h3 className="font-medium">Drag and drop your files</h3>
              <p className="text-sm text-gray-500">
                {availableImageSlots > 0 
                  ? `You can add up to ${availableImageSlots} more images${!hasVideo ? ' and 1 video' : ''}`
                  : hasVideo ? 'Maximum images limit reached' : 'Maximum images limit reached, you can still add 1 video'}
              </p>
              
              <div className="flex justify-center">
                <label>
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    disabled={(availableImageSlots <= 0) && hasVideo}
                    type="button"
                  >
                    Select files
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileInputChange}
                    accept={[...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES].join(',')}
                    disabled={(availableImageSlots <= 0) && hasVideo}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
        
        {/* Upload Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
          <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-700 space-y-1">
            <p>• Images: Up to 10 images, 1200px+ width recommended for best quality (5MB max)</p>
            <p>• Video: One video file (MP4, WebM, QuickTime, 50MB max) or YouTube/Vimeo URL</p>
            <p>• Primary image will always appear first. Video (if present) will stay in second position.</p>
          </div>
        </div>
        
        {/* Video URL Input field remains - can be kept in BusinessMediaUploader */}
      </DndProvider>
    </div>
  );
};

export default MediaUpload;
