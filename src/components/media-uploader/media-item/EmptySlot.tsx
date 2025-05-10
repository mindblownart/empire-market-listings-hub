
import React from 'react';
import { Video, Plus, Image } from 'lucide-react';

interface EmptySlotProps {
  index: number;
  type: 'image' | 'video' | 'empty';
  isPrimary?: boolean;
}

const EmptySlot: React.FC<EmptySlotProps> = ({ index, type, isPrimary }) => {
  return (
    <div className="w-full h-full bg-gray-50 flex items-center justify-center">
      {type === 'video' ? (
        // Empty video slot
        <div className="text-center p-2">
          <Video className="w-8 h-8 mx-auto text-gray-300 mb-1" />
          <p className="text-xs text-gray-400">Video</p>
          <p className="text-xs text-gray-300">(Optional)</p>
        </div>
      ) : (
        // Empty image slot
        <div className="text-center p-2">
          {isPrimary ? (
            <>
              <Image className="w-8 h-8 mx-auto text-gray-300 mb-1" />
              <p className="text-xs text-gray-400">Primary Image</p>
            </>
          ) : (
            <>
              <Plus className="w-6 h-6 mx-auto text-gray-300 mb-1" />
              <p className="text-xs text-gray-400">Add image</p>
              <p className="text-xs text-gray-300">Drop files here</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptySlot;
