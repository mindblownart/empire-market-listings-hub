
import React, { useRef, useEffect } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface VideoPlayerProps {
  url: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  className?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  autoplay = true,
  loop = true,
  muted = true,
  controls = true,
  className = '',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Enhanced logging for video player
  console.log("VideoPlayer rendering with props:", { url, autoplay, loop, muted, controls });
  
  useEffect(() => {
    // Try to play video automatically if autoplay is enabled
    if (autoplay && videoRef.current) {
      console.log("Attempting to autoplay video:", url);
      
      const playPromise = videoRef.current.play();
      
      // Handle autoplay restrictions
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("Video autoplay successful");
          })
          .catch(error => {
            console.warn("Autoplay prevented:", error);
            // For debugging only - in production you might want to show a play button overlay
          });
      }
    }
  }, [url, autoplay]);
  
  // Determine if it's a YouTube/Vimeo URL
  const isYouTube = url && typeof url === 'string' && 
    (url.includes('youtube.com') || url.includes('youtu.be'));
  const isVimeo = url && typeof url === 'string' && url.includes('vimeo.com');
  
  // Extract YouTube video ID
  const getYoutubeId = (youtubeUrl: string) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = youtubeUrl.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };
  
  // Extract Vimeo video ID
  const getVimeoId = (vimeoUrl: string) => {
    const regExp = /^.*(vimeo\.com\/)((channels\/[A-z]+\/)|(groups\/[A-z]+\/videos\/))?([0-9]+)/;
    const match = vimeoUrl.match(regExp);
    return match ? match[5] : null;
  };
  
  // Handle different video sources
  if (isYouTube) {
    const videoId = getYoutubeId(url);
    if (!videoId) {
      console.error("Invalid YouTube URL:", url);
      return null;
    }
    
    // Create YouTube embed URL with autoplay and loop parameters
    let embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;
    if (autoplay) embedUrl += '&autoplay=1';
    if (loop) embedUrl += '&loop=1&playlist=' + videoId;
    if (muted) embedUrl += '&mute=1';
    
    console.log("Using YouTube embed URL:", embedUrl);
    
    return (
      <AspectRatio ratio={16 / 9} className="bg-black">
        <iframe
          src={embedUrl}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="YouTube video"
        />
      </AspectRatio>
    );
  }
  
  if (isVimeo) {
    const videoId = getVimeoId(url);
    if (!videoId) {
      console.error("Invalid Vimeo URL:", url);
      return null;
    }
    
    // Create Vimeo embed URL with parameters
    let embedUrl = `https://player.vimeo.com/video/${videoId}?background=1`;
    if (autoplay) embedUrl += '&autoplay=1';
    if (loop) embedUrl += '&loop=1';
    if (muted) embedUrl += '&muted=1';
    
    console.log("Using Vimeo embed URL:", embedUrl);
    
    return (
      <AspectRatio ratio={16 / 9} className="bg-black">
        <iframe
          src={embedUrl}
          className="w-full h-full"
          frameBorder="0"
          allow="autoplay; fullscreen"
          allowFullScreen
          title="Vimeo video"
        />
      </AspectRatio>
    );
  }
  
  // For regular video files
  console.log("Using HTML5 video player with URL:", url);
  
  return (
    <AspectRatio ratio={16 / 9} className="bg-black">
      <video
        ref={videoRef}
        className={`w-full h-full object-contain ${className}`}
        autoPlay={autoplay}
        loop={loop}
        muted={muted}
        controls={controls}
        playsInline
      >
        <source src={url} />
        Your browser does not support the video tag.
      </video>
    </AspectRatio>
  );
};
