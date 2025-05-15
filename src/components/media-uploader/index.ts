
export { default as MediaItem } from './MediaItem';
export { default as MediaGallery } from './MediaGallery';
export { default as MediaUpload } from './MediaUpload';
export { default as VideoPreviewModal } from './VideoPreviewModal';
export { default as EmptySlot } from './EmptySlot';
export { default as DragContext } from './DragContext';
export * from './gallery';

// Export types properly
export type { 
  MediaFile, 
  MediaItemType, 
  MediaItem,
  DragItem, 
  VideoInfo,
  BusinessMediaUploaderProps,
  MediaMetadata
} from './types';

export * from './video-utils';
export * from './media-processing';
