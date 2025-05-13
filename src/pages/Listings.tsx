
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import HomeFooter from '@/components/HomeFooter';
import { priceRangePresets } from '@/components/PriceRangeDropdowns';
import SearchFilters from '@/components/listings/SearchFilters';
import SortControls from '@/components/listings/SortControls';
import ListingResults from '@/components/listings/ListingResults';
import ListingPagination from '@/components/listings/ListingPagination';

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

  // Handle search term change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Clear search term
  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // Set price range from preset
  const handlePresetPriceRange = (preset: string) => {
    const selectedPreset = priceRangePresets.find(p => p.value === preset);
    if (selectedPreset) {
      setMinPrice(selectedPreset.min);
      setMaxPrice(selectedPreset.max);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Toggle filters visibility
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
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Find Your Ideal Business</h1>
            <p className="text-gray-600 mb-8">Browse our curated selection of high-potential businesses for sale.</p>
            
            {/* Only show search and filters if we have listings */}
            {(hasListings || filtersApplied) && !isLoading && (
              <SearchFilters
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                onClearSearch={handleClearSearch}
                category={category}
                onCategoryChange={setCategory}
                country={country}
                onCountryChange={setCountry}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onMinPriceChange={setMinPrice}
                onMaxPriceChange={setMaxPrice}
                newListingsOnly={newListingsOnly}
                onNewListingsChange={setNewListingsOnly}
                onApplyFilters={handleApplyFilters}
                onClearFilters={handleClearFilters}
              />
            )}

            {/* Sort Controls */}
            {hasListings && !isLoading && (
              <SortControls 
                sortBy={sortBy}
                onSortChange={setSortBy}
              />
            )}

            {/* Listings Results */}
            <ListingResults 
              isLoading={isLoading}
              businesses={businesses}
              filteredBusinesses={filteredBusinesses}
              currentItems={currentItems}
              onDeleteBusiness={fetchBusinesses}
            />

            {/* Pagination */}
            <ListingPagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              filteredBusinessesCount={filteredBusinesses.length}
            />
          </div>
        </div>
      </main>

      <HomeFooter />
    </div>
  );
};

export default Listings;
