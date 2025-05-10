
import React from 'react';
import { Star } from 'lucide-react';

interface MediaItemBadgesProps {
  index: number;
  isEmpty: boolean;
  isNew: boolean;
  isPrimary: boolean;
}

const MediaItemBadges: React.FC<MediaItemBadgesProps> = ({ index, isEmpty, isNew, isPrimary }) => {
  return (
    <>
      {/* Primary badge */}
      {(index === 0 || isPrimary) && (
        <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 z-10">
          <Star className="h-3 w-3" /> Primary
        </div>
      )}
      
      {/* Badge for empty but special slots */}
      {isEmpty && index === 1 && (
        <div className="absolute top-2 left-2 bg-gray-500/70 text-white text-xs px-2 py-1 rounded-full z-10">
          Video Slot
        </div>
      )}
      
      {/* Badge for new media */}
      {isNew && !isEmpty && (
        <div className="absolute top-2 right-12 bg-blue-500 text-white text-xs px-2 py-1 rounded-full z-10">
          New
        </div>
      )}
    </>
  );
};

export default MediaItemBadges;
