
import React, { useRef, useState, useEffect } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Volume2, VolumeX, Play, Pause, VideoOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoPlayerProps {
  url: string;
  autoplay?: boolean;
  thumbnail?: string;
  objectFit?: 'cover' | 'contain';
  className?: string;
  showControls?: boolean;
  inCarouselPreview?: boolean;
  onError?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  autoplay = false,
  thumbnail,
  objectFit = 'cover',
  className = '',
  showControls = true,
  inCarouselPreview = false,
  onError
}) => {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoadingVideo, setIsLoadingVideo] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Set up video autoplay when component mounts or updates
  useEffect(() => {
    if (videoRef.current && !hasError) {
      videoRef.current.muted = isMuted;
      
      // Make sure to play the video after a short delay to ensure DOM is ready
      const timer = setTimeout(() => {
        if (autoplay && videoRef.current) {
          playVideo();
        }
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [autoplay, isMuted, url, hasError]);
  
  // Handle playing the video with proper error handling
  const playVideo = () => {
    if (!videoRef.current || hasError) return;
    
    const playPromise = videoRef.current.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.log('Autoplay prevented:', error);
        setIsPlaying(false);
      }).then(() => {
        setIsPlaying(true);
        setIsLoadingVideo(false);
      });
    }
  };
  
  // Toggle mute state with improved event handling
  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent click from bubbling to parent elements
    
    if (videoRef.current && !hasError) {
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
    
    if (videoRef.current && !hasError) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        playVideo();
      }
    }
  };
  
  // Handle video error
  const handleError = () => {
    setHasError(true);
    setIsPlaying(false);
    setIsLoadingVideo(false);
    console.error("Video failed to load:", url);
    if (onError) onError();
  };
  
  // Handle video loaded
  const handleVideoLoaded = () => {
    setIsLoadingVideo(false);
    if (autoplay) {
      playVideo();
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
  
  // Show loading state if video is still loading
  if (isLoadingVideo && !hasError && !isYouTube && !isVimeo) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 h-full w-full ${className}`}>
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // If there's an error, show error state
  if (hasError) {
    return (
      <div className={`flex flex-col items-center justify-center h-full bg-gray-100 ${className}`}>
        <VideoOff className="h-12 w-12 text-gray-400 mb-2" />
        <p className="text-gray-500">Video failed to load</p>
        {thumbnail && (
          <div className="mt-2 p-2 bg-white/50 rounded">
            <img 
              src={thumbnail} 
              alt="Video thumbnail" 
              className="w-full max-h-32 object-contain rounded"
            />
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className={`relative w-full h-full bg-black ${className}`}>
      {isYouTube ? (
        <iframe 
          src={getYoutubeEmbedUrl()}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
          onError={handleError}
        />
      ) : isVimeo ? (
        <iframe 
          src={getVimeoEmbedUrl()}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
          onError={handleError}
        />
      ) : (
        <>
          <video
            ref={videoRef}
            src={url}
            className={`w-full h-full object-${objectFit}`}
            muted={isMuted}
            playsInline
            loop
            preload="metadata"
            controls={showControls && hasInteracted}
            onError={handleError}
            onLoadedData={handleVideoLoaded}
          />
          
          {renderOverlay()}
          
          {showControls && !hasInteracted && (
            <div className="absolute bottom-4 right-4 z-20">
              <Button 
                size="sm" 
                variant="secondary" 
                className="bg-black/50 hover:bg-black/70 text-white rounded-full p-2 h-8 w-8" 
                onClick={toggleMute}
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
