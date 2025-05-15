
import React, { useEffect, useState } from 'react';
import { EnhancedCarousel } from '../carousel';

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
  autoplayVideo = false,
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
      
    // Filter out any empty or invalid URLs
    const validImages = processedImages.filter(img => img && img.trim() !== '');
      
    setDisplayImages(validImages);
    
    // Debug logging
    console.log("MediaGallery received images:", validImages);
    if (videoURL) {
      console.log("MediaGallery received videoURL:", videoURL);
    }
  }, [galleryImages, skipPrimaryImage]);
  
  return (
    <EnhancedCarousel
      images={displayImages}
      videoURL={videoURL && videoURL.trim() !== '' ? videoURL : null}
      autoplayVideo={autoplayVideo}
      skipPrimaryImage={false} // We've already handled the skipping here
      className={className}
      inPreview={true}
    />
  );
};
