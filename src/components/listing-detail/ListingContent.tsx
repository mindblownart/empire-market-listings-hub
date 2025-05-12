
import React from 'react';
import { Button } from '@/components/ui/button';
import { BusinessListing } from '@/types/supabase';
import { 
  BusinessHeader, 
  BusinessOverview, 
  BusinessDetails, 
  MediaGallery, 
  ContactInformation 
} from '@/components/preview';

interface ListingContentProps {
  business: BusinessListing;
}

export const ListingContent: React.FC<ListingContentProps> = ({ business }) => {
  // Always use primary_image_url as the hero image
  const heroImage = business.primary_image_url;
  
  // Ensure location is properly formatted for flag display
  const flagCode = business.location ? business.location.toLowerCase() : "gl";

  return (
    <>
      {/* 1. Hero Section with Business Header and Asking Price */}
      <div className="mb-6">
        <BusinessHeader 
          businessName={business.business_name} 
          industry={business.category} 
          location={business.location} 
          flagCode={flagCode} 
          primaryImage={heroImage} 
          askingPrice={business.asking_price} 
          currencyCode={business.currency_code} 
        />
      </div>
      
      {/* Revised layout with 2 columns starting right below the hero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Media Gallery and Business Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Media Gallery exactly aligned with Business Overview */}
          <MediaGallery 
            galleryImages={business.gallery_images || []} 
            videoURL={business.video_url || undefined} 
            autoplayVideo={true} 
            skipPrimaryImage={true} // Skip primary image since it's shown in hero
          />
          
          {/* Business Overview & Highlights */}
          <BusinessOverview 
            askingPrice={business.asking_price}
            annualRevenue={business.annual_revenue}
            annualProfit={business.annual_profit}
            currencyCode={business.currency_code}
            description={business.description || ''} 
            highlights={business.highlights || []} 
          />
        </div>
        
        {/* Right Column - Business Details & Contact Information */}
        <div className="space-y-6">
          <BusinessDetails 
            annualRevenue={business.annual_revenue} 
            annualProfit={business.annual_profit} 
            currencyCode={business.currency_code} 
            location={business.location} 
            industry={business.category} 
            yearEstablished={business.year_established?.toString() || 'N/A'} 
            employees={business.employees || 'N/A'} 
          />
          
          <ContactInformation 
            contactName={business.contact_name || 'Contact not provided'} 
            contactEmail={business.contact_email || 'Email not provided'} 
            contactPhone={business.contact_phone || 'Phone not provided'} 
            contactRole={business.contact_role || 'Role not specified'} 
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
