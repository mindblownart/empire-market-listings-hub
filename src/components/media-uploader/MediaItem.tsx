
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
      
      // If this is the video slot (index 1) or primary slot (index 0), prevent hover
      if (hoverIndex === 0 || hoverIndex === 1) return;
      if (dragIndex === 0 || dragIndex === 1) return;
      
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

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && !item.isEmpty) {
      onDelete(item.id);
    }
  };

  // Don't render delete button for empty slots
  const showDeleteButton = !item.isEmpty && !isFixed;
  const showSetPrimaryButton = !item.isEmpty && !item.isPrimary && item.type === 'image' && onSetPrimary;
  
  // Determine border color and opacity based on state
  let borderColorClass = 'border-gray-200';
  let bgClass = item.isEmpty ? 'bg-gray-50' : '';
  
  if (isDragging) {
    borderColorClass = 'border-dashed border-gray-400';
  } else if (isOver) {
    borderColorClass = 'border-primary';
    bgClass = 'bg-primary/5';
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
        bgClass,
        isDragging ? 'opacity-50' : 'opacity-100',
        item.isEmpty ? 'border-dashed hover:bg-gray-100 transition-colors' : ''
      )}
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
        <VideoItem item={item} onVideoPreview={onVideoPreview} />
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
        onSetPrimary={handleSetPrimary}
        onDelete={handleDelete}
        showSetPrimaryButton={!!showSetPrimaryButton}
        showDeleteButton={!!showDeleteButton}
      />
    </div>
  );
};

export default MediaItem;
