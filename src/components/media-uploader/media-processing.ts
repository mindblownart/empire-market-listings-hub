
import { MediaFile } from './types';
import { 
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_VIDEO_TYPES,
  MAX_FILE_SIZE,
  MAX_VIDEO_HEIGHT,
  MAX_VIDEO_DURATION
} from './utils/constants';

export { 
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_VIDEO_TYPES,
  MAX_FILE_SIZE,
  MAX_VIDEO_HEIGHT,
  MAX_VIDEO_DURATION
};

// Re-export constants for easy access
export { MAX_IMAGES, VIDEO_SLOT_INDEX } from './utils/constants';

/**
 * Process and validate media files
 */
export const processFiles = async (
  files: FileList, 
  existingImageCount: number = 0,
  hasVideo: boolean = false,
  existingHashes: string[] = []
): Promise<{
  acceptedImages: MediaFile[],
  rejectedImages: File[],
  videoFile: MediaFile | null,
  videoThumbnail: string | null,
  videoRejected: boolean,
  videoError?: string,
  duplicateDetected: boolean
}> => {
  const acceptedImages: MediaFile[] = [];
  const rejectedImages: File[] = [];
  let videoFile: MediaFile | null = null;
  let videoThumbnail: string | null = null;
  let videoRejected = false;
  let videoError: string | undefined = undefined;
  let duplicateDetected = false;

  // Function to ensure file has an ID
  const ensureFileId = (file: File): MediaFile => {
    const mediaFile = file as MediaFile;
    if (!mediaFile.id) {
      mediaFile.id = `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }
    return mediaFile;
  };

  // Process each file
  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      console.log(`File ${file.name} exceeds maximum file size`);
      rejectedImages.push(file);
      continue;
    }

    // Process image files
    if (ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      // Skip if we already have a duplicate
      const simpleHash = await simpleFileHash(file);
      if (existingHashes.includes(simpleHash)) {
        duplicateDetected = true;
        console.log(`Duplicate image detected: ${file.name}`);
        continue;
      }

      try {
        const mediaFile = await processImageFile(file, simpleHash);
        acceptedImages.push(mediaFile);
      } catch (error) {
        console.error(`Error processing image file ${file.name}:`, error);
        rejectedImages.push(file);
      }
    }
    // Process video files
    else if (ACCEPTED_VIDEO_TYPES.includes(file.type)) {
      // Only accept one video
      if (hasVideo || videoFile) {
        console.log(`Video ${file.name} rejected: only one video allowed`);
        videoRejected = true;
        videoError = "Only one video is allowed. Please remove the existing video first.";
        continue;
      }

      try {
        const { processedVideo, thumbnail } = await processVideoFile(file);
        videoFile = processedVideo;
        videoThumbnail = thumbnail;
      } catch (error) {
        console.error(`Error processing video file ${file.name}:`, error);
        videoRejected = true;
        videoError = error instanceof Error ? error.message : "Unknown error processing video";
      }
    }
    // Reject all other file types
    else {
      console.log(`File ${file.name} has unsupported type: ${file.type}`);
      rejectedImages.push(file);
    }
  }

  // Return the processed results
  return {
    acceptedImages: acceptedImages.map(ensureFileId), // Ensure all files have IDs
    rejectedImages,
    videoFile: videoFile ? ensureFileId(videoFile) : null,  // Ensure video file has ID
    videoThumbnail,
    videoRejected,
    videoError,
    duplicateDetected
  };
};

/**
 * Generate a simple hash for a file to detect duplicates
 */
const simpleFileHash = async (file: File): Promise<string> => {
  const bytes = Math.min(file.size, 1024 * 8); // Read first 8KB at most
  const buffer = await file.slice(0, bytes).arrayBuffer();
  const hashArray = Array.from(new Uint8Array(buffer));
  const hash = hashArray.reduce((acc, byte) => ((acc << 5) - acc + byte) | 0, 0);
  return `${file.name.slice(0, 10)}-${file.size}-${hash}`;
};

/**
 * Process and optimize an image file
 */
const processImageFile = async (file: File, hash?: string): Promise<MediaFile> => {
  // Add ID and preview to the file object
  const mediaFile = file as MediaFile;
  mediaFile.id = `img-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  
  // Create preview URL
  mediaFile.preview = URL.createObjectURL(file);
  
  return mediaFile;
};

/**
 * Process and validate a video file
 */
const processVideoFile = async (file: File): Promise<{
  processedVideo: MediaFile;
  thumbnail: string | null;
}> => {
  return new Promise((resolve, reject) => {
    // Create video element for metadata validation
    const video = document.createElement('video');
    const mediaFile = file as MediaFile;
    mediaFile.id = `video-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const url = URL.createObjectURL(file);
    
    // Listen for metadata to validate video
    video.onloadedmetadata = () => {
      try {
        // Check video dimensions
        if (video.videoHeight > MAX_VIDEO_HEIGHT) {
          throw new Error(`Video height exceeds maximum of ${MAX_VIDEO_HEIGHT}px (your video is ${video.videoHeight}px)`);
        }
        
        // Check video duration
        if (video.duration > MAX_VIDEO_DURATION) {
          throw new Error(`Video duration exceeds maximum of ${MAX_VIDEO_DURATION} seconds (your video is ${Math.round(video.duration)} seconds)`);
        }
        
        // Generate thumbnail at 25% of the video duration
        video.currentTime = video.duration * 0.25;
      } catch (error) {
        URL.revokeObjectURL(url);
        reject(error);
      }
    };
    
    // Generate thumbnail when seeking completes
    video.onseeked = () => {
      try {
        // Create canvas for thumbnail
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw current video frame to canvas
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Failed to get canvas context');
        }
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to image data URL
        const thumbnail = canvas.toDataURL('image/jpeg', 0.7);
        
        // Clean up
        URL.revokeObjectURL(url);
        
        // Set preview to thumbnail
        mediaFile.preview = thumbnail;
        
        resolve({
          processedVideo: mediaFile,
          thumbnail
        });
      } catch (error) {
        URL.revokeObjectURL(url);
        reject(error);
      }
    };
    
    // Handle errors
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load video. The file may be corrupted or use an unsupported codec.'));
    };
    
    // Start loading video
    video.preload = 'metadata';
    video.src = url;
  });
};
