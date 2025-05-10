
import React, { useState, useRef, useEffect } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';

interface MediaGalleryProps {
  galleryImages: string[];
  videoURL?: string | null;
  autoplayVideo?: boolean;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  galleryImages,
  videoURL,
  autoplayVideo = false
}) => {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Check if any media is available
  const hasVideo = !!videoURL;
  const hasImages = Array.isArray(galleryImages) && galleryImages.length > 0;
  const hasMedia = hasVideo || hasImages;

  // Handle mute toggle
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  // Set up autoplay when component mounts
  useEffect(() => {
    if (videoRef.current && autoplayVideo) {
      videoRef.current.muted = isMuted;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log('Autoplay prevented. Requires user interaction:', error);
        });
      }
    }
  }, [autoplayVideo, isMuted]);

  if (!hasMedia) {
    // Fallback placeholder when no media is available
    return (
      <div className="w-full rounded-lg overflow-hidden shadow-md">
        <AspectRatio ratio={16 / 9} className="bg-gradient-to-r from-gray-200 to-gray-300">
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <img 
              src="https://images.unsplash.com/photo-1472396961693-142e6e269027" 
              alt="Placeholder" 
              className="w-full h-full object-cover opacity-60"
            />
          </div>
        </AspectRatio>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg overflow-hidden shadow-md">
      <Carousel className="w-full">
        <CarouselContent>
          {/* Video (if available) as the first item - PRIORITY #1 */}
          {hasVideo && (
            <CarouselItem>
              <AspectRatio ratio={16 / 9} className="bg-gray-100 overflow-hidden">
                <div className="relative w-full h-full">
                  <video 
                    ref={videoRef} 
                    src={videoURL!} 
                    controls={false} 
                    loop 
                    muted={isMuted} 
                    playsInline 
                    className="w-full h-full object-cover" 
                  />
                  
                  {/* Video Controls */}
                  <div className="absolute bottom-4 right-4">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="bg-white/80 backdrop-blur-sm hover:bg-white rounded-full" 
                      onClick={toggleMute}
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </AspectRatio>
            </CarouselItem>
          )}
          
          {/* Images - Display after video or as primary if no video */}
          {hasImages && galleryImages.map((imageUrl, index) => (
            <CarouselItem key={index}>
              <AspectRatio ratio={16 / 9} className="bg-gray-100 overflow-hidden">
                <img 
                  src={imageUrl} 
                  alt={`Business media ${index + 1}`} 
                  className="w-full h-full object-cover" 
                  loading={index === 0 && !hasVideo ? "eager" : "lazy"}
                />
              </AspectRatio>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Navigation Controls - Only show if we have more than one media item */}
        {(hasVideo && hasImages) || galleryImages.length > 1 ? (
          <>
            <CarouselPrevious className="left-2 bg-white/70 hover:bg-white" />
            <CarouselNext className="right-2 bg-white/70 hover:bg-white" />
          </>
        ) : null}
      </Carousel>
    </div>
  );
};
