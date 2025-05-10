
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
  const [activeIndex, setActiveIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasMedia = videoURL || galleryImages.length > 0;
  const allMedia = [...(videoURL ? ['video'] : []), ...galleryImages];
  
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
    <Card className="shadow-md">
      <CardHeader className="border-b py-4">
        <CardTitle>Media Gallery</CardTitle>
      </CardHeader>
      <CardContent className="pt-4 pb-4">
        <div className="space-y-3">
          {/* Main Media Display - More compact height (40% smaller) */}
          <AspectRatio ratio={21/9} className="bg-gray-200 rounded-md overflow-hidden">
            {activeIndex === 0 && videoURL ? (
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
                    className="bg-white/80 backdrop-blur-sm hover:bg-white"
                    onClick={toggleMute}
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            ) : (
              <img 
                src={galleryImages[videoURL ? activeIndex - 1 : activeIndex]} 
                alt={`Business media ${activeIndex + 1}`} 
                className="w-full h-full object-cover"
              />
            )}
          </AspectRatio>
          
          {/* Thumbnails Row */}
          {allMedia.length > 1 && (
            <div className="overflow-auto pb-1">
              <div className="flex space-x-2">
                {allMedia.map((media, index) => (
                  <div 
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`relative cursor-pointer flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 ${
                      index === activeIndex ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    {index === 0 && videoURL ? (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <div className="w-6 h-6 bg-white/80 rounded-full flex items-center justify-center">
                          <div className="w-0 h-0 border-y-4 border-y-transparent border-l-[6px] border-l-gray-800 ml-0.5"></div>
                        </div>
                      </div>
                    ) : (
                      <img 
                        src={galleryImages[videoURL ? index - 1 : index]} 
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Navigation Controls */}
          {allMedia.length > 1 && (
            <div className="flex justify-end gap-2 mt-1">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-full"
                onClick={() => setActiveIndex(prev => (prev === 0 ? allMedia.length - 1 : prev - 1))}
              >
                <CarouselPrevious className="static transform-none h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-full"
                onClick={() => setActiveIndex(prev => (prev === allMedia.length - 1 ? 0 : prev + 1))}
              >
                <CarouselNext className="static transform-none h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
