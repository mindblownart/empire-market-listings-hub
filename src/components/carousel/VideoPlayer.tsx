
import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoPlayerProps {
  url: string;
  autoplay?: boolean;
}

const VideoPlayerComponent: React.FC<VideoPlayerProps> = ({
  url,
  autoplay = false
}) => {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Set up video autoplay when component mounts or updates
  useEffect(() => {
    if (videoRef.current && autoplay) {
      videoRef.current.muted = isMuted;
      
      // Play video with a short delay to ensure DOM is ready
      const timer = setTimeout(() => {
        if (videoRef.current) {
          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.log('Autoplay prevented:', error);
            });
          }
        }
      }, 300); // Increased delay for better reliability
      
      return () => clearTimeout(timer);
    }
  }, [autoplay, url]);
  
  // Update mute state when it changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);
  
  // Toggle mute state with improved event handling
  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent click from bubbling to parent elements
    setIsMuted(prevState => !prevState);
  }, []);

  // Memoize URL processing to reduce render cycles
  const videoUrls = useMemo(() => {
    // Determine video type (YouTube, Vimeo, or direct file)
    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    const isVimeo = url.includes('vimeo.com');
    
    // Create embed URL for YouTube videos
    const getYoutubeEmbedUrl = () => {
      let videoId = '';
      if (url.includes('v=')) {
        videoId = url.split('v=')[1].split('&')[0];
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
      }
      return `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? '1' : '0'}&mute=${isMuted ? '1' : '0'}&loop=1&playlist=${videoId}`;
    };

    // Create embed URL for Vimeo videos
    const getVimeoEmbedUrl = () => {
      const videoId = url.split('/').pop() || '';
      return `https://player.vimeo.com/video/${videoId}?autoplay=${autoplay ? '1' : '0'}&muted=${isMuted ? '1' : '0'}&loop=1&background=1`;
    };
    
    return { isYouTube, isVimeo, youtubeUrl: getYoutubeEmbedUrl(), vimeoUrl: getVimeoEmbedUrl() };
  }, [url, autoplay, isMuted]);
  
  // Fix rendering to prevent infinite loops
  const { isYouTube, isVimeo, youtubeUrl, vimeoUrl } = videoUrls;
  
  return (
    <AspectRatio ratio={16 / 9} className="bg-transparent overflow-hidden rounded-lg">
      {isYouTube ? (
        <iframe 
          src={youtubeUrl}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen
          className="w-full h-full"
          title="YouTube video"
        />
      ) : isVimeo ? (
        <iframe 
          src={vimeoUrl}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
          title="Vimeo video"
        />
      ) : (
        // Direct video file container
        <div className="relative w-full h-full">
          <video 
            ref={videoRef}
            src={url}
            controls={false}
            loop
            muted={isMuted}
            playsInline
            className="w-full h-full object-cover object-center"
          />
          
          {/* Video Controls - high z-index to ensure visibility */}
          <div className="absolute bottom-4 right-4 z-[100]">
            <Button
              variant="outline"
              size="icon"
              className="bg-white/80 backdrop-blur-sm hover:bg-white rounded-full pointer-events-auto"
              onClick={toggleMute}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}
    </AspectRatio>
  );
};

// Prevent unnecessary re-renders with memo
export const VideoPlayer = React.memo(VideoPlayerComponent);
