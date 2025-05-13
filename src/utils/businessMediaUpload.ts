
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export const uploadBusinessMedia = async (businessImages: File[]) => {
  let primaryImageUrl = '';
  let galleryImages: string[] = [];
  
  if (businessImages && businessImages.length > 0) {
    // Upload the first image as the primary image
    const primaryImage = businessImages[0];
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
      
      // Upload any additional images
      if (businessImages.length > 1) {
        const additionalImages = businessImages.slice(1);
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
        galleryImages = uploadedImageUrls.filter(url => url !== null) as string[];
      }
    }
  }
  
  return {
    primaryImageUrl: primaryImageUrl || null,
    galleryImages: galleryImages.length > 0 ? galleryImages : null
  };
};
