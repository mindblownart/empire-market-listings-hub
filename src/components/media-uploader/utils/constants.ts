
// Maximum number of images allowed
export const MAX_IMAGES = 8;

// Maximum size for images in MB
export const MAX_IMAGE_SIZE_MB = 10;

// Target size for images after optimization in MB
export const TARGET_IMAGE_SIZE_MB = 5;

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

// Size limits
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB in bytes

// Image processing constants
export const MAX_IMAGE_WIDTH = 1920; // pixels
export const MAX_IMAGE_HEIGHT = 1080; // pixels
export const IMAGE_QUALITY_START = 0.9; // Starting quality for compression
export const IMAGE_QUALITY_MIN = 0.5; // Minimum quality for compression

// Video processing constants
export const MAX_VIDEO_HEIGHT = 720; // pixels
export const MAX_VIDEO_DURATION = 300; // seconds (5 minutes)
