
import { v4 as uuidv4 } from 'uuid';
import { MediaFile } from '../types';
import { ACCEPTED_IMAGE_TYPES, ACCEPTED_VIDEO_TYPES, TARGET_IMAGE_SIZE_MB } from './constants';

// Helper function to convert File to MediaFile with ID
export const fileToMediaFile = (file: File): MediaFile => {
  return Object.assign(file, { 
    id: `file-${uuidv4()}`,
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
export const getFileSizeMB = (file: File): number => {
  return file.size / (1024 * 1024);
};

// Helper to check if file exceeds size limit
export const exceedsFileSizeLimit = (file: File): boolean => {
  const sizeMB = getFileSizeMB(file);
  if (isImageFile(file)) {
    return sizeMB > TARGET_IMAGE_SIZE_MB;
  } else if (isVideoFile(file)) {
    return sizeMB > 20; // 20MB for videos
  }
  return false;
};

// Extract file name and extension
export const getFileNameAndExt = (fileName: string): { name: string; extension: string } => {
  const parts = fileName.split('.');
  const extension = parts.length > 1 ? parts.pop() || '' : '';
  const name = parts.join('.');
  return { name, extension };
};
