
import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Move, X, Play, Link as LinkIcon } from 'lucide-react';
import { MediaItemProps } from './types';

export const MediaItem: React.FC<MediaItemProps> = ({ 
  item, 
  index, 
  moveItem, 
  onDelete,
  onVideoPreview,
  isFixed = false
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'media-item',
    item: { id: item.id, index },
    canDrag: !isFixed && item.type === 'image',
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [, drop] = useDrop({
    accept: 'media-item',
    hover: (draggedItem: { id: string; index: number }, monitor) => {
      if (!ref.current) return;
      const dragIndex = draggedItem.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) return;
      
      // If this is the video slot (index 1) or trying to move to primary slot (index 0), prevent it
      if (hoverIndex === 1 || hoverIndex === 0) return;
      if (dragIndex === 1 || dragIndex === 0) return;

      moveItem(dragIndex, hoverIndex);
      draggedItem.index = hoverIndex;
    },
  });

  // Only add drag ref if not fixed
  if (!isFixed && item.type === 'image') {
    drag(drop(ref));
  }

  const handleVideoClick = () => {
    if (item.type === 'video') {
      onVideoPreview(item);
    }
  };

  return (
    <div 
      ref={ref}
      className={`relative group aspect-square rounded-md overflow-hidden border-2 ${
        item.isPrimary ? 'border-primary' : isDragging ? 'border-dashed border-gray-400 opacity-50' : 'border-gray-200'
      }`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {item.type === 'image' ? (
        <img src={item.preview} alt="Media preview" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          {item.preview ? (
            <div 
              className="relative w-full h-full cursor-pointer" 
              onClick={handleVideoClick}
            >
              <img 
                src={item.preview} 
                alt="Video thumbnail" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
                <Play className="text-white w-12 h-12" />
              </div>
              {item.url && (
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md flex items-center">
                  <LinkIcon className="w-3 h-3 mr-1" /> {item.videoInfo?.platform || 'External'} Video
                </div>
              )}
            </div>
          ) : item.url ? (
            <div 
              className="text-center p-2 cursor-pointer" 
              onClick={handleVideoClick}
            >
              <Video className="w-10 h-10 mx-auto text-gray-500 mb-1" />
              <p className="text-xs truncate text-gray-600">External Video</p>
            </div>
          ) : (
            <Video className="text-gray-400 w-10 h-10" />
          )}
        </div>
      )}
      
      {/* Badge for primary image */}
      {item.isPrimary && (
        <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
          Primary
        </div>
      )}
      
      {/* Move handle only for draggable images */}
      {!isFixed && item.type === 'image' && (
        <div className="absolute top-2 right-10 bg-black/60 hover:bg-black/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
          <Move className="h-4 w-4 text-white" />
        </div>
      )}

      {/* Delete button */}
      <button
        onClick={() => onDelete(item.id)}
        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="h-4 w-4 text-white" />
      </button>
    </div>
  );
};

export default MediaItem;

// Import Video component that was missing
import { Video } from 'lucide-react';
