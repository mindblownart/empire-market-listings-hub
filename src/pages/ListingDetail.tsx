
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { BusinessHeader, BusinessOverview, BusinessDetails, MediaGallery, ContactInformation } from '@/components/preview';
import { ChevronLeft } from 'lucide-react';

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
    primaryImage: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    galleryImages: ['https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'],
    videoURL: null,
    sellerInfo: {
      name: 'James Wilson',
      email: 'james@example.com',
      phone: '+1 (555) 123-4567',
      role: 'owner',
      reason: 'Relocating overseas',
      yearsOwned: 7
    },
    highlights: ['Prime locations in high-foot-traffic areas', 'Loyal customer base with 60% repeat customers', 'Award-winning coffee blends with proprietary recipes', 'Fully trained staff with low turnover rate', 'Modern equipment and recently renovated spaces']
  },
  '2': {
    id: '2',
    title: 'E-commerce Fashion Retailer',
    price: '1200000',
    description: 'Profitable online fashion business with international shipping capabilities. Premium brand identity and established supplier relationships. Growing customer base across multiple countries with high repeat purchase rate.',
    category: 'Retail',
    location: 'Global',
    flagCode: 'GL',
    industry: 'retail',
    revenue: '2400000',
    profit: '620000',
    established: '2017',
    employees: '8',
    currencyCode: 'USD',
    primaryImage: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    galleryImages: ['https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1508599804355-0204969ff56f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'],
    videoURL: null,
    sellerInfo: {
      name: 'Sophia Chen',
      email: 'sophia@example.com',
      phone: '+1 (555) 987-6543',
      role: 'founder',
      reason: 'New ventures',
      yearsOwned: 5
    },
    highlights: ['Established relationships with premium suppliers', 'Proprietary e-commerce platform with advanced features', '85% positive customer reviews', 'Extensive customer database', 'Scalable fulfillment operations']
  },
  '3': {
    id: '3',
    title: 'Modern Fitness Studio',
    price: '350000',
    description: 'Boutique fitness studio in upscale neighborhood with recurring membership model. Full suite of premium equipment and established clientele. Dedicated instructors with specialized certifications.',
    category: 'Fitness',
    location: 'Singapore',
    flagCode: 'SG',
    industry: 'health',
    revenue: '520000',
    profit: '175000',
    established: '2018',
    employees: '10',
    currencyCode: 'USD',
    primaryImage: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    galleryImages: ['https://images.unsplash.com/photo-1593079831268-3381b0db4a77?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'],
    videoURL: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
    sellerInfo: {
      name: 'David Park',
      email: 'david@example.com',
      phone: '+1 (555) 234-5678',
      role: 'owner',
      reason: 'Family relocation',
      yearsOwned: 4
    },
    highlights: ['Premium location in high-income neighborhood', '150+ recurring monthly memberships', 'State-of-the-art equipment', 'Highly rated instructors', 'Established brand in local fitness community']
  },
  '4': {
    id: '4',
    title: 'Technology Consulting Agency',
    price: '800000',
    description: 'B2B technology consulting firm with long-term enterprise clients. Specializes in digital transformation and cloud migration services. Team of experienced consultants with industry certifications.',
    category: 'Technology',
    location: 'Singapore',
    flagCode: 'SG',
    industry: 'tech',
    revenue: '1300000',
    profit: '450000',
    established: '2016',
    employees: '15',
    currencyCode: 'USD',
    primaryImage: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    galleryImages: ['https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'],
    videoURL: null,
    sellerInfo: {
      name: 'Michael Wong',
      email: 'michael@example.com',
      phone: '+1 (555) 345-6789',
      role: 'CEO',
      reason: 'Strategic merger',
      yearsOwned: 6
    },
    highlights: ['8 enterprise-level clients on long-term contracts', 'Team of certified cloud architects and consultants', 'Proprietary project management methodology', 'Industry recognition and awards', 'Strong partnership network with major tech providers']
  },
  '5': {
    id: '5',
    title: 'Manufacturing & Distribution',
    price: '1800000',
    description: 'Established manufacturing business with proprietary product line and distribution networks across Southeast Asia. Efficient production facility with modern equipment and trained staff.',
    category: 'Manufacturing',
    location: 'Regional',
    flagCode: 'AS',
    industry: 'manufacturing',
    revenue: '3200000',
    profit: '860000',
    established: '2010',
    employees: '35',
    currencyCode: 'USD',
    primaryImage: 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    galleryImages: ['https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1621264448270-9ef00e4e3c80?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'],
    videoURL: null,
    sellerInfo: {
      name: 'Robert Tan',
      email: 'robert@example.com',
      phone: '+1 (555) 456-7890',
      role: 'founder',
      reason: 'Retirement',
      yearsOwned: 12
    },
    highlights: ['Proprietary manufacturing processes', 'Established distribution network in 6 countries', 'Modern production facility with high efficiency', '20+ product line with consistent demand', 'Experienced production team']
  },
  '6': {
    id: '6',
    title: 'Luxury Travel Agency',
    price: '650000',
    description: 'Premium travel agency specializing in luxury experiences for high-net-worth individuals. Strong industry relationships and high profit margins. Exclusive partnerships with premium hospitality brands worldwide.',
    category: 'Travel',
    location: 'Global',
    flagCode: 'GL',
    industry: 'service',
    revenue: '1800000',
    profit: '520000',
    established: '2014',
    employees: '8',
    currencyCode: 'USD',
    primaryImage: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    galleryImages: ['https://images.unsplash.com/photo-1530521954074-e64f6810b32d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'],
    videoURL: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
    sellerInfo: {
      name: 'Elizabeth Lee',
      email: 'elizabeth@example.com',
      phone: '+1 (555) 567-8901',
      role: 'managing director',
      reason: 'Career change',
      yearsOwned: 7
    },
    highlights: ['Database of 300+ high-net-worth clients', 'Exclusive agreements with luxury resorts and services', 'Award-winning concierge team', 'Specialized luxury expedition planning', 'High client retention rate']
  }
};

