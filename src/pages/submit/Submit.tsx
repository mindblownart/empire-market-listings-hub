
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useFormData } from '@/contexts/FormDataContext';
import AuthCheck from '@/components/auth/AuthCheck';
import FormContainer from '@/components/submit/FormContainer';
import BusinessDetails from './BusinessDetails';
import FinancialDetails from './FinancialDetails';
import BusinessDescription from './BusinessDescription';
import BusinessHighlights from './BusinessHighlights';
import ContactInformation from './ContactInformation';
import { useBusinessSubmission } from '@/hooks/useBusinessSubmission';
import { MediaUpload } from '@/components/media-uploader';
import DragContext from '@/components/media-uploader/DragContext';

const Submit = () => {
  const { formData, updateFormData } = useFormData();
  const { validationErrors, validateField } = useBusinessSubmission();
  
  return (
    <AuthCheck>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <div className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-3xl font-bold mb-6 text-center">Submit Your Business</h1>
            <p className="text-gray-600 mb-10 text-center max-w-2xl mx-auto">
              List your business on EmpireMarket to reach qualified buyers and simplify your business sale journey.
            </p>
            
            <div className="bg-white rounded-xl shadow-md p-8">
              <FormContainer>
                <BusinessDetails 
                  formData={formData}
                  updateFormData={updateFormData}
                  validationErrors={validationErrors}
                  validateField={validateField}
                />

                <FinancialDetails 
                  formData={formData}
                  updateFormData={updateFormData}
                  validationErrors={validationErrors}
                  validateField={validateField}
                />

                <BusinessDescription 
                  formData={formData}
                  updateFormData={updateFormData}
                  validationErrors={validationErrors}
                  validateField={validateField}
                />
                
                <BusinessHighlights
                  formData={formData}
                  updateFormData={updateFormData}
                />

                <div className="pt-4 border-t border-gray-100">
                  <h2 className="text-xl font-semibold mb-4">Business Media</h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Add photos and videos of your business. The first image will be your primary image
                    shown in search results. You can drag and drop to reorder images.
                  </p>
                  <DragContext>
                    <MediaUpload 
                      onImagesChange={(images) => updateFormData({ businessImages: images })}
                      onVideoChange={(video) => updateFormData({ businessVideo: video })}
                      onVideoUrlChange={(url) => updateFormData({ businessVideoUrl: url || '' })}
                      maxImages={10}
                    />
                  </DragContext>
                </div>

                <ContactInformation 
                  formData={formData}
                  updateFormData={updateFormData}
                />
              </FormContainer>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    </AuthCheck>
  );
};

export default Submit;
