
// Define accepted mime types and file extensions
export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

export const ACCEPTED_VIDEO_TYPES = [
  'video/mp4'
];

// Image processing configuration
export const MAX_IMAGE_WIDTH = 1600;
export const MAX_IMAGE_HEIGHT = 2000;
export const TARGET_IMAGE_SIZE_MB = 5;  // Updated to 5MB per requirement
export const IMAGE_QUALITY_START = 0.9;
export const IMAGE_QUALITY_MIN = 0.7;

// Video processing configuration
export const MAX_VIDEO_SIZE_MB = 20;
export const TARGET_VIDEO_HEIGHT = 720;

// Gallery configuration
export const MAX_IMAGES = 11;
export const VIDEO_SLOT_INDEX = 1;  // Video is always in slot 2 (index 1)
