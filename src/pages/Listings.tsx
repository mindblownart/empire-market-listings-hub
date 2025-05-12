
import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Link, useLocation } from 'react-router-dom';
import BusinessCard from '@/components/BusinessCard';
import Navbar from '@/components/Navbar';
import HomeFooter from '@/components/HomeFooter';
import { supabase } from '@/lib/supabase';
import { BusinessListing } from '@/types/supabase';
import { useToast } from '@/components/ui/use-toast';

// Categories and locations for filtering
const categories = [{
  value: 'all',
  label: 'All Categories'
}, {
  value: 'tech',
  label: 'Technology'
}, {
  value: 'retail',
  label: 'Retail'
}, {
  value: 'food',
  label: 'Food & Beverage'
}, {
  value: 'health',
  label: 'Health & Wellness'
}, {
  value: 'manufacturing',
  label: 'Manufacturing'
}, {
  value: 'service',
  label: 'Service'
}, {
  value: 'travel',
  label: 'Travel'
}, {
  value: 'fitness',
  label: 'Fitness'
}];

const locations = [{
  value: 'all',
  label: 'All Locations'
}, {
  value: 'sg',
  label: 'Singapore'
}, {
  value: 'global',
  label: 'Global'
}, {
  value: 'regional',
  label: 'Regional'
}];

const sortOptions = [{
  value: 'newest',
  label: 'Newest'
}, {
  value: 'price-high',
  label: 'Price High to Low'
}, {
  value: 'price-low',
  label: 'Price Low to High'
}, {
  value: 'revenue-high',
  label: 'Revenue High to Low'
}];

