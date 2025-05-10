
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useFormData } from '@/contexts/FormDataContext';
import { BusinessHeader } from '@/components/preview/BusinessHeader';
import { MediaGallery } from '@/components/preview/MediaGallery';
import { BusinessOverview } from '@/components/preview/BusinessOverview';
import { ContactInformation } from '@/components/preview/ContactInformation';
import { BusinessDetails } from '@/components/preview/BusinessDetails';

const PreviewListing = () => {
  const { formData } = useFormData();
  const navigate = useNavigate();
  
  // Handle back button
  const handleBack = () => {
    navigate('/submit');
  };
  
  // Convert File objects to URLs for preview
  const imageURLs = React.useMemo(() => {
    return formData.businessImages.map(file => URL.createObjectURL(file));
  }, [formData.businessImages]);
  
  // Create video URL if video exists
  const videoURL = React.useMemo(() => {
    if (formData.businessVideo) {
      return URL.createObjectURL(formData.businessVideo);
    }
    return formData.businessVideoUrl || '';
  }, [formData.businessVideo, formData.businessVideoUrl]);
  
  // Clean up URLs when component unmounts
  React.useEffect(() => {
    return () => {
      imageURLs.forEach(URL.revokeObjectURL);
      if (videoURL && formData.businessVideo) URL.revokeObjectURL(videoURL);
    };
  }, [imageURLs, videoURL, formData.businessVideo]);

  // Helper function to format business highlights from description (optional)
  const getBusinessHighlights = () => {
    if (!formData.description) return [];
    
    // Simple algorithm to extract potential bullet points
    // Look for sentences that might be highlights (short, start with action verbs or numbers)
    const sentences = formData.description.split(/[.!?]/).filter(s => s.trim().length > 0);
    
    // Filter for potential highlights (shorter sentences that might be feature points)
    return sentences
      .filter(s => s.trim().length > 10 && s.trim().length < 100)
      .map(s => s.trim())
      .slice(0, 4); // Limit to 4 highlights
  };

  const highlights = getBusinessHighlights();
  const primaryImage = imageURLs.length > 0 ? imageURLs[0] : '';
  const galleryImages = imageURLs;
  
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
          
          {/* Media Gallery Section - Directly below hero */}
          <div className="mx-auto max-w-3xl py-4">
            <MediaGallery 
              galleryImages={galleryImages} 
              videoURL={videoURL} 
              autoplayVideo={true} 
            />
          </div>
            
          {/* Main content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
            {/* Left Column - Business Overview */}
            <div className="md:col-span-2 space-y-8">
              {/* Business Overview */}
              <BusinessOverview description={formData.description} highlights={highlights} />
            </div>
            
            {/* Right Column - Business Details */}
            <div className="space-y-8">
              {/* Business Details Card */}
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
              
              {/* Contact Information */}
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
              Back to Edit
            </Button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PreviewListing;
