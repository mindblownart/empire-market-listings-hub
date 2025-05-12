
import React, { useState, useRef, useEffect } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { getVideoEmbedUrl } from '@/components/media-uploader/video-utils';
import { VideoPlayer } from '@/components/carousel';

interface MediaGalleryProps {
  galleryImages: string[];
  videoURL?: string | null;
  autoplayVideo?: boolean;
  skipPrimaryImage?: boolean;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  galleryImages = [],
  videoURL,
  autoplayVideo = false,
  skipPrimaryImage = false,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const carouselRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Check if any media is available
  const hasVideo = !!videoURL;
  const hasImages = Array.isArray(galleryImages) && galleryImages.length > 0;
  const hasMedia = hasVideo || hasImages;
  
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

  // Handle mute toggle for video with proper event stopping
  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (videoRef.current) {
      const newMutedState = !isMuted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
    }
  };

  // Improved navigation handlers with proper event stopping
  const handlePrev = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!carouselRef.current) return;
    
    if (activeIndex > 0) {
      const newIndex = activeIndex - 1;
      setActiveIndex(newIndex);
      carouselRef.current.scrollTo(newIndex);
    }
  };
  
  const handleNext = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!carouselRef.current) return;
    
    if (activeIndex < mediaItems.length - 1) {
      const newIndex = activeIndex + 1;
      setActiveIndex(newIndex);
      carouselRef.current.scrollTo(newIndex);
    }
  };
  
  // Enhanced keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Process keyboard events for this carousel
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handlePrev();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleNext();
      }
    };
    
    // Only add listener if we have multiple items
    if (mediaItems.length > 1) {
      window.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mediaItems.length, activeIndex]);

  // Fallback placeholder when no media is available
  if (!hasMedia) {
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

  // Calculate if we're at the first or last slide for UI feedback
  const isAtStart = activeIndex === 0;
  const isAtEnd = activeIndex === mediaItems.length - 1;

  return (
    <div className="w-full rounded-lg overflow-hidden shadow-md relative" ref={containerRef} tabIndex={0}>
      {/* Main Carousel with improved event handling */}
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
                <VideoPlayer url={item.url} autoplay={autoplayVideo} />
              )}
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      
      {/* Custom navigation arrows - improved positioning, z-index and hit areas */}
      {mediaItems.length > 1 && (
        <>
          {/* Left arrow - increased size, padding and z-index */}
          <div className="absolute left-0 top-0 bottom-0 flex items-center justify-center z-50 px-2 sm:px-4 py-2 pointer-events-none">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-16 w-16 rounded-full bg-white/70 hover:bg-white/90 backdrop-blur-sm text-gray-800 shadow-md focus-visible:ring-2 transition-opacity pointer-events-auto",
                isAtStart ? "opacity-50 cursor-not-allowed" : "opacity-100 cursor-pointer"
              )}
              onClick={handlePrev}
              aria-label="Previous slide"
              disabled={isAtStart}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
          </div>
          
          {/* Right arrow - increased size, padding and z-index */}
          <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center z-50 px-2 sm:px-4 py-2 pointer-events-none">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-16 w-16 rounded-full bg-white/70 hover:bg-white/90 backdrop-blur-sm text-gray-800 shadow-md focus-visible:ring-2 transition-opacity pointer-events-auto",
                isAtEnd ? "opacity-50 cursor-not-allowed" : "opacity-100 cursor-pointer"
              )}
              onClick={handleNext}
              aria-label="Next slide"
              disabled={isAtEnd}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </div>
        </>
      )}
      
      {/* Improved thumbnail navigation indicators with better visibility */}
      {mediaItems.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-50">
          {mediaItems.map((_, index) => (
            <button
              key={`indicator-${index}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (carouselRef.current) {
                  setActiveIndex(index);
                  carouselRef.current.scrollTo(index);
                }
              }}
              className={cn(
                "h-3 rounded-full transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary pointer-events-auto",
                activeIndex === index 
                  ? "bg-primary w-8" 
                  : "bg-gray-300 w-3 opacity-70 hover:opacity-100"
              )}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={activeIndex === index ? 'true' : 'false'}
            />
          ))}
        </div>
      )}
    </div>
  );
};
