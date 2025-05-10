
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, AtSign } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
          <div className="flex items-center">
            <div className="w-[40%] flex items-center">
              <User className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
              <span className="text-gray-500 whitespace-nowrap">Full Name</span>
            </div>
            <div className="w-[60%] text-right font-medium truncate">
              {fullName || 'Not provided'}
            </div>
          </div>
          
          {/* Email row with tooltip for long emails */}
          <div className="flex items-center">
            <div className="w-[40%] flex items-center">
              <Mail className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
              <span className="text-gray-500 whitespace-nowrap">Email</span>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-[60%] text-right font-medium truncate">
                    {email || 'Not provided'}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{email || 'Not provided'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {/* Phone Number row */}
          <div className="flex items-center">
            <div className="w-[40%] flex items-center">
              <Phone className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
              <span className="text-gray-500 whitespace-nowrap">Phone Number</span>
            </div>
            <div className="w-[60%] text-right font-medium truncate">
              {phone || 'Not provided'}
            </div>
          </div>
          
          {/* Role row */}
          <div className="flex items-center">
            <div className="w-[40%] flex items-center">
              <AtSign className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
              <span className="text-gray-500 whitespace-nowrap">Role</span>
            </div>
            <div className="w-[60%] text-right font-medium capitalize truncate">
              {role || 'Not provided'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
