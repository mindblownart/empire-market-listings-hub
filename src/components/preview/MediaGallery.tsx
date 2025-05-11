
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
  skipPrimaryImage?: boolean; // If true, primary image is shown elsewhere and shouldn't be included in gallery
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  galleryImages = [],
  videoURL,
  autoplayVideo = false,
  skipPrimaryImage = false, // Default to showing primary image in carousel
}) => {
  const [isMuted, setIsMuted] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const carouselRef = useRef<any>(null);
  
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
  
  // Organize media items to ensure correct order
  const mediaItems = React.useMemo(() => {
    const items = [];
    
    // Always start with primary image if available and not skipped
    if (hasImages && !skipPrimaryImage && galleryImages.length > 0) {
      items.push({
        type: 'image',
        url: galleryImages[0],
        isPrimary: true
      });
    }
    
    // Add video as next item if it exists
    if (hasVideo) {
      items.push({
        type: 'video',
        url: videoURL || '',
        isPrimary: false
      });
    }
    
    // Add all images except primary (if primary should be shown)
    if (hasImages) {
      // Start from index 1 if we're showing primary, otherwise start from 0
      const startIdx = !skipPrimaryImage ? 1 : 0;
      galleryImages.slice(startIdx).forEach((url) => {
        items.push({
          type: 'image',
          url,
          isPrimary: false
        });
      });
    }
    
    return items;
  }, [galleryImages, hasImages, hasVideo, videoURL, skipPrimaryImage]);

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
      {/* Main Carousel */}
      <Carousel 
        className="w-full" 
        setApi={(api) => {
          carouselRef.current = api;
          api?.scrollTo(0);
          api?.on('select', () => {
            const selectedIndex = api.selectedScrollSnap();
            setActiveIndex(selectedIndex);
          });
        }}
      >
        <CarouselContent>
          {mediaItems.map((item, index) => (
            <CarouselItem key={`media-item-${index}`} className="basis-full">
              {item.type === 'image' ? (
                <AspectRatio ratio={16 / 9} className="bg-gray-100 overflow-hidden">
                  <img 
                    src={item.url} 
                    alt={`Business media ${item.isPrimary ? 'primary' : index + 1}`} 
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
                        title="Video"
                      />
                    ) : item.url && item.url.includes('vimeo.com') ? (
                      // Vimeo embed
                      <iframe 
                        src={`https://player.vimeo.com/video/${item.url.split('/').pop()}`}
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                        title="Video"
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
        
        {/* Only show navigation controls if there's more than one item */}
        {mediaItems.length > 1 && (
          <>
            <CarouselPrevious className="left-2 bg-white/70 hover:bg-white" />
            <CarouselNext className="right-2 bg-white/70 hover:bg-white" />
          </>
        )}
      </Carousel>
      
      {/* Progress indicators for mobile */}
      {mediaItems.length > 1 && (
        <div className="flex justify-center mt-2 pb-2">
          {mediaItems.map((_, index) => (
            <div 
              key={`indicator-${index}`}
              className={`
                h-1.5 mx-1 rounded-full transition-all cursor-pointer
                ${activeIndex === index ? 'w-4 bg-primary' : 'w-1.5 bg-gray-300'}
              `}
              onClick={() => {
                if (carouselRef.current) {
                  carouselRef.current.scrollTo(index);
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
