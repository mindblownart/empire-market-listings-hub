
import React, { useState, useRef, useEffect } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageCarouselProps {
  images: string[];
  startIndex?: number;
  onIndexChange?: (index: number) => void;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  startIndex = 0,
  onIndexChange
}) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Ensure index stays within bounds
  useEffect(() => {
    if (images.length === 0) return;
    
    if (currentIndex >= images.length) {
      setCurrentIndex(images.length - 1);
    } else if (currentIndex < 0) {
      setCurrentIndex(0);
    }
  }, [currentIndex, images.length]);
  
  // Notify parent component of index changes
  useEffect(() => {
    if (onIndexChange) {
      onIndexChange(currentIndex);
    }
  }, [currentIndex, onIndexChange]);

  // Handle navigation with improved event handling
  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };
  
  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    if (currentIndex < images.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };
  
  // Add keyboard navigation with improved event handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Process keyboard events globally
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentIndex > 0) {
          setCurrentIndex(prev => prev - 1);
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (currentIndex < images.length - 1) {
          setCurrentIndex(prev => prev + 1);
        }
      }
    };
    
    // Add a global handler to support keyboard navigation
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, images.length]);
  
  // Handle empty state
  if (images.length === 0) {
    return (
      <div className="w-full rounded-lg overflow-hidden">
        <AspectRatio ratio={16 / 9} className="bg-gray-100">
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No images available</p>
          </div>
        </AspectRatio>
      </div>
    );
  }
  
  // Calculate if we're at first or last slide
  const isAtStart = currentIndex === 0;
  const isAtEnd = currentIndex === images.length - 1;

  return (
    <div 
      className="relative w-full rounded-lg overflow-hidden" 
      ref={containerRef}
      tabIndex={0} // Make container focusable for keyboard events
    >
      {/* Main Image */}
      <AspectRatio ratio={16 / 9}>
        <img 
          src={images[currentIndex]} 
          alt={`Image ${currentIndex + 1}`} 
          className="object-cover w-full h-full transition-opacity duration-300" 
          loading={currentIndex === 0 ? "eager" : "lazy"}
        />
      </AspectRatio>
      
      {/* Navigation Controls - improved positioning, size and z-index */}
      <div className="absolute inset-0 flex items-center justify-between z-40 pointer-events-none">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-16 w-16 rounded-full bg-white/70 hover:bg-white/90 shadow-md backdrop-blur-sm text-gray-800 ml-2 sm:ml-4 pointer-events-auto transition-opacity",
            isAtStart ? "opacity-50 cursor-not-allowed" : "opacity-100 cursor-pointer"
          )}
          onClick={handlePrev}
          disabled={isAtStart}
          aria-label="Previous image"
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-16 w-16 rounded-full bg-white/70 hover:bg-white/90 shadow-md backdrop-blur-sm text-gray-800 mr-2 sm:mr-4 pointer-events-auto transition-opacity",
            isAtEnd ? "opacity-50 cursor-not-allowed" : "opacity-100 cursor-pointer"
          )}
          onClick={handleNext}
          disabled={isAtEnd}
          aria-label="Next image"
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      </div>
      
      {/* Navigation Indicators - improved styling and interaction */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-40">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              aria-label={`Go to image ${index + 1}`}
              aria-current={index === currentIndex ? 'true' : 'false'}
              className={cn(
                "w-3 h-3 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white pointer-events-auto",
                index === currentIndex 
                  ? "bg-white w-8" 
                  : "bg-white/50 hover:bg-white/70"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};
