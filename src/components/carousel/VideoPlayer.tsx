
import React, { useRef, useState, useEffect } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoPlayerProps {
  url: string;
  autoplay?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  autoplay = false
}) => {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Set up video autoplay when component mounts or updates
  useEffect(() => {
    if (videoRef.current && autoplay) {
      videoRef.current.muted = isMuted;
      
      // Make sure to play the video after a short delay to ensure DOM is ready
      const timer = setTimeout(() => {
        const playPromise = videoRef.current?.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log('Autoplay prevented:', error);
          });
        }
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [autoplay, isMuted, url]);
  
  // Toggle mute state with improved event handling
  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent click from bubbling to parent elements
    
    if (videoRef.current) {
      const newMutedState = !isMuted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
    }
  };

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
    return `https://player.vimeo.com/video/${videoId}?autoplay=${autoplay ? '1' : '0'}&muted=${isMuted ? '1' : '0'}&loop=1`;
  };
  
  return (
    <AspectRatio ratio={16 / 9} className="bg-transparent overflow-hidden rounded-lg">
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
