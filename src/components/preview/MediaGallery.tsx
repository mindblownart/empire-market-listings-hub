
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
  skipPrimaryImage = false,
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
  
  // Organize media items to ensure video is first if it exists
  const mediaItems = React.useMemo(() => {
    const items = [];
    
    // Add video as first item if it exists
    if (hasVideo) {
      items.push({
        type: 'video',
        url: videoURL || '',
        isPrimary: true
      });
    }
    
    // Add all images
    if (hasImages) {
      galleryImages.forEach((url, index) => {
        items.push({
          type: 'image',
          url,
          isPrimary: !hasVideo && index === 0
        });
      });
    }
    
    return items;
  }, [galleryImages, hasImages, hasVideo, videoURL]);

  // Handle thumbnail click
  const handleThumbnailClick = (index: number) => {
    setActiveIndex(index);
    if (carouselRef.current) {
      carouselRef.current.scrollTo(index);
    }
  };

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
      <Carousel 
        className="w-full" 
        setApi={(api) => {
          // Store carousel API reference
          carouselRef.current = api;
          // Start at index 0, but this can be modified if needed
          api?.scrollTo(0);
          // Set up event listener for slide changes
          api?.on('select', () => {
            const selectedIndex = api.selectedScrollSnap();
            setActiveIndex(selectedIndex);
          });
        }}
      >
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
      
      {/* Thumbnail navigation for multiple items */}
      {mediaItems.length > 1 && (
        <div className="px-4 py-3 bg-gray-50">
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-thin">
            {mediaItems.map((item, index) => (
              <div 
                key={`thumb-${index}`}
                className={`
                  w-16 h-12 flex-shrink-0 rounded overflow-hidden cursor-pointer transition-all
                  ${activeIndex === index ? 
                    'ring-2 ring-primary scale-105 shadow-md' : 
                    'ring-1 ring-gray-200 hover:ring-gray-300'
                  }
                `}
                onClick={() => handleThumbnailClick(index)}
              >
                {item.type === 'image' ? (
                  <img 
                    src={item.url} 
                    alt={`Thumbnail ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-black flex items-center justify-center">
                    <svg 
                      className="w-6 h-6 text-white" 
                      fill="currentColor" 
                      viewBox="0 0 20 20" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