const ListingDetail = () => {
  const { id } = useParams<{ id: string; }>();
  const business = id ? businessesData[id as keyof typeof businessesData] : null;

  if (!business) {
    return <div className="min-h-screen flex flex-col">
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
      </div>;
  }

  // Media priority logic:
  // 1. Use video as hero if available
  // 2. Otherwise use explicit primaryImage if set
  // 3. Otherwise use first gallery image
  // 4. If no media at all, undefined will trigger fallback
  const hasVideo = !!business.videoURL;
  const heroImage = business.primaryImage || (business.galleryImages.length > 0 ? business.galleryImages[0] : undefined);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-20 px-4 pb-12">
        <div className="container mx-auto max-w-7xl">
          {/* Back Button */}
          <Link to="/" className="flex items-center text-gray-600 mb-4 hover:text-primary transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span>Back to Listings</span>
          </Link>
          
          {/* 1. Hero Section with Business Header and Asking Price */}
          <div className="mb-6">
            <BusinessHeader 
              businessName={business.title} 
              industry={business.category} 
              locationName={business.location} 
              flagCode={business.flagCode} 
              primaryImage={heroImage} 
              askingPrice={business.price} 
              currencyCode={business.currencyCode} 
            />
          </div>
          
          {/* Revised layout with 2 columns starting right below the hero */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Media Gallery and Business Overview */}
            <div className="lg:col-span-2 space-y-6">
              {/* Media Gallery exactly aligned with Business Overview */}
              <MediaGallery 
                galleryImages={business.galleryImages} 
                videoURL={business.videoURL} 
                autoplayVideo={true} 
              />
              
              {/* Business Overview & Highlights */}
              <BusinessOverview description={business.description} highlights={business.highlights} />
            </div>
            
            {/* Right Column - Business Details & Contact Information */}
            <div className="space-y-6">
              <BusinessDetails 
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
              
              {/* Contact Seller Button */}
              <Button className="w-full bg-[#9b87f5] hover:bg-[#8673e0] py-6 h-auto text-white text-lg font-medium">
                Contact Seller
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ListingDetail;
