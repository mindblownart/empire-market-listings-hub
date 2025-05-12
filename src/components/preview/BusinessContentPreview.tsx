
import React, { useEffect } from 'react';
import { 
  BusinessHeader, 
  BusinessOverview, 
  BusinessDetails, 
  MediaGallery, 
  ContactInformation 
} from '@/components/preview';
import { Button } from '@/components/ui/button';

interface BusinessContentPreviewProps {
  formData: any;
  imageUrls: string[];
  videoURL: string | null;
  flagCode: string;
}

const BusinessContentPreview: React.FC<BusinessContentPreviewProps> = ({
  formData,
  imageUrls,
  videoURL,
  flagCode
}) => {
  // Debug logging
  useEffect(() => {
    // Log all properties for debugging purposes
    console.log("BusinessContentPreview rendered with props:", {
      formDataKeys: Object.keys(formData),
      imageUrlsCount: imageUrls.length,
      imageUrls: imageUrls,
      videoURL: videoURL,
      flagCode
    });
  }, [formData, imageUrls, videoURL, flagCode]);
  
  // Ensure we have a valid primary image for the hero section
  const primaryImage = imageUrls.length > 0 ? imageUrls[0] : undefined;
  
  return (
    <>
      {/* Hero Section with Business Header */}
      <div className="mb-6">
        <BusinessHeader 
          businessName={formData.businessName} 
          industry={formData.industry} 
          location={formData.location} 
          flagCode={flagCode}
          primaryImage={primaryImage}
          askingPrice={formData.askingPrice}
          currencyCode={formData.currencyCode}
        />
      </div>
      
      {/* Revised layout with 2 columns starting right below the hero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Media Gallery and Business Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pass video URL correctly to MediaGallery */}
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
    </>
  );
};

export default BusinessContentPreview;
