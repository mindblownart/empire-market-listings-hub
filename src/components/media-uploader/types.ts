
export interface MediaFile extends File {
  id: string;
  preview?: string;
}

export interface VideoInfo {
  platform: 'youtube' | 'vimeo' | 'file' | null;
  id: string | null;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  file?: MediaFile;
  url?: string;
  preview: string;
  isPrimary: boolean;
  isNew?: boolean;
  videoInfo?: VideoInfo;
}

export interface MediaUploadProps {
  images: MediaItem[];
  videoItem: MediaItem | null;
  onImagesChange: (images: MediaItem[]) => void;
  onVideoChange: (video: MediaItem | null) => void;
  onVideoUrlChange: (url: string | null) => void;
  maxImages?: number;
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
}

export interface DragItem {
  id: string;
  index: number;
  type: string;
}
