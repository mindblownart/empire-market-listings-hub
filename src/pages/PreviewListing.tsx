
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useFormData } from '@/contexts/FormDataContext';
import { BusinessHeader } from '@/components/preview/BusinessHeader';
import { MediaGallery } from '@/components/preview/MediaGallery';
import { BusinessOverview } from '@/components/preview/BusinessOverview';
import { ContactInformation } from '@/components/preview/ContactInformation';
import { BusinessDetails } from '@/components/preview/BusinessDetails';
import { Loader2 } from 'lucide-react';

const PreviewListing = () => {
  const { formData } = useFormData();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editListingId, setEditListingId] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Check if we're editing an existing listing or creating a new one
  useEffect(() => {
    const storedListingId = localStorage.getItem('editingListingId');
    if (storedListingId) {
      setIsEditing(true);
      setEditListingId(storedListingId);
      
      // Get stored image URLs and primary image index if any
      const storedImagesStr = localStorage.getItem('editingListingImages');
      if (storedImagesStr) {
        try {
          const storedImagesData = JSON.parse(storedImagesStr);
          if (Array.isArray(storedImagesData)) {
            // Legacy format - just array of URLs
            setGalleryImages(storedImagesData);
          } else if (storedImagesData.urls) {
            // New format with primaryIndex
            setGalleryImages(storedImagesData.urls);
            if (typeof storedImagesData.primaryIndex === 'number') {
              setPrimaryImageIndex(storedImagesData.primaryIndex);
            }
          }
        } catch (error) {
          console.error('Error parsing stored images:', error);
        }
      }
    }
    setIsInitialized(true);
  }, []);
  
  // Handle back button
  const handleBack = () => {
    if (isEditing && editListingId) {
      navigate(`/edit-listing/${editListingId}`);
    } else {
      navigate('/submit');
    }
  };
  
  // Convert File objects to URLs for preview (only for new listings)
  const imageURLs = React.useMemo(() => {
    if (isEditing) {
      // Use the stored gallery images when editing
      return galleryImages;
    } else {
      // For new listings, convert Files to URLs
      return formData.businessImages.map(file => URL.createObjectURL(file));
    }
  }, [formData.businessImages, isEditing, galleryImages]);
  
  // Create video URL if video exists
  const videoURL = React.useMemo(() => {
    if (formData.businessVideo) {
      return URL.createObjectURL(formData.businessVideo);
    }
    return formData.businessVideoUrl || '';
  }, [formData.businessVideo, formData.businessVideoUrl]);
  
  // Clean up URLs when component unmounts
  useEffect(() => {
    return () => {
      // Only revoke object URLs that we created for File objects
      if (!isEditing) {
        imageURLs.forEach(url => {
          if (url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
          }
        });
      }
      
      if (videoURL && formData.businessVideo && videoURL.startsWith('blob:')) {
        URL.revokeObjectURL(videoURL);
      }
      
      // Clear stored editing data
      localStorage.removeItem('editingListingId');
      localStorage.removeItem('editingListingImages');
    };
  }, [imageURLs, videoURL, formData.businessVideo, isEditing]);

  // Use the highlights directly from form data
  const highlights = formData.highlights || [];
  
  // Get primary image based on the primaryImageIndex
  const primaryImage = isEditing && primaryImageIndex < imageURLs.length 
    ? imageURLs[primaryImageIndex] 
    : (imageURLs.length > 0 ? imageURLs[0] : '');

  // Show loading state until we determine if we're editing or creating
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin" />
        </div>
      </div>
    );
  }
  
  // Process images for the gallery with primary image first
  const orderedImages = imageURLs;
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Logo header */}
      <header className="py-4 px-6 border-b">
        <div className="container mx-auto">
          <Link to="/" className="inline-block">
            <span className="text-2xl font-bold text-[#5B3DF5]">
              EmpireMarket
            </span>
          </Link>
        </div>
      </header>
      
      <div className="py-8 px-4 flex-grow bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          {/* Large hero banner with primary image */}
          <BusinessHeader 
            businessName={formData.businessName} 
            industry={formData.industry} 
            locationName={formData.locationName}
            flagCode={formData.flagCode}
            primaryImage={primaryImage}
            askingPrice={formData.askingPrice}
            currencyCode={formData.currencyCode || 'USD'}
          />
          
          {/* Revised layout with 2 columns starting right below the hero */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Left Column - Media Gallery and Business Overview */}
            <div className="lg:col-span-2 space-y-6">
              {/* Media Gallery exactly aligned with Business Overview */}
              <MediaGallery 
                galleryImages={orderedImages} 
                videoURL={videoURL} 
                autoplayVideo={true}
              />
              
              {/* Business Overview & Highlights */}
              <BusinessOverview description={formData.description} highlights={highlights} />
            </div>
            
            {/* Right Column - Business Details & Contact Information */}
            <div className="space-y-6">
              <BusinessDetails 
                annualRevenue={formData.annualRevenue}
                annualProfit={formData.annualProfit}
                currencyCode={formData.currencyCode || 'USD'}
                locationName={formData.locationName}
                industry={formData.industry}
                yearEstablished={formData.yearEstablished}
                employees={formData.employees}
                originalValues={formData.originalValues}
              />
              
              <ContactInformation 
                fullName={formData.fullName}
                email={formData.email}
                phone={formData.phone}
                role={formData.role}
              />
            </div>
          </div>
            
          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 mt-6">
            <Button variant="outline" onClick={handleBack}>
              {isEditing ? "Back to Edit" : "Back to Form"}
            </Button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PreviewListing;
