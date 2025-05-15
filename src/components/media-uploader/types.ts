
// Basic types for media handling
export type MediaFile = File & {
  id: string;
  preview?: string;
  metadata?: MediaMetadata;
};

export type MediaMetadata = {
  size?: number;
  format?: string;
  duration?: number;
  width?: number;
  height?: number;
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
  metadata?: MediaMetadata;
};

// Add an alias for MediaItem to support the new naming convention
export type MediaItemType = MediaItem;

// Add the VideoInfo type
export type VideoInfo = {
  platform: 'youtube' | 'vimeo' | 'file' | null;
  id: string | null;
  metadata?: MediaMetadata;
};

// Add back the BusinessMediaUploaderProps interface that was removed
export interface BusinessMediaUploaderProps {
  initialImages?: MediaFile[];
  initialVideo?: MediaFile | null;
  initialVideoUrl?: string | null;
  galleryImages?: string[];
  disableImageUpload?: boolean;
  maxImages?: number;
  onImagesChange?: (images: MediaFile[]) => void;
  onVideoChange?: (video: MediaFile | null) => void;
  onVideoUrlChange?: (url: string | null) => void;
  onSetPrimaryImage?: (index: number) => void;
  onImagesReorder?: (reorderedImages: string[]) => void;
}
