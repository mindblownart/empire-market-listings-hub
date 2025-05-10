
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone } from 'lucide-react';

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
          <div className="flex flex-col sm:flex-row">
            <div className="w-full sm:w-1/2 flex items-center mb-1 sm:mb-0">
              <User className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-gray-500">Full Name</span>
            </div>
            <div className="w-full sm:w-1/2 sm:text-right font-medium">
              {fullName || 'Not provided'}
            </div>
          </div>
          
          {/* Email row */}
          <div className="flex flex-col sm:flex-row">
            <div className="w-full sm:w-1/2 flex items-center mb-1 sm:mb-0">
              <Mail className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-gray-500">Email</span>
            </div>
            <div className="w-full sm:w-1/2 sm:text-right font-medium break-all">
              {email || 'Not provided'}
            </div>
          </div>
          
          {/* Phone Number row */}
          <div className="flex flex-col sm:flex-row">
            <div className="w-full sm:w-1/2 flex items-center mb-1 sm:mb-0">
              <Phone className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-gray-500">Phone Number</span>
            </div>
            <div className="w-full sm:w-1/2 sm:text-right font-medium">
              {phone || 'Not provided'}
            </div>
          </div>
          
          {/* Role row */}
          <div className="flex flex-col sm:flex-row">
            <div className="w-full sm:w-1/2 flex items-center mb-1 sm:mb-0">
              <User className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-gray-500">Role</span>
            </div>
            <div className="w-full sm:w-1/2 sm:text-right font-medium capitalize">
              {role || 'Not provided'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
