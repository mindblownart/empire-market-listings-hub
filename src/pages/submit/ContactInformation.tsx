
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BusinessFormData } from '@/contexts/FormDataContext';
import PhoneInput from '@/components/submit/PhoneInput';

interface ContactInformationProps {
  formData: BusinessFormData;
  updateFormData: (data: Partial<BusinessFormData>) => void;
}

const ContactInformation: React.FC<ContactInformationProps> = ({
  formData,
  updateFormData
}) => {
  // Handle key press in fields to enable tabbing in the proper order
  const handleKeyDown = (e: React.KeyboardEvent, nextFieldId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextField = document.getElementById(nextFieldId);
      if (nextField) nextField.focus();
    }
  };

  // Handle select changes
  const handleSelectChange = (id: string, value: string) => {
    updateFormData({ [id]: value });
  };
  
  return (
    <>
      <h2 className="text-xl font-semibold mb-4 pt-4 border-t border-gray-100">Contact Information</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="full-name">Full Name</Label>
          <Input 
            id="full-name" 
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={(e) => updateFormData({ fullName: e.target.value })}
            onKeyDown={(e) => handleKeyDown(e, 'email')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => updateFormData({ email: e.target.value })}
            onKeyDown={(e) => handleKeyDown(e, 'phone')}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <PhoneInput
            id="phone"
            value={formData.phone}
            onChange={(value) => updateFormData({ phone: value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role in Business</Label>
          <Select
            value={formData.role}
            onValueChange={(value) => handleSelectChange('role', value)}
          >
            <SelectTrigger id="role">
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="owner">Owner</SelectItem>
              <SelectItem value="broker">Broker</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
};

export default ContactInformation;
