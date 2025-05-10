
import React, { useState, useRef, useEffect } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import { getVideoEmbedUrl } from '@/components/media-uploader/video-utils';

interface MediaGalleryProps {
  galleryImages: string[];
  videoURL?: string | null;
  autoplayVideo?: boolean;
  primaryImageIndex?: number;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  galleryImages = [],
  videoURL,
  autoplayVideo = false,
  primaryImageIndex = 0
}) => {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Check if any media is available
  const hasVideo = !!videoURL;
  const hasImages = Array.isArray(galleryImages) && galleryImages.length > 0;
  const hasMedia = hasVideo || hasImages;
  
  // Organize images by priority
  const organizedImages = React.useMemo(() => {
    if (!hasImages) return [];
    
    // If primaryImageIndex is valid, move that image to first position
    if (typeof primaryImageIndex === 'number' && 
        primaryImageIndex >= 0 && 
        primaryImageIndex < galleryImages.length) {
      const images = [...galleryImages];
      const primaryImage = images.splice(primaryImageIndex, 1)[0];
      return [primaryImage, ...images];
    }
    
    return galleryImages;
  }, [galleryImages, primaryImageIndex, hasImages]);

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
          {/* Primary image is always first */}
          {hasImages && organizedImages.length > 0 && (
            <CarouselItem>
              <AspectRatio ratio={16 / 9} className="bg-gray-100 overflow-hidden">
                <img 
                  src={organizedImages[0]} 
                  alt="Primary business image" 
                  className="w-full h-full object-cover" 
                  loading="eager"
                />
              </AspectRatio>
            </CarouselItem>
          )}
          
          {/* Video (if available) as the second item */}
          {hasVideo && (
            <CarouselItem>
              <AspectRatio ratio={16 / 9} className="bg-gray-100 overflow-hidden">
                <div className="relative w-full h-full">
                  {videoURL && videoURL.includes('youtube.com') || videoURL?.includes('youtu.be') ? (
                    // YouTube embed
                    <iframe 
                      src={getVideoEmbedUrl('youtube', videoURL.split('v=')[1] || videoURL.split('/').pop() || '')} 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  ) : videoURL && videoURL.includes('vimeo.com') ? (
                    // Vimeo embed
                    <iframe 
                      src={`https://player.vimeo.com/video/${videoURL.split('/').pop()}`}
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  ) : (
                    // Direct video file
                    <>
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
                    </>
                  )}
                </div>
              </AspectRatio>
            </CarouselItem>
          )}
          
          {/* Remaining images - Skip first image as it's already shown */}
          {hasImages && organizedImages.length > 1 && organizedImages.slice(1).map((imageUrl, index) => (
            <CarouselItem key={index + 1}>
              <AspectRatio ratio={16 / 9} className="bg-gray-100 overflow-hidden">
                <img 
                  src={imageUrl} 
                  alt={`Business media ${index + 2}`} 
                  className="w-full h-full object-cover" 
                  loading="lazy"
                />
              </AspectRatio>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Navigation Controls - Only show if we have more than one media item */}
        {((hasVideo && hasImages) || organizedImages.length > 1) && (
          <>
            <CarouselPrevious className="left-2 bg-white/70 hover:bg-white" />
            <CarouselNext className="right-2 bg-white/70 hover:bg-white" />
          </>
        )}
      </Carousel>
    </div>
  );
};
