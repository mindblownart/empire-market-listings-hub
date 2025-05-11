
import { fileToMediaFile, getFileSizeMB } from './file-utils';
import { MediaFile } from '../types';
import { 
  MAX_IMAGE_WIDTH, 
  MAX_IMAGE_HEIGHT, 
  TARGET_IMAGE_SIZE_MB, 
  IMAGE_QUALITY_START, 
  IMAGE_QUALITY_MIN 
} from './constants';

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
