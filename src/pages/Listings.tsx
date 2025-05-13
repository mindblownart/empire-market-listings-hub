import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Link, useLocation } from 'react-router-dom';
import BusinessCard from '@/components/BusinessCard';
import Navbar from '@/components/Navbar';
import HomeFooter from '@/components/HomeFooter';
import { supabase } from '@/lib/supabase';
import { BusinessListing } from '@/types/supabase';
import { useToast } from '@/components/ui/use-toast';
import CountryDropdown from '@/components/CountryDropdown';
import PriceRangeDropdowns, { priceRangePresets } from '@/components/PriceRangeDropdowns';
import SearchControls from '@/components/ui/search-controls';

// Categories for filtering
const categories = [{
  value: 'all',
  label: 'All Industries'
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
  const [country, setCountry] = useState('all');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000000); // Updated to match our new max value
  const [sortBy, setSortBy] = useState('newest');
  const [newListingsOnly, setNewListingsOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userSession, setUserSession] = useState(null);
  const [filtersApplied, setFiltersApplied] = useState(false);
  
  const itemsPerPage = 9;

  // Parse query parameters from the URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    const countryParam = params.get('country');
    const minPriceParam = params.get('minPrice');
    const maxPriceParam = params.get('maxPrice');
    const newOnlyParam = params.get('newOnly');
    
    // Check if we should reset filters based on location state
    const resetFilters = location.state?.resetFilters;
    
    if (resetFilters) {
      // Reset all filters
      setSearchTerm('');
      setCategory('all');
      setCountry('all');
      setMinPrice(0);
      setMaxPrice(10000000); // Updated to match our new max value
      setSortBy('newest');
      setNewListingsOnly(false);
      setFiltersApplied(false);
      // Clear location state to prevent repeated resets
      window.history.replaceState({}, document.title, location.pathname);
    } else {
      // Apply URL parameters as filters if they exist
      if (categoryParam) setCategory(categoryParam);
      if (countryParam) setCountry(countryParam);
      if (minPriceParam) setMinPrice(parseInt(minPriceParam));
      if (maxPriceParam) setMaxPrice(parseInt(maxPriceParam));
      if (newOnlyParam) setNewListingsOnly(newOnlyParam === 'true');
      
      // Set filtersApplied if any filters are set
      if (categoryParam || countryParam || minPriceParam || maxPriceParam || newOnlyParam) {
        setFiltersApplied(true);
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
          userId: userSession?.user?.id
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
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `$${(price / 1000).toFixed(0)}K`;
    }
    return `$${price}`;
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

    // Filter by country
    if (country !== 'all') {
      results = results.filter(business => 
        business.location?.toLowerCase().includes(country.toLowerCase())
      );
    }

    // Filter by price range
    results = results.filter(business => {
      if (!business.price) return true;
      const businessPrice = parseInt(business.price.replace(/[^0-9]/g, ''));
      return businessPrice >= minPrice && businessPrice <= maxPrice;
    });

    // Filter by new listings only
    if (newListingsOnly) {
      results = results.filter(business => business.isNew === true);
    }

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
  }, [searchTerm, category, country, minPrice, maxPrice, sortBy, newListingsOnly, businesses]);

  // Get current page items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBusinesses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBusinesses.length / itemsPerPage);

  // Apply filters function
  const handleApplyFilters = () => {
    setFiltersApplied(true);
    // In a real application, you might want to update the URL with filter params
    const params = new URLSearchParams();
    if (category !== 'all') params.append('category', category);
    if (country !== 'all') params.append('country', country);
    if (minPrice > 0) params.append('minPrice', minPrice.toString());
    if (maxPrice < 10000000) params.append('maxPrice', maxPrice.toString());
    if (newListingsOnly) params.append('newOnly', 'true');
    
    window.history.pushState({}, '', `${location.pathname}?${params.toString()}`);
  };

  // Clear all filters function
  const handleClearFilters = () => {
    setSearchTerm('');
    setCategory('all');
    setCountry('all');
    setMinPrice(0);
    setMaxPrice(10000000); // Updated to match our new max value
    setNewListingsOnly(false);
    setFiltersApplied(false);
    // Clear URL parameters
    window.history.pushState({}, '', location.pathname);
  };

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

  // Set price range from preset
  const handlePresetPriceRange = (preset: string) => {
    const selectedPreset = priceRangePresets.find(p => p.value === preset);
    if (selectedPreset) {
      setMinPrice(selectedPreset.min);
      setMaxPrice(selectedPreset.max);
    }
  };

  // Clear search term
  const handleClearSearch = () => {
    setSearchTerm('');
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
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Find Your Ideal Business</h1>
            <p className="text-gray-600 mb-8">Browse our curated selection of high-potential businesses for sale.</p>
            
            {/* Only show search and filters if we have listings */}
            {(hasListings || filtersApplied) && !isLoading && (
              <div className="bg-white shadow-sm border border-gray-100 rounded-lg mb-10">
                {/* Search Bar */}
                <div className="p-4 border-b border-gray-100">
                  <SearchControls 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClearSearch={handleClearSearch}
                    placeholder="Search businesses by name or description..."
                  />
                </div>

                {/* Filter Controls */}
                <div className="p-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Price Range</label>
                    <PriceRangeDropdowns
                      minPrice={minPrice}
                      maxPrice={maxPrice}
                      onMinChange={setMinPrice}
                      onMaxChange={setMaxPrice}
                    />
                  </div>

                  {/* Industry */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Industry</label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All Industries" />
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

                  {/* Country */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
                    <CountryDropdown
                      value={country}
                      onChange={setCountry}
                      className="w-full"
                    />
                  </div>

                  {/* Listing Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Listing Status</label>
                    <div className="flex items-center space-x-2 mt-1.5">
                      <Checkbox
                        id="newListings"
                        checked={newListingsOnly}
                        onCheckedChange={(checked) => setNewListingsOnly(checked === true)}
                      />
                      <label
                        htmlFor="newListings"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        New Listings Only
                      </label>
                    </div>
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="p-4 border-t border-gray-100 flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={handleClearFilters}
                    className="flex items-center gap-1"
                  >
                    <X className="h-4 w-4" /> Clear All
                  </Button>
                  <Button onClick={handleApplyFilters}>
                    Apply Filters
                  </Button>
                </div>
              </div>
            )}

            {/* Sort Controls */}
            {hasListings && !isLoading && (
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="ml-auto">
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
                </div>
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
