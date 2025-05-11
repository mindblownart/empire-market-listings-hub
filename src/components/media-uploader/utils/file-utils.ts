
import { v4 as uuidv4 } from 'uuid';
import { MediaFile } from '../types';
import { ACCEPTED_IMAGE_TYPES, ACCEPTED_VIDEO_TYPES } from './constants';

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
export const getFileSizeMB = (file: File): number => {
  return file.size / (1024 * 1024);
};
