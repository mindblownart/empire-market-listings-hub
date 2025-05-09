
import React from 'react';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';

const PrivacyTerms = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header with logo */}
      <div className="p-6">
        <Link to="/" className="text-2xl font-bold text-primary">
          EmpireMarket
        </Link>
      </div>
      
      <div className="flex-1 flex flex-col items-center px-4 py-8 md:py-12 max-w-4xl mx-auto w-full">
        {/* Page title */}
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12 text-[#1A1F2C]">
          Privacy & Terms
        </h1>
        
        {/* Privacy Policy section */}
        <div className="w-full mb-8 md:mb-12">
          <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
            <h2 className="text-2xl font-semibold mb-6">Privacy Policy</h2>
            <div className="text-base text-gray-700 leading-relaxed space-y-4">
              <p>
                At EmpireMarket, we take your privacy seriously. This Privacy Policy describes how we collect, use, and share information about you when you use our website, services, and applications.
              </p>
              <p>
                <strong>Information We Collect:</strong> We collect information you provide directly to us, such as when you create an account, complete a form, make a purchase, or communicate with us.
              </p>
              <p>
                <strong>How We Use Your Information:</strong> We use the information we collect to provide, maintain, and improve our services, to process transactions, communicate with you, and comply with legal obligations.
              </p>
              <p>
                <strong>Sharing of Information:</strong> We may share your information with third-party service providers who perform services on our behalf, business partners, and as required by law.
              </p>
              <p>
                <strong>Your Choices:</strong> You can opt out of receiving promotional communications, update your account information, and choose whether to share certain information.
              </p>
              <p>
                <strong>Security:</strong> We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access.
              </p>
              <p>
                This Privacy Policy may be updated from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
              </p>
            </div>
          </div>
        </div>
        
        {/* Terms of Service section */}
        <div className="w-full mb-8 md:mb-12">
          <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
            <h2 className="text-2xl font-semibold mb-6">Terms of Service</h2>
            <div className="text-base text-gray-700 leading-relaxed space-y-4">
              <p>
                By accessing or using EmpireMarket, you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions, then you may not access the service.
              </p>
              <p>
                <strong>Use of the Service:</strong> You may use our service only for lawful purposes and in accordance with these Terms. You agree not to use the service in any way that violates any applicable local, state, national, or international law or regulation.
              </p>
              <p>
                <strong>User Accounts:</strong> When you create an account with us, you must provide accurate and complete information. You are responsible for safeguarding the password and for all activities that occur under your account.
              </p>
              <p>
                <strong>Intellectual Property:</strong> The service and its original content, features, and functionality are and will remain the exclusive property of EmpireMarket and its licensors.
              </p>
              <p>
                <strong>Termination:</strong> We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
              <p>
                <strong>Limitation of Liability:</strong> In no event shall EmpireMarket, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages.
              </p>
              <p>
                <strong>Changes:</strong> We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our service after those revisions become effective, you agree to be bound by the revised terms.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PrivacyTerms;
