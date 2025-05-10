
import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { MediaItem as MediaItemType, DragItem } from './types';
import { cn } from '@/lib/utils';
import { X, GripVertical, Play } from 'lucide-react';

interface MediaItemProps {
  item: MediaItemType;
  index: number;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  onDelete: () => void;
  onPreview?: () => void;
  isFixed?: boolean;
}

// Item type for drag and drop
const ITEM_TYPE = 'media-item';

const MediaItem: React.FC<MediaItemProps> = ({ 
  item, 
  index, 
  moveItem, 
  onDelete,
  onPreview,
  isFixed = false
}) => {
  const ref = useRef<HTMLDivElement>(null);

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
      
      // Don't allow dropping into fixed position
      if (isFixed) return;
      
      // Only perform the move when the mouse has crossed half of the item height
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      
      // Dragging downwards
      if (draggedItem.index < index && hoverClientY < hoverMiddleY) {
        return;
      }
      
      // Dragging upwards
      if (draggedItem.index > index && hoverClientY > hoverMiddleY) {
        return;
      }
      
      // Time to actually perform the action
      moveItem(draggedItem.index, index);
      
      // Update the index for the drag source
      draggedItem.index = index;
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });
  
  // Fix the reference issue by proper assignment - use ref callback pattern
  const dragDropRef = (node: HTMLDivElement | null) => {
    // Apply the drag ref
    if (!isFixed) {
      drag(node);
    }
    // Apply the drop ref
    drop(node);
    // Set the ref value
    if (ref.current !== node) {
      ref.current = node;
    }
  };
  
  // Determine if this is an empty slot
  const isEmpty = item.isEmpty || item.type === 'empty';

  // Determine the class names based on state
  const itemClasses = cn(
    "relative rounded-md overflow-hidden aspect-square border-2",
    isDragging ? "opacity-50 border-dashed border-gray-400" : "border-gray-200",
    isOver ? "border-primary bg-primary/5" : "",
    item.isPrimary ? "border-primary" : "",
    isEmpty ? "border-dashed border-gray-300" : "",
    isFixed ? "cursor-default" : isEmpty ? "cursor-pointer" : "cursor-move",
    "group"
  );
  
  // Handle click for videos
  const handleClick = () => {
    if (item.type === 'video' && onPreview && !isEmpty) {
      onPreview();
    }
  };

  // Render empty slot
  if (isEmpty) {
    return (
      <div className={itemClasses}>
        <div className="w-full h-full flex items-center justify-center">
          {index === 1 ? (
            <div className="text-center p-2">
              <Play className="h-8 w-8 mx-auto text-gray-300 mb-1" />
              <p className="text-xs text-gray-400">Video</p>
              <p className="text-xs text-gray-300">(Optional)</p>
            </div>
          ) : (
            <div className="text-center p-2">
              <span className="text-2xl text-gray-300">+</span>
              <p className="text-xs text-gray-400">Add image</p>
            </div>
          )}
        </div>
      </div>
    );
  }

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
        <div className="absolute top-2 left-2 bg-primary/90 text-white text-xs px-2 py-1 rounded-full z-20">
          Primary
        </div>
      )}
      
      {/* Video badge */}
      {index === 1 && item.type === 'video' && (
        <div className="absolute top-2 left-2 bg-gray-700/80 text-white text-xs px-2 py-1 rounded-full z-20">
          Video
        </div>
      )}
      
      {/* Grip handle for draggable items */}
      {!isFixed && (
        <div className="absolute top-2 right-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-black/70 rounded-full p-1.5 cursor-grab">
            <GripVertical className="h-3.5 w-3.5 text-white" />
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
      >
        <X className="h-3.5 w-3.5 text-white" />
      </button>
      
      {/* Drop indicator */}
      {isOver && !isDragging && !isFixed && (
        <div className="absolute inset-0 bg-primary/10 border-2 border-primary border-dashed rounded-md z-10" />
      )}
    </div>
  );
};

export default MediaItem;
