
import React from 'react';
import { Video, Plus } from 'lucide-react';

interface EmptySlotContentProps {
  index: number;
  isPrimary?: boolean;
}

const EmptySlotContent: React.FC<EmptySlotContentProps> = ({ index, isPrimary = false }) => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      {index === 1 ? (
        <div className="text-center p-2">
          <Video className="h-8 w-8 mx-auto text-gray-300 mb-1" />
          <p className="text-xs text-gray-400">Video</p>
          <p className="text-xs text-gray-300">(Optional)</p>
        </div>
      ) : (
        <div className="text-center p-2">
          <Plus className="h-8 w-8 mx-auto text-gray-300" />
          <p className="text-xs text-gray-400">
            {isPrimary ? 'Add Primary Image' : 'Add Image'}
          </p>
        </div>
      )}
    </div>
  );
};

export default EmptySlotContent;
