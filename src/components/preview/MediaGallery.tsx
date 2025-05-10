
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface MediaGalleryProps {
  galleryImages: string[];
  videoURL?: string;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  galleryImages,
  videoURL,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
      {/* Left section: Additional Photos */}
      {galleryImages.length > 0 && (
        <div className="md:col-span-2">
          <Card className="shadow-md h-full">
            <CardHeader className="border-b">
              <CardTitle>Additional Photos</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Carousel className="w-full">
                <CarouselContent>
                  {galleryImages.map((url, index) => (
                    <CarouselItem key={index} className="basis-1/2 md:basis-1/3 lg:basis-1/4">
                      <AspectRatio ratio={4/3} className="bg-gray-200 rounded-md overflow-hidden">
                        <img 
                          src={url} 
                          alt={`Business image ${index + 1}`} 
                          className="w-full h-full object-cover"
                        />
                      </AspectRatio>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="flex justify-end gap-2 mt-4">
                  <CarouselPrevious className="static transform-none" />
                  <CarouselNext className="static transform-none" />
                </div>
              </Carousel>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Right section: Video */}
      {videoURL && (
        <div className={galleryImages.length > 0 ? "md:col-span-1" : "md:col-span-3"}>
          <Card className="shadow-md h-full">
            <CardHeader className="border-b">
              <CardTitle>Business Video</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <AspectRatio ratio={16/9} className="overflow-hidden rounded-md">
                <video
                  src={videoURL}
                  controls
                  className="w-full h-full object-cover"
                />
              </AspectRatio>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
