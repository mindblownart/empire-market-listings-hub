
import React, { useEffect, useState } from 'react';
import { EnhancedCarousel } from '@/components/carousel/EnhancedCarousel';

interface MediaGalleryProps {
  galleryImages: string[];
  videoURL?: string | null;
  autoplayVideo?: boolean;
  skipPrimaryImage?: boolean;
  className?: string;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  galleryImages = [],
  videoURL,
  autoplayVideo = true,
  skipPrimaryImage = true,
  className = '',
}) => {
  const [displayImages, setDisplayImages] = useState<string[]>([]);
  
  // Process images when props change
  useEffect(() => {
    // Skip the first image when skipPrimaryImage is true and there's at least one image
    const processedImages = skipPrimaryImage && galleryImages.length > 0
      ? galleryImages.slice(1)
      : [...galleryImages];
      
    setDisplayImages(processedImages);
    
    // Debug logging
    if (videoURL) {
      console.log("MediaGallery received videoURL:", videoURL);
    }
  }, [galleryImages, skipPrimaryImage]);
  
  return (
    <EnhancedCarousel
      images={displayImages}
      videoURL={videoURL}
      autoplayVideo={autoplayVideo}
      skipPrimaryImage={false} // We've already handled the skipping here
      className={className}
    />
  );
};
