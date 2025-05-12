
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { VideoPlayer } from './VideoPlayer';

interface EnhancedCarouselProps {
  images: string[];
  videoURL?: string | null;
  autoplayVideo?: boolean;
  skipPrimaryImage?: boolean;
}

export const EnhancedCarousel: React.FC<EnhancedCarouselProps> = ({
  images = [],
  videoURL,
  autoplayVideo = true,
  skipPrimaryImage = false,
}) => {
  // Media state management
  const [activeIndex, setActiveIndex] = useState(0);
  const [mediaItems, setMediaItems] = useState<Array<{type: 'image' | 'video', url: string}>>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Set up media items to display with video always in position 1 if available
  useEffect(() => {
    const items: Array<{type: 'image' | 'video', url: string}> = [];
    
    // Make sure we have valid arrays
    let validImages = Array.isArray(images) ? images.filter(Boolean) : [];
    
    if (validImages.length === 0 && !videoURL) {
      setMediaItems([]);
      return;
    }
    
    // If skipPrimaryImage is true, remove the first image (primary) from the carousel
    if (skipPrimaryImage && validImages.length > 0) {
      validImages = validImages.slice(1);
    }
    
    // Always add video as first item if available
    if (videoURL) {
      items.push({ type: 'video', url: videoURL });
    }
    
    // Add all remaining images after the video
    if (validImages.length > 0) {
      validImages.forEach(url => {
        items.push({ type: 'image', url });
      });
    }
    
    setMediaItems(items);
    setActiveIndex(0); // Reset active index when media items change
  }, [images, videoURL, skipPrimaryImage]);

  // Event handlers for navigation
  const handlePrev = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setActiveIndex(prev => {
      if (prev > 0) return prev - 1;
      return prev;
    });
  }, []);
  
  const handleNext = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setActiveIndex(prev => {
      if (prev < mediaItems.length - 1) return prev + 1;
      return prev;
    });
  }, [mediaItems.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current) return;
      
      if (containerRef.current.contains(document.activeElement) || document.activeElement === document.body) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          handlePrev();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          handleNext();
        }
      }
    };
    
    if (mediaItems.length > 1) {
      window.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleNext, handlePrev, mediaItems.length]);

  // Memoize display states
  const displayState = useMemo(() => {
    const hasMedia = mediaItems.length > 0;
    const hasMultipleItems = mediaItems.length > 1;
    const isAtStart = activeIndex === 0;
    const isAtEnd = activeIndex === mediaItems.length - 1;
    
    return { hasMedia, hasMultipleItems, isAtStart, isAtEnd };
  }, [mediaItems, activeIndex]);

  // Fallback when no media is available
  if (!displayState.hasMedia) {
    return (
      <div className="w-full rounded-lg overflow-hidden">
        <AspectRatio ratio={16 / 9} className="bg-gray-100">
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No media available</p>
          </div>
        </AspectRatio>
      </div>
    );
  }
  
  return (
    <div 
      className="w-full rounded-lg overflow-hidden shadow-md relative"
      ref={containerRef}
      tabIndex={0}
    >
      {/* Active Media Display */}
      <div className="w-full">
        {mediaItems[activeIndex]?.type === 'video' ? (
          <VideoPlayer 
            url={mediaItems[activeIndex].url} 
            autoplay={autoplayVideo}
          />
        ) : (
          <AspectRatio ratio={16 / 9} className="bg-transparent">
            <img 
              src={mediaItems[activeIndex]?.url} 
              alt={`Media ${activeIndex + 1}`}
              className="w-full h-full object-cover object-center"
              loading={activeIndex === 0 ? "eager" : "lazy"}
            />
          </AspectRatio>
        )}
      </div>
      
      {/* Navigation arrows - only shown if multiple items */}
      {displayState.hasMultipleItems && (
        <>
          {/* Left navigation arrow */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handlePrev}
            disabled={displayState.isAtStart}
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full",
              "bg-white/70 hover:bg-white/90 backdrop-blur-sm text-gray-800",
              "shadow-md z-20 transition-opacity",
              displayState.isAtStart ? "opacity-60" : "opacity-100"
            )}
            aria-label="Previous item"
            type="button"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          {/* Right navigation arrow */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleNext}
            disabled={displayState.isAtEnd}
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full",
              "bg-white/70 hover:bg-white/90 backdrop-blur-sm text-gray-800",
              "shadow-md z-20 transition-opacity",
              displayState.isAtEnd ? "opacity-60" : "opacity-100"
            )}
            aria-label="Next item"
            type="button"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}
      
      {/* Pagination indicators - only shown if multiple items */}
      {displayState.hasMultipleItems && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20">
          {mediaItems.map((_, index) => (
            <button
              key={`indicator-${index}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveIndex(index);
              }}
              className={cn(
                "h-2.5 transition-all focus:outline-none focus:ring-2 focus:ring-primary rounded-full",
                activeIndex === index 
                  ? "bg-white w-6" 
                  : "bg-white/40 w-2.5 hover:bg-white/70"
              )}
              aria-label={`Go to item ${index + 1}`}
              aria-current={activeIndex === index ? 'true' : 'false'}
              type="button"
            />
          ))}
        </div>
      )}
    </div>
  );
};
