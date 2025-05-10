
import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { cn } from '@/lib/utils';
import { MediaItemProps } from './types';
import { EmptySlot, ImageItem, VideoItem, MediaItemBadges, MediaItemActions } from './media-item';

const MediaItem: React.FC<MediaItemProps> = ({ 
  item, 
  index, 
  moveItem, 
  onDelete,
  onVideoPreview,
  isFixed = false
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'media-item',
    item: () => ({ id: item.id, index }),
    canDrag: !isFixed && !item.isEmpty && item.type === 'image',
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'media-item',
    hover: (draggedItem: { id: string; index: number }, monitor) => {
      if (!ref.current) return;
      const dragIndex = draggedItem.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) return;
      
      // Don't allow dropping onto fixed video slot (index 1)
      if (hoverIndex === 1 && item.type === 'video') return;
      
      // Calculate mouse position
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
      const clientOffset = monitor.getClientOffset();
      
      // Get horizontal position
      const hoverClientX = clientOffset ? clientOffset.x - hoverBoundingRect.left : 0;
      
      // Only perform the move when the mouse has crossed half of the items height/width
      if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) return;
      if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) return;

      moveItem(dragIndex, hoverIndex);
      draggedItem.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  // Apply drag and drop refs
  const dragDropRef = (node: HTMLDivElement | null) => {
    ref.current = node;
    
    // Only apply drag ref if item is draggable
    if (!isFixed && !item.isEmpty && item.type === 'image') {
      drag(node);
    }
    
    // Always apply drop ref unless it's the video slot (index 1)
    if (!(index === 1 && item.type === 'video')) {
      drop(node);
    }
  };

  const handleVideoClick = () => {
    if (item.type === 'video' && !item.isEmpty && onVideoPreview) {
      onVideoPreview(item);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && !item.isEmpty) {
      onDelete(item.id);
    }
  };

  // Don't render delete button for empty slots
  const showDeleteButton = !item.isEmpty;
  
  // Determine border color and opacity based on state
  let borderColorClass = 'border-gray-200';
  let bgClass = item.isEmpty ? 'bg-gray-50' : '';
  
  if (isDragging) {
    borderColorClass = 'border-dashed border-gray-400';
    bgClass = 'bg-gray-50/50';
  } else if (isOver) {
    borderColorClass = 'border-primary';
    bgClass = 'bg-primary/5';
  } else if (item.isPrimary) {
    borderColorClass = 'border-primary';
  }

  return (
    <div 
      ref={dragDropRef}
      data-type={item.type}
      data-index={index}
      className={cn(
        "relative group aspect-square rounded-md overflow-hidden border-2 transition-all",
        borderColorClass,
        bgClass,
        isDragging ? 'opacity-60 scale-95' : 'opacity-100',
        item.isEmpty ? 'border-dashed hover:bg-gray-100 transition-colors' : '',
        isFixed && !item.isEmpty ? 'cursor-default' : (item.isEmpty ? 'cursor-pointer' : 'cursor-grab')
      )}
      onClick={item.type === 'video' ? handleVideoClick : undefined}
    >
      {item.isEmpty ? (
        <EmptySlot 
          index={index} 
          type={item.type} 
          isPrimary={index === 0} 
        />
      ) : item.type === 'image' ? (
        <ImageItem item={item} />
      ) : (
        <VideoItem item={item} onVideoPreview={onVideoPreview ? onVideoPreview : () => {}} />
      )}
      
      <MediaItemBadges 
        index={index}
        isEmpty={!!item.isEmpty}
        isNew={!!item.isNew}
        isPrimary={!!item.isPrimary}
      />
      
      <MediaItemActions 
        isEmpty={!!item.isEmpty}
        isFixed={isFixed}
        isPrimary={!!item.isPrimary}
        type={item.type}
        onSetPrimary={null}
        onDelete={handleDelete}
        showSetPrimaryButton={false}
        showDeleteButton={showDeleteButton}
      />

      {/* Drop indicator */}
      {isOver && !isDragging && (
        <div className="absolute inset-0 bg-primary/10 border-2 border-primary border-dashed rounded-md z-10" />
      )}
    </div>
  );
};

export default MediaItem;
