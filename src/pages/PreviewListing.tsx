
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import { usePreviewData } from '@/hooks/usePreviewData';
import PreviewLoading from '@/components/preview/PreviewLoading';
import PreviewHeaderActions from '@/components/preview/PreviewHeaderActions';
import BusinessContentPreview from '@/components/preview/BusinessContentPreview';
import PreviewSubmitButton from '@/components/preview/PreviewSubmitButton';

const PreviewListing = () => {
  const navigate = useNavigate();
  const { isLoading, formData, imageUrls, videoURL } = usePreviewData();
  
  // Function to handle going back to the form
  const handleBackToForm = () => {
    navigate('/submit');
  };
  
  // Function to handle submitting the form
  const handleSubmitListing = () => {
    // Navigate to the submit page with a flag to trigger the submission
    sessionStorage.setItem('submitAfterPreview', 'true');
    
    // Use a toast to indicate the redirecting status
    toast.info("Redirecting to submission page...", {
      description: "You'll be able to review your listing one more time before final submission."
    });
    
    navigate('/submit');
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <PreviewLoading />
        <Footer />
      </div>
    );
  }
  
  // Parse the location for the flag code
  const flagCode = formData.location ? formData.location.toLowerCase() : "gl";
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="py-20 px-4 flex-grow">
        <div className="container mx-auto max-w-7xl">
          <PreviewHeaderActions 
            onBackToForm={handleBackToForm} 
            onSubmitListing={handleSubmitListing} 
          />
          
          <div className="bg-white shadow-md p-4 rounded-lg border border-gray-100">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-700">Preview Your Business Listing</h1>
              <p className="text-gray-500">This is how your listing will appear to potential buyers</p>
            </div>
            
            <BusinessContentPreview 
              formData={formData}
              imageUrls={imageUrls}
              videoURL={videoURL}
              flagCode={flagCode}
            />
            
            <PreviewSubmitButton onSubmitListing={handleSubmitListing} />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PreviewListing;
