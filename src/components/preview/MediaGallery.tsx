
import React from 'react';
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
  // Log incoming props for debugging
  console.log("MediaGallery received props:", { 
    galleryImagesCount: galleryImages.length, 
    videoURL, 
    autoplayVideo, 
    skipPrimaryImage 
  });
  
  // Skip the first image when skipPrimaryImage is true and there's at least one image
  const displayImages = skipPrimaryImage && galleryImages.length > 0
    ? galleryImages.slice(1)
    : [...galleryImages];
  
  console.log("Displaying images:", displayImages);
  
  return (
    <EnhancedCarousel
      images={displayImages}
      videoURL={videoURL}
      autoplayVideo={autoplayVideo}
      skipPrimaryImage={false} // We've already handled the skipping here
    />
  );
};
