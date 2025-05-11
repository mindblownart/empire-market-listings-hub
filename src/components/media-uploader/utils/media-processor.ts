
import { isImageFile, isVideoFile } from './file-utils';
import { processImage } from './image-processor';
import { processVideo } from './video-processor';
import { MediaFile } from '../types';
import { MAX_IMAGES, VIDEO_SLOT_INDEX } from './constants';

// Simple hash function for file content - for detecting duplicates
const hashFile = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  let hash = 0;
  const view = new DataView(buffer);
  
  // Sample data points throughout the file rather than reading every byte
  // This creates a reasonably unique signature without being too computationally expensive
  const step = Math.max(1, Math.floor(buffer.byteLength / 500)); // Sample ~500 points
  
  for (let i = 0; i < buffer.byteLength; i += step) {
    if (i + 4 <= buffer.byteLength) {
      // Use 32-bit integers where possible
      hash = ((hash << 5) - hash + view.getInt32(i, true)) | 0;
    } else if (i < buffer.byteLength) {
      // Fall back to bytes for the remaining data
      hash = ((hash << 5) - hash + view.getInt8(i)) | 0;
    }
  }
  
  // Include file size and name in hash
  hash = ((hash << 5) - hash + file.size) | 0;
  
  for (let i = 0; i < file.name.length; i++) {
    hash = ((hash << 5) - hash + file.name.charCodeAt(i)) | 0;
  }
  
  return String(hash);
};

// Main function to process multiple files
export const processFiles = async (
  fileList: FileList,
  existingImagesCount: number = 0,
  hasVideo: boolean = false,
  existingImageHashes: string[] = []
): Promise<{
  acceptedImages: MediaFile[];
  rejectedImages: File[];
  videoFile: MediaFile | null;
  videoRejected: boolean;
  videoThumbnail: string | null;
  duplicateDetected: boolean;
}> => {
  // Split files into images and videos
  const files = Array.from(fileList);
  const imageFiles: File[] = [];
  let videoFile: File | null = null;
  let videoRejected = false;
  let duplicateDetected = false;
  
  // Process each file to detect duplicates
  const fileHashes: Map<string, boolean> = new Map();
  
  // First pass: compute hashes and check for duplicates
  for (const file of files) {
    try {
      const hash = await hashFile(file);
      
      // Check if this is a duplicate within the batch or matches existing images
      if (fileHashes.has(hash) || existingImageHashes.includes(hash)) {
        duplicateDetected = true;
        continue; // Skip this file
      }
      
      fileHashes.set(hash, true);
      
      // Sort by type
      if (isImageFile(file)) {
        imageFiles.push(file);
      } else if (!hasVideo && isVideoFile(file)) {
        // Only use the first video file encountered
        if (!videoFile) {
          videoFile = file;
        }
      }
    } catch (error) {
      console.error("Error processing file for duplication check:", error);
    }
  }
  
  // Process images (limit to max allowed)
  const maxAdditionalImages = MAX_IMAGES - existingImagesCount;
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
    videoThumbnail,
    duplicateDetected
  };
};

// Helper function to reorder media items ensuring the constraints
export const reorderMediaItems = <T>(
  items: T[],
  sourceIndex: number,
  destinationIndex: number
): T[] => {
  // Don't allow moving to/from video slot (index 1)
  if (sourceIndex === VIDEO_SLOT_INDEX || destinationIndex === VIDEO_SLOT_INDEX) {
    return [...items];
  }
  
  const result = Array.from(items);
  const [removed] = result.splice(sourceIndex, 1);
  result.splice(destinationIndex, 0, removed);
  
  return result;
};
