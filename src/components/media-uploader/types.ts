import { FileWithPath } from 'react-dropzone';

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

export interface MediaFile extends FileWithPath {
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

// Update the VideoInfo interface to make id optional to match with video-utils.ts
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
