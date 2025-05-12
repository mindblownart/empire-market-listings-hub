
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
  autoplayVideo = false,
  skipPrimaryImage = false,
}) => {
  return (
    <EnhancedCarousel
      images={galleryImages}
      videoURL={videoURL}
      autoplayVideo={autoplayVideo}
      skipPrimaryImage={skipPrimaryImage}
    />
  );
};
