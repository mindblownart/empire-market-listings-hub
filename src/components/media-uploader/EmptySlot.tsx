
import React from 'react';
import { Plus, Video } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptySlotProps {
  type: 'image' | 'video';
  isOver: boolean;
  isPrimary?: boolean;
}

const EmptySlot: React.FC<EmptySlotProps> = ({ type, isOver, isPrimary = false }) => {
  return (
    <div 
      className={cn(
        "border-2 border-dashed rounded-md aspect-square flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors",
        isOver ? "border-primary bg-primary/5" : "border-gray-300",
        isPrimary ? "border-primary/50" : ""
      )}
    >
      <div className="text-center p-2">
        {type === 'video' ? (
          <>
            <Video className="w-8 h-8 mx-auto text-gray-400" />
            <p className="text-xs text-gray-500 mt-1">Video</p>
            <p className="text-xs text-gray-400">(Optional)</p>
          </>
        ) : (
          <>
            <Plus className="w-8 h-8 mx-auto text-gray-400" />
            <p className="text-xs text-gray-500 mt-1">
              {isPrimary ? 'Add Primary Image' : 'Add Image'}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default EmptySlot;
