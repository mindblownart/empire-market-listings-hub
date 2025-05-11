
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye } from 'lucide-react'; // Added Eye import here
import { 
  BusinessHeader, 
  BusinessOverview, 
  BusinessDetails, 
  MediaGallery,
  ContactInformation 
} from '@/components/preview';
import { useFormData } from '@/contexts/FormDataContext';
import { supabase } from '@/lib/supabase';

const PreviewListing = () => {
  const navigate = useNavigate();
  const { formData } = useFormData();
  const [isLoading, setIsLoading] = useState(true);
  const [previewData, setPreviewData] = useState(formData);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  
  // Load data from session storage or from context/database
  useEffect(() => {
    async function loadPreviewData() {
      setIsLoading(true);
      
      // First, try to load from sessionStorage (this takes precedence)
      const sessionData = sessionStorage.getItem('previewFormData');
      const sessionImages = sessionStorage.getItem('previewImageUrls');
      const sessionVideo = sessionStorage.getItem('previewVideoUrl');
      
      if (sessionData) {
        // We have data in session storage, use it
        const parsedData = JSON.parse(sessionData);
        setPreviewData(parsedData);
        
        if (sessionImages) {
          setGalleryImages(JSON.parse(sessionImages));
        }
        
        if (sessionVideo) {
          setVideoURL(sessionVideo);
        }
        
        setIsLoading(false);
        return;
      }
      
      // If there's no session data, try to load from database if we have an ID
      const editingListingId = localStorage.getItem('editingListingId');
      
      if (editingListingId) {
        // Fetch the listing data from the database
        const { data: listing, error } = await supabase
          .from('business_listings')
          .select('*')
          .eq('id', editingListingId)
          .single();
        
        if (error) {
          console.error('Error fetching listing for preview:', error);
          // Fall back to the form data
          setPreviewData(formData);
        } else if (listing) {
          // Convert database listing to form data format
          setPreviewData({
            businessName: listing.business_name,
            industry: listing.category,
            location: listing.location,
            yearEstablished: listing.year_established?.toString() || '',
            employees: listing.employees || '',
            askingPrice: listing.asking_price,
            annualRevenue: listing.annual_revenue,
            annualProfit: listing.annual_profit,
            currencyCode: listing.currency_code,
            description: listing.description || '',
            highlights: listing.highlights || [],
            businessImages: [],
            businessVideo: null,
            businessVideoUrl: listing.video_url || '',
            fullName: listing.contact_name || '',
            email: listing.contact_email || '',
            phone: listing.contact_phone || '',
            role: listing.contact_role || '',
            originalValues: {
              askingPrice: listing.asking_price,
              annualRevenue: listing.annual_revenue,
              annualProfit: listing.annual_profit,
              currencyCode: listing.currency_code,
            }
          });
          
          // Set gallery images and video URL
          if (listing.gallery_images && Array.isArray(listing.gallery_images)) {
            setGalleryImages(listing.gallery_images);
          }
          
          if (listing.video_url) {
            setVideoURL(listing.video_url);
          }
        }
      } else {
        // Use the current form data
        setPreviewData(formData);
        
        // If we have businessImages in formData, we need to convert them to URLs
        if (formData.businessImages && formData.businessImages.length > 0) {
          const urls = formData.businessImages.map(file => {
            if (file instanceof File) {
              return URL.createObjectURL(file);
            }
            return null;
          }).filter(Boolean) as string[];
          
          setGalleryImages(urls);
        }
        
        if (formData.businessVideoUrl) {
          setVideoURL(formData.businessVideoUrl);
        }
      }
      
      setIsLoading(false);
    }
    
    loadPreviewData();
    
    // Clean up any created object URLs when component unmounts
    return () => {
      galleryImages.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [formData]);
  
  const handleBackToForm = () => {
    const editingListingId = localStorage.getItem('editingListingId');
    if (editingListingId) {
      navigate(`/edit-listing/${editingListingId}`);
    } else {
      navigate('/submit');
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="bg-gray-50 py-10 px-4">
        <div className="container mx-auto">
          {/* Preview banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 rounded-full p-2">
                <Eye className="text-blue-700 h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-800">Preview Mode</h3>
                <p className="text-sm text-blue-700">This is how your listing will appear to potential buyers.</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
              onClick={handleBackToForm}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Form
            </Button>
          </div>
          
          {/* Business content */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Media gallery on large screens, appears at the top on mobile */}
            <div className="lg:hidden">
              <MediaGallery 
                galleryImages={galleryImages} 
                videoURL={videoURL}
                autoplayVideo={false}
              />
            </div>
            
            <div className="p-6 md:p-8 lg:p-10">
              {/* Business name and key details */}
              <BusinessHeader 
                businessName={previewData.businessName}
                industry={previewData.industry}
                location={previewData.location}
                yearEstablished={previewData.yearEstablished}
                employeeCount={previewData.employees}
              />
              
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left column with financial overview */}
                <div className="lg:col-span-1 space-y-8">
                  <BusinessOverview
                    askingPrice={previewData.askingPrice}
                    annualRevenue={previewData.annualRevenue}
                    annualProfit={previewData.annualProfit}
                    currencyCode={previewData.currencyCode}
                  />
                  
                  {/* Contact info */}
                  <ContactInformation
                    contactName={previewData.fullName}
                    contactEmail={previewData.email}
                    contactPhone={previewData.phone}
                    contactRole={previewData.role}
                  />
                </div>
                
                {/* Right column with description, gallery, and details */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Media gallery (hidden on mobile since it's shown at the top) */}
                  <div className="hidden lg:block">
                    <MediaGallery 
                      galleryImages={galleryImages} 
                      videoURL={videoURL}
                      autoplayVideo={false}
                    />
                  </div>
                  
                  {/* Business description */}
                  <BusinessDetails
                    description={previewData.description}
                    highlights={previewData.highlights}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PreviewListing;
