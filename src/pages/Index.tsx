
import React, { useState } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BusinessCard from '@/components/BusinessCard';

// Sample business data for the listing section
const businesses = [
  {
    id: '1',
    title: 'Premium Coffee Shop Chain',
    price: '$450,000',
    description: 'Established specialty coffee shop chain with 3 prime locations in central business district. Strong brand presence and loyal customer base.',
    category: 'Food & Beverage',
    location: 'Singapore',
    revenue: '$780K/year',
    imageUrl: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '2',
    title: 'E-commerce Fashion Retailer',
    price: '$1,200,000',
    description: 'Profitable online fashion business with international shipping capabilities. Premium brand identity and established supplier relationships.',
    category: 'Retail',
    location: 'Global',
    revenue: '$2.4M/year',
    imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '3',
    title: 'Modern Fitness Studio',
    price: '$350,000',
    description: 'Boutique fitness studio in upscale neighborhood with recurring membership model. Full suite of premium equipment and established clientele.',
    category: 'Fitness',
    location: 'Singapore',
    revenue: '$520K/year',
    imageUrl: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '4',
    title: 'Technology Consulting Agency',
    price: '$800,000',
    description: 'B2B technology consulting firm with long-term enterprise clients. Specializes in digital transformation and cloud migration services.',
    category: 'Technology',
    location: 'Singapore',
    revenue: '$1.3M/year',
    imageUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '5',
    title: 'Manufacturing & Distribution',
    price: '$1,800,000',
    description: 'Established manufacturing business with proprietary product line and distribution networks across Southeast Asia.',
    category: 'Manufacturing',
    location: 'Regional',
    revenue: '$3.2M/year',
    imageUrl: 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '6',
    title: 'Luxury Travel Agency',
    price: '$650,000',
    description: 'Premium travel agency specializing in luxury experiences for high-net-worth individuals. Strong industry relationships and high profit margins.',
    category: 'Travel',
    location: 'Global',
    revenue: '$1.8M/year',
    imageUrl: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  }
];

// Testimonial data
const testimonials = [
  {
    name: 'David Chen',
    position: 'Entrepreneur',
    content: 'EmpireMarket made it incredibly easy to find the perfect business. The platform\'s verification process gave me confidence, and I was able to close the deal within two months. Couldn\'t be happier with my investment!',
  },
  {
    name: 'Sarah Williams',
    position: 'Business Owner',
    content: 'I listed my e-commerce store on EmpireMarket and received multiple qualified offers within weeks. The team guided me through every step of the process, making what could have been a stressful experience surprisingly smooth.',
  }
];

const Index = () => {
  const [industry, setIndustry] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [minRevenue, setMinRevenue] = useState<string>('');
  const [maxRevenue, setMaxRevenue] = useState<string>('');

  const handleSearch = () => {
    // This would typically trigger a search with the filter parameters
    console.log({ industry, country, minRevenue, maxRevenue });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-[url('/lovable-uploads/a49736eb-98cb-4903-bec9-4ecba94673ae.png')] bg-cover bg-center h-screen">
        <div className="absolute inset-0 bg-black/40 z-0"></div>
        <div className="container mx-auto px-4 md:px-12 h-full flex items-center relative z-10">
          <div className="max-w-3xl text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight animate-fade-in">
              A Smarter Way to Buy and Sell Businesses
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mt-6 max-w-2xl animate-fade-in" style={{animationDelay: '0.2s'}}>
              List, discover, and acquire high-quality businesses across all industries with ease.
            </p>
            <div className="mt-10 flex flex-wrap gap-4 justify-center md:justify-start animate-fade-in" style={{animationDelay: '0.4s'}}>
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary-light text-white px-8"
              >
                Browse Listings
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-transparent text-white border-white hover:bg-white/10"
              >
                List a Business
              </Button>
            </div>
          </div>
        </div>

        {/* Search Filter Section */}
        <div className="absolute bottom-0 left-0 right-0 transform translate-y-1/2 px-4">
          <div className="container mx-auto">
            <div className="glass-effect rounded-xl p-6 md:p-8 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Select onValueChange={setIndustry}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="tech">Technology</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="food">Food & Beverage</SelectItem>
                        <SelectItem value="health">Health & Wellness</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="service">Service</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select onValueChange={setCountry}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="sg">Singapore</SelectItem>
                        <SelectItem value="global">Global</SelectItem>
                        <SelectItem value="my">Malaysia</SelectItem>
                        <SelectItem value="id">Indonesia</SelectItem>
                        <SelectItem value="th">Thailand</SelectItem>
                        <SelectItem value="ph">Philippines</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Input 
                    type="text" 
                    placeholder="Minimum Revenue" 
                    value={minRevenue}
                    onChange={e => setMinRevenue(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <Input 
                    type="text" 
                    placeholder="Maximum Revenue" 
                    value={maxRevenue}
                    onChange={e => setMaxRevenue(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-center">
                <Button 
                  onClick={handleSearch} 
                  className="bg-primary hover:bg-primary-light px-10"
                >
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-32 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 rounded-full p-6 mb-6">
                <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Browse Listings</h3>
              <p className="text-gray-600">
                Search through verified businesses that meet your criteria and investment goals.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 rounded-full p-6 mb-6">
                <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Connect & Evaluate</h3>
              <p className="text-gray-600">
                Contact sellers directly, analyze business details, and perform due diligence.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 rounded-full p-6 mb-6">
                <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Close the Deal</h3>
              <p className="text-gray-600">
                Complete your purchase securely with our guided transition process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Available Businesses Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Available Businesses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {businesses.map(business => (
              <BusinessCard
                key={business.id}
                {...business}
              />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button className="bg-primary hover:bg-primary-light px-8">
              View All Listings
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.position}</p>
                  </div>
                </div>
                <p className="text-gray-700">"{testimonial.content}"</p>
                <div className="mt-4 flex">
                  {[...Array(5)].map((_, starIndex) => (
                    <svg key={starIndex} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
