
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
  useEffect(() => {
    console.log("VideoPlayer mounted with URL:", url);
    console.log("VideoPlayer props:", { url, autoplay, loop, muted, controls });
    
    // Validate URL to help with debugging
    if (!url) {
      console.warn("VideoPlayer received empty URL");
    } else if (typeof url !== 'string') {
      console.error("VideoPlayer received non-string URL:", url);
    }
  }, [url, autoplay, loop, muted, controls]);
  
  useEffect(() => {
    // Try to play video automatically if autoplay is enabled
    if (autoplay && videoRef.current && url) {
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
  
  // Guard against invalid URLs
  if (!url || typeof url !== 'string') {
    console.error("Invalid video URL provided to VideoPlayer:", url);
    return (
      <AspectRatio ratio={16 / 9} className="bg-gray-100">
        <div className="flex items-center justify-center h-full text-gray-500">
          Video unavailable
        </div>
      </AspectRatio>
    );
  }
  
  // IMPROVED: Better detection of URL types including blob URLs
  const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
  const isVimeo = url.includes('vimeo.com');
  const isBlobUrl = url.startsWith('blob:') || url.startsWith('data:');
  
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
      console.error("Could not extract YouTube video ID from:", url);
      return null;
    }
    
    // Create YouTube embed URL with autoplay and loop parameters
    let embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;
    if (autoplay) embedUrl += '&autoplay=1';
    if (loop) embedUrl += '&loop=1&playlist=' + videoId;
    if (muted) embedUrl += '&mute=1';
    if (!controls) embedUrl += '&controls=0';
    
    console.log("Rendering YouTube video with ID:", videoId);
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
      console.error("Could not extract Vimeo video ID from:", url);
      return null;
    }
    
    // Create Vimeo embed URL with parameters
    let embedUrl = `https://player.vimeo.com/video/${videoId}?background=1`;
    if (autoplay) embedUrl += '&autoplay=1';
    if (loop) embedUrl += '&loop=1';
    if (muted) embedUrl += '&muted=1';
    if (!controls) embedUrl += '&controls=0';
    
    console.log("Rendering Vimeo video with ID:", videoId);
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
  
  // For MP4, blob URLs and other direct video files
  console.log("Rendering direct video file:", url);
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
