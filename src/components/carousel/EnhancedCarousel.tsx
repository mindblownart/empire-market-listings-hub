import React, { useState, useCallback } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ImageOff, VideoOff } from 'lucide-react';
import { VideoPlayer } from './VideoPlayer';

interface EnhancedCarouselProps {
  images: string[];
  videoURL?: string | null;
  autoplayVideo?: boolean;
  skipPrimaryImage?: boolean;
  className?: string;
  inPreview?: boolean;
}

export const EnhancedCarousel: React.FC<EnhancedCarouselProps> = ({
  images = [],
  videoURL = null,
  autoplayVideo = false,
  skipPrimaryImage = false,
  className = '',
  inPreview = false,
}) => {
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});
  const [videoFailed, setVideoFailed] = useState<boolean>(false);
  
  // Filter images if needed
  const displayImages = skipPrimaryImage && images.length > 0 ? images.slice(1) : images;

  // Handle image load errors
  const handleImageError = useCallback((index: number) => {
    setFailedImages(prev => ({
      ...prev,
      [index]: true
    }));
  }, []);
  
  // Handle video error
  const handleVideoError = useCallback(() => {
    setVideoFailed(true);
    console.error("Video failed to load:", videoURL);
  }, [videoURL]);

  // If no content, show placeholder
  if (displayImages.length === 0 && (!videoURL || videoFailed)) {
    return (
      <div className={`w-full bg-gray-100 rounded-lg overflow-hidden ${className}`}>
        <AspectRatio ratio={16 / 9} className="bg-gray-100">
          <div className="flex flex-col items-center justify-center h-full">
            <ImageOff className="h-12 w-12 text-gray-400 mb-2" />
            <p className="text-gray-500">No media available</p>
          </div>
        </AspectRatio>
      </div>
    );
  }
  
  // Determine if we need to render a carousel or just a single item
  const totalItems = displayImages.length + (videoURL && !videoFailed ? 1 : 0);
  const showCarousel = totalItems > 1;
  
  // If only one item, render it directly
  if (totalItems === 1) {
    if (displayImages.length === 1) {
      // Show single image
      return (
        <div className={`w-full bg-gray-100 rounded-lg overflow-hidden ${className}`}>
          <AspectRatio ratio={16 / 9}>
            {!failedImages[0] ? (
              <img 
                src={displayImages[0]} 
                alt="Business" 
                className="w-full h-full object-cover"
                onError={() => handleImageError(0)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full bg-gray-100">
                <ImageOff className="h-12 w-12 text-gray-400 mb-2" />
                <p className="text-gray-500">Image failed to load</p>
              </div>
            )}
          </AspectRatio>
        </div>
      );
    } else if (videoURL) {
      // Show video only
      return (
        <div className={`w-full bg-gray-100 rounded-lg overflow-hidden ${className}`}>
          <AspectRatio ratio={16 / 9}>
            <VideoPlayer 
              url={videoURL}
              autoplay={autoplayVideo}
              onError={handleVideoError}
              showControls={true}
              inCarouselPreview={inPreview}
            />
          </AspectRatio>
        </div>
      );
    }
  }
  
  // Otherwise show carousel
  return (
    <Carousel className={`w-full ${className}`}>
      <CarouselContent>
        {/* Render images */}
        {displayImages.map((image, index) => (
          <CarouselItem key={`image-${index}`}>
            <AspectRatio ratio={16 / 9}>
              {!failedImages[index] ? (
                <img 
                  src={image} 
                  alt={`Business ${index + 1}`} 
                  className="w-full h-full object-cover rounded-lg"
                  onError={() => handleImageError(index)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full bg-gray-100 rounded-lg">
                  <ImageOff className="h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-gray-500">Image failed to load</p>
                </div>
              )}
            </AspectRatio>
          </CarouselItem>
        ))}
        
        {/* Render video if present */}
        {videoURL && !videoFailed && (
          <CarouselItem key="video">
            <AspectRatio ratio={16 / 9}>
              <VideoPlayer 
                url={videoURL} 
                autoplay={autoplayVideo}
                onError={handleVideoError}
                showControls={true}
                inCarouselPreview={inPreview}
              />
            </AspectRatio>
          </CarouselItem>
        )}
      </CarouselContent>
      
      {showCarousel && (
        <>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </>
      )}
    </Carousel>
  );
};
