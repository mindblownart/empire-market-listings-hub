
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { extractVideoInfo } from './video-utils';
import { BusinessMediaUploaderProps, MediaFile } from './types';
import MediaUpload from './MediaUpload';

const MAX_IMAGES = 10;

const BusinessMediaUploader: React.FC<BusinessMediaUploaderProps> = ({
  onImagesChange,
  onVideoChange,
  onVideoUrlChange,
  initialImages = [],
  initialVideo = null,
  initialVideoUrl = null,
  disableImageUpload = false,
  galleryImages = [],
  onSetPrimaryImage,
  maxImages = MAX_IMAGES
}) => {
  // Convert initialImages to proper format if they're strings
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
          mediaFile.id = mediaFile.id || `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
    
    // Check if it's a valid YouTube or Vimeo URL
    if (url && url.trim() !== '') {
      const videoInfo = extractVideoInfo(url);
      if (!videoInfo.platform) {
        toast.warning('Invalid video URL', {
          description: 'Please enter a valid YouTube or Vimeo URL.'
        });
      } else {
        // Valid URL, clear any file video
        setVideo(null);
        if (onVideoChange) {
          onVideoChange(null);
        }
      }
    }
    
    // Always notify parent regardless
    if (onVideoUrlChange) {
      onVideoUrlChange(url);
    }
  };

  // Handle removing an existing image by index
  const handleDeleteExistingImage = (index: number) => {
    // This is just for UI - the actual deletion would happen on save
    setExistingImages(prev => {
      const newExistingImages = [...prev];
      newExistingImages.splice(index, 1);
      return newExistingImages;
    });
  };

  // Handle removing video URL
  const handleDeleteVideoUrl = () => {
    setVideoUrl('');
    if (onVideoUrlChange) {
      onVideoUrlChange('');
    }
  };

  // Handle reordering of existing images
  const handleReorderExistingImages = (reorderedImages: string[]) => {
    setExistingImages(reorderedImages);
    // The parent component will need to update the order on save
  };

  return (
    <div className="space-y-6">
      {/* Unified Media Upload Component */}
      <MediaUpload
        existingImages={existingImages}
        existingVideoUrl={videoUrl}
        primaryImageIndex={0}
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
        onSetPrimaryImage={onSetPrimaryImage}
        onDeleteExistingImage={handleDeleteExistingImage}
        onDeleteExistingVideo={handleDeleteVideoUrl}
        onImagesReorder={handleReorderExistingImages}
      />

      {/* Video URL Input */}
      <div className="mt-4">
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
