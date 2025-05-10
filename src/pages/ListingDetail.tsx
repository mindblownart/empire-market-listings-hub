
import React from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { 
  BusinessHeader, 
  BusinessOverview, 
  BusinessDetails, 
  MediaGallery, 
  ContactInformation 
} from '@/components/preview';

// Mock business data - in a real app, this would come from an API
const businessesData = {
  '1': {
    id: '1',
    title: 'Premium Coffee Shop Chain',
    price: '450000',
    description: 'Established specialty coffee shop chain with 3 prime locations in central business district. Strong brand presence and loyal customer base with consistent monthly revenue and growth potential in new areas. Business comes with full equipment, inventory, and trained staff ready for smooth transition.',
    category: 'Food & Beverage',
    location: 'Singapore',
    flagCode: 'SG',
    industry: 'food',
    revenue: '780000',
    profit: '210000',
    established: '2015',
    employees: '12',
    currencyCode: 'USD',
    primaryImage: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    ],
    videoURL: null,
    sellerInfo: {
      name: 'James Wilson',
      email: 'james@example.com',
      phone: '+1 (555) 123-4567',
      role: 'owner',
      reason: 'Relocating overseas',
      yearsOwned: 7,
    },
    highlights: [
      'Prime locations in high-foot-traffic areas',
      'Loyal customer base with 60% repeat customers',
      'Award-winning coffee blends with proprietary recipes',
      'Fully trained staff with low turnover rate',
      'Modern equipment and recently renovated spaces',
    ],
  },
  // Would add other listings here
};

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const business = id ? businessesData[id as keyof typeof businessesData] : null;
  
  if (!business) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Listing Not Found</h2>
            <p className="mt-2 text-gray-600">The business listing you're looking for doesn't exist or has been removed.</p>
            <Button className="mt-6 bg-primary hover:bg-primary-light" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Hero Section with Business Header */}
          <BusinessHeader 
            businessName={business.title}
            industry={business.category}
            locationName={business.location}
            flagCode={business.flagCode}
            primaryImage={business.primaryImage}
          />
          
          {/* 2. Media Gallery Section - Now placed directly below hero */}
          <div className="mb-8">
            <MediaGallery 
              galleryImages={business.galleryImages}
              videoURL={business.videoURL}
            />
          </div>
          
          {/* 3. Main Content Grid - Updated layout with left and right sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Left Column - Business Overview & Highlights */}
            <div className="lg:col-span-2 space-y-8">
              <BusinessOverview 
                description={business.description}
                highlights={business.highlights}
              />
            </div>
            
            {/* Right Column - Business Details & Contact */}
            <div className="space-y-8">
              <BusinessDetails 
                askingPrice={business.price}
                annualRevenue={business.revenue}
                annualProfit={business.profit}
                currencyCode={business.currencyCode}
                locationName={business.location}
                industry={business.industry}
                yearEstablished={business.established}
                employees={business.employees}
              />
              
              <ContactInformation 
                fullName={business.sellerInfo.name}
                email={business.sellerInfo.email}
                phone={business.sellerInfo.phone}
                role={business.sellerInfo.role}
              />
              
              <div className="mt-6">
                <Button className="w-full bg-primary hover:bg-primary-light">
                  Contact Seller
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

export default ListingDetail;
