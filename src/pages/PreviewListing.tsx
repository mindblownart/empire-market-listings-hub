
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useFormData } from '@/contexts/FormDataContext';
import { ArrowLeft, DollarSign, TrendingUp, TrendingDown, MapPin, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const PreviewListing = () => {
  const { formData } = useFormData();
  const navigate = useNavigate();
  
  // Handle back button
  const handleBack = () => {
    navigate('/submit');
  };
  
  // Handle submit button
  const handleSubmit = () => {
    // In a real app, submit the form data to the backend
    alert('Your business listing has been submitted!');
    navigate('/');
  };

  // Convert File objects to URLs for preview
  const imageURLs = React.useMemo(() => {
    return formData.businessImages.map(file => URL.createObjectURL(file));
  }, [formData.businessImages]);
  
  // Create video URL if video exists
  const videoURL = React.useMemo(() => {
    if (formData.businessVideo) {
      return URL.createObjectURL(formData.businessVideo);
    }
    return formData.businessVideoUrl || '';
  }, [formData.businessVideo, formData.businessVideoUrl]);
  
  // Clean up URLs when component unmounts
  React.useEffect(() => {
    return () => {
      imageURLs.forEach(URL.revokeObjectURL);
      if (videoURL && formData.businessVideo) URL.revokeObjectURL(videoURL);
    };
  }, [imageURLs, videoURL, formData.businessVideo]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="py-20 px-4 flex-grow">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold">Preview Your Business Listing</h1>
            <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Edit
            </Button>
          </div>
          
          <Card className="overflow-hidden shadow-lg mb-8">
            {/* Main image if available */}
            {imageURLs.length > 0 && (
              <div className="relative h-64 w-full">
                <img 
                  src={imageURLs[0]} 
                  alt={formData.businessName} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full p-8">
                  <Badge className="mb-2">{formData.industry}</Badge>
                  <h2 className="text-3xl font-bold text-white">{formData.businessName || 'Unnamed Business'}</h2>
                </div>
              </div>
            )}
            
            <CardHeader>
              {imageURLs.length === 0 && (
                <>
                  <Badge className="w-fit mb-2">{formData.industry || 'Uncategorized'}</Badge>
                  <CardTitle className="text-2xl">{formData.businessName || 'Unnamed Business'}</CardTitle>
                </>
              )}
              <div className="flex items-center mt-2">
                <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                <span className="flex items-center">
                  {formData.flagCode && (
                    <span className="mr-2 text-xl">
                      {String.fromCodePoint(
                        ...[...formData.flagCode.toUpperCase()].map(
                          char => char.charCodeAt(0) + 127397
                        )
                      )}
                    </span>
                  )}
                  {formData.locationName || formData.location}
                </span>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Financial Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <DollarSign className="h-4 w-4 mr-1" /> Asking Price
                  </div>
                  <div className="text-xl font-bold">
                    {formData.currencyCode} {formData.askingPrice || '0'}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <TrendingUp className="h-4 w-4 mr-1" /> Annual Revenue
                  </div>
                  <div className="text-xl font-bold">
                    {formData.currencyCode} {formData.annualRevenue || '0'}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <TrendingDown className="h-4 w-4 mr-1" /> Annual Profit
                  </div>
                  <div className="text-xl font-bold">
                    {formData.currencyCode} {formData.annualProfit || '0'}
                  </div>
                </div>
              </div>
              
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Business Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {formData.description || 'No description provided.'}
                </p>
              </div>
              
              {/* Media Gallery */}
              {(imageURLs.length > 1 || videoURL) && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Media Gallery</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {/* Skip the first image since it's shown as the header */}
                    {imageURLs.slice(1).map((url, index) => (
                      <div key={index} className="aspect-video overflow-hidden rounded-md">
                        <img src={url} alt={`Business image ${index + 2}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                    
                    {videoURL && (
                      <div className="aspect-video overflow-hidden rounded-md">
                        <video 
                          src={videoURL} 
                          controls 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Name</div>
                    <div className="font-medium">{formData.fullName || 'Not provided'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Email</div>
                    <div className="font-medium">{formData.email || 'Not provided'}</div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                    <div className="font-medium">{formData.phone || 'Not provided'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Role</div>
                    <div className="font-medium">{formData.role || 'Not provided'}</div>
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-end space-x-4 bg-gray-50 p-6">
              <Button variant="outline" onClick={handleBack}>
                Back to Edit
              </Button>
              <Button onClick={handleSubmit} className="bg-primary hover:bg-primary-light">
                Submit Business Listing
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PreviewListing;
