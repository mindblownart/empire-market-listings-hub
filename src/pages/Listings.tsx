import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue, 
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import BusinessCard from '@/components/BusinessCard';
import Navbar from '@/components/Navbar';
import HomeFooter from '@/components/HomeFooter';

// Sample business data, in a real app this would come from an API
const sampleBusinesses = [
  {
    id: '1',
    title: 'Premium Coffee Shop Chain',
    price: '$450,000',
    description: 'Established specialty coffee shop chain with 3 prime locations in central business district. Strong brand presence and loyal customer base.',
    category: 'Food & Beverage',
    location: 'Singapore',
    revenue: '$780K/year',
    imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    isNew: true,
    isHot: false,
  },
  {
    id: '2',
    title: 'E-commerce Fashion Retailer',
    price: '$1,200,000',
    description: 'Profitable online fashion business with international shipping capabilities. Premium brand identity and established supplier relationships.',
    category: 'Retail',
    location: 'Global',
    revenue: '$2.4M/year',
    imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    isNew: false,
    isHot: true,
  },
  {
    id: '3',
    title: 'Modern Fitness Studio',
    price: '$350,000',
    description: 'Boutique fitness studio in upscale neighborhood with recurring membership model. Full suite of premium equipment and established clientele.',
    category: 'Fitness',
    location: 'Singapore',
    revenue: '$520K/year',
    imageUrl: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    isNew: true,
    isHot: false,
  },
  {
    id: '4',
    title: 'Technology Consulting Agency',
    price: '$800,000',
    description: 'B2B technology consulting firm with long-term enterprise clients. Specializes in digital transformation and cloud migration services.',
    category: 'Technology',
    location: 'Singapore',
    revenue: '$1.3M/year',
    imageUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    isNew: false,
    isHot: false,
  },
  {
    id: '5',
    title: 'Manufacturing & Distribution',
    price: '$1,800,000',
    description: 'Established manufacturing business with proprietary product line and distribution networks across Southeast Asia.',
    category: 'Manufacturing',
    location: 'Regional',
    revenue: '$3.2M/year',
    imageUrl: 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    isNew: false,
    isHot: true,
  },
  {
    id: '6',
    title: 'Luxury Travel Agency',
    price: '$650,000',
    description: 'Premium travel agency specializing in luxury experiences for high-net-worth individuals. Strong industry relationships and high profit margins.',
    category: 'Travel',
    location: 'Global',
    revenue: '$1.8M/year',
    imageUrl: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    isNew: false,
    isHot: false,
  },
  {
    id: '7',
    title: 'IT Support Services',
    price: '$550,000',
    description: 'Established IT support company with recurring contracts in the financial sector. High-margin business with stable client base.',
    category: 'Technology',
    location: 'Singapore',
    revenue: '$910K/year',
    imageUrl: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    isNew: true,
    isHot: false,
  },
  {
    id: '8',
    title: 'Restaurant With Outdoor Seating',
    price: '$380,000',
    description: 'Popular restaurant located in tourist district with beautiful outdoor dining area. Strong weekend revenue and positive online reviews.',
    category: 'Food & Beverage',
    location: 'Singapore',
    revenue: '$620K/year',
    imageUrl: 'https://images.unsplash.com/photo-1555992336-fb0d29498b13?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    isNew: false,
    isHot: false,
  },
  {
    id: '9',
    title: 'Beauty & Wellness Spa',
    price: '$250,000',
    description: 'Successful wellness spa in upscale shopping district offering luxury treatments and products. Dedicated client base with high retention rate.',
    category: 'Health & Wellness',
    location: 'Singapore',
    revenue: '$480K/year',
    imageUrl: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    isNew: false,
    isHot: true,
  },
];

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'tech', label: 'Technology' },
  { value: 'retail', label: 'Retail' },
  { value: 'food', label: 'Food & Beverage' },
  { value: 'health', label: 'Health & Wellness' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'service', label: 'Service' },
  { value: 'travel', label: 'Travel' },
  { value: 'fitness', label: 'Fitness' },
];

const locations = [
  { value: 'all', label: 'All Locations' },
  { value: 'sg', label: 'Singapore' },
  { value: 'global', label: 'Global' },
  { value: 'regional', label: 'Regional' },
];

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-high', label: 'Price High to Low' },
  { value: 'price-low', label: 'Price Low to High' },
  { value: 'revenue-high', label: 'Revenue High to Low' },
];

