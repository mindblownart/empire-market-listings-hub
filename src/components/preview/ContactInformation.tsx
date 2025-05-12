
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, AtSign, Contact } from 'lucide-react';

interface ContactInformationProps {
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactRole?: string;
}

// Function to format international phone number for display
const formatInternationalPhone = (phone: string): string => {
  if (!phone) return 'Not provided';
  
  // Phone number already in international format (starts with +)
  if (phone.startsWith('+')) {
    // First try to find the dial code boundary
    const match = phone.match(/^\+(\d{1,4})\s*(.*)$/);
    
    if (match) {
      const [, dialCode, nationalNumber] = match;
      // Format the national number with spaces for readability
      // This is a simple approach that may need to be customized per country
      const formattedNational = nationalNumber.replace(/\D/g, '')
        .replace(/(\d{4})(\d{1,})/, '$1 $2')
        .replace(/(\d{3})(\d{1,})/, '$1 $2');
        
      return `+${dialCode} ${formattedNational}`.trim();
    }
    
    // If we can't parse properly, just return the cleaned input
    return phone.replace(/\s+/g, ' ').trim();
  }
  
  // For numbers without a + prefix, just return as is
  return phone;
};

export const ContactInformation: React.FC<ContactInformationProps> = ({
  contactName,
  contactEmail,
  contactPhone,
  contactRole
}) => {
  return (
    <Card className="shadow-md">
      <CardHeader className="border-b py-4">
        <CardTitle className="flex items-center">
          <Contact className="h-5 w-5 mr-2 text-primary" />
          Contact Information
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 pb-4">
        <div className="space-y-4">
          {/* Full Name row */}
          <div className="flex items-start">
            <div className="w-[40%] flex items-center">
              <User className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
              <span className="text-gray-500">Full Name</span>
            </div>
            <div className="w-[60%] text-right font-medium break-words">
              {contactName || 'Not provided'}
            </div>
          </div>
          
          {/* Email row */}
          <div className="flex items-start">
            <div className="w-[40%] flex items-center">
              <Mail className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
              <span className="text-gray-500">Email</span>
            </div>
            <div className="w-[60%] text-right font-medium break-words select-text">
              {contactEmail || 'Not provided'}
            </div>
          </div>
          
          {/* Phone Number row */}
          <div className="flex items-start">
            <div className="w-[40%] flex items-center">
              <Phone className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
              <span className="text-gray-500">Phone Number</span>
            </div>
            <div className="w-[60%] text-right font-medium break-words">
              {contactPhone ? formatInternationalPhone(contactPhone) : 'Not provided'}
            </div>
          </div>
          
          {/* Role row */}
          <div className="flex items-start">
            <div className="w-[40%] flex items-center">
              <AtSign className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
              <span className="text-gray-500">Role</span>
            </div>
            <div className="w-[60%] text-right font-medium capitalize break-words">
              {contactRole || 'Not provided'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
