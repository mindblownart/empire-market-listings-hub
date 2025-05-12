
import React, { useEffect } from 'react';
import { EnhancedCarousel } from '@/components/carousel/EnhancedCarousel';

interface MediaGalleryProps {
  galleryImages: string[];
  videoURL?: string | null;
  autoplayVideo?: boolean;
  skipPrimaryImage?: boolean;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  galleryImages = [],
  videoURL,
  autoplayVideo = true,
  skipPrimaryImage = true,
}) => {
  // Enhanced logging for debugging
  useEffect(() => {
    console.log("MediaGallery mounted with props:", {
      galleryImagesCount: galleryImages.length,
      galleryImages: galleryImages,
      videoURL: videoURL,
      autoplayVideo,
      skipPrimaryImage
    });
  }, [galleryImages, videoURL, autoplayVideo, skipPrimaryImage]);
  
  // Skip the first image when skipPrimaryImage is true and there's at least one image
  const displayImages = skipPrimaryImage && galleryImages.length > 0
    ? galleryImages.slice(1)
    : [...galleryImages];
  
  // Validate video URL to prevent errors
  const validVideoURL = typeof videoURL === 'string' && videoURL.trim() !== '' ? videoURL : null;
  
  // Log the exact images and video being displayed in the carousel
  useEffect(() => {
    console.log("MediaGallery displaying images:", displayImages);
    console.log("MediaGallery displaying video:", validVideoURL);
  }, [displayImages, validVideoURL]);
  
  return (
    <EnhancedCarousel
      images={displayImages}
      videoURL={validVideoURL}
      autoplayVideo={autoplayVideo}
      skipPrimaryImage={false} // We've already handled the skipping here
    />
  );
};
