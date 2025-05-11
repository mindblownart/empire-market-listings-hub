
import { v4 as uuidv4 } from 'uuid';
import { MediaFile, VideoInfo } from './types';

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
const MAX_IMAGE_WIDTH = 1600;
const MAX_IMAGE_HEIGHT = 2000;
const TARGET_IMAGE_SIZE_MB = 1;
const IMAGE_QUALITY_START = 0.85;
const IMAGE_QUALITY_MIN = 0.65;

// Video processing configuration
const MAX_VIDEO_SIZE_MB = 20;
const TARGET_VIDEO_HEIGHT = 720;

// Helper function to convert File to MediaFile with ID
export const fileToMediaFile = (file: File): MediaFile => {
  return Object.assign(file, { 
    id: uuidv4(),
    originalFile: file
  });
};

// Convert array of Files to MediaFiles
export const filesToMediaFiles = (files: File[]): MediaFile[] => {
  return Array.from(files).map(fileToMediaFile);
};

// Helper function to check if a file is an image
export const isImageFile = (file: File): boolean => {
  return ACCEPTED_IMAGE_TYPES.includes(file.type);
};

// Helper function to check if a file is a video
export const isVideoFile = (file: File): boolean => {
  return ACCEPTED_VIDEO_TYPES.includes(file.type);
};

// Helper function to get file size in MB
const getFileSizeMB = (file: File): number => {
  return file.size / (1024 * 1024);
};

// Process image: resize and compress
export const processImage = async (file: File): Promise<MediaFile> => {
  // If file is already small enough, just return it as MediaFile
  if (getFileSizeMB(file) <= TARGET_IMAGE_SIZE_MB) {
    return fileToMediaFile(file);
  }

  // Create an image element to load the file
  const img = new Image();
  const imgLoaded = new Promise<void>((resolve) => {
    img.onload = () => resolve();
  });
  img.src = URL.createObjectURL(file);
  await imgLoaded;
  
  // Calculate new dimensions (maintaining aspect ratio)
  let width = img.width;
  let height = img.height;
  
  if (width > MAX_IMAGE_WIDTH || height > MAX_IMAGE_HEIGHT) {
    if (width > height) {
      // Landscape
      height = (height / width) * MAX_IMAGE_WIDTH;
      width = MAX_IMAGE_WIDTH;
    } else {
      // Portrait
      width = (width / height) * MAX_IMAGE_HEIGHT;
      height = MAX_IMAGE_HEIGHT;
    }
  }
  
  // Create canvas and draw image
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  ctx.drawImage(img, 0, 0, width, height);
  
  // Attempt compression with decreasing quality until target size is reached
  let quality = IMAGE_QUALITY_START;
  let blob: Blob | null = null;
  let mediaFile: MediaFile;
  
  // Try to compress as WebP first (better compression)
  while (quality >= IMAGE_QUALITY_MIN) {
    blob = await new Promise<Blob | null>(resolve => {
      canvas.toBlob(resolve, 'image/webp', quality);
    });
    
    if (blob && blob.size / (1024 * 1024) <= TARGET_IMAGE_SIZE_MB) {
      break;
    }
    
    // Reduce quality and try again
    quality -= 0.05;
  }
  
  // If WebP compression failed or not supported, try JPEG
  if (!blob || blob.size / (1024 * 1024) > TARGET_IMAGE_SIZE_MB) {
    quality = IMAGE_QUALITY_START;
    while (quality >= IMAGE_QUALITY_MIN) {
      blob = await new Promise<Blob | null>(resolve => {
        canvas.toBlob(resolve, 'image/jpeg', quality);
      });
      
      if (blob && blob.size / (1024 * 1024) <= TARGET_IMAGE_SIZE_MB) {
        break;
      }
      
      // Reduce quality and try again
      quality -= 0.05;
    }
  }
  
  // If compression still failed, use the best we got
  if (!blob) {
    blob = await new Promise<Blob | null>(resolve => {
      canvas.toBlob(resolve, 'image/jpeg', IMAGE_QUALITY_MIN);
    });
    
    if (!blob) {
      // If all else fails, return original file as MediaFile
      return fileToMediaFile(file);
    }
  }
  
  // Create a new file from the blob
  const optimizedFile = new File(
    [blob],
    `${file.name.split('.')[0]}.${blob.type.includes('webp') ? 'webp' : 'jpg'}`,
    { type: blob.type }
  );
  
  // Create a preview URL
  const preview = URL.createObjectURL(blob);
  
  // Create and return MediaFile
  mediaFile = fileToMediaFile(optimizedFile);
  mediaFile.preview = preview;
  
  return mediaFile;
};

