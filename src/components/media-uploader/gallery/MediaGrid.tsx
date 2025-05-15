
import React from 'react';
import { MediaItemType } from '../types';
import MediaSlot from './MediaSlot';

interface MediaGridProps {
  items: MediaItemType[];
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  onDelete: (id: string) => void;
  onPreview: (item: MediaItemType) => void;
  onVideoSlotClick?: () => void;
  isDragging: boolean;
  onDrop: (e: React.DragEvent) => void;
}

const MediaGrid: React.FC<MediaGridProps> = ({
  items,
  moveItem,
  onDelete,
  onPreview,
  onVideoSlotClick,
  isDragging,
  onDrop,
}) => {
  return (
    <div 
      className={`grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 ${isDragging ? 'border-2 border-dashed border-primary rounded-lg p-2' : ''}`}
      onDragOver={(e) => e.preventDefault()}
    >
      {items.map((item, index) => (
        <div 
          key={item.id}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDrop(e);
          }}
          className="h-full"
        >
          <MediaSlot
            item={item}
            index={index}
            moveItem={moveItem}
            onDelete={() => onDelete(item.id)}
            onPreview={() => onPreview(item)}
            onVideoSlotClick={index === 1 ? onVideoSlotClick : undefined}
          />
        </div>
      ))}
    </div>
  );
};

export default MediaGrid;