const Listings = () => {
  const location = useLocation();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 2000000]);
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userSession, setUserSession] = useState(null);
  
  const itemsPerPage = 9;
  const maxPrice = 2000000;

  // Parse query parameters from the URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    const locationParam = params.get('location');
    const minRevenueParam = params.get('minRevenue');
    const maxRevenueParam = params.get('maxRevenue');
    
    // Check if we should reset filters based on location state
    const resetFilters = location.state?.resetFilters;
    
    if (resetFilters) {
      // Reset all filters
      setSearchTerm('');
      setCategory('all');
      setLocationFilter('all');
      setPriceRange([0, maxPrice]);
      setSortBy('newest');
      // Clear location state to prevent repeated resets
      window.history.replaceState({}, document.title, location.pathname);
    } else {
      // Apply URL parameters as filters if they exist
      if (categoryParam) setCategory(categoryParam);
      if (locationParam) setLocationFilter(locationParam);
      // Handle min/max revenue if needed
      if (minRevenueParam) {
        const min = parseInt(minRevenueParam);
        const max = maxRevenueParam ? parseInt(maxRevenueParam) : maxPrice;
        setPriceRange([min, max]);
      }
    }
  }, [location]);

  // Check user authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setUserSession(data.session);
    };
    
    checkAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUserSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Enable real-time updates for business listings
  useEffect(() => {
    // Set up real-time listener for business_listings table
    const channel = supabase
      .channel('public:business_listings')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'business_listings' 
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          // Refresh listings when any change happens
          fetchBusinesses();
        }
      )
      .subscribe();

    // Fetch initial data
    fetchBusinesses();

    // Clean up subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userSession]);

  // Fetch businesses from Supabase
  const fetchBusinesses = async () => {
    setIsLoading(true);
    try {
      // Modified query to include all published listings OR the user's own listings
      let query = supabase.from('business_listings').select('*');
      
      // If user is logged in, get published listings OR their own listings
      // If not logged in, only get published listings
      if (userSession) {
        query = query.or(`is_published.eq.true,user_id.eq.${userSession.user.id}`);
      } else {
        query = query.eq('is_published', true);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching business listings:', error);
        toast({
          title: "Error loading listings",
          description: "There was a problem loading the business listings. Please try again.",
          variant: "destructive",
        });
        setBusinesses([]);
      } else if (data && data.length > 0) {
        // Map the business listings to match the BusinessCard component props
        const mappedBusinesses = data.map(listing => ({
          id: listing.id,
          title: listing.business_name,
          price: listing.asking_price,
          description: listing.description,
          category: listing.category,
          location: listing.location,
          revenue: listing.annual_revenue,
          imageUrl: listing.primary_image_url || '/placeholder.svg',
          currencyCode: listing.currency_code,
          isNew: listing.is_new,
          isHot: listing.is_hot,
          // Add a property to indicate if this is the current user's listing
          isOwnListing: userSession && listing.user_id === userSession.user.id,
          userId: listing.user_id
        }));
        
        setBusinesses(mappedBusinesses);
      } else {
        setBusinesses([]);
      }
    } catch (error) {
      console.error('Error fetching business listings:', error);
      toast({
        title: "Error loading listings",
        description: "There was a problem loading the business listings. Please try again.",
        variant: "destructive",
      });
      setBusinesses([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Format price display for the slider
  const formatPriceDisplay = (price: number) => {
    return price >= 1000000 ? `$${(price / 1000000).toFixed(1)}M` : `$${(price / 1000).toFixed(0)}K`;
  };

  // Apply filters and sorting
  useEffect(() => {
    let results = [...businesses];

    // Filter by search term
    if (searchTerm) {
      results = results.filter(business => 
        business.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        business.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (category !== 'all') {
      results = results.filter(business => 
        business.category?.toLowerCase().includes(category.toLowerCase())
      );
    }

    // Filter by location
    if (locationFilter !== 'all') {
      results = results.filter(business => 
        business.location?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    // Filter by price range
    results = results.filter(business => {
      if (!business.price) return true;
      const businessPrice = parseInt(business.price.replace(/[^0-9]/g, ''));
      return businessPrice >= priceRange[0] && businessPrice <= priceRange[1];
    });

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        // In a real app, would sort by date created
        break;
      case 'price-high':
        results.sort((a, b) => {
          const priceA = a.price ? parseInt(a.price.replace(/[^0-9]/g, '')) : 0;
          const priceB = b.price ? parseInt(b.price.replace(/[^0-9]/g, '')) : 0;
          return priceB - priceA;
        });
        break;
      case 'price-low':
        results.sort((a, b) => {
          const priceA = a.price ? parseInt(a.price.replace(/[^0-9]/g, '')) : 0;
          const priceB = b.price ? parseInt(b.price.replace(/[^0-9]/g, '')) : 0;
          return priceA - priceB;
        });
        break;
      case 'revenue-high':
        results.sort((a, b) => {
          const revenueA = a.revenue ? parseInt(a.revenue.replace(/[^0-9]/g, '')) : 0;
          const revenueB = b.revenue ? parseInt(b.revenue.replace(/[^0-9]/g, '')) : 0;
          return revenueB - revenueA;
        });
        break;
      default:
        break;
    }
    setFilteredBusinesses(results);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, category, locationFilter, priceRange, sortBy, businesses]);

  // Get current page items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBusinesses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBusinesses.length / itemsPerPage);

  // Calculate pagination items
  const getPaginationItems = () => {
    const items = [];

    // Always show first page
    items.push(<PaginationItem key="first">
        <PaginationLink onClick={() => setCurrentPage(1)} isActive={currentPage === 1}>
          1
        </PaginationLink>
      </PaginationItem>);

    // Show ellipsis if needed
    if (currentPage > 3) {
      items.push(<PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>);
    }

    // Add pages before current
    for (let i = Math.max(2, currentPage - 1); i < currentPage; i++) {
      items.push(<PaginationItem key={i}>
          <PaginationLink onClick={() => setCurrentPage(i)}>
            {i}
          </PaginationLink>
        </PaginationItem>);
    }

    // Add current page if not first or last
    if (currentPage !== 1 && currentPage !== totalPages) {
      items.push(<PaginationItem key={currentPage}>
          <PaginationLink isActive>
            {currentPage}
          </PaginationLink>
        </PaginationItem>);
    }

    // Add pages after current
    for (let i = currentPage + 1; i < Math.min(totalPages, currentPage + 2); i++) {
      items.push(<PaginationItem key={i}>
          <PaginationLink onClick={() => setCurrentPage(i)}>
            {i}
          </PaginationLink>
        </PaginationItem>);
    }

    // Show ellipsis if needed
    if (currentPage < totalPages - 2) {
      items.push(<PaginationItem key="ellipsis-2">
          <PaginationEllipsis />
        </PaginationItem>);
    }

    // Always show last page if there is more than one page
    if (totalPages > 1) {
      items.push(<PaginationItem key="last">
          <PaginationLink onClick={() => setCurrentPage(totalPages)} isActive={currentPage === totalPages}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>);
    }
    return items;
  };
  
  const toggleFilters = () => {
    setIsFilterVisible(!isFilterVisible);
  };

  // Check if there are any listings available
  const hasListings = businesses.length > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Main content with improved spacing */}
      <main className="flex-grow pb-12 pt-24 md:pt-28">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Available Businesses</h1>
            <p className="text-gray-600 mb-8">Browse our curated selection of high-potential businesses for sale.</p>
            
            {/* Only show search and filters if we have listings */}
            {hasListings && !isLoading && (
              <div className="bg-white mb-10">
                <div className="p-4 flex flex-wrap items-center gap-4 px-0">
                  <div className="relative w-full md:w-auto flex-grow">
                    <Input type="search" placeholder="Search listings..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
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

                    <Button variant="outline" onClick={toggleFilters} className="flex items-center gap-2">
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
                      <Select value={locationFilter} onValueChange={setLocationFilter}>
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
                      <Slider defaultValue={[0, maxPrice]} min={0} max={maxPrice} step={50000} value={priceRange} onValueChange={setPriceRange} className="py-4" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Loading state */}
            {isLoading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Loading listings...</p>
              </div>
            ) : (
              <>
                {/* Empty state when no listings are available */}
                {!hasListings ? (
                  <div className="text-center py-20 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-xl font-medium text-gray-900 mb-4">No businesses have been listed yet. Be the first to submit yours!</h3>
                    <p className="text-gray-600 mb-6 max-w-lg mx-auto">
                      Our marketplace is ready for your business listing. Submit your business details to find the right buyer.
                    </p>
                    <Button asChild className="px-6 py-6 text-lg">
                      <Link to="/submit">Submit a Business</Link>
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Listings Grid */}
                    {currentItems.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {currentItems.map(business => (
                          <BusinessCard 
                            key={business.id} 
                            {...business} 
                            onDelete={fetchBusinesses} 
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

                    {/* Pagination - only show if we have listings */}
                    {filteredBusinesses.length > 0 && (
                      <Pagination className="mt-8">
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} className={currentPage === 1 ? "pointer-events-none opacity-50" : ""} />
                          </PaginationItem>
                          
                          {getPaginationItems()}
                          
                          <PaginationItem>
                            <PaginationNext onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""} />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <HomeFooter />
    </div>
  );
};

export default Listings;
