
import React from 'react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { MediaItem } from '../types';
import DraggableMediaItem from './DraggableMediaItem';
import EmptySlotContent from './EmptySlotContent';
import { VIDEO_SLOT_INDEX } from '../utils/constants';

interface MediaSlotProps {
  item: MediaItem;
  index: number;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  onDelete: () => void;
  onPreview?: () => void;
  onVideoSlotClick?: () => void;
}

const MediaSlot: React.FC<MediaSlotProps> = ({
  item,
  index,
  moveItem,
  onDelete,
  onPreview,
  onVideoSlotClick
}) => {
  // Determine if this is a fixed position
  const isFixed = index === VIDEO_SLOT_INDEX;
  
  // Handle click for videos or empty slots
  const handleClick = () => {
    if (item.type === 'video' && onPreview && !item.isEmpty) {
      onPreview();
    } else if (index === VIDEO_SLOT_INDEX && item.isEmpty && onVideoSlotClick) {
      onVideoSlotClick();
    }
  };

  // Determine if this is an empty slot
  const isEmpty = item.isEmpty || item.type === 'empty';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div 
          className="h-full"
          onClick={isEmpty ? handleClick : undefined}
        >
          {isEmpty ? (
            <div className="border-2 border-dashed rounded-md aspect-square flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors border-gray-300">
              <EmptySlotContent index={index} isPrimary={index === 0} />
            </div>
          ) : (
            <DraggableMediaItem
              item={item}
              index={index}
              moveItem={moveItem}
              onDelete={onDelete}
              onPreview={onPreview}
              handleClick={handleClick}
            />
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="top">
        {item.isEmpty ? (
          index === VIDEO_SLOT_INDEX ? 'Video slot (optional)' : 'Drop files here'
        ) : (
          index === 0 ? 'Primary image (drag to reorder)' : 
          index === VIDEO_SLOT_INDEX ? 'Video (fixed position)' : 
          `Image ${index} (can be reordered)`
        )}
      </TooltipContent>
    </Tooltip>
  );
};

export default MediaSlot;
