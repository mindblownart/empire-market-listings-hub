
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MediaGalleryProps {
  galleryImages: string[];
  videoURL?: string | null;
  autoplayVideo?: boolean;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  galleryImages,
  videoURL,
  autoplayVideo = false,
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
      
      // Some browsers require user interaction to autoplay, 
      // so we attempt to play and handle any errors silently
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
    <Card className="shadow-md">
      <CardHeader className="border-b">
        <CardTitle>Media Gallery</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <Carousel className="w-full">
          <CarouselContent>
            {/* Video Item (First if available) */}
            {videoURL && (
              <CarouselItem key="video" className="basis-full">
                <div className="relative">
                  <AspectRatio ratio={16/9} className="bg-gray-200 rounded-md overflow-hidden">
                    <video
                      ref={videoRef}
                      src={videoURL}
                      controls={false}
                      loop
                      muted={isMuted}
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  </AspectRatio>
                  
                  {/* Video Controls */}
                  <div className="absolute bottom-4 right-4">
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="bg-white/80 backdrop-blur-sm hover:bg-white"
                      onClick={toggleMute}
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CarouselItem>
            )}
            
            {/* Image Items */}
            {galleryImages.map((url, index) => (
              <CarouselItem key={`image-${index}`} className="basis-full">
                <AspectRatio ratio={16/9} className="bg-gray-200 rounded-md overflow-hidden">
                  <img 
                    src={url} 
                    alt={`Business image ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </AspectRatio>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {/* Only show navigation controls if there's more than one item */}
          {(videoURL ? galleryImages.length > 0 : galleryImages.length > 1) && (
            <div className="flex justify-end gap-2 mt-4">
              <CarouselPrevious className="static transform-none" />
              <CarouselNext className="static transform-none" />
            </div>
          )}
        </Carousel>
      </CardContent>
    </Card>
  );
};
