
import React from 'react';
import { Move, X } from 'lucide-react';

interface MediaItemActionsProps {
  isEmpty: boolean;
  isFixed: boolean;
  isPrimary: boolean;
  type: 'image' | 'video' | 'empty';
  onSetPrimary: (() => void) | null;
  onDelete: (e: React.MouseEvent) => void;
  showSetPrimaryButton: boolean;
  showDeleteButton: boolean;
}

const MediaItemActions: React.FC<MediaItemActionsProps> = ({ 
  isEmpty, 
  isFixed, 
  isPrimary,
  type,
  onSetPrimary,
  onDelete,
  showSetPrimaryButton,
  showDeleteButton
}) => {
  return (
    <>
      {/* Move handle only for draggable items */}
      {!isFixed && !isEmpty && type === 'image' && (
        <div className="absolute top-2 right-10 bg-black/60 hover:bg-black/80 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
          <Move className="h-3.5 w-3.5 text-white" />
        </div>
      )}

      {/* Delete button */}
      {showDeleteButton && (
        <button
          onClick={onDelete}
          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="h-3.5 w-3.5 text-white" />
        </button>
      )}
    </>
  );
};

export default MediaItemActions;
