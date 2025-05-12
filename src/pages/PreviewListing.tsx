
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { BusinessHeader, BusinessOverview, BusinessDetails, MediaGallery, ContactInformation } from '@/components/preview';
import { Loader2, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';

const PreviewListing = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<any>({});
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  
  // Load form data from session storage
  useEffect(() => {
    const loadFormData = () => {
      try {
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
        
        // Load video URL from session storage
        const sessionVideo = sessionStorage.getItem('previewVideoUrl');
        console.log("Retrieved video URL from session:", sessionVideo);
        
        if (sessionVideo) {
          setVideoURL(sessionVideo);
          console.log("Set video URL from session:", sessionVideo);
        } else if (parsedData.businessVideoUrl) {
          // Fallback to businessVideoUrl from form data if sessionVideo is not available
          setVideoURL(parsedData.businessVideoUrl);
          console.log("Set video URL from form data:", parsedData.businessVideoUrl);
        } else {
          // Ensure video URL is null if none exists
          setVideoURL(null);
          console.log("No video URL found, set to null");
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
  
  // Function to handle going back to the form
  const handleBackToForm = () => {
    navigate('/submit');
  };
  
  // Function to handle submitting the form
  const handleSubmitListing = () => {
    // Navigate to the submit page with a flag to trigger the submission
    sessionStorage.setItem('submitAfterPreview', 'true');
    
    // Use a toast to indicate the redirecting status
    toast.info("Redirecting to submission page...", {
      description: "You'll be able to review your listing one more time before final submission."
    });
    
    navigate('/submit');
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto" />
            <h2 className="mt-4 text-xl font-semibold">Loading preview...</h2>
            <p className="mt-2 text-gray-600">Preparing your business listing preview</p>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }
  
  // Parse the location for the flag code
  const flagCode = formData.location ? formData.location.toLowerCase() : "gl";
  
  // Add console log to debug the video URL right before rendering
  console.log("Rendering preview with videoURL:", videoURL);
  console.log("Images to display:", imageUrls);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="py-20 px-4 flex-grow">
        <div className="container mx-auto max-w-7xl">
          <div className="flex justify-between items-center mb-6">
            <Button 
              variant="ghost"
              className="flex items-center gap-2"
              onClick={handleBackToForm}
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Edit Form
            </Button>
            
            <div className="flex items-center gap-4">
              <Button 
                variant="outline"
                onClick={handleBackToForm}
              >
                Edit Listing
              </Button>
              
              <Button 
                onClick={handleSubmitListing}
              >
                Submit Listing
              </Button>
            </div>
          </div>
          
          <div className="bg-white shadow-md p-4 rounded-lg border border-gray-100">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-700">Preview Your Business Listing</h1>
              <p className="text-gray-500">This is how your listing will appear to potential buyers</p>
            </div>
            
            {/* Hero Section with Business Header */}
            <div className="mb-6">
              <BusinessHeader 
                businessName={formData.businessName} 
                industry={formData.industry} 
                location={formData.location} 
                flagCode={flagCode}
                primaryImage={imageUrls.length > 0 ? imageUrls[0] : undefined}
                askingPrice={formData.askingPrice}
                currencyCode={formData.currencyCode}
              />
            </div>
            
            {/* Revised layout with 2 columns starting right below the hero */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Media Gallery and Business Overview */}
              <div className="lg:col-span-2 space-y-6">
                {/* Media Gallery - Skipping the primary image since it's shown in the hero */}
                <MediaGallery 
                  galleryImages={imageUrls} 
                  videoURL={videoURL}
                  autoplayVideo={true}
                  skipPrimaryImage={true}
                />
                
                {/* Business Overview & Highlights */}
                <BusinessOverview 
                  askingPrice={formData.askingPrice}
                  annualRevenue={formData.annualRevenue}
                  annualProfit={formData.annualProfit}
                  currencyCode={formData.currencyCode}
                  description={formData.description} 
                  highlights={formData.highlights} 
                />
              </div>
              
              {/* Right Column - Business Details & Contact Information */}
              <div className="space-y-6">
                <BusinessDetails 
                  location={formData.location} 
                  industry={formData.industry} 
                  yearEstablished={formData.yearEstablished} 
                  employees={formData.employees}
                  annualRevenue={formData.annualRevenue}
                  annualProfit={formData.annualProfit}
                  currencyCode={formData.currencyCode}
                />
                
                <ContactInformation 
                  contactName={formData.fullName} 
                  contactEmail={formData.email} 
                  contactPhone={formData.phone} 
                  contactRole={formData.role} 
                />
                
                {/* Contact Seller Button */}
                <Button className="w-full bg-[#9b87f5] hover:bg-[#8673e0] py-6 h-auto text-white text-lg font-medium">
                  Contact Seller
                </Button>
              </div>
            </div>
            
            <div className="mt-8 border-t pt-8 flex justify-center">
              <Button 
                size="lg"
                onClick={handleSubmitListing}
                className="px-8 py-6 text-lg"
              >
                Submit Business Listing
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PreviewListing;
