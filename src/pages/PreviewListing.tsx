import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye } from 'lucide-react';
import { 
  BusinessHeader, 
  BusinessOverview, 
  BusinessDetails, 
  MediaGallery,
  ContactInformation 
} from '@/components/preview';
import { useFormData } from '@/contexts/FormDataContext';
import { supabase } from '@/lib/supabase';

const PreviewListing = () => {
  const navigate = useNavigate();
  const { formData } = useFormData();
  const [isLoading, setIsLoading] = useState(true);
  const [previewData, setPreviewData] = useState(formData);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [primaryImage, setPrimaryImage] = useState<string | undefined>(undefined);
  
  // Load data from session storage or from context/database
  useEffect(() => {
    async function loadPreviewData() {
      setIsLoading(true);
      
      // First, try to load from sessionStorage (this takes precedence)
      const sessionData = sessionStorage.getItem('previewFormData');
      const sessionImages = sessionStorage.getItem('previewImageUrls');
      const sessionVideo = sessionStorage.getItem('previewVideoUrl');
      const sessionOrdering = sessionStorage.getItem('previewImageOrdering') || sessionStorage.getItem('imageOrder');
      
      if (sessionData) {
        // We have data in session storage, use it
        const parsedData = JSON.parse(sessionData);
        setPreviewData(parsedData);
        
        if (sessionImages) {
          try {
            const parsedImages = JSON.parse(sessionImages);
            
            // Apply custom ordering if available
            let orderedImages = parsedImages;
            if (sessionOrdering) {
              try {
                const orderMap = JSON.parse(sessionOrdering);
                // Apply custom ordering if it exists
                if (Array.isArray(orderMap) && orderMap.length > 0) {
                  // Use the exact order from the ordering map
                  // but only for images that exist in parsedImages
                  const validOrderedImages = orderMap.filter(url => 
                    parsedImages.includes(url)
                  );
                  
                  // Add any images from parsedImages that aren't in the order map
                  // (these would be newly added images)
                  const newImages = parsedImages.filter(url => 
                    !orderMap.includes(url)
                  );
                  
                  orderedImages = [...validOrderedImages, ...newImages];
                  console.log("Applied custom image ordering:", orderedImages);
                }
              } catch (error) {
                console.error("Error parsing image ordering:", error);
              }
            }
            
            // Set primary image to first image
            if (orderedImages.length > 0) {
              setPrimaryImage(orderedImages[0]);
              setGalleryImages(orderedImages);
            } else {
              setGalleryImages([]);
            }
          } catch (error) {
            console.error("Error parsing session images:", error);
            if (Array.isArray(sessionImages)) {
              setGalleryImages(sessionImages);
              if (sessionImages.length > 0) {
                setPrimaryImage(sessionImages[0]);
              }
            }
          }
        }
        
        if (sessionVideo) {
          setVideoURL(sessionVideo);
        }
        
        setIsLoading(false);
        return;
      }
      
      // If there's no session data, try to load from database if we have an ID
      const editingListingId = localStorage.getItem('editingListingId');
      
      if (editingListingId) {
        // Fetch the listing data from the database
        const { data: listing, error } = await supabase
          .from('business_listings')
          .select('*')
          .eq('id', editingListingId)
          .single();
        
        if (error) {
          console.error('Error fetching listing for preview:', error);
          // Fall back to the form data
          setPreviewData(formData);
        } else if (listing) {
          // Convert database listing to form data format
          setPreviewData({
            businessName: listing.business_name,
            industry: listing.category,
            location: listing.location,
            yearEstablished: listing.year_established?.toString() || '',
            employees: listing.employees || '',
            askingPrice: listing.asking_price,
            annualRevenue: listing.annual_revenue,
            annualProfit: listing.annual_profit,
            currencyCode: listing.currency_code,
            description: listing.description || '',
            highlights: listing.highlights || [],
            businessImages: [],
            businessVideo: null,
            businessVideoUrl: listing.video_url || '',
            fullName: listing.contact_name || '',
            email: listing.contact_email || '',
            phone: listing.contact_phone || '',
            role: listing.contact_role || '',
            originalValues: {
              askingPrice: listing.asking_price,
              annualRevenue: listing.annual_revenue,
              annualProfit: listing.annual_profit,
              currencyCode: listing.currency_code,
            }
          });
          
          // Set gallery images and video URL
          if (listing.gallery_images && Array.isArray(listing.gallery_images)) {
            if (listing.gallery_images.length > 0) {
              // Apply any custom ordering stored in session
              let orderedImages = [...listing.gallery_images];
              
              if (sessionOrdering) {
                try {
                  const orderMap = JSON.parse(sessionOrdering);
                  // Filter the order map to only include images that exist in gallery_images
                  if (Array.isArray(orderMap) && orderMap.length > 0) {
                    const validOrderedImages = orderMap.filter(url => 
                      listing.gallery_images.includes(url)
                    );
                    
                    // Add any images from gallery_images that aren't in the order map
                    const remainingImages = listing.gallery_images.filter(url => 
                      !validOrderedImages.includes(url)
                    );
                    
                    orderedImages = [...validOrderedImages, ...remainingImages];
                  }
                } catch (error) {
                  console.error("Error parsing image ordering:", error);
                }
              }
              
              setPrimaryImage(orderedImages[0]);
              setGalleryImages(orderedImages);
            }
          }
          
          if (listing.video_url) {
            setVideoURL(listing.video_url);
          }
        }
      } else {
        // Use the current form data
        setPreviewData(formData);
        
        // Check if we have stored image ordering
        const storedImageOrdering = localStorage.getItem('imageOrdering');
        
        // If we have businessImages in formData, we need to convert them to URLs
        if (formData.businessImages && formData.businessImages.length > 0) {
          const urls = formData.businessImages.map(file => {
            if (file instanceof File) {
              return URL.createObjectURL(file);
            }
            return null;
          }).filter(Boolean) as string[];
          
          if (urls.length > 0) {
            setPrimaryImage(urls[0]);
            setGalleryImages(urls);
          }
        }
        
        if (formData.businessVideoUrl) {
          setVideoURL(formData.businessVideoUrl);
        }
      }
      
      setIsLoading(false);
    }
    
    loadPreviewData();
    
    // Clean up any created object URLs when component unmounts
    return () => {
      if (primaryImage && primaryImage.startsWith('blob:')) {
        URL.revokeObjectURL(primaryImage);
      }
      
      galleryImages.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [formData]);
  
  const handleBackToForm = () => {
    const editingListingId = localStorage.getItem('editingListingId');
    if (editingListingId) {
      // When navigating back to the form, ensure we preserve the image ordering
      // This is saved in handlePreview() in EditListing.tsx and FormContainer.tsx
      navigate(`/edit-listing/${editingListingId}`);
    } else {
      navigate('/submit');
    }
  };

  // If loading, show a loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <h2 className="text-2xl font-bold">Loading Preview</h2>
            <p className="text-gray-500">Please wait while we prepare your business listing preview...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-20 px-4 pb-12">
        <div className="container mx-auto max-w-7xl">
          {/* Preview banner - Removed the Back to Form button from here */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 rounded-full p-2">
                <Eye className="text-blue-700 h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-800">Preview Mode</h3>
                <p className="text-sm text-blue-700">This is how your listing will appear to potential buyers.</p>
              </div>
            </div>
          </div>
          
          {/* Hero banner section - Always show primary image */}
          <div className="mb-6">
            <BusinessHeader 
              businessName={previewData.businessName}
              industry={previewData.industry}
              location={previewData.location}
              flagCode={previewData.location || "us"}
              primaryImage={primaryImage}
              askingPrice={previewData.askingPrice}
              currencyCode={previewData.currencyCode}
            />
          </div>

          {/* Main content with responsive grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column (70% width on desktop) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Media Gallery - Showing all media EXCEPT primary image */}
              <MediaGallery 
                galleryImages={galleryImages} 
                videoURL={videoURL}
                autoplayVideo={true}
                skipPrimaryImage={true} // Skip primary image in carousel as it's shown in hero banner
              />
              
              {/* Business Overview */}
              <BusinessOverview 
                description={previewData.description}
                highlights={previewData.highlights}
                askingPrice={previewData.askingPrice}
                annualRevenue={previewData.annualRevenue}
                annualProfit={previewData.annualProfit}
                currencyCode={previewData.currencyCode}
              />
            </div>
            
            {/* Right Column (30% width on desktop) */}
            <div className="space-y-6">
              {/* Business Details */}
              <BusinessDetails
                annualRevenue={previewData.annualRevenue}
                annualProfit={previewData.annualProfit}
                currencyCode={previewData.currencyCode}
                location={previewData.location}
                industry={previewData.industry}
                yearEstablished={previewData.yearEstablished}
                employees={previewData.employees}
              />
              
              {/* Contact Information */}
              <ContactInformation
                contactName={previewData.fullName}
                contactEmail={previewData.email}
                contactPhone={previewData.phone}
                contactRole={previewData.role}
              />
              
              {/* Back to Form Button */}
              <div className="md:static fixed bottom-0 left-0 right-0 p-4 bg-white md:bg-transparent md:p-0 md:mt-6 z-10 shadow-lg md:shadow-none">
                <Button 
                  className="w-full bg-[#9b87f5] hover:bg-[#8673e0] py-6 h-auto text-white text-lg font-medium"
                  onClick={handleBackToForm}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Form
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PreviewListing;
