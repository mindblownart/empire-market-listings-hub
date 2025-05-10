
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react';
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
  
  // Navigation handlers
  const goToPrevious = () => {
    setActiveIndex(prev => (prev === 0 ? allMedia.length - 1 : prev - 1));
  };
  
  const goToNext = () => {
    setActiveIndex(prev => (prev === allMedia.length - 1 ? 0 : prev + 1));
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
    <Card className="shadow-md mb-6">
      <CardHeader className="border-b py-3">
        <CardTitle className="text-lg">Media Gallery</CardTitle>
      </CardHeader>
      <CardContent className="p-4 relative">
        {/* Main Media Display - More compact height */}
        <div className="relative">
          <AspectRatio ratio={16/9} className="bg-gray-200 rounded-md overflow-hidden">
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
          
          {/* Navigation Controls */}
          {allMedia.length > 1 && (
            <>
              {/* Previous Button */}
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-full absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md"
                onClick={goToPrevious}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {/* Next Button */}
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-full absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md"
                onClick={goToNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
        
        {/* Media Counter */}
        <div className="text-xs text-gray-500 text-center mt-2">
          {activeIndex + 1} of {allMedia.length}
        </div>
      </CardContent>
    </Card>
  );
};
