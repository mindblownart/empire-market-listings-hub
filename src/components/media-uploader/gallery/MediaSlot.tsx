
import React from 'react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { MediaItem } from '../types';
import DraggableMediaItem from './DraggableMediaItem';
import EmptySlotContent from './EmptySlotContent';

interface MediaSlotProps {
  item: MediaItem;
  index: number;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  onDelete: () => void;
  onPreview?: () => void;
  onVideoSlotClick?: () => void;
  isFixed?: boolean;
}

const MediaSlot: React.FC<MediaSlotProps> = ({
  item,
  index,
  moveItem,
  onDelete,
  onPreview,
  onVideoSlotClick,
  isFixed = false
}) => {
  // Handle click for videos or empty slots
  const handleClick = () => {
    if (item.type === 'video' && onPreview && !item.isEmpty) {
      onPreview();
    } else if (index === 1 && item.isEmpty && onVideoSlotClick) {
      onVideoSlotClick();
    }
  };

  // Determine if this is an empty slot
  const isEmpty = item.isEmpty || item.type === 'empty';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="h-full"
          onClick={isEmpty ? handleClick : undefined}
        >
          {isEmpty ? (
            <EmptySlotContent index={index} />
          ) : (
            <DraggableMediaItem
              item={item}
              index={index}
              moveItem={moveItem}
              onDelete={onDelete}
              onPreview={onPreview}
              isFixed={isFixed}
              handleClick={handleClick}
            />
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="top">
        {item.isEmpty ? (
          index === 1 ? 'Video slot (optional)' : 'Drop files here'
        ) : (
          index === 0 ? 'Primary image (drag to reorder)' : 
          index === 1 ? 'Video (fixed position)' : 
          `Image ${index} (can be reordered)`
        )}
      </TooltipContent>
    </Tooltip>
  );
};

export default MediaSlot;
