
import React, { useRef, useState, useEffect } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getVideoEmbedUrl } from '@/components/media-uploader/video-utils';

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
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [autoplay, isMuted]);
  
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
  
  return (
    <AspectRatio ratio={16 / 9} className="bg-black overflow-hidden rounded-lg">
      <div className="relative w-full h-full">
        {isYouTube ? (
          <iframe 
            src={getVideoEmbedUrl('youtube', url.includes('v=') 
              ? url.split('v=')[1].split('&')[0] 
              : url.split('/').pop() || '')} 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
            className="w-full h-full"
            title="YouTube video"
          />
        ) : isVimeo ? (
          <iframe 
            src={`https://player.vimeo.com/video/${url.split('/').pop()}?autoplay=${autoplay ? '1' : '0'}`}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
            title="Vimeo video"
          />
        ) : (
          // Direct video file
          <>
            <video 
              ref={videoRef}
              src={url}
              controls={false}
              loop
              muted={isMuted}
              playsInline
              className="w-full h-full object-cover"
            />
            
            {/* Video Controls - increase z-index to ensure it's above navigation arrows */}
            <div className="absolute bottom-4 right-4 z-30">
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
  );
};
