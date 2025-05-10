
import React from 'react';
import { MediaItemType } from '../types';

interface ImageItemProps {
  item: MediaItemType;
}

const ImageItem: React.FC<ImageItemProps> = ({ item }) => {
  return (
    <img 
      src={item.preview} 
      alt="Media preview" 
      className="w-full h-full object-cover"
      loading="lazy"
    />
  );
};

export default ImageItem;
