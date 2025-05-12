
export type MediaFile = File & {
  id?: string;
  preview?: string;
};

export type MediaItem = {
  id: string;
  type: 'image' | 'video' | 'empty';
  preview?: string;
  url?: string;
  file?: MediaFile | File;
  isPrimary?: boolean;
  isEmpty?: boolean;
  isNew?: boolean; // Add this property to fix the TypeScript errors
  videoInfo?: VideoInfo;
};

// Add the VideoInfo type
export type VideoInfo = {
  platform: 'youtube' | 'vimeo' | 'file';
  id?: string;
};

// Add the DragItem type
export type DragItem = {
  id: string;
  index: number;
  type: string;
};

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
