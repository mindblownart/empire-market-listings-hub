
import React, { useState, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, Image, Video, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageFile extends File {
  preview?: string;
}

interface BusinessMediaUploadProps {
  onImagesChange?: (images: File[]) => void;
  onVideoChange?: (video: File | null) => void;
  onVideoUrlChange?: (url: string) => void;
}

const BusinessMediaUpload: React.FC<BusinessMediaUploadProps> = ({
  onImagesChange,
  onVideoChange,
  onVideoUrlChange,
}) => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  // Handle image upload
  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;

    const newFiles = Array.from(fileList).filter(file => {
      // Check file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload JPG, PNG, or WebP images only.",
          variant: "destructive"
        });
        return false;
      }
      return true;
    });

    // Check max number of images
    if (images.length + newFiles.length > 10) {
      toast({
        title: "Too many images",
        description: "You can upload a maximum of 10 images.",
        variant: "destructive"
      });
      return;
    }

    // Process and add preview URLs
    const processedFiles = newFiles.map(file => {
      const imageFile = file as ImageFile;
      imageFile.preview = URL.createObjectURL(file);
      return imageFile;
    });

    const updatedImages = [...images, ...processedFiles];
    setImages(updatedImages);
    if (onImagesChange) onImagesChange(updatedImages);

    // Simulate upload progress
    simulateUploadProgress();
  }, [images, onImagesChange, toast]);

  // Handle video upload
  const handleVideoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    const validTypes = ['video/mp4', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload MP4 or MOV video files only.",
        variant: "destructive"
      });
      return;
    }

    // Check file size (100MB limit)
    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Video file must be smaller than 100MB.",
        variant: "destructive"
      });
      return;
    }

    setVideo(file);
    if (onVideoChange) onVideoChange(file);

    // Simulate upload progress
    simulateUploadProgress();
  }, [onVideoChange, toast]);

  // Handle video URL input
  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setVideoUrl(url);
    if (onVideoUrlChange) onVideoUrlChange(url);
  };

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
    const imageFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      return validTypes.includes(file.type);
    });

    if (images.length + imageFiles.length > 10) {
      toast({
        title: "Too many images",
        description: "You can upload a maximum of 10 images.",
        variant: "destructive"
      });
      return;
    }

    // Process image files
    const processedFiles = imageFiles.map(file => {
      const imageFile = file as ImageFile;
      imageFile.preview = URL.createObjectURL(file);
      return imageFile;
    });

    const updatedImages = [...images, ...processedFiles];
    setImages(updatedImages);
    if (onImagesChange) onImagesChange(updatedImages);

    // Check if there's a video file
    const videoFiles = files.filter(file => {
      const validTypes = ['video/mp4', 'video/quicktime'];
      return validTypes.includes(file.type);
    });

    if (videoFiles.length > 0 && !video) {
      const videoFile = videoFiles[0];
      if (videoFile.size <= 100 * 1024 * 1024) {
        setVideo(videoFile);
        if (onVideoChange) onVideoChange(videoFile);
      } else {
        toast({
          title: "File too large",
          description: "Video file must be smaller than 100MB.",
          variant: "destructive"
        });
      }
    }

    // Simulate upload progress
    simulateUploadProgress();
  }, [images, onImagesChange, onVideoChange, video, toast]);

  // Remove an image
  const removeImage = useCallback((index: number) => {
    const newImages = [...images];
    
    // Revoke object URL to avoid memory leaks
    if (newImages[index].preview) {
      URL.revokeObjectURL(newImages[index].preview!);
    }
    
    newImages.splice(index, 1);
    setImages(newImages);
    if (onImagesChange) onImagesChange(newImages);
  }, [images, onImagesChange]);

  // Remove video
  const removeVideo = useCallback(() => {
    setVideo(null);
    if (onVideoChange) onVideoChange(null);
  }, [onVideoChange]);

  // Simulate upload progress (for visual feedback)
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

  return (
    <div className="space-y-6 pt-4">
      {/* Images Upload Section */}
      <div className="space-y-2">
        <Label htmlFor="business-images">Upload Business Images</Label>
        <div
          className={`border-2 border-dashed rounded-md p-6 transition-colors ${
            dragActive ? 'border-primary bg-primary/5' : 'border-gray-300'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <Image className="text-gray-400 mb-2" />
            <p className="text-sm text-center text-gray-500">
              Drag & drop images or <span className="text-primary font-medium">browse</span>
            </p>
            <p className="text-xs text-gray-400">
              Accepted formats: JPG, PNG, WebP (Recommended: 1200px width minimum)
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {images.length}/10 images uploaded
            </p>
            <Input
              id="business-images"
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleImageChange}
              multiple
              className="hidden"
            />
            <Button 
              type="button"
              variant="outline" 
              size="sm"
              onClick={() => document.getElementById('business-images')?.click()}
              className="mt-2"
            >
              <Upload className="mr-2 h-4 w-4" /> Select Images
            </Button>
            <p className="text-xs text-gray-500 italic mt-1">
              *Add photos that showcase your location, equipment, team, or storefront.
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

        {/* Image previews */}
        {images.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Uploaded Images:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image.preview}
                    alt={`Business image ${index + 1}`}
                    className="h-24 w-full object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Video Upload Section */}
      <div className="space-y-2 mt-6">
        <Label htmlFor="business-video">Upload a Business Video (Optional)</Label>
        <Card className="p-4">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Video className="text-gray-400 mb-2" />
            
            {!video ? (
              <>
                <p className="text-sm text-center text-gray-500">
                  Upload a video or provide a link to YouTube or Vimeo
                </p>
                <Input
                  id="business-video"
                  type="file"
                  accept=".mp4,.mov"
                  onChange={handleVideoChange}
                  className="hidden"
                />
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm"
                  onClick={() => document.getElementById('business-video')?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" /> Select Video
                </Button>
              </>
            ) : (
              <div className="w-full">
                <div className="flex items-center justify-between bg-gray-100 rounded-md p-2">
                  <span className="text-sm truncate max-w-[70%]">{video.name}</span>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={removeVideo}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            
            <div className="w-full space-y-2 mt-2">
              <Label htmlFor="video-url" className="text-sm">Or paste a YouTube/Vimeo URL:</Label>
              <Input 
                id="video-url" 
                type="url" 
                placeholder="https://youtube.com/..." 
                value={videoUrl}
                onChange={handleVideoUrlChange}
              />
            </div>
            
            <p className="text-xs text-gray-500 italic mt-1">
              *Add a short video tour or owner introduction (max 2 minutes). MP4/MOV formats, max 100MB.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BusinessMediaUpload;
