
export interface MediaFile extends File {
  preview?: string;
  id: string;
}

export interface BusinessMediaUploaderProps {
  onImagesChange?: (images: File[]) => void;
  onVideoChange?: (video: File | null) => void;
  onVideoUrlChange?: (url: string) => void;
  initialImages?: File[] | string[];
  initialVideo?: File | null;
  initialVideoUrl?: string | null;
  disableImageUpload?: boolean;
  galleryImages?: string[];
  onSetPrimaryImage?: (index: number) => void;
}

export type MediaItemType = {
  id: string;
  type: 'image' | 'video';
  file?: MediaFile;
  preview: string;
  url?: string;
  isPrimary?: boolean;
  videoInfo?: {
    platform: string | null;
    id: string | null;
  };
  originalIndex?: number;
};

export interface MediaItemProps { 
  item: MediaItemType; 
  index: number; 
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  onDelete: (id: string) => void;
  onVideoPreview: (item: MediaItemType) => void;
  onSetPrimary?: (id: string) => void;
  isFixed?: boolean;
}
