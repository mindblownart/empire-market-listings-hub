
import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { MediaItemType, DragItem } from '../types';
import { cn } from '@/lib/utils';
import { X, Move, Play, Star } from 'lucide-react';
import { VIDEO_SLOT_INDEX } from '../utils/constants';

interface DraggableMediaItemProps {
  item: MediaItemType;
  index: number;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  onDelete: () => void;
  onPreview?: () => void;
  handleClick?: () => void;
}

// Item type for drag and drop
const ITEM_TYPE = 'media-item';

const DraggableMediaItem: React.FC<DraggableMediaItemProps> = ({ 
  item, 
  index, 
  moveItem, 
  onDelete,
  onPreview,
  handleClick
}) => {
  const ref = useRef<HTMLDivElement>(null);
  
  // Determine if this is a fixed position (video is fixed at index 1)
  const isFixed = index === VIDEO_SLOT_INDEX;

  // Set up drag functionality - not allowed for fixed items or empty slots
  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: () => ({ id: item.id, index, type: item.type }) as DragItem,
    canDrag: !isFixed && !item.isEmpty && item.type !== 'empty',
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Set up drop functionality
  const [{ isOver }, drop] = useDrop({
    accept: ITEM_TYPE,
    hover: (draggedItem: DragItem, monitor) => {
      if (!ref.current) return;
      
      // Don't replace items with themselves
      if (draggedItem.index === index) return;
      
      // Don't allow dropping into fixed position (video slot)
      if (isFixed) return;
      
      // Time to actually perform the action
      moveItem(draggedItem.index, index);
      
      // Update the index for the drag source
      draggedItem.index = index;
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });
  
  // Fix the reference issue by proper assignment
  const dragDropRef = (node: HTMLDivElement | null) => {
    drag(drop(node));
    ref.current = node;
  };

  // Determine the class names based on state
  const itemClasses = cn(
    "relative rounded-md overflow-hidden aspect-square border-2",
    isDragging ? "opacity-50 border-dashed border-gray-400" : "border-gray-200",
    isOver ? "border-primary bg-primary/5" : "",
    item.isPrimary ? "border-primary" : "",
    isFixed ? "cursor-default" : "cursor-move",
    "group"
  );

  return (
    <div 
      ref={dragDropRef}
      className={itemClasses}
      onClick={item.type === 'video' ? handleClick : undefined}
    >
      {/* Media content */}
      <div className="w-full h-full">
        {item.type === 'image' ? (
          <img 
            src={item.preview} 
            alt="Media item" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="relative w-full h-full">
            <img 
              src={item.preview} 
              alt="Video thumbnail" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <Play className="h-12 w-12 text-white" />
            </div>
          </div>
        )}
      </div>
      
      {/* Primary badge */}
      {item.isPrimary && (
        <div className="absolute top-2 left-2 bg-primary/90 text-white text-xs px-2 py-1 rounded-full z-20 flex items-center gap-1">
          <Star className="h-3 w-3" /> Primary
        </div>
      )}
      
      {/* New badge - for newly optimized images */}
      {item.isNew && !item.isPrimary && (
        <div className="absolute top-2 left-2 bg-blue-500/90 text-white text-xs px-2 py-1 rounded-full z-20">
          Optimized
        </div>
      )}
      
      {/* Video badge */}
      {index === 1 && item.type === 'video' && (
        <div className="absolute top-2 left-2 bg-gray-700/80 text-white text-xs px-2 py-1 rounded-full z-20">
          Video
        </div>
      )}
      
      {/* Drag handle overlay on hover */}
      {!isFixed && !item.isEmpty && (
        <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors opacity-0 group-hover:opacity-100 flex items-center justify-center">
          <div className="bg-black/50 rounded-full p-2">
            <Move className="h-6 w-6 text-white" />
          </div>
        </div>
      )}
      
      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute top-2 right-2 bg-red-500/90 hover:bg-red-600 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20"
        aria-label="Delete"
      >
        <X className="h-3.5 w-3.5 text-white" />
      </button>
      
      {/* Drop indicator */}
      {isOver && !isDragging && !isFixed && (
        <div className="absolute inset-0 bg-primary/10 border-2 border-primary border-dashed rounded-md z-10 flex items-center justify-center">
          <div className="bg-primary/70 text-white px-3 py-1.5 rounded-full text-xs">
            Drop Here
          </div>
        </div>
      )}
    </div>
  );
};

export default DraggableMediaItem;
