
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
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  galleryImages = [],
  videoURL,
  autoplayVideo = false,
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
  
  // Organize media items to ensure primary is first and video is second
  const mediaItems = React.useMemo(() => {
    const items = [];
    
    // Primary image (first image) is always first
    if (hasImages && galleryImages.length > 0) {
      items.push({
        type: 'image',
        url: galleryImages[0],
        isPrimary: true
      });
    }
    
    // Video is always second (if present)
    if (hasVideo) {
      items.push({
        type: 'video',
        url: videoURL || ''
      });
    }
    
    // Add remaining images
    if (hasImages && galleryImages.length > 1) {
      for (let i = 1; i < galleryImages.length; i++) {
        items.push({
          type: 'image',
          url: galleryImages[i],
          isPrimary: false
        });
      }
    }
    
    return items;
  }, [galleryImages, hasImages, hasVideo, videoURL]);

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
          {mediaItems.map((item, index) => (
            <CarouselItem key={index}>
              {item.type === 'image' ? (
                <AspectRatio ratio={16 / 9} className="bg-gray-100 overflow-hidden">
                  <img 
                    src={item.url} 
                    alt={item.isPrimary ? "Primary business image" : `Business image ${index + 1}`} 
                    className="w-full h-full object-cover" 
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                </AspectRatio>
              ) : (
                <AspectRatio ratio={16 / 9} className="bg-gray-100 overflow-hidden">
                  <div className="relative w-full h-full">
                    {item.url && (item.url.includes('youtube.com') || item.url.includes('youtu.be')) ? (
                      // YouTube embed
                      <iframe 
                        src={getVideoEmbedUrl('youtube', item.url.split('v=')[1] || item.url.split('/').pop() || '')} 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    ) : item.url && item.url.includes('vimeo.com') ? (
                      // Vimeo embed
                      <iframe 
                        src={`https://player.vimeo.com/video/${item.url.split('/').pop()}`}
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    ) : (
                      // Direct video file
                      <>
                        <video 
                          ref={videoRef} 
                          src={item.url} 
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
              )}
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Navigation Controls - Only show if we have more than one media item */}
        {mediaItems.length > 1 && (
          <>
            <CarouselPrevious className="left-2 bg-white/70 hover:bg-white" />
            <CarouselNext className="right-2 bg-white/70 hover:bg-white" />
          </>
        )}
      </Carousel>
    </div>
  );
};
