
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const usePreviewData = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<any>({});
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  
  // Load form data from session storage
  useEffect(() => {
    const loadFormData = () => {
      try {
        console.log("usePreviewData: Loading preview data from session storage");
        
        // Check if we have any form data in session storage
        const storedData = sessionStorage.getItem('previewFormData');
        
        if (!storedData) {
          console.error("No form data found in session storage");
          toast.error("Failed to load preview data", {
            description: "Please go back and try again."
          });
          setTimeout(() => navigate('/submit'), 2000);
          return;
        }
        
        // Parse the form data
        const parsedData = JSON.parse(storedData);
        console.log("Loaded form data:", parsedData);
        setFormData(parsedData);
        
        // Load image URLs - First check for preview image urls
        const storedImageUrls = sessionStorage.getItem('previewImageUrls');
        const storedImageOrdering = sessionStorage.getItem('previewImageOrdering');
        
        if (storedImageUrls) {
          try {
            const parsedImageUrls = JSON.parse(storedImageUrls);
            if (Array.isArray(parsedImageUrls) && parsedImageUrls.length > 0) {
              console.log("Using stored image URLs:", parsedImageUrls);
              setImageUrls(parsedImageUrls);
            }
          } catch (error) {
            console.error("Error parsing image URLs:", error);
          }
        }
        // If no previewImageUrls, try the image ordering
        else if (storedImageOrdering) {
          try {
            const parsedOrdering = JSON.parse(storedImageOrdering);
            if (Array.isArray(parsedOrdering) && parsedOrdering.length > 0) {
              console.log("Using stored image ordering:", parsedOrdering);
              setImageUrls(parsedOrdering);
            }
          } catch (error) {
            console.error("Error parsing image ordering:", error);
          }
        }
        
        // FIXED: Enhanced video handling to support both URL and File
        console.log("Checking for video data in session storage");
        
        // First check for video file data (from local upload)
        const videoFileData = sessionStorage.getItem('previewVideoFile');
        console.log("Retrieved video file data from session:", videoFileData);
        
        if (videoFileData) {
          try {
            const parsedVideoFile = JSON.parse(videoFileData);
            if (parsedVideoFile && parsedVideoFile.previewUrl) {
              console.log("Setting video URL from file blob URL:", parsedVideoFile.previewUrl);
              setVideoURL(parsedVideoFile.previewUrl);
            }
          } catch (error) {
            console.error("Error parsing video file data:", error);
          }
        } 
        // If no video file, check for video URL (YouTube/Vimeo)
        else {
          const sessionVideo = sessionStorage.getItem('previewVideoUrl');
          console.log("Retrieved video URL from session:", sessionVideo);
          
          if (sessionVideo) {
            console.log("Setting video URL from session storage:", sessionVideo);
            setVideoURL(sessionVideo);
          } else if (parsedData.businessVideoUrl) {
            // Fallback to businessVideoUrl from form data if sessionVideo is not available
            console.log("Setting video URL from form data:", parsedData.businessVideoUrl);
            setVideoURL(parsedData.businessVideoUrl);
          } else {
            // Ensure video URL is null if none exists
            console.log("No video URL found, setting to null");
            setVideoURL(null);
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading preview data:", error);
        toast.error("Failed to load preview data", { 
          description: "There was an error processing your data. Please try again." 
        });
        
        // Redirect back to submit page
        setTimeout(() => navigate('/submit'), 2000);
      }
    };
    
    loadFormData();
  }, [navigate]);

  return {
    isLoading,
    formData,
    imageUrls,
    videoURL,
  };
};
