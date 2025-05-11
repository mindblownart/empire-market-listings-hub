import React, { useState, useRef, useEffect } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Volume2, VolumeX, Image, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import { getVideoEmbedUrl } from '@/components/media-uploader/video-utils';
import { toast } from 'sonner';

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
  skipPrimaryImage = true, // Default to skipping primary image in carousel
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
  
  // Organize media items to ensure video is first if it exists, excluding primary image from carousel
  const mediaItems = React.useMemo(() => {
    const items = [];
    let startIndex = 0;
    
    // Skip primary image in carousel if requested - only show in hero section
    if (skipPrimaryImage && hasImages) {
      startIndex = 1;
    }
    
    // Add video as first item if it exists
    if (hasVideo) {
      items.push({
        type: 'video',
        url: videoURL || '',
        isPrimary: false
      });
    }
    
    // Add all images except primary (if skip is enabled)
    if (hasImages) {
      galleryImages.slice(startIndex).forEach((url, index) => {
        items.push({
          type: 'image',
          url,
          isPrimary: false
        });
      });
    }
    
    return items;
  }, [galleryImages, hasImages, hasVideo, videoURL, skipPrimaryImage]);

  // Get featured media (displayed larger at top)
  const featuredMedia = React.useMemo(() => {
    // If we have a video and it's active, show the video
    if (hasVideo && activeIndex === 0) {
      return {
        type: 'video',
        url: videoURL || '',
      };
    }
    
    // Otherwise show the active image
    const adjustedIndex = hasVideo ? activeIndex - 1 : activeIndex;
    const imageStartIndex = skipPrimaryImage ? 1 : 0;
    const imageIndex = imageStartIndex + adjustedIndex;
    
    if (hasImages && imageIndex < galleryImages.length) {
      return {
        type: 'image', 
        url: galleryImages[imageIndex],
      };
    }
    
    // Fallback to primary image if available
    if (hasImages && galleryImages.length > 0) {
      return { 
        type: 'image', 
        url: galleryImages[0],
      };
    }
    
    return null;
  }, [activeIndex, hasVideo, hasImages, videoURL, galleryImages, skipPrimaryImage]);

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
      {/* Featured Media Display (Hero) */}
      {featuredMedia && (
        <div className="w-full">
          {featuredMedia.type === 'image' ? (
            <AspectRatio ratio={16 / 9} className="bg-gray-100 overflow-hidden">
              <img 
                src={featuredMedia.url} 
                alt="Featured business media" 
                className="w-full h-full object-cover" 
                loading="eager"
              />
            </AspectRatio>
          ) : (
            <AspectRatio ratio={16 / 9} className="bg-gray-100 overflow-hidden">
              <div className="relative w-full h-full">
                {featuredMedia.url && (featuredMedia.url.includes('youtube.com') || featuredMedia.url.includes('youtu.be')) ? (
                  // YouTube embed
                  <iframe 
                    src={getVideoEmbedUrl('youtube', featuredMedia.url.split('v=')[1] || featuredMedia.url.split('/').pop() || '')} 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                ) : featuredMedia.url && featuredMedia.url.includes('vimeo.com') ? (
                  // Vimeo embed
                  <iframe 
                    src={`https://player.vimeo.com/video/${featuredMedia.url.split('/').pop()}`}
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                ) : (
                  // Direct video file
                  <>
                    <video 
                      ref={videoRef} 
                      src={featuredMedia.url} 
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
        </div>
      )}
      
      {/* Thumbnail Carousel - Only show if we have multiple items */}
      {mediaItems.length > 1 && (
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
              <CarouselItem key={index} className="basis-1/4 md:basis-1/5 lg:basis-1/6">
                <div 
                  className={`
                    relative rounded-md overflow-hidden cursor-pointer transition-all
                    ${activeIndex === index ? 
                      'ring-2 ring-primary scale-105 shadow-md z-10' : 
                      'ring-1 ring-gray-200 hover:ring-gray-300'
                    }
                  `}
                  onClick={() => handleThumbnailClick(index)}
                >
                  <AspectRatio ratio={1/1} className="bg-gray-100">
                    {item.type === 'image' ? (
                      <img 
                        src={item.url} 
                        alt={`Thumbnail ${index + 1}`} 
                        className="w-full h-full object-cover" 
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <Play className="h-8 w-8 text-white" />
                      </div>
                    )}
                  </AspectRatio>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {/* Navigation Controls - Only show if we have more media items that fit the view */}
          {mediaItems.length > 4 && (
            <>
              <CarouselPrevious className="left-2 bg-white/70 hover:bg-white" />
              <CarouselNext className="right-2 bg-white/70 hover:bg-white" />
            </>
          )}
        </Carousel>
      )}
      
      {/* Thumbnail indicators for mobile */}
      {mediaItems.length > 1 && (
        <div className="flex justify-center mt-2 pb-2 md:hidden">
          {mediaItems.map((_, index) => (
            <div 
              key={`indicator-${index}`}
              className={`
                h-1.5 mx-1 rounded-full transition-all
                ${activeIndex === index ? 'w-4 bg-primary' : 'w-1.5 bg-gray-300'}
              `}
              onClick={() => handleThumbnailClick(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
