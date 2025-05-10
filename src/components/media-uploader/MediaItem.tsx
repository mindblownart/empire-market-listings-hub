
import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Move, X, Play, Star, Video, Image, Plus } from 'lucide-react';
import { MediaItemProps, MediaItemType } from './types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const MediaItem: React.FC<MediaItemProps> = ({ 
  item, 
  index, 
  moveItem, 
  onDelete,
  onVideoPreview,
  onSetPrimary,
  isFixed = false
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'media-item',
    item: { id: item.id, index },
    canDrag: !isFixed && item.type === 'image' && !item.isEmpty,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [{ isOver }, drop] = useDrop({
    accept: 'media-item',
    hover: (draggedItem: { id: string; index: number }, monitor) => {
      if (!ref.current) return;
      const dragIndex = draggedItem.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) return;
      
      // If this is the video slot (index 1) or trying to move to primary slot (index 0), prevent it
      if (hoverIndex <= 1) return;
      if (dragIndex <= 1) return;
      
      // Don't allow dropping onto empty slots beyond the first available one
      if (item.type === 'empty' && hoverIndex > 0) {
        const emptySlotIndex = Array.from(ref.current.parentElement?.children || [])
          .findIndex(el => (el as HTMLElement).dataset.type === 'empty');
        
        if (emptySlotIndex !== -1 && hoverIndex > emptySlotIndex) return;
      }

      moveItem(dragIndex, hoverIndex);
      draggedItem.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  });

  // Only add drag ref if not fixed and not empty
  if (!isFixed && item.type === 'image' && !item.isEmpty) {
    drag(drop(ref));
  } else {
    drop(ref);
  }

  const handleVideoClick = () => {
    if (item.type === 'video' && !item.isEmpty && onVideoPreview) {
      onVideoPreview(item);
    }
  };

  const handleSetPrimary = () => {
    if (onSetPrimary && !item.isPrimary && item.type === 'image') {
      onSetPrimary(item.id);
    }
  };

  // Don't render delete button for empty slots
  const showDeleteButton = !item.isEmpty;
  const showSetPrimaryButton = !item.isEmpty && !item.isPrimary && item.type === 'image' && onSetPrimary;
  
  // Determine border color and opacity based on state
  let borderColorClass = 'border-gray-200';
  if (isDragging) {
    borderColorClass = 'border-dashed border-gray-400';
  } else if (isOver) {
    borderColorClass = 'border-primary';
  } else if (item.isPrimary) {
    borderColorClass = 'border-primary';
  }

  return (
    <div 
      ref={ref}
      data-type={item.type}
      className={cn(
        "relative group aspect-square rounded-md overflow-hidden border-2",
        borderColorClass,
        isDragging ? 'opacity-50' : 'opacity-100',
        item.type === 'empty' ? 'border-dashed' : ''
      )}
    >
      {item.isEmpty ? (
        // Empty slot rendering
        item.type === 'video' ? (
          // Empty video slot
          <div className="w-full h-full bg-gray-50 flex items-center justify-center">
            <div className="text-center p-2">
              <Video className="w-8 h-8 mx-auto text-gray-300 mb-1" />
              <p className="text-xs text-gray-400">Video</p>
              <p className="text-xs text-gray-300">(Optional)</p>
            </div>
          </div>
        ) : (
          // Empty image slot
          <div className="w-full h-full bg-gray-50 flex items-center justify-center">
            <div className="text-center p-2">
              <Plus className="w-6 h-6 mx-auto text-gray-300 mb-1" />
              <p className="text-xs text-gray-400">Add image</p>
            </div>
          </div>
        )
      ) : item.type === 'image' ? (
        // Image rendering
        <img 
          src={item.preview} 
          alt="Media preview" 
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        // Video rendering
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
                loading="lazy"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
                <Play className="text-white w-12 h-12" />
              </div>
            </div>
          ) : (
            <div 
              className="text-center p-2 cursor-pointer" 
              onClick={handleVideoClick}
            >
              <Video className="w-10 h-10 mx-auto text-gray-500 mb-1" />
              <p className="text-xs truncate text-gray-600">Video</p>
            </div>
          )}
        </div>
      )}
      
      {/* Position indicator badges */}
      {index === 0 && (
        <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <Star className="h-3 w-3" /> Primary
        </div>
      )}
      
      {/* Badge for empty but special slots */}
      {item.isEmpty && index === 1 && (
        <div className="absolute top-2 left-2 bg-gray-500/70 text-white text-xs px-2 py-1 rounded-full">
          Video Slot
        </div>
      )}
      
      {/* Badge for new media */}
      {item.isNew && !item.isEmpty && (
        <div className="absolute top-2 right-12 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
          New
        </div>
      )}
      
      {/* Set Primary button */}
      {showSetPrimaryButton && (
        <button
          onClick={handleSetPrimary}
          className="absolute bottom-2 left-2 bg-primary hover:bg-primary/90 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Star className="h-3.5 w-3.5 text-white" />
        </button>
      )}
      
      {/* Move handle only for draggable items */}
      {!isFixed && !item.isEmpty && item.type === 'image' && (
        <div className="absolute top-2 right-10 bg-black/60 hover:bg-black/80 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
          <Move className="h-3.5 w-3.5 text-white" />
        </div>
      )}

      {/* Delete button */}
      {showDeleteButton && (
        <button
          onClick={() => onDelete(item.id)}
          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="h-3.5 w-3.5 text-white" />
        </button>
      )}
    </div>
  );
};

export default MediaItem;
