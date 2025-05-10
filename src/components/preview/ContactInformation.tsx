
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div>
              <div className="flex items-center text-gray-500 mb-1">
                <User className="h-4 w-4 mr-2" /> Full Name
              </div>
              <div className="font-medium">{fullName || 'Not provided'}</div>
            </div>
            <div>
              <div className="flex items-center text-gray-500 mb-1">
                <Mail className="h-4 w-4 mr-2" /> Email
              </div>
              <div className="font-medium">{email || 'Not provided'}</div>
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <div className="flex items-center text-gray-500 mb-1">
                <Phone className="h-4 w-4 mr-2" /> Phone Number
              </div>
              <div className="font-medium">{phone || 'Not provided'}</div>
            </div>
            <div>
              <div className="flex items-center text-gray-500 mb-1">
                <User className="h-4 w-4 mr-2" /> Role
              </div>
              <div className="font-medium capitalize">{role || 'Not provided'}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
