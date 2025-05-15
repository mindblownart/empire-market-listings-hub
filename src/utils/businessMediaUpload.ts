
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export const uploadBusinessMedia = async (
  mediaFiles: File[],
  isVideo: boolean = false
) => {
  let primaryImageUrl = '';
  let galleryImages: string[] = [];
  let videoUrl: string | null = null;
  
  try {
    if (isVideo) {
      // Handle video file upload
      if (mediaFiles && mediaFiles.length > 0) {
        const videoFile = mediaFiles[0];
        const videoFileName = `video_${Date.now()}_${videoFile.name}`;
        
        console.log("Uploading video file:", videoFileName);
        const { data: videoData, error: videoError } = await supabase.storage
          .from('business_media')
          .upload(videoFileName, videoFile);
          
        if (videoError) {
          console.error('Error uploading video:', videoError);
          toast.error("There was an error uploading your video.");
          return { primaryImageUrl: null, galleryImages: null, videoUrl: null };
        }
        
        // Get the public URL of the uploaded video
        const { data: videoUrlData } = supabase.storage
          .from('business_media')
          .getPublicUrl(videoFileName);
          
        videoUrl = videoUrlData.publicUrl;
        console.log("Video uploaded successfully, URL:", videoUrl);
      }
    } else {
      // Handle image file uploads
      if (mediaFiles && mediaFiles.length > 0) {
        // Upload the first image as the primary image
        const primaryImage = mediaFiles[0];
        const primaryImageFileName = `${Date.now()}_${primaryImage.name}`;
        
        const { data: primaryImageData, error: primaryImageError } = await supabase.storage
          .from('business_media')
          .upload(primaryImageFileName, primaryImage);
          
        if (primaryImageError) {
          console.error('Error uploading primary image:', primaryImageError);
          toast.error("There was an error uploading your primary image.");
        } else {
          // Get the public URL of the uploaded image
          const { data: publicUrlData } = supabase.storage
            .from('business_media')
            .getPublicUrl(primaryImageFileName);
            
          primaryImageUrl = publicUrlData.publicUrl;
          galleryImages.push(primaryImageUrl);
          
          // Upload any additional images
          if (mediaFiles.length > 1) {
            const additionalImages = mediaFiles.slice(1);
            const imageUploadPromises = additionalImages.map(async (image, index) => {
              const fileName = `${Date.now()}_${index}_${image.name}`;
              
              const { data, error } = await supabase.storage
                .from('business_media')
                .upload(fileName, image);
                
              if (error) {
                console.error(`Error uploading image ${index}:`, error);
                return null;
              }
              
              const { data: urlData } = supabase.storage
                .from('business_media')
                .getPublicUrl(fileName);
                
              return urlData.publicUrl;
            });
            
            const uploadedImageUrls = await Promise.all(imageUploadPromises);
            const validUrls = uploadedImageUrls.filter(url => url !== null) as string[];
            galleryImages = [...galleryImages, ...validUrls];
          }
        }
      }
    }
  } catch (error) {
    console.error("Error in uploadBusinessMedia:", error);
    toast.error("An error occurred during media upload.");
  }
  
  return {
    primaryImageUrl: primaryImageUrl || null,
    galleryImages: galleryImages.length > 0 ? galleryImages : null,
    videoUrl: videoUrl
  };
};
