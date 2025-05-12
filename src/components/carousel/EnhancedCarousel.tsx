
import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  skipPrimaryImage = true,
}) => {
  // Media state management
  const [activeIndex, setActiveIndex] = useState(0);
  const [mediaItems, setMediaItems] = useState<Array<{type: 'image' | 'video', url: string}>>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Set up media items to display (primary image first, then video, then other images)
  // Use useMemo to prevent unnecessary recalculations
  useEffect(() => {
    const items: Array<{type: 'image' | 'video', url: string}> = [];
    
    // Make sure we have valid arrays
    const validImages = Array.isArray(images) ? images.filter(Boolean) : [];
    if (validImages.length === 0 && !videoURL) {
      setMediaItems([]);
      return;
    }
    
    // Add primary image if we have images and aren't skipping it
    if (validImages.length > 0 && !skipPrimaryImage) {
      items.push({ type: 'image', url: validImages[0] });
    }
    
    // ALWAYS add video as second item if available
    if (videoURL) {
      items.push({ type: 'video', url: videoURL });
    }
    
    // Add remaining images, skipping the first one
    const startIndex = skipPrimaryImage ? 1 : 1; // Skip primary image if needed
    const imagesToAdd = validImages.slice(startIndex);
    
    imagesToAdd.forEach(url => {
      items.push({ type: 'image', url });
    });
    
    setMediaItems(items);
    
    // Reset active index when media items change
    setActiveIndex(0);
  }, [images, videoURL, skipPrimaryImage]);

  // Memoize display states to prevent unnecessary re-renders
  const displayState = useMemo(() => {
    const hasMedia = mediaItems.length > 0;
    const hasMultipleItems = mediaItems.length > 1;
    const isAtStart = activeIndex === 0;
    const isAtEnd = activeIndex === mediaItems.length - 1;
    
    return { hasMedia, hasMultipleItems, isAtStart, isAtEnd };
  }, [mediaItems, activeIndex]);
  
  // Event handlers for navigation
  const handlePrev = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (activeIndex > 0) {
      setActiveIndex(prev => prev - 1);
    }
  };
  
  const handleNext = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (activeIndex < mediaItems.length - 1) {
      setActiveIndex(prev => prev + 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current) return;
      
      // Only process events when our container is focused or in the active document
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
    
    if (displayState.hasMultipleItems) {
      window.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeIndex, displayState.hasMultipleItems]);

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
  
  // Return the complete carousel component
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
            />
          ))}
        </div>
      )}
    </div>
  );
};
