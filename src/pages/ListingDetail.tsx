import React from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  EuroIcon, 
  PoundSterlingIcon, 
  JapaneseYen 
} from 'lucide-react';

// Get the appropriate currency icon based on currency code
const getCurrencyIcon = (currencyCode: string) => {
  switch(currencyCode) {
    case 'EUR':
      return <EuroIcon className="h-4 w-4 mr-2" />;
    case 'GBP':
      return <PoundSterlingIcon className="h-4 w-4 mr-2" />;
    case 'JPY':
      return <JapaneseYen className="h-4 w-4 mr-2" />;
    case 'USD':
    case 'SGD':
    case 'AUD':
    case 'CAD':
    default:
      return <DollarSign className="h-4 w-4 mr-2" />;
  }
};

// Mock business data - in a real app, this would come from an API
const businessesData = {
  '1': {
    id: '1',
    title: 'Premium Coffee Shop Chain',
    price: '$450,000',
    description: 'Established specialty coffee shop chain with 3 prime locations in central business district. Strong brand presence and loyal customer base with consistent monthly revenue and growth potential in new areas. Business comes with full equipment, inventory, and trained staff ready for smooth transition.',
    category: 'Food & Beverage',
    location: 'Singapore',
    revenue: '$780K/year',
    profit: '$210K/year',
    established: '2015',
    employees: '12',
    imageUrl: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    ],
    sellerInfo: {
      name: 'James Wilson',
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
      
      <main className="flex-grow pt-24">
        {/* Hero Section with Main Image */}
        <div className="relative h-96">
          <img 
            src={business.imageUrl} 
            alt={business.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full p-8">
            <div className="container mx-auto">
              <div className="flex flex-wrap justify-between items-end">
                <div className="mb-4 md:mb-0">
                  <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                    {business.category}
                  </span>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mt-3">{business.title}</h1>
                  <p className="text-white/90 mt-2">{business.location}</p>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-600">Asking Price</p>
                  <p className="text-3xl font-bold text-primary">{business.price}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content Section */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl p-8 shadow-md mb-8">
                <h2 className="text-2xl font-semibold mb-4">Business Overview</h2>
                <p className="text-gray-700 mb-8">{business.description}</p>
                
                <h3 className="text-xl font-semibold mb-4">Business Highlights</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-8">
                  {business.highlights.map((highlight, index) => (
                    <li key={index}>{highlight}</li>
                  ))}
                </ul>
                
                <h3 className="text-xl font-semibold mb-4">Additional Photos</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {business.additionalImages.map((image, index) => (
                    <div key={index} className="rounded-lg overflow-hidden h-48">
                      <img src={image} alt={`${business.title} - ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 shadow-md mb-6 sticky top-24">
                <h3 className="text-lg font-semibold border-b pb-4 mb-4">Business Details</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Revenue</span>
                    <span className="font-medium">{business.revenue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Profit</span>
                    <span className="font-medium">{business.profit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Established</span>
                    <span className="font-medium">{business.established}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Employees</span>
                    <span className="font-medium">{business.employees}</span>
                  </div>
                </div>
                
                <div className="border-t border-b py-4 my-6">
                  <h4 className="font-medium mb-2">Seller Information</h4>
                  <p className="text-sm text-gray-600">Owned for {business.sellerInfo.yearsOwned} years</p>
                  <p className="text-sm text-gray-600">Reason for selling: {business.sellerInfo.reason}</p>
                </div>
                
                <Button className="w-full bg-primary hover:bg-primary-light mb-3">
                  Contact Seller
                </Button>
                <Button variant="outline" className="w-full">
                  Request Financials
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
