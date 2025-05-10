
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, AtSign } from 'lucide-react';

interface ContactInformationProps {
  fullName?: string;
  email?: string;
  phone?: string;
  role?: string;
}

export const ContactInformation: React.FC<ContactInformationProps> = ({
  fullName,
  email,
  phone,
  role
}) => {
  return (
    <Card className="shadow-md">
      <CardHeader className="border-b py-4">
        <CardTitle>Contact Information</CardTitle>
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
              {fullName || 'Not provided'}
            </div>
          </div>
          
          {/* Email row - updated to allow wrapping */}
          <div className="flex items-start">
            <div className="w-[40%] flex items-center">
              <Mail className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
              <span className="text-gray-500">Email</span>
            </div>
            <div className="w-[60%] text-right font-medium break-words select-text">
              {email || 'Not provided'}
            </div>
          </div>
          
          {/* Phone Number row */}
          <div className="flex items-start">
            <div className="w-[40%] flex items-center">
              <Phone className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
              <span className="text-gray-500">Phone Number</span>
            </div>
            <div className="w-[60%] text-right font-medium break-words">
              {phone || 'Not provided'}
            </div>
          </div>
          
          {/* Role row */}
          <div className="flex items-start">
            <div className="w-[40%] flex items-center">
              <AtSign className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
              <span className="text-gray-500">Role</span>
            </div>
            <div className="w-[60%] text-right font-medium capitalize break-words">
              {role || 'Not provided'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
