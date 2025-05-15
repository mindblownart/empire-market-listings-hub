
// Maximum number of images allowed
export const MAX_IMAGES = 8;

// Maximum size for images in MB
export const MAX_IMAGE_SIZE_MB = 10;

// Maximum size for videos in MB - increased to support larger videos
export const MAX_VIDEO_SIZE_MB = 100;

// Default video slot index
export const VIDEO_SLOT_INDEX = 1;

// Accepted image types
export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg', 
  'image/png', 
  'image/webp', 
  'image/heic', 
  'image/heif'
];

// Accepted video types
export const ACCEPTED_VIDEO_TYPES = [
  'video/mp4', 
  'video/webm', 
  'video/quicktime', 
  'video/x-msvideo'
];

// Maximum total media items (images + video)
export const MAX_TOTAL_MEDIA = 9; // 8 images + 1 video
