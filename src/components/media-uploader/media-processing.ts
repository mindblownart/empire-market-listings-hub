
/**
 * Media processing utilities for optimizing images and videos
 */
import { toast } from "sonner";

// Constants for optimization
const IMAGE_MAX_SIZE_MB = 1; // 1MB
const IMAGE_MAX_DIMENSION = 2000; // 2000px
const IMAGE_TARGET_DIMENSION = 1600; // 1600px
const VIDEO_MAX_SIZE_MB = 20; // 20MB
const IMAGE_QUALITY = 0.8; // 80% quality for WebP compression

// Accepted file types
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ACCEPTED_VIDEO_TYPES = ['video/mp4'];

/**
 * Checks if the file is an accepted image type
 */
export const isAcceptedImageType = (file: File): boolean => {
  return ACCEPTED_IMAGE_TYPES.includes(file.type);
};

/**
 * Checks if the file is an accepted video type
 */
export const isAcceptedVideoType = (file: File): boolean => {
  return ACCEPTED_VIDEO_TYPES.includes(file.type);
};

/**
 * Get file size in MB
 */
export const getFileSizeMB = (file: File): number => {
  return file.size / (1024 * 1024);
};

/**
 * Optimizes an image by:
 * 1. Checking dimensions and resizing if needed
 * 2. Converting to WebP format
 * 3. Compressing to target size
 * Returns the optimized file or null if optimization fails
 */
export const optimizeImage = async (file: File): Promise<File | null> => {
  try {
    // Create a bitmap from the file
    const bitmap = await createImageBitmap(file);
    
    // Check if we need to resize
    const needsResize = bitmap.width > IMAGE_MAX_DIMENSION || bitmap.height > IMAGE_MAX_DIMENSION;
    
    // Calculate new dimensions (if resize needed)
    let newWidth = bitmap.width;
    let newHeight = bitmap.height;
    
    if (needsResize) {
      const aspectRatio = bitmap.width / bitmap.height;
      
      if (bitmap.width > bitmap.height) {
        // Landscape orientation
        newWidth = IMAGE_TARGET_DIMENSION;
        newHeight = Math.round(IMAGE_TARGET_DIMENSION / aspectRatio);
      } else {
        // Portrait orientation
        newHeight = IMAGE_TARGET_DIMENSION;
        newWidth = Math.round(IMAGE_TARGET_DIMENSION * aspectRatio);
      }
    }
    
    // Create a canvas and draw the image (possibly resized)
    const canvas = document.createElement('canvas');
    canvas.width = newWidth;
    canvas.height = newHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    
    // Draw the bitmap to the canvas (resized if needed)
    ctx.drawImage(bitmap, 0, 0, newWidth, newHeight);
    
    // Convert to WebP format with target quality
    const webpBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/webp', IMAGE_QUALITY);
    });
    
    if (!webpBlob) throw new Error('Failed to convert image to WebP');
    
    // Check if the file size is acceptable
    const optimizedSize = webpBlob.size / (1024 * 1024);
    if (optimizedSize > IMAGE_MAX_SIZE_MB) {
      console.warn(`Image still too large after optimization: ${optimizedSize.toFixed(2)}MB`);
      return null;
    }
    
    // Create a new File object
    const optimizedFile = new File([webpBlob], `${file.name.split('.')[0]}.webp`, {
      type: 'image/webp',
      lastModified: Date.now()
    });
    
    // Add ID for tracking in the UI
    const mediaFile = optimizedFile as any;
    mediaFile.id = `image-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    
    console.log(`Optimized image from ${getFileSizeMB(file).toFixed(2)}MB to ${getFileSizeMB(optimizedFile).toFixed(2)}MB`);
    
    return mediaFile;
  } catch (error) {
    console.error('Image optimization failed:', error);
    return null;
  }
};

/**
 * Creates a preview of the video and returns video information
 * Note: Full video compression requires additional libraries or server-side processing
 */
export const processVideo = async (file: File): Promise<{
  isAcceptable: boolean,
  file: File,
  thumbnail: string | null
}> => {
  try {
    // Check file size
    const fileSizeMB = getFileSizeMB(file);
    
    if (fileSizeMB > VIDEO_MAX_SIZE_MB) {
      return {
        isAcceptable: false,
        file,
        thumbnail: null
      };
    }
    
    // Generate video thumbnail
    const videoElement = document.createElement('video');
    videoElement.preload = 'metadata';
    
    const videoSrc = URL.createObjectURL(file);
    videoElement.src = videoSrc;
    
    // Wait for video metadata to load
    await new Promise((resolve) => {
      videoElement.onloadedmetadata = () => resolve(null);
    });
    
    // Generate thumbnail
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    videoElement.currentTime = 1; // Seek to 1 second
    
    // Wait for video to seek
    await new Promise((resolve) => {
      videoElement.onseeked = () => resolve(null);
    });
    
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.7);
    
    // Check video resolution
    if (videoElement.videoWidth > 1920 || videoElement.videoHeight > 1080) {
      return {
        isAcceptable: false,
        file,
        thumbnail: thumbnailDataUrl
      };
    }
    
    // Add ID for tracking in the UI
    const mediaFile = file as any;
    mediaFile.id = `video-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    
    // Cleanup
    URL.revokeObjectURL(videoSrc);
    
    return {
      isAcceptable: true,
      file: mediaFile,
      thumbnail: thumbnailDataUrl
    };
  } catch (error) {
    console.error('Video processing failed:', error);
    return {
      isAcceptable: false,
      file,
      thumbnail: null
    };
  }
};

/**
 * Process multiple files with optimizations
 */
export const processFiles = async (
  files: FileList, 
  existingImageCount: number, 
  hasExistingVideo: boolean
): Promise<{
  acceptedImages: File[],
  rejectedImages: File[],
  videoFile: File | null,
  videoRejected: boolean,
  videoThumbnail: string | null
}> => {
  const result = {
    acceptedImages: [] as File[],
    rejectedImages: [] as File[],
    videoFile: null as File | null,
    videoRejected: false,
    videoThumbnail: null as string | null
  };
  
  const availableImageSlots = 10 - existingImageCount;
  
  // Process all files
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    // Handle images
    if (isAcceptedImageType(file)) {
      if (result.acceptedImages.length >= availableImageSlots) {
        toast.warning('Maximum images reached', {
          description: `You can only upload up to 10 images total.`
        });
        break;
      }
      
      const optimizedImage = await optimizeImage(file);
      
      if (optimizedImage) {
        result.acceptedImages.push(optimizedImage);
      } else {
        result.rejectedImages.push(file);
        toast.error(`Image optimization failed: ${file.name}`, {
          description: 'File too large after optimization. Please upload a smaller or lower-resolution image.'
        });
      }
    } 
    // Handle video
    else if (isAcceptedVideoType(file)) {
      if (hasExistingVideo || result.videoFile) {
        toast.warning('Video slot already used', {
          description: 'Please remove the existing video first.'
        });
        continue;
      }
      
      const videoResult = await processVideo(file);
      
      if (videoResult.isAcceptable) {
        result.videoFile = videoResult.file;
        result.videoThumbnail = videoResult.thumbnail;
      } else {
        result.videoRejected = true;
        toast.error(`Video requirements not met: ${file.name}`, {
          description: 'Videos must be MP4 format, max 720p resolution, and under 20MB.'
        });
      }
    } else {
      toast.error(`Unsupported file type: ${file.name}`, {
        description: 'Please upload JPG, PNG, WebP images or MP4 videos.'
      });
    }
  }
  
  return result;
};
