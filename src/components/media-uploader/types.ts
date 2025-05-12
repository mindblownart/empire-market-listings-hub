
export interface MediaFile extends File {
  id: string;
  preview?: string;
  originalFile?: File;
}

export interface VideoInfo {
  platform: 'youtube' | 'vimeo' | 'file' | null;
  id: string | null;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'empty';
  file?: MediaFile;
  url?: string;
  preview: string;
  isPrimary: boolean;
  isNew?: boolean;
  isEmpty?: boolean;
  videoInfo?: VideoInfo;
}

export interface DragItem {
  id: string;
  index: number;
  type: string;
}

export interface MediaUploadProps {
  existingImages?: string[];
  existingVideoUrl?: string | null;
  onImagesChange: (images: MediaFile[]) => void;
  onVideoChange: (video: MediaFile | null) => void;
  onVideoUrlChange: (url: string | null) => void;
  maxImages?: number;
  onDeleteExistingImage?: (index: number) => void;
  onDeleteExistingVideo?: () => void;
  onImagesReorder?: (images: string[]) => void;
}

export interface BusinessMediaUploaderProps {
  initialImages?: File[] | string[];
  initialVideo?: File | null;
  initialVideoUrl?: string | null;
  galleryImages?: string[];
  disableImageUpload?: boolean;
  maxImages?: number;
  onImagesChange?: (images: File[]) => void;
  onVideoChange?: (video: File | null) => void;
  onVideoUrlChange?: (url: string) => void;
  onSetPrimaryImage?: (index: number) => void;
  onImagesReorder?: (reorderedImages: string[]) => void;
}

