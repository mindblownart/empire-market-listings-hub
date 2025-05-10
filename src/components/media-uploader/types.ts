
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
  maxImages?: number;
}

export type MediaItemType = {
  id: string;
  type: 'image' | 'video' | 'empty';
  file?: MediaFile;
  preview: string;
  url?: string;
  isPrimary?: boolean;
  isEmpty?: boolean;
  videoInfo?: {
    platform: string | null;
    id: string | null;
  };
  originalIndex?: number;
  isNew?: boolean; // Flag to differentiate between existing and new media
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

export interface MediaGalleryProps {
  images?: string[];
  newImages?: File[];
  videoUrl?: string | null;
  newVideo?: File | null;
  onSetPrimaryImage?: (index: number) => void;
  onReorderImages?: (reorderedImages: string[]) => void;
  onReorderNewImages?: (reorderedImages: File[]) => void;
  onDeleteImage?: (index: number) => void;
  onDeleteNewImage?: (index: number) => void;
  onDeleteVideo?: () => void;
  onDeleteNewVideo?: () => void;
}
