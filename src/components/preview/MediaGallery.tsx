
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
  
  // Organize media items to ensure correct order based on settings
  const mediaItems = React.useMemo(() => {
    const items = [];
    
    // Get images based on whether we should skip primary image
    // When skipPrimaryImage is true, we exclude the first image since it's shown in the hero banner
    const imagesToUse = skipPrimaryImage && galleryImages.length > 0 
      ? galleryImages.slice(1)  // Skip the primary image (index 0)
      : [...galleryImages];     // Use all images
    
    // If there's a video, add it first (priority display)
    if (hasVideo) {
      items.push({
        type: 'video',
        url: videoURL || '',
        isPrimary: false
      });
    }
    
    // Add all appropriate images
    if (imagesToUse.length > 0) {
      imagesToUse.forEach(url => {
        items.push({
          type: 'image',
          url,
          isPrimary: false
        });
      });
    }
    
    return items;
  }, [galleryImages, hasVideo, videoURL, skipPrimaryImage]);

  // Reset active index when media items change
  useEffect(() => {
    setActiveIndex(0);
    if (carouselRef.current) {
      carouselRef.current.scrollTo(0);
    }
  }, [mediaItems]);

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
  
  // Don't render the gallery if there are no items to show
  if (mediaItems.length === 0) {
    return null;
  }

  return (
    <div className="w-full rounded-lg overflow-hidden shadow-md">
      {/* Main Carousel */}
      <Carousel 
        className="w-full" 
        setApi={(api) => {
          carouselRef.current = api;
          if (api) {
            api.scrollTo(0);
            api.on('select', () => {
              const selectedIndex = api.selectedScrollSnap();
              setActiveIndex(selectedIndex);
            });
          }
        }}
      >
        <CarouselContent>
          {mediaItems.map((item, index) => (
            <CarouselItem key={`media-item-${index}`} className="basis-full">
              {item.type === 'image' ? (
                <AspectRatio ratio={16 / 9} className="bg-gray-100 overflow-hidden">
                  <img 
                    src={item.url} 
                    alt={`Business media ${index + 1}`} 
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
                        src={getVideoEmbedUrl('youtube', item.url.includes('v=') ? item.url.split('v=')[1].split('&')[0] : item.url.split('/').pop() || '')} 
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
      
      {/* Thumbnail navigation indicators */}
      {mediaItems.length > 1 && (
        <div className="flex items-center justify-center gap-1 mt-2 pb-2 px-4 overflow-x-auto">
          {mediaItems.map((_, index) => (
            <button
              key={`indicator-${index}`}
              onClick={() => {
                if (carouselRef.current) {
                  carouselRef.current.scrollTo(index);
                }
              }}
              className={`
                min-w-8 h-2 rounded-full transition-all cursor-pointer
                ${activeIndex === index 
                  ? 'bg-primary w-10' 
                  : 'bg-gray-300 w-8 opacity-50 hover:opacity-75'}
              `}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
