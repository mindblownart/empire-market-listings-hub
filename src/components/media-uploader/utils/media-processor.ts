
import { isImageFile, isVideoFile } from './file-utils';
import { processImage } from './image-processor';
import { processVideo } from './video-processor';
import { MediaFile } from '../types';
import { MAX_IMAGES, VIDEO_SLOT_INDEX } from './constants';

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
    videoThumbnail
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
