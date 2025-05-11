
import React from 'react';
import { Video } from 'lucide-react';

interface EmptySlotContentProps {
  index: number;
}

const EmptySlotContent: React.FC<EmptySlotContentProps> = ({ index }) => {
  return (
    <div className="border-2 border-dashed rounded-md aspect-square flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors border-gray-300">
      <div className="text-center p-2">
        {index === 1 ? (
          <div className="text-center p-2">
            <Video className="h-8 w-8 mx-auto text-gray-300 mb-1" />
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
};

export default EmptySlotContent;
