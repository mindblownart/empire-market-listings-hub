
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
    
    video.onerror = (e) => {
      URL.revokeObjectURL(objectUrl);
      console.error('Video error:', e);
      reject(new Error('Error loading video: Format may be unsupported'));
    };
    
    video.src = objectUrl;
  });
};

// Process video with improved error handling
export const processVideo = async (file: File): Promise<{ 
  videoFile: MediaFile; 
  thumbnail: string | null;
}> => {
  // Check file size with clearer error message
  if (getFileSizeMB(file) > MAX_VIDEO_SIZE_MB) {
    throw new Error(`Video exceeds maximum size of ${MAX_VIDEO_SIZE_MB}MB. Please reduce the file size.`);
  }
  
  // Validate video format
  if (!['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'].includes(file.type)) {
    throw new Error(`Unsupported video format: ${file.type || 'unknown'}. Please use MP4, WebM, or MOV format.`);
  }
  
  let thumbnail: string | null = null;
  
  try {
    thumbnail = await generateVideoThumbnail(file);
  } catch (error) {
    console.error("Error generating video thumbnail:", error);
    // Continue without thumbnail, but provide a fallback later
  }
  
  // Create MediaFile with ID and metadata
  const videoFile = fileToMediaFile(file);
  
  // Add additional metadata for persistence
  videoFile.preview = thumbnail || undefined;
  
  return { 
    videoFile, 
    thumbnail 
  };
};
