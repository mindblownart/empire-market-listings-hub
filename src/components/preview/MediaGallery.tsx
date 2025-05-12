
import React from 'react';
import { EnhancedCarousel } from '@/components/carousel';

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
  skipPrimaryImage = false,
}) => {
  // Ensure we have valid arrays and values before rendering
  const validImages = Array.isArray(galleryImages) ? galleryImages.filter(Boolean) : [];
  
  return (
    <EnhancedCarousel
      images={validImages}
      videoURL={videoURL}
      autoplayVideo={autoplayVideo}
      skipPrimaryImage={skipPrimaryImage}
    />
  );
};
