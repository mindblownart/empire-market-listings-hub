import React from 'react';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { BusinessFormData } from '../../contexts/FormDataContext';
import PhoneInput from '../../components/submit/PhoneInput';

interface ContactInformationProps {
  formData: BusinessFormData;
  updateFormData: (data: Partial<BusinessFormData>) => void;
  validationErrors?: Record<string, string>;
  validateField?: (field: string, value: any) => boolean;
}

const ContactInformation: React.FC<ContactInformationProps> = ({
  formData,
  updateFormData,
  validationErrors = {},
  validateField
}) => {
  // Handle key press in fields to enable tabbing in the proper order
  const handleKeyDown = (e: React.KeyboardEvent, nextFieldId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextField = document.getElementById(nextFieldId);
      if (nextField) nextField.focus();
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
    
    if (validateField) {
      validateField(name, value);
    }
  };

  // Handle select changes
  const handleSelectChange = (id: string, value: string) => {
    updateFormData({ [id]: value });
    
    if (validateField) {
      validateField(id, value);
    }
  };

  // Handle phone changes
  const handlePhoneChange = (value: string) => {
    updateFormData({ phone: value });
    
    if (validateField) {
      validateField('phone', value);
    }
  };
  
  return (
    <>
      <h2 className="text-xl font-semibold mb-4 pt-4 border-t border-gray-100">Contact Information</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="full-name">Full Name</Label>
          <Input 
            id="full-name" 
            name="fullName"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={handleInputChange}
            onKeyDown={(e) => handleKeyDown(e, 'email')}
            className={validationErrors.fullName ? "border-red-500 focus-visible:ring-red-500" : ""}
          />
          {validationErrors.fullName && (
            <p className="text-sm font-medium text-red-500">{validationErrors.fullName}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            name="email"
            type="email" 
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleInputChange}
            onKeyDown={(e) => handleKeyDown(e, 'phone')}
            className={validationErrors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
          />
          {validationErrors.email && (
            <p className="text-sm font-medium text-red-500">{validationErrors.email}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <PhoneInput
            id="phone"
            value={formData.phone}
            onChange={handlePhoneChange}
            error={validationErrors.phone}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role in Business</Label>
          <Select
            value={formData.role}
            onValueChange={(value) => handleSelectChange('role', value)}
          >
            <SelectTrigger 
              id="role"
              className={validationErrors.role ? "border-red-500 focus-visible:ring-red-500" : ""}
            >
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="owner">Owner</SelectItem>
              <SelectItem value="broker">Broker</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {validationErrors.role && (
            <p className="text-sm font-medium text-red-500">{validationErrors.role}</p>
          )}
        </div>
      </div>
    </>
  );
};

export default ContactInformation;
