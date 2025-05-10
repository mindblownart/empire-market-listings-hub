
import React from 'react';
import { Play, Video } from 'lucide-react';
import { MediaItemType } from '../types';

interface VideoItemProps {
  item: MediaItemType;
  onVideoPreview: (item: MediaItemType) => void;
}

const VideoItem: React.FC<VideoItemProps> = ({ item, onVideoPreview }) => {
  const handleClick = () => {
    if (!item.isEmpty) {
      onVideoPreview(item);
    }
  };

  return (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
      {item.preview ? (
        <div 
          className="relative w-full h-full cursor-pointer" 
          onClick={handleClick}
        >
          <img 
            src={item.preview} 
            alt="Video thumbnail" 
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
            <Play className="text-white w-12 h-12" />
          </div>
        </div>
      ) : (
        <div 
          className="text-center p-2 cursor-pointer" 
          onClick={handleClick}
        >
          <Video className="w-10 h-10 mx-auto text-gray-500 mb-1" />
          <p className="text-xs truncate text-gray-600">Video</p>
        </div>
      )}
    </div>
  );
};

export default VideoItem;
