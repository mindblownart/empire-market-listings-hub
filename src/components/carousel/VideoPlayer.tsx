
import React, { useRef, useState, useEffect } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoPlayerProps {
  url: string;
  autoplay?: boolean;
  thumbnail?: string;
  objectFit?: 'cover' | 'contain';
  className?: string;
  showControls?: boolean;
  inCarouselPreview?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  autoplay = false,
  thumbnail,
  objectFit = 'cover',
  className = '',
  showControls = true,
  inCarouselPreview = false
}) => {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [hasInteracted, setHasInteracted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Set up video autoplay when component mounts or updates
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      
      // Make sure to play the video after a short delay to ensure DOM is ready
      const timer = setTimeout(() => {
        if (autoplay && videoRef.current) {
          playVideo();
        }
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [autoplay, isMuted, url]);
  
  // Handle playing the video with proper error handling
  const playVideo = () => {
    if (!videoRef.current) return;
    
    const playPromise = videoRef.current.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.log('Autoplay prevented:', error);
        setIsPlaying(false);
      }).then(() => {
        setIsPlaying(true);
      });
    }
  };
  
  // Toggle mute state with improved event handling
  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent click from bubbling to parent elements
    
    if (videoRef.current) {
      const newMutedState = !isMuted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
      
      // If unmuting and video is not playing, start playing
      if (!newMutedState && !isPlaying) {
        playVideo();
      }
    }
  };

  // Toggle play/pause when clicking on the video
  const togglePlay = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!hasInteracted) {
      setHasInteracted(true);
    }
    
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        playVideo();
      }
    }
  };

  // Determine video type (YouTube, Vimeo, or direct file)
  const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
  const isVimeo = url.includes('vimeo.com');
  
  // Create embed URL for YouTube videos with improved options
  const getYoutubeEmbedUrl = () => {
    let videoId = '';
    if (url.includes('v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    }
    return `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay && !inCarouselPreview ? '1' : '0'}&mute=${isMuted ? '1' : '0'}&loop=1&playlist=${videoId}&controls=${showControls ? '1' : '0'}`;
  };

  // Create embed URL for Vimeo videos with improved options
  const getVimeoEmbedUrl = () => {
    const videoId = url.split('/').pop() || '';
    return `https://player.vimeo.com/video/${videoId}?autoplay=${autoplay && !inCarouselPreview ? '1' : '0'}&muted=${isMuted ? '1' : '0'}&loop=1&controls=${showControls ? '1' : '0'}`;
  };
  
  // Generate proper play/pause overlay
  const renderOverlay = () => {
    if (!showControls) return null;
    
    return (
      <div 
        className={`absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity cursor-pointer z-10 ${!isPlaying ? 'opacity-50' : ''}`}
        onClick={togglePlay}
      >
        <div className="bg-black/50 rounded-full p-3">
          {isPlaying ? (
            <Pause className="h-8 w-8 text-white" />
          ) : (
            <Play className="h-8 w-8 text-white" />
          )}
        </div>
      </div>
    );
  };
  
  return (
    <AspectRatio ratio={16 / 9} className={`bg-transparent overflow-hidden rounded-lg ${className}`}>
      {isYouTube ? (
        <iframe 
          src={getYoutubeEmbedUrl()}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen
          className="w-full h-full"
          title="YouTube video"
        />
      ) : isVimeo ? (
        <iframe 
          src={getVimeoEmbedUrl()}
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
            poster={thumbnail}
            controls={false}
            loop
            muted={isMuted}
            playsInline
            onClick={togglePlay}
            className={`w-full h-full object-${objectFit} object-center`}
          />
          
          {/* Custom overlay with play/pause */}
          {renderOverlay()}
          
          {/* Video Controls - high z-index to ensure visibility */}
          {showControls && (
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
          )}
        </div>
      )}
    </AspectRatio>
  );
};
