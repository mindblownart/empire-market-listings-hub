
import React from 'react';
import { EnhancedCarousel } from '@/components/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { ImageOff } from 'lucide-react';

interface MediaGalleryProps {
  galleryImages: string[];
  videoURL?: string | null;
  autoplayVideo?: boolean;
  skipPrimaryImage?: boolean;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  galleryImages = [],
  videoURL,
  autoplayVideo = false,
  skipPrimaryImage = false,
}) => {
  // Check if there's any media to display
  const hasMedia = (galleryImages && galleryImages.length > 0) || videoURL;
  
  if (!hasMedia) {
    return (
      <Card className="w-full rounded-lg overflow-hidden shadow-md">
        <CardContent className="p-0">
          <div className="flex items-center justify-center bg-gray-50 h-64 rounded-lg">
            <div className="text-center p-6">
              <ImageOff className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 font-medium">No media uploaded yet</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <EnhancedCarousel
      images={galleryImages}
      videoURL={videoURL}
      autoplayVideo={autoplayVideo}
      skipPrimaryImage={skipPrimaryImage}
    />
  );
};
