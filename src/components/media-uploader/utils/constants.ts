
// Maximum allowed images
export const MAX_IMAGES = 10;

// Maximum total media files (images + video)
export const MAX_TOTAL_MEDIA = 11;

// Fixed position for video in the media grid
export const VIDEO_SLOT_INDEX = 1;

// Accepted image file types
export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/tiff',
  'image/svg+xml'
];

// Accepted video file types
export const ACCEPTED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime'
];

// Maximum file size in bytes (20MB)
export const MAX_FILE_SIZE = 20 * 1024 * 1024;

// Maximum video duration in seconds (5 minutes)
export const MAX_VIDEO_DURATION = 300;

// Maximum video resolution (720p)
export const MAX_VIDEO_HEIGHT = 720;

// Maximum target size for images in MB
export const TARGET_IMAGE_SIZE_MB = 5;

// Maximum size for videos in MB
export const MAX_VIDEO_SIZE_MB = 20;

// Image processing constants
export const MAX_IMAGE_WIDTH = 1920;
export const MAX_IMAGE_HEIGHT = 1080;
export const IMAGE_QUALITY_START = 0.9;
export const IMAGE_QUALITY_MIN = 0.5;
