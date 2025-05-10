import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Upload, Image, Video, X, Move, Play, Link as LinkIcon } from 'lucide-react';
import VideoPreviewModal from './VideoPreviewModal';

interface MediaFile extends File {
  preview?: string;
  id: string;
}

interface BusinessMediaUploaderProps {
  onImagesChange?: (images: File[]) => void;
  onVideoChange?: (video: File | null) => void;
  onVideoUrlChange?: (url: string) => void;
  initialImages?: File[];
  initialVideo?: File | null;
  initialVideoUrl?: string;
}

type MediaItemType = {
  id: string;
  type: 'image' | 'video';
  file?: MediaFile;
  preview: string;
  url?: string;
  isPrimary?: boolean;
  videoInfo?: {
    platform: string | null;
    id: string | null;
  };
};

// Function to extract video ID from YouTube and Vimeo URLs
const extractVideoInfo = (url: string): { platform: string | null; id: string | null } => {
  if (!url) return { platform: null, id: null };

  // YouTube patterns - handle both standard and shortened URLs
  const youtubeStandardRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const youtubeMatch = url.match(youtubeStandardRegex);
  if (youtubeMatch && youtubeMatch[1]) {
    return { platform: 'youtube', id: youtubeMatch[1] };
  }

  // Vimeo patterns
  const vimeoRegex = /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|)(\d+)(?:$|\/|\?)|player\.vimeo\.com\/video\/(\d+))/i;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch && (vimeoMatch[1] || vimeoMatch[2])) {
    const vimeoId = vimeoMatch[1] || vimeoMatch[2];
    return { platform: 'vimeo', id: vimeoId };
  }

  return { platform: null, id: null };
};

// Function to get thumbnail URL based on platform and ID
const getVideoThumbnailUrl = (platform: string | null, id: string | null): string => {
  if (!platform || !id) return '';
  
  if (platform === 'youtube') {
    return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  } else if (platform === 'vimeo') {
    return `https://vumbnail.com/${id}.jpg`;
  }
  
  return '';
};

// Function to get embed URL for the video preview
const getVideoEmbedUrl = (platform: string | null, id: string | null): string => {
  if (!platform || !id) return '';
  
  if (platform === 'youtube') {
    return `https://www.youtube.com/embed/${id}?autoplay=1`;
  } else if (platform === 'vimeo') {
    return `https://player.vimeo.com/video/${id}?autoplay=1`;
  }
  
  return '';
};

