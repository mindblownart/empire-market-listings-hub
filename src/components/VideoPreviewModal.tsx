
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface VideoPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  embedUrl: string;
  platform: string | null;
}

const VideoPreviewModal: React.FC<VideoPreviewModalProps> = ({
  isOpen,
  onClose,
  embedUrl,
  platform
}) => {
  if (!embedUrl) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 flex flex-row items-center justify-between">
          <DialogTitle>Video Preview</DialogTitle>
          <DialogClose onClick={onClose} className="rounded-full hover:bg-gray-200 p-1">
            <X className="h-4 w-4" />
          </DialogClose>
        </DialogHeader>
        <div className="w-full aspect-video">
          {platform === 'file' ? (
            <video 
              src={embedUrl} 
              controls 
              autoPlay 
              className="w-full h-full object-contain bg-black"
            />
          ) : (
            <iframe 
              src={embedUrl} 
              title="Video Preview" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
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
