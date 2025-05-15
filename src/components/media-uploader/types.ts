
// Basic types for media handling
export type MediaFile = File & {
  id: string;
  preview?: string;
};

export type DragItem = {
  id: string;
  index: number;
  type: string;
};

export type MediaItem = {
  id: string;
  type: string;
  preview: string;
  url?: string;
  file?: MediaFile | File;
  isPrimary?: boolean;
  isEmpty?: boolean;
  isNew?: boolean;
  videoInfo?: VideoInfo;
};

// Add an alias for MediaItem to support the new naming convention
export type MediaItemType = MediaItem;

// Add the VideoInfo type
export type VideoInfo = {
  platform: 'youtube' | 'vimeo' | 'file' | null;
  id: string | null;
};