const Listings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [location, setLocation] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 2000000]);
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredBusinesses, setFilteredBusinesses] = useState(sampleBusinesses);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  
  const itemsPerPage = 9;
  const maxPrice = 2000000;
  
  // Format price display for the slider
  const formatPriceDisplay = (price: number) => {
    return price >= 1000000 
      ? `$${(price / 1000000).toFixed(1)}M` 
      : `$${(price / 1000).toFixed(0)}K`;
  };

  // Apply filters and sorting
  useEffect(() => {
    let results = [...sampleBusinesses];
    
    // Filter by search term
    if (searchTerm) {
      results = results.filter(business => 
        business.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        business.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by category
    if (category !== 'all') {
      results = results.filter(business => 
        business.category.toLowerCase().includes(category.toLowerCase())
      );
    }
    
    // Filter by location
    if (location !== 'all') {
      results = results.filter(business => 
        business.location.toLowerCase().includes(location.toLowerCase())
      );
    }
    
    // Filter by price range
    results = results.filter(business => {
      const businessPrice = parseInt(business.price.replace(/[^0-9]/g, ''));
      return businessPrice >= priceRange[0] && businessPrice <= priceRange[1];
    });
    
    // Apply sorting
    switch (sortBy) {
      case 'newest':
        // In a real app, would sort by date created
        break;
      case 'price-high':
        results.sort((a, b) => 
          parseInt(b.price.replace(/[^0-9]/g, '')) - parseInt(a.price.replace(/[^0-9]/g, ''))
        );
        break;
      case 'price-low':
        results.sort((a, b) => 
          parseInt(a.price.replace(/[^0-9]/g, '')) - parseInt(b.price.replace(/[^0-9]/g, ''))
        );
        break;
      case 'revenue-high':
        results.sort((a, b) => {
          const revenueA = parseInt(a.revenue.replace(/[^0-9]/g, ''));
          const revenueB = parseInt(b.revenue.replace(/[^0-9]/g, ''));
          return revenueB - revenueA;
        });
        break;
      default:
        break;
    }
    
    setFilteredBusinesses(results);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, category, location, priceRange, sortBy]);
  
  // Get current page items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBusinesses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBusinesses.length / itemsPerPage);

  // Calculate pagination items
  const getPaginationItems = () => {
    const items = [];
    
    // Always show first page
    items.push(
      <PaginationItem key="first">
        <PaginationLink 
          onClick={() => setCurrentPage(1)} 
          isActive={currentPage === 1}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );
    
    // Show ellipsis if needed
    if (currentPage > 3) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Add pages before current
    for (let i = Math.max(2, currentPage - 1); i < currentPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink onClick={() => setCurrentPage(i)}>
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Add current page if not first or last
    if (currentPage !== 1 && currentPage !== totalPages) {
      items.push(
        <PaginationItem key={currentPage}>
          <PaginationLink isActive>
            {currentPage}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Add pages after current
    for (let i = currentPage + 1; i < Math.min(totalPages, currentPage + 2); i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink onClick={() => setCurrentPage(i)}>
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Show ellipsis if needed
    if (currentPage < totalPages - 2) {
      items.push(
        <PaginationItem key="ellipsis-2">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Always show last page if there is more than one page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key="last">
          <PaginationLink 
            onClick={() => setCurrentPage(totalPages)} 
            isActive={currentPage === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
  };

  const toggleFilters = () => {
    setIsFilterVisible(!isFilterVisible);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pb-12 pt-24">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Available Businesses</h1>
            <p className="text-gray-600">Browse our curated selection of high-potential businesses for sale.</p>
          </div>

          {/* Search and Filter Section - Now with sticky positioning */}
          <div className="bg-white rounded-lg shadow-md mb-8 sticky top-[72px] z-20 border-b border-gray-100">
            <div className="p-4 flex flex-wrap items-center gap-4">
              <div className="relative w-full md:w-auto flex-grow">
                <Input
                  type="search"
                  placeholder="Search listings..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>

              <div className="w-full md:w-auto flex flex-wrap gap-2 md:ml-auto">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button 
                  variant="outline" 
                  onClick={toggleFilters}
                  className="flex items-center gap-2"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </Button>
              </div>
            </div>

            {/* Advanced Filters - Collapsible */}
            {isFilterVisible && (
              <div className="border-t border-gray-200 p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map(loc => (
                        <SelectItem key={loc.value} value={loc.value}>
                          {loc.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price Range: {formatPriceDisplay(priceRange[0])} - {formatPriceDisplay(priceRange[1])}
                  </label>
                  <Slider
                    defaultValue={[0, maxPrice]}
                    min={0}
                    max={maxPrice}
                    step={50000}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="py-4"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Listings Grid */}
          {currentItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentItems.map(business => (
                <BusinessCard
                  key={business.id}
                  {...business}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
              <p className="text-gray-600">
                No listings match your search. Try adjusting filters or check back later.
              </p>
            </div>
          )}

          {/* Pagination */}
          {filteredBusinesses.length > 0 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {getPaginationItems()}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </main>

      <HomeFooter />
    </div>
  );
};

export default Listings;
