
// Accepted media types
export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg', 
  'image/png', 
  'image/gif', 
  'image/webp', 
  'image/svg+xml'
];

export const ACCEPTED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg'
];

// Grid configuration
export const MAX_IMAGES = 10;
export const VIDEO_SLOT_INDEX = 1;
export const MAX_TOTAL_MEDIA = 11; // 1 video + 10 images

// Display constants
export const MAX_VIDEO_HEIGHT = 600; // pixels

// Size limits
export const TARGET_IMAGE_SIZE_MB = 5; // MB
export const MAX_VIDEO_SIZE_MB = 100; // MB - increased from typical 20MB to support larger videos
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB in bytes

// Image processing constants
export const MAX_IMAGE_WIDTH = 1920; // pixels
export const MAX_IMAGE_HEIGHT = 1080; // pixels
export const IMAGE_QUALITY_START = 0.9; // Starting quality for compression
export const IMAGE_QUALITY_MIN = 0.5; // Minimum quality for compression

// Video processing constants
export const MAX_VIDEO_DURATION = 300; // seconds (5 minutes)