const MediaItem = ({ 
  item, 
  index, 
  moveItem, 
  onDelete,
  onVideoPreview,
  isFixed = false
}: { 
  item: MediaItemType; 
  index: number; 
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  onDelete: (id: string) => void;
  onVideoPreview: (item: MediaItemType) => void;
  isFixed?: boolean;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'media-item',
    item: { id: item.id, index },
    canDrag: !isFixed && item.type === 'image',
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [, drop] = useDrop({
    accept: 'media-item',
    hover: (draggedItem: { id: string; index: number }, monitor) => {
      if (!ref.current) return;
      const dragIndex = draggedItem.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) return;
      
      // If this is the video slot (index 1) or trying to move to primary slot (index 0), prevent it
      if (hoverIndex === 1 || hoverIndex === 0) return;
      if (dragIndex === 1 || dragIndex === 0) return;

      moveItem(dragIndex, hoverIndex);
      draggedItem.index = hoverIndex;
    },
  });

  // Only add drag ref if not fixed
  if (!isFixed && item.type === 'image') {
    drag(drop(ref));
  }

  const handleVideoClick = () => {
    if (item.type === 'video') {
      onVideoPreview(item);
    }
  };

  return (
    <div 
      ref={ref}
      className={`relative group aspect-square rounded-md overflow-hidden border-2 ${
        item.isPrimary ? 'border-primary' : isDragging ? 'border-dashed border-gray-400 opacity-50' : 'border-gray-200'
      }`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {item.type === 'image' ? (
        <img src={item.preview} alt="Media preview" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          {item.preview ? (
            <div 
              className="relative w-full h-full cursor-pointer" 
              onClick={handleVideoClick}
            >
              <img 
                src={item.preview} 
                alt="Video thumbnail" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
                <Play className="text-white w-12 h-12" />
              </div>
              {item.url && (
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md flex items-center">
                  <LinkIcon className="w-3 h-3 mr-1" /> {item.videoInfo?.platform || 'External'} Video
                </div>
              )}
            </div>
          ) : item.url ? (
            <div 
              className="text-center p-2 cursor-pointer" 
              onClick={handleVideoClick}
            >
              <Video className="w-10 h-10 mx-auto text-gray-500 mb-1" />
              <p className="text-xs truncate text-gray-600">External Video</p>
            </div>
          ) : (
            <Video className="text-gray-400 w-10 h-10" />
          )}
        </div>
      )}
      
      {/* Badge for primary image */}
      {item.isPrimary && (
        <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
          Primary
        </div>
      )}
      
      {/* Move handle only for draggable images */}
      {!isFixed && item.type === 'image' && (
        <div className="absolute top-2 right-10 bg-black/60 hover:bg-black/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
          <Move className="h-4 w-4 text-white" />
        </div>
      )}

      {/* Delete button */}
      <button
        onClick={() => onDelete(item.id)}
        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="h-4 w-4 text-white" />
      </button>
    </div>
  );
};

const BusinessMediaUploader: React.FC<BusinessMediaUploaderProps> = ({
  onImagesChange,
  onVideoChange,
  onVideoUrlChange,
  initialImages = [],
  initialVideo = null,
  initialVideoUrl = '',
}) => {
  const [mediaItems, setMediaItems] = useState<MediaItemType[]>(() => {
    const items: MediaItemType[] = [];
    
    // Add initial images
    initialImages.forEach((file, index) => {
      const imageFile = file as MediaFile;
      imageFile.id = `image-${Date.now()}-${index}`;
      items.push({
        id: imageFile.id,
        type: 'image',
        file: imageFile,
        preview: URL.createObjectURL(file),
        isPrimary: index === 0
      });
    });
    
    // Extract video info from URL if available
    let videoThumbnail = '';
    let videoInfo = null;
    if (initialVideoUrl) {
      videoInfo = extractVideoInfo(initialVideoUrl);
      videoThumbnail = getVideoThumbnailUrl(videoInfo.platform, videoInfo.id);
    }
    
    // Add video placeholder (always at index 1 if we have items)
    if (initialVideo) {
      const videoFile = initialVideo as MediaFile;
      videoFile.id = `video-${Date.now()}`;
      items.splice(1, 0, {
        id: videoFile.id,
        type: 'video',
        file: videoFile,
        preview: URL.createObjectURL(initialVideo)
      });
    } else if (initialVideoUrl) {
      items.splice(1, 0, {
        id: `video-url-${Date.now()}`,
        type: 'video',
        preview: videoThumbnail,
        url: initialVideoUrl,
        videoInfo: videoInfo
      });
    } else if (items.length > 0) {
      // Add empty video slot if we have any images
      items.splice(1, 0, {
        id: `video-placeholder-${Date.now()}`,
        type: 'video',
        preview: ''
      });
    }
    
    return items;
  });
  
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl || '');
  const [videoThumbnail, setVideoThumbnail] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [currentVideoPreview, setCurrentVideoPreview] = useState<{
    embedUrl: string;
    platform: string | null;
  } | null>(null);
  
  const { toast } = useToast();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Get all image files
  const getImageFiles = useCallback(() => {
    return mediaItems
      .filter(item => item.type === 'image' && item.file)
      .map(item => item.file) as File[];
  }, [mediaItems]);
  
  // Get video file
  const getVideoFile = useCallback(() => {
    const videoItem = mediaItems.find(item => item.type === 'video' && item.file);
    return videoItem ? videoItem.file as File : null;
  }, [mediaItems]);

  // Handle changes in media items
  const updateParentData = useCallback(() => {
    if (onImagesChange) {
      onImagesChange(getImageFiles());
    }
    
    if (onVideoChange) {
      onVideoChange(getVideoFile());
    }
    
    if (onVideoUrlChange) {
      onVideoUrlChange(videoUrl);
    }
  }, [getImageFiles, getVideoFile, onImagesChange, onVideoChange, onVideoUrlChange, videoUrl]);

  // Fetch thumbnail when videoUrl changes
  useEffect(() => {
    const videoInfo = extractVideoInfo(videoUrl);
    const newThumbnailUrl = getVideoThumbnailUrl(videoInfo.platform, videoInfo.id);
    setVideoThumbnail(newThumbnailUrl);

    // Update video item with new thumbnail if exists
    if (videoUrl) {
      setMediaItems(prevItems => {
        const newItems = [...prevItems];
        
        // Find existing video item
        const videoIndex = newItems.findIndex(item => item.type === 'video');
        
        if (videoIndex >= 0) {
          // Update existing video
          newItems[videoIndex] = {
            ...newItems[videoIndex],
            url: videoUrl,
            preview: newThumbnailUrl,
            file: undefined,
            videoInfo: videoInfo
          };
        }
        
        return newItems;
      });
    }
  }, [videoUrl]);

  // Handle item reordering
  const moveItem = useCallback((dragIndex: number, hoverIndex: number) => {
    setMediaItems(prevItems => {
      const newItems = [...prevItems];
      const draggedItem = newItems[dragIndex];
      
      // Remove the dragged item
      newItems.splice(dragIndex, 1);
      // Insert it at the new position
      newItems.splice(hoverIndex, 0, draggedItem);
      
      return newItems;
    });
  }, []);

  // Handle file selection
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const fileList = e.target.files;
    if (!fileList) return;

    const files = Array.from(fileList);
    
    // Process files
    processFiles(files);
    
    // Reset input
    e.target.value = '';
  }, []);

  // Handle video URL input
  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setVideoUrl(url);
    
    // Extract video platform and ID
    const videoInfo = extractVideoInfo(url);
    const thumbnailUrl = getVideoThumbnailUrl(videoInfo.platform, videoInfo.id);
    
    // Update or add video URL item
    setMediaItems(prevItems => {
      const newItems = [...prevItems];
      
      // Find existing video item
      const videoIndex = newItems.findIndex(item => item.type === 'video');
      
      if (videoIndex >= 0) {
        // Update existing video
        newItems[videoIndex] = {
          ...newItems[videoIndex],
          url: url,
          preview: thumbnailUrl,
          file: undefined,
          videoInfo: videoInfo
        };
      } else if (url) {
        // Add new video at index 1
        const videoItem: MediaItemType = {
          id: `video-url-${Date.now()}`,
          type: 'video',
          preview: thumbnailUrl,
          url: url,
          videoInfo: videoInfo
        };
        
        // If we have at least one item, insert at index 1
        if (newItems.length > 0) {
          newItems.splice(1, 0, videoItem);
        } else {
          // Otherwise just add it
          newItems.push(videoItem);
        }
      }
      
      return newItems;
    });
    
    if (onVideoUrlChange) {
      onVideoUrlChange(url);
    }
  };

  // Handle video preview
  const handleVideoPreview = (item: MediaItemType) => {
    if (item.type === 'video') {
      if (item.file) {
        // For uploaded video files
        setCurrentVideoPreview({
          embedUrl: item.preview,
          platform: 'file'
        });
      } else if (item.url && item.videoInfo) {
        // For YouTube or Vimeo URLs
        const embedUrl = getVideoEmbedUrl(item.videoInfo.platform, item.videoInfo.id);
        setCurrentVideoPreview({
          embedUrl,
          platform: item.videoInfo.platform
        });
      } else {
        return; // No video to preview
      }
      
      setIsVideoModalOpen(true);
    }
  };

  // Process uploaded files
  const processFiles = useCallback((files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const videoFiles = files.filter(file => file.type.startsWith('video/'));
    
    // Check if we're adding too many images
    const currentImageCount = mediaItems.filter(item => item.type === 'image').length;
    if (currentImageCount + imageFiles.length > 10) {
      toast({
        title: "Too many images",
        description: `You can upload a maximum of 10 images (${10 - currentImageCount} remaining)`,
        variant: "destructive"
      });
      return;
    }
    
    // Check if we already have a video
    if (videoFiles.length > 0 && mediaItems.some(item => item.type === 'video' && (item.file || item.url))) {
      toast({
        title: "Video already added",
        description: "You can only upload one video. Please remove the existing video first.",
        variant: "destructive"
      });
      return;
    }
    
    // Process and add images
    if (imageFiles.length > 0) {
      setMediaItems(prevItems => {
        const newItems = [...prevItems];
        const isPrimary = newItems.filter(item => item.type === 'image').length === 0;
        
        const processedImages = imageFiles.map((file, index) => {
          const mediaFile = file as MediaFile;
          mediaFile.id = `image-${Date.now()}-${index}`;
          mediaFile.preview = URL.createObjectURL(file);
          
          return {
            id: mediaFile.id,
            type: 'image' as const,
            file: mediaFile,
            preview: mediaFile.preview,
            isPrimary: isPrimary && index === 0
          };
        });
        
        // If we have no items yet, add them all
        if (newItems.length === 0) {
          return [...processedImages];
        }
        
        // If we already have items, preserve video at index 1
        if (newItems.some(item => item.type === 'video')) {
          const videoIndex = newItems.findIndex(item => item.type === 'video');
          const videoItem = newItems[videoIndex];
          
          // Remove video from current position
          newItems.splice(videoIndex, 1);
          
          // Add all images
          const result = [...newItems, ...processedImages];
          
          // Sort to ensure primary image is first
          result.sort((a, b) => {
            if (a.isPrimary) return -1;
            if (b.isPrimary) return 1;
            return 0;
          });
          
          // Insert video at index 1
          result.splice(1, 0, videoItem);
          return result;
        }
        
        // Otherwise just add the images
        return [...newItems, ...processedImages];
      });
    }
    
    // Process and add video
    if (videoFiles.length > 0) {
      const videoFile = videoFiles[0] as MediaFile;
      
      // Check video size
      if (videoFile.size > 100 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Video file must be smaller than 100MB.",
          variant: "destructive"
        });
        return;
      }
      
      videoFile.id = `video-${Date.now()}`;
      videoFile.preview = URL.createObjectURL(videoFile);
      
      setMediaItems(prevItems => {
        const newItems = [...prevItems];
        
        // Find and remove any existing video
        const videoIndex = newItems.findIndex(item => item.type === 'video');
        if (videoIndex >= 0) {
          newItems.splice(videoIndex, 1);
        }
        
        const videoItem = {
          id: videoFile.id,
          type: 'video' as const,
          file: videoFile,
          preview: videoFile.preview
        };
        
        // If we have no items, just add the video
        if (newItems.length === 0) {
          return [videoItem];
        }
        
        // Otherwise, insert it at position 1
        newItems.splice(1, 0, videoItem);
        return newItems;
      });
    }
    
    // Simulate upload progress
    simulateUploadProgress();
    
    // Update parent after a small delay to ensure state is updated
    setTimeout(updateParentData, 100);
  }, [mediaItems, toast, updateParentData]);

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  // Handle drop event
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);

  // Delete a media item
  const handleDelete = useCallback((id: string) => {
    setMediaItems(prevItems => {
      // Find the item to delete
      const itemToDelete = prevItems.find(item => item.id === id);
      
      // Clean up previews
      if (itemToDelete?.preview && itemToDelete.file) {
        URL.revokeObjectURL(itemToDelete.preview);
      }
      
      // Remove the item
      const newItems = prevItems.filter(item => item.id !== id);
      
      // If we deleted the primary image, set the first image as primary
      if (itemToDelete?.isPrimary && newItems.some(item => item.type === 'image')) {
        const firstImageIndex = newItems.findIndex(item => item.type === 'image');
        if (firstImageIndex >= 0) {
          newItems[firstImageIndex] = {
            ...newItems[firstImageIndex],
            isPrimary: true
          };
        }
      }
      
      // If we deleted the video
      if (itemToDelete?.type === 'video') {
        // Clear video URL if it was a URL video
        if (itemToDelete.url && !itemToDelete.file) {
          setVideoUrl('');
        }
      }
      
      return newItems;
    });
    
    // Update parent after a small delay to ensure state is updated
    setTimeout(updateParentData, 100);
  }, [updateParentData]);

  // Simulate upload progress
  const simulateUploadProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  // Clean up object URLs when component unmounts
  React.useEffect(() => {
    return () => {
      mediaItems.forEach(item => {
        if (item.preview && item.file) {
          URL.revokeObjectURL(item.preview);
        }
      });
    };
  }, [mediaItems]);

  // Update parent data when media items change
  React.useEffect(() => {
    updateParentData();
  }, [mediaItems, videoUrl, updateParentData]);

  // Organize media items to ensure correct order
  const organizedMediaItems = React.useMemo(() => {
    // If there are no items, return empty array to avoid errors
    if (!mediaItems || mediaItems.length === 0) {
      return [];
    }

    const items = [...mediaItems];
    
    // If we have items but no primary image, set the first image as primary
    const hasImages = items.some(item => item && item.type === 'image');
    const hasPrimary = items.some(item => item && item.isPrimary);
    
    if (hasImages && !hasPrimary) {
      const firstImageIndex = items.findIndex(item => item && item.type === 'image');
      if (firstImageIndex >= 0) {
        items[firstImageIndex] = {
          ...items[firstImageIndex],
          isPrimary: true
        };
      }
    }
    
    // Sort to ensure primary image is first
    items.sort((a, b) => {
      // Add null checks to prevent errors
      if (!a) return 1;
      if (!b) return -1;
      
      if (a.isPrimary) return -1;
      if (b.isPrimary) return 1;
      if (a.type === 'video') return 1;
      if (b.type === 'video') return -1;
      return 0;
    });
    
    // Find video index - add null check
    const videoIndex = items.findIndex(item => item && item.type === 'video');
    
    // If we have a video and it's not at position 1, move it there
    if (videoIndex >= 0 && videoIndex !== 1 && items.length > 1) {
      const videoItem = items[videoIndex];
      items.splice(videoIndex, 1);
      items.splice(1, 0, videoItem);
    }
    
    return items;
  }, [mediaItems]);

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-md p-6 transition-colors min-h-[200px] ${
          dragActive ? 'border-primary bg-primary/5' : 'border-gray-300'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex gap-3">
            <Image className="text-gray-400" />
            <Video className="text-gray-400" />
          </div>
          <p className="text-sm text-center text-gray-500">
            Drag & drop images and video or <span className="text-primary font-medium">browse</span>
          </p>
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Image className="mr-2 h-4 w-4" /> Select Images
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Select up to 10 images (JPG, PNG, WebP)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm"
                    onClick={() => videoInputRef.current?.click()}
                  >
                    <Video className="mr-2 h-4 w-4" /> Select Video
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Select one video (MP4, MOV, max 100MB)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={handleFileSelect}
            multiple
            className="hidden"
          />
          
          <input
            ref={videoInputRef}
            type="file"
            accept=".mp4,.mov"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <p className="text-xs text-gray-500 mt-1">
            {organizedMediaItems.filter(item => item.type === 'image').length}/10 images uploaded
          </p>
          
          <p className="text-xs text-gray-400 mt-1">
            First image will be set as primary. Video will always appear second.
          </p>
        </div>
      </div>
      
      {/* Upload progress */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="mt-2">
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-xs text-gray-500 mt-1">Uploading: {uploadProgress}%</p>
        </div>
      )}
      
      {/* Video URL input */}
      <div className="space-y-2">
        <Label htmlFor="video-url" className="text-sm">Or paste a YouTube/Vimeo URL:</Label>
        <div className="flex gap-2">
          <input 
            id="video-url" 
            type="url" 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="https://youtube.com/... or https://youtu.be/..." 
            value={videoUrl}
            onChange={handleVideoUrlChange}
          />
        </div>
      </div>
      
      {/* Media Grid */}
      {organizedMediaItems.length > 0 && (
        <div className="mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {organizedMediaItems.map((item, index) => (
              <MediaItem 
                key={item.id}
                item={item}
                index={index}
                moveItem={moveItem}
                onDelete={handleDelete}
                onVideoPreview={handleVideoPreview}
                isFixed={index === 0 || index === 1} // Primary image and video are fixed
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Help text */}
      <p className="text-xs text-gray-500 italic mt-4">
        <span className="font-semibold">Tips:</span> For best results, use high-quality images (1200px+ width) and keep videos under 2 minutes.
        You can drag and drop to reorder non-primary images. The primary image and video position cannot be changed.
      </p>

      {/* Video Preview Modal */}
      <VideoPreviewModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        embedUrl={currentVideoPreview?.embedUrl || ''}
        platform={currentVideoPreview?.platform || null}
      />
    </div>
  );
};

export default BusinessMediaUploader;
