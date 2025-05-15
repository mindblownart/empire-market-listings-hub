
import { FileWithPath } from 'react-dropzone';

// Primary media item type used throughout the application
export type MediaItemType = {
  id: string;
  type: 'image' | 'video' | 'empty';
  file?: MediaFile;
  url?: string;
  preview: string;
  isPrimary: boolean;
  isEmpty?: boolean;
  videoInfo?: VideoInfo | null;
  metadata?: MediaMetadata;
  isNew?: boolean;
};

// For backwards compatibility
export type MediaItem = MediaItemType;

// For drag and drop functionality
export type DragItem = {
  id: string;
  index: number;
  type: string;
};

// File with additional metadata
export interface MediaFile extends File {
  id: string;
  preview?: string;
  metadata?: MediaMetadata;
  originalFile?: File;
}

export interface MediaMetadata {
  size: number;
  format: string;
  duration?: number;
  width?: number;
  height?: number;
}

// VideoInfo interface aligned across all imports
export interface VideoInfo {
  platform: string;
  id: string | null;
}

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
