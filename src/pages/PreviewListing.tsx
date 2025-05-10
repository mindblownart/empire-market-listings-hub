
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFormData } from '@/contexts/FormDataContext';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';
import { DollarSign, MapPin, Phone, Mail, User, Building, Calendar, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const PreviewListing = () => {
  const { formData } = useFormData();
  const navigate = useNavigate();
  
  // Handle back button
  const handleBack = () => {
    navigate('/submit');
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

  // Helper function to format business highlights from description (optional)
  const getBusinessHighlights = () => {
    if (!formData.description) return [];
    
    // Simple algorithm to extract potential bullet points
    // Look for sentences that might be highlights (short, start with action verbs or numbers)
    const sentences = formData.description.split(/[.!?]/).filter(s => s.trim().length > 0);
    
    // Filter for potential highlights (shorter sentences that might be feature points)
    return sentences
      .filter(s => s.trim().length > 10 && s.trim().length < 100)
      .map(s => s.trim())
      .slice(0, 4); // Limit to 4 highlights
  };

  const highlights = getBusinessHighlights();
  const hasAdditionalImages = imageURLs.length > 1;
  const primaryImage = imageURLs.length > 0 ? imageURLs[0] : '';
  const galleryImages = imageURLs.slice(1);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Logo header */}
      <header className="py-4 px-6 border-b">
        <div className="container mx-auto">
          <Link to="/" className="inline-block">
            <span className="text-2xl font-bold text-[#5B3DF5]">
              EmpireMarket
            </span>
          </Link>
        </div>
      </header>
      
      <div className="py-8 px-4 flex-grow bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          {/* Large hero banner with primary image */}
          {primaryImage ? (
            <div className="w-full overflow-hidden rounded-lg shadow-md mb-8">
              <AspectRatio ratio={21/9} className="bg-gray-200">
                <img 
                  src={primaryImage} 
                  alt={formData.businessName || 'Business banner'} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full p-8">
                  <Badge className="mb-2">{formData.industry || 'Uncategorized'}</Badge>
                  <h1 className="text-4xl font-bold text-white mb-2">{formData.businessName || 'Unnamed Business'}</h1>
                  {formData.locationName && (
                    <div className="flex items-center text-white mt-2">
                      <MapPin className="h-4 w-4 mr-2" />
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
                        {formData.locationName}
                      </span>
                    </div>
                  )}
                </div>
              </AspectRatio>
            </div>
          ) : (
            <Card className="mb-8 shadow-md">
              <CardHeader>
                <Badge className="w-fit mb-2">{formData.industry || 'Uncategorized'}</Badge>
                <CardTitle className="text-2xl">{formData.businessName || 'Unnamed Business'}</CardTitle>
                {formData.locationName && (
                  <div className="flex items-center text-gray-600 mt-1">
                    <MapPin className="h-4 w-4 mr-2" />
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
                      {formData.locationName}
                    </span>
                  </div>
                )}
              </CardHeader>
            </Card>
          )}
          
          {/* Media and Video Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Left section: Additional Photos */}
            {galleryImages.length > 0 && (
              <div className="md:col-span-2">
                <Card className="shadow-md h-full">
                  <CardHeader className="border-b">
                    <CardTitle>Additional Photos</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <Carousel className="w-full">
                      <CarouselContent>
                        {galleryImages.map((url, index) => (
                          <CarouselItem key={index} className="basis-1/2 md:basis-1/3 lg:basis-1/4">
                            <AspectRatio ratio={4/3} className="bg-gray-200 rounded-md overflow-hidden">
                              <img 
                                src={url} 
                                alt={`Business image ${index + 1}`} 
                                className="w-full h-full object-cover"
                              />
                            </AspectRatio>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <div className="flex justify-end gap-2 mt-4">
                        <CarouselPrevious className="static transform-none" />
                        <CarouselNext className="static transform-none" />
                      </div>
                    </Carousel>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {/* Right section: Video */}
            {videoURL && (
              <div className={galleryImages.length > 0 ? "md:col-span-1" : "md:col-span-3"}>
                <Card className="shadow-md h-full">
                  <CardHeader className="border-b">
                    <CardTitle>Business Video</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <AspectRatio ratio={16/9} className="overflow-hidden rounded-md">
                      <video
                        src={videoURL}
                        controls
                        className="w-full h-full object-cover"
                      />
                    </AspectRatio>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
            
          {/* Main content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column - Business Overview */}
            <div className="md:col-span-2 space-y-8">
              {/* Business Overview */}
              <Card className="shadow-md">
                <CardHeader className="border-b">
                  <CardTitle>Business Overview</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {formData.description || 'No description provided.'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Business Highlights (if any) */}
              {highlights.length > 0 && (
                <Card className="shadow-md">
                  <CardHeader className="border-b">
                    <CardTitle>Business Highlights</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ul className="list-disc pl-6 space-y-2">
                      {highlights.map((highlight, index) => (
                        <li key={index} className="text-gray-700">{highlight}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              
              {/* Contact Information */}
              <Card className="shadow-md">
                <CardHeader className="border-b">
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center text-gray-500 mb-1">
                          <User className="h-4 w-4 mr-2" /> Full Name
                        </div>
                        <div className="font-medium">{formData.fullName || 'Not provided'}</div>
                      </div>
                      <div>
                        <div className="flex items-center text-gray-500 mb-1">
                          <Mail className="h-4 w-4 mr-2" /> Email
                        </div>
                        <div className="font-medium">{formData.email || 'Not provided'}</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center text-gray-500 mb-1">
                          <Phone className="h-4 w-4 mr-2" /> Phone Number
                        </div>
                        <div className="font-medium">{formData.phone || 'Not provided'}</div>
                      </div>
                      <div>
                        <div className="flex items-center text-gray-500 mb-1">
                          <User className="h-4 w-4 mr-2" /> Role
                        </div>
                        <div className="font-medium capitalize">{formData.role || 'Not provided'}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Right Column - Business Details */}
            <div className="space-y-8">
              {/* Business Details Card */}
              <Card className="shadow-md">
                <CardHeader className="border-b">
                  <CardTitle>Business Details</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <dl className="space-y-4">
                    <div className="flex items-center">
                      <dt className="flex items-center w-1/2 text-gray-500">
                        <DollarSign className="h-4 w-4 mr-2" /> Asking Price
                      </dt>
                      <dd className="w-1/2 font-medium">
                        {formData.currencyCode} {formData.askingPrice || '0'}
                      </dd>
                    </div>
                    <div className="flex items-center">
                      <dt className="flex items-center w-1/2 text-gray-500">
                        <DollarSign className="h-4 w-4 mr-2" /> Annual Revenue
                      </dt>
                      <dd className="w-1/2 font-medium">
                        {formData.currencyCode} {formData.annualRevenue || '0'}
                      </dd>
                    </div>
                    <div className="flex items-center">
                      <dt className="flex items-center w-1/2 text-gray-500">
                        <DollarSign className="h-4 w-4 mr-2" /> Annual Profit
                      </dt>
                      <dd className="w-1/2 font-medium">
                        {formData.currencyCode} {formData.annualProfit || '0'}
                      </dd>
                    </div>
                    <div className="flex items-center">
                      <dt className="flex items-center w-1/2 text-gray-500">
                        <MapPin className="h-4 w-4 mr-2" /> Country
                      </dt>
                      <dd className="w-1/2 font-medium">
                        {formData.locationName || 'Not specified'}
                      </dd>
                    </div>
                    <div className="flex items-center">
                      <dt className="flex items-center w-1/2 text-gray-500">
                        <Building className="h-4 w-4 mr-2" /> Industry
                      </dt>
                      <dd className="w-1/2 font-medium capitalize">
                        {formData.industry === 'tech' ? 'Technology' :
                         formData.industry === 'food' ? 'Food & Beverage' :
                         formData.industry === 'retail' ? 'Retail' :
                         formData.industry === 'manufacturing' ? 'Manufacturing' :
                         formData.industry === 'health' ? 'Health & Wellness' :
                         formData.industry === 'service' ? 'Professional Services' :
                         formData.industry || 'Not specified'}
                      </dd>
                    </div>
                    <div className="flex items-center">
                      <dt className="flex items-center w-1/2 text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" /> Year Established
                      </dt>
                      <dd className="w-1/2 font-medium">
                        {formData.yearEstablished || 'Not provided'}
                      </dd>
                    </div>
                    <div className="flex items-center">
                      <dt className="flex items-center w-1/2 text-gray-500">
                        <Users className="h-4 w-4 mr-2" /> Employees
                      </dt>
                      <dd className="w-1/2 font-medium">
                        {formData.employees || 'Not provided'}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </div>
          </div>
            
          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 mt-6">
            <Button variant="outline" onClick={handleBack}>
              Back to Edit
            </Button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PreviewListing;