// Generate video thumbnail
export const generateVideoThumbnail = async (videoFile: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.playsInline = true;
    video.muted = true;
    
    const objectUrl = URL.createObjectURL(videoFile);
    
    video.onloadedmetadata = () => {
      // Seek to 25% of the video
      video.currentTime = video.duration * 0.25;
    };
    
    video.onseeked = () => {
      // Create canvas and draw video frame
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to data URL and resolve
        const dataUrl = canvas.toDataURL('image/jpeg');
        URL.revokeObjectURL(objectUrl);
        resolve(dataUrl);
      } else {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Could not get canvas context'));
      }
    };
    
    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Error loading video'));
    };
    
    video.src = objectUrl;
  });
};

// Process video (currently just creates thumbnail and returns file with ID)
// In a real-world implementation, this would also compress the video
export const processVideo = async (file: File): Promise<{ 
  videoFile: MediaFile; 
  thumbnail: string | null;
}> => {
  // For simplicity, we'll just check the size but not actually compress
  if (getFileSizeMB(file) > MAX_VIDEO_SIZE_MB) {
    throw new Error(`Video exceeds maximum size of ${MAX_VIDEO_SIZE_MB}MB`);
  }
  
  let thumbnail: string | null = null;
  
  try {
    thumbnail = await generateVideoThumbnail(file);
  } catch (error) {
    console.error("Error generating video thumbnail:", error);
    // Continue without thumbnail
  }
  
  // Create MediaFile with ID
  const videoFile = fileToMediaFile(file);
  
  return { videoFile, thumbnail };
};

// Main function to process multiple files
export const processFiles = async (
  fileList: FileList,
  existingImagesCount: number = 0,
  hasVideo: boolean = false
): Promise<{
  acceptedImages: MediaFile[];
  rejectedImages: File[];
  videoFile: MediaFile | null;
  videoRejected: boolean;
  videoThumbnail: string | null;
}> => {
  // Split files into images and videos
  const files = Array.from(fileList);
  const imageFiles: File[] = [];
  let videoFile: File | null = null;
  let videoRejected = false;
  
  // Sort files by type
  for (const file of files) {
    if (isImageFile(file)) {
      imageFiles.push(file);
    } else if (!hasVideo && isVideoFile(file)) {
      // Only use the first video file encountered
      if (!videoFile) {
        videoFile = file;
      }
    }
  }
  
  // Process images (limit to max allowed)
  const maxAdditionalImages = 10 - existingImagesCount;
  const imagesToProcess = imageFiles.slice(0, maxAdditionalImages);
  const rejectedImages = imageFiles.slice(maxAdditionalImages);
  
  const processedImagesPromises = imagesToProcess.map(processImage);
  const acceptedImages = await Promise.all(processedImagesPromises);
  
  // Process video if present
  let processedVideo: MediaFile | null = null;
  let videoThumbnail: string | null = null;
  
  if (videoFile && !hasVideo) {
    try {
      const result = await processVideo(videoFile);
      processedVideo = result.videoFile;
      videoThumbnail = result.thumbnail;
    } catch (error) {
      console.error("Error processing video:", error);
      videoRejected = true;
    }
  }
  
  return {
    acceptedImages,
    rejectedImages,
    videoFile: processedVideo,
    videoRejected,
    videoThumbnail
  };
};
