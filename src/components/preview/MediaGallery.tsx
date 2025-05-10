
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
  const hasMedia = videoURL || galleryImages.length > 0;

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

  if (!hasMedia) return null;

  return (
    <div className="w-full rounded-lg overflow-hidden shadow-md">
      <Carousel className="w-full">
        <CarouselContent>
          {/* Video (if available) as the first item */}
          {videoURL && (
            <CarouselItem>
              <AspectRatio ratio={16 / 9} className="h-[300px] bg-gray-100 overflow-hidden">
                <div className="relative w-full h-full">
                  <video 
                    ref={videoRef} 
                    src={videoURL} 
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
          
          {/* Images */}
          {galleryImages.map((imageUrl, index) => (
            <CarouselItem key={index}>
              <AspectRatio ratio={16 / 9} className="h-[300px] bg-gray-100 overflow-hidden">
                <img 
                  src={imageUrl} 
                  alt={`Business media ${index + 1}`} 
                  className="w-full h-full object-cover" 
                />
              </AspectRatio>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Navigation Controls - Side Arrows */}
        <CarouselPrevious className="left-2 bg-white/70 hover:bg-white" />
        <CarouselNext className="right-2 bg-white/70 hover:bg-white" />
      </Carousel>
    </div>
  );
};
