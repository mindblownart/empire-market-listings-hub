
import React, { useState, useEffect, useCallback } from 'react';
import { Video, ImagePlus, VideoIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { extractVideoInfo } from './video-utils';
import MediaGallery from './MediaGallery';
import { BusinessMediaUploaderProps, MediaFile } from './types';

const MAX_IMAGES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

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

  // Handle image file changes
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // Check if adding these would exceed the limit
    const totalImageCount = existingImages.length + images.length + files.length;
    if (totalImageCount > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`, {
        description: `You can only upload ${maxImages} images in total.`
      });
      return;
    }

    // Validate and process the files
    const newImages = Array.from(files).filter(file => {
      // File type validation
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast.error('Invalid file type', {
          description: 'Please upload only JPG, PNG, WebP or GIF images.'
        });
        return false;
      }

      // File size validation
      if (file.size > MAX_FILE_SIZE) {
        toast.error('File too large', {
          description: 'Maximum file size is 5MB.'
        });
        return false;
      }

      return true;
    });

    // Add ids to the new images to make them compatible with MediaFile type
    const newImagesWithIds = newImages.map(file => {
      const mediaFile = file as MediaFile;
      mediaFile.id = `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      return mediaFile;
    });

    // Add new images to existing ones
    setImages(prev => [...prev, ...newImagesWithIds]);

    // Notify parent component
    if (onImagesChange) {
      onImagesChange([...images, ...newImagesWithIds]);
    }

    // Reset input value to allow selecting the same file again
    event.target.value = '';
  };

  // Handle video file changes
  const handleVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // File type validation
    if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
      toast.error('Invalid video format', {
        description: 'Please upload only MP4, WebM or QuickTime videos.'
      });
      return;
    }

    // File size validation - videos can be larger
    if (file.size > MAX_FILE_SIZE * 10) { // 50MB
      toast.error('Video file too large', {
        description: 'Maximum video file size is 50MB.'
      });
      return;
    }

    // Add id to make it compatible with MediaFile
    const mediaFile = file as MediaFile;
    mediaFile.id = `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Set video state
    setVideo(mediaFile);

    // Clear video URL if we're setting a file
    setVideoUrl('');

    // Notify parent component
    if (onVideoChange) {
      onVideoChange(mediaFile);
    }
    if (onVideoUrlChange) {
      onVideoUrlChange('');
    }

    // Reset input value to allow selecting the same file again
    event.target.value = '';
  };

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

  // Handle removing a image by index
  const handleDeleteNewImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      newImages.splice(index, 1);
      if (onImagesChange) {
        onImagesChange(newImages);
      }
      return newImages;
    });
  };

  // Handle removing an existing image by index
  const handleDeleteExistingImage = (index: number) => {
    // This is just for UI - the actual deletion would happen on save
    setExistingImages(prev => {
      const newExistingImages = [...prev];
      newExistingImages.splice(index, 1);
      return newExistingImages;
    });
    
    // If this deletes the primary image, we might need to update state
    if (index === 0 && existingImages.length > 1 && onSetPrimaryImage) {
      // Make the next image primary
      onSetPrimaryImage(0);
    }
  };

  // Handle removing video
  const handleDeleteNewVideo = () => {
    setVideo(null);
    if (onVideoChange) {
      onVideoChange(null);
    }
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

  // Handle reordering of new images
  const handleReorderNewImages = (reorderedImages: File[]) => {
    // Convert File[] to MediaFile[] to fix the type error
    const typedImages = reorderedImages.map(file => {
      const mediaFile = file as MediaFile;
      if (!mediaFile.id) {
        mediaFile.id = `reordered-image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
      return mediaFile;
    });
    
    setImages(typedImages);
    
    if (onImagesChange) {
      onImagesChange(typedImages);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* Unified Media Gallery */}
        <MediaGallery
          images={existingImages}
          newImages={images}
          videoUrl={videoUrl}
          newVideo={video}
          onSetPrimaryImage={onSetPrimaryImage}
          onReorderImages={handleReorderExistingImages}
          onReorderNewImages={handleReorderNewImages}
          onDeleteImage={handleDeleteExistingImage}
          onDeleteNewImage={handleDeleteNewImage}
          onDeleteVideo={handleDeleteVideoUrl}
          onDeleteNewVideo={handleDeleteNewVideo}
        />

        {/* Image Upload Controls */}
        <div className="flex flex-wrap gap-4 mt-2">
          {!disableImageUpload && (
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('image-upload')?.click()}
                className="flex items-center gap-2"
                disabled={existingImages.length + images.length >= maxImages}
              >
                <ImagePlus className="h-4 w-4" />
                Select Images
              </Button>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageChange}
                disabled={existingImages.length + images.length >= maxImages}
              />
            </div>
          )}

          <div>
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('video-upload')?.click()}
              className="flex items-center gap-2"
              disabled={!!video || !!videoUrl}
            >
              <VideoIcon className="h-4 w-4" />
              Select Video
            </Button>
            <Input
              id="video-upload"
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleVideoChange}
              disabled={!!video || !!videoUrl}
            />
          </div>
        </div>

        {/* Upload Tips */}
        <div className="text-sm text-gray-500 space-y-1">
          <p>• Images: Up to {maxImages} images, 1200px+ width recommended for best quality (5MB max)</p>
          <p>• Video: Either upload a video file (MP4, WebM, QuickTime) or paste a YouTube/Vimeo URL</p>
        </div>
      </div>

      {/* Video URL Input - Only show if no video file is selected */}
      {!video && (
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
        </div>
      )}
    </div>
  );
};

export default BusinessMediaUploader;
