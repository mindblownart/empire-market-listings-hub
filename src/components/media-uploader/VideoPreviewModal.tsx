
import React from 'react';
import { XCircle } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { getVideoEmbedUrl } from './video-utils';

export interface VideoPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  url?: string;
  platform: string | null;
}

const VideoPreviewModal: React.FC<VideoPreviewModalProps> = ({
  isOpen,
  onClose,
  url = '',
  platform
}) => {
  // Get the actual embed URL for the video
  let embedUrl = '';
  let videoId = '';
  
  if (url) {
    if (platform === 'youtube') {
      videoId = url.includes('v=') ? url.split('v=')[1] : url.split('/').pop() || '';
      embedUrl = getVideoEmbedUrl('youtube', videoId);
    } else if (platform === 'vimeo') {
      videoId = url.split('/').pop() || '';
      embedUrl = `https://player.vimeo.com/video/${videoId}`;
    } else {
      // Direct file URL
      embedUrl = url;
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-black">
        <button
          onClick={onClose}
          className="absolute right-2 top-2 rounded-full bg-white p-1 z-10"
          aria-label="Close"
        >
          <XCircle className="h-6 w-6" />
        </button>
        
        <div className="aspect-video w-full">
          {platform === 'youtube' || platform === 'vimeo' ? (
            <iframe
              src={embedUrl}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : url ? (
            <video
              src={url}
              controls
              autoPlay
              className="w-full h-full object-contain bg-black"
            ></video>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-black text-white">
              No video to preview
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPreviewModal;
