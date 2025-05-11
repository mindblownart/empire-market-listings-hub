
import { fileToMediaFile, getFileSizeMB } from './file-utils';
import { MediaFile } from '../types';
import { MAX_VIDEO_SIZE_MB } from './constants';

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
