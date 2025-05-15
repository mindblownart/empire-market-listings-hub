
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { extractVideoInfo } from './video-utils';
import { BusinessMediaUploaderProps, MediaFile } from './types';
import MediaUpload from './MediaUpload';
import DragContext from './DragContext';

const BusinessMediaUploader: React.FC<BusinessMediaUploaderProps> = ({
  initialImages = [],
  initialVideo = null,
  initialVideoUrl = null,
  galleryImages = [],
  disableImageUpload = false,
  maxImages = 10,
  onImagesChange,
  onVideoChange,
  onVideoUrlChange,
  onSetPrimaryImage,
  onImagesReorder
}) => {
  // State for all media
  const [images, setImages] = useState<MediaFile[]>([]);
  const [video, setVideo] = useState<MediaFile | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>(initialVideoUrl || '');
  const [existingImages, setExistingImages] = useState<string[]>(galleryImages || []);
  
  // Initialize images from props
  useEffect(() => {
    if (Array.isArray(initialImages) && initialImages.length > 0) {
      // Filter out anything that's not a File and add IDs
      const fileImages = initialImages
        .filter(img => img instanceof File)
        .map(file => {
          const mediaFile = file as MediaFile;
          // Ensure unique IDs for all media files
          mediaFile.id = mediaFile.id || `img-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
          return mediaFile;
        });
      setImages(fileImages);
    }

    // Initialize existing images from galleryImages
    if (Array.isArray(galleryImages) && galleryImages.length > 0) {
      setExistingImages(galleryImages);
    }
  }, [initialImages, galleryImages]);

  // Initialize video from props
  useEffect(() => {
    if (initialVideo) {
      const mediaFile = initialVideo as MediaFile;
      mediaFile.id = mediaFile.id || `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setVideo(mediaFile);
    }
    
    if (initialVideoUrl) {
      setVideoUrl(initialVideoUrl);
    }
  }, [initialVideo, initialVideoUrl]);

  // Handle video URL changes
  const handleVideoUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value;
    setVideoUrl(url);
    
    // Validate YouTube/Vimeo URLs
    if (url && url.trim() !== '') {
      const videoInfo = extractVideoInfo(url);
      if (!videoInfo.platform) {
        toast("Please enter a valid YouTube or Vimeo URL.");
      } else {
        // Clear any file video if URL is valid
        setVideo(null);
        if (onVideoChange) {
          onVideoChange(null);
        }
      }
    }
    
    // Notify parent
    if (onVideoUrlChange) {
      onVideoUrlChange(url);
    }
  };

  // Handle removing video URL
  const handleDeleteVideoUrl = () => {
    setVideoUrl('');
    if (onVideoUrlChange) {
      onVideoUrlChange('');
    }
  };

  // Handle deleting existing image
  const handleDeleteExistingImage = (index: number) => {
    setExistingImages(prev => {
      const newImages = [...prev];
      newImages.splice(index, 1);
      return newImages;
    });
  };

  // Handle reordering existing images with proper ordering preservation
  const handleReorderExistingImages = (reorderedImages: string[]) => {
    setExistingImages(reorderedImages);
    
    // Store the reordering in session storage for persistence
    sessionStorage.setItem('imageOrder', JSON.stringify(reorderedImages));
    
    // First image is always primary
    if (onSetPrimaryImage && reorderedImages.length > 0) {
      onSetPrimaryImage(0);
    }
    
    // Provide reordered images to parent component
    if (onImagesReorder) {
      onImagesReorder(reorderedImages);
    }
  };

  return (
    <div className="space-y-6">
      <DragContext>
        <MediaUpload
          existingImages={existingImages}
          existingVideoUrl={videoUrl}
          onImagesChange={(newImages) => {
            setImages(newImages);
            if (onImagesChange) onImagesChange(newImages);
          }}
          onVideoChange={(newVideo) => {
            setVideo(newVideo);
            if (onVideoChange) onVideoChange(newVideo);
            
            // Clear video URL if we're setting a file
            if (newVideo) {
              setVideoUrl('');
              if (onVideoUrlChange) onVideoUrlChange('');
            }
          }}
          onVideoUrlChange={(url) => {
            if (url === null) {
              setVideoUrl('');
              if (onVideoUrlChange) onVideoUrlChange('');
            }
          }}
          maxImages={maxImages}
          onDeleteExistingImage={handleDeleteExistingImage}
          onDeleteExistingVideo={handleDeleteVideoUrl}
          onImagesReorder={handleReorderExistingImages}
        />
      </DragContext>

      {/* Video URL Input */}
      <div>
        <label htmlFor="video-url" className="block text-sm font-medium mb-1">
          Video URL (YouTube or Vimeo)
        </label>
        <div className="relative">
          <Input
            id="video-url"
            type="text"
            placeholder="e.g., https://www.youtube.com/watch?v=abcd1234"
            value={videoUrl}
            onChange={handleVideoUrlChange}
            className="pr-10"
            disabled={!!video}
          />
          {videoUrl && (
            <button
              type="button"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={handleDeleteVideoUrl}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {video && (
          <p className="mt-1 text-sm text-amber-600">
            You have uploaded a video file. Remove it to use a YouTube or Vimeo URL instead.
          </p>
        )}
      </div>
    </div>
  );
};

export default BusinessMediaUploader;
