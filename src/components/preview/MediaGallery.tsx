
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
    e.stopPropagation();
    e.preventDefault();
    
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Improved navigation handlers with proper event stopping
  const handlePrev = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
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
      e.stopPropagation();
      e.preventDefault();
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
      // Check if this component is in view
      if (containerRef.current && 
          (containerRef.current.contains(document.activeElement) || 
           document.activeElement === document.body)) {
        
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          handlePrev();
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          handleNext();
        }
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
    <div className="w-full rounded-lg overflow-hidden shadow-md" ref={containerRef} tabIndex={0}>
      {/* Main Carousel with improved event handling */}
      <Carousel 
        className="w-full relative" 
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
                        src={`https://player.vimeo.com/video/${item.url.split('/').pop()}?autoplay=1`}
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
                          autoPlay={autoplayVideo}
                          className="w-full h-full object-cover" 
                        />
                        
                        {/* Video Controls - increased z-index */}
                        <div className="absolute bottom-4 right-4 z-30">
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
        
        {/* Custom navigation arrows - improved positioning, z-index and hit areas */}
        {mediaItems.length > 1 && (
          <>
            {/* Left arrow - increased padding and z-index */}
            <div className="absolute left-0 top-0 bottom-0 flex items-center z-20 pointer-events-none">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-12 w-12 rounded-full bg-white/70 hover:bg-white/90 backdrop-blur-sm text-gray-800 shadow-md ml-2 sm:ml-4 focus-visible:ring-2 transition-opacity pointer-events-auto",
                  isAtStart ? "opacity-50 cursor-not-allowed" : "opacity-100 cursor-pointer"
                )}
                onClick={handlePrev}
                aria-label="Previous slide"
                disabled={isAtStart}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            </div>
            
            {/* Right arrow - increased padding and z-index */}
            <div className="absolute right-0 top-0 bottom-0 flex items-center z-20 pointer-events-none">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-12 w-12 rounded-full bg-white/70 hover:bg-white/90 backdrop-blur-sm text-gray-800 shadow-md mr-2 sm:mr-4 focus-visible:ring-2 transition-opacity pointer-events-auto",
                  isAtEnd ? "opacity-50 cursor-not-allowed" : "opacity-100 cursor-pointer"
                )}
                onClick={handleNext}
                aria-label="Next slide"
                disabled={isAtEnd}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </>
        )}
      </Carousel>
      
      {/* Improved thumbnail navigation indicators with more spacing and better visibility */}
      {mediaItems.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-3 pb-3 px-4 overflow-x-auto z-20">
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
                "min-w-6 h-2 rounded-full transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary",
                activeIndex === index 
                  ? "bg-primary w-10" 
                  : "bg-gray-300 w-6 opacity-50 hover:opacity-75"
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
