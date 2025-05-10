
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { VideoInfo } from './types';

interface VideoPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  videoInfo: VideoInfo | undefined;
}

const VideoPreviewModal: React.FC<VideoPreviewModalProps> = ({ 
  isOpen, 
  onClose, 
  videoUrl,
  videoInfo
}) => {
  if (!videoUrl) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 flex flex-row items-center justify-between">
          <DialogTitle>Video Preview</DialogTitle>
          <button className="rounded-full hover:bg-gray-100 p-2" onClick={onClose}>
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>
        
        <div className="w-full aspect-video">
          {videoInfo?.platform === 'file' ? (
            <video 
              src={videoUrl} 
              controls 
              autoPlay 
              className="w-full h-full object-contain bg-black"
            />
          ) : (
            <iframe 
              src={videoUrl} 
              title="Video Preview" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              className="w-full h-full"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPreviewModal;
