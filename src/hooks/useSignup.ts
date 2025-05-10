import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";

export function useSignup() {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string>('');

  const validateForm = (
    firstName: string,
    lastName: string, 
    email: string, 
    password: string, 
    confirmPassword: string,
    country: string,
    acceptedTerms: boolean
  ) => {
    const newErrors: Record<string, string> = {};
    
    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!country) {
      newErrors.country = 'Please select your country';
    }
    
    if (!acceptedTerms) {
      newErrors.terms = 'You must accept the terms and privacy policy';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const signUp = async (
    firstName: string,
    lastName: string, 
    email: string, 
    password: string, 
    confirmPassword: string,
    country: string,
    acceptedTerms: boolean,
    redirectPath: string = '/'
  ) => {
    // Validate form
    const isValid = validateForm(firstName, lastName, email, password, confirmPassword, country, acceptedTerms);
    if (!isValid) return;
    
    setIsLoading(true);
    
    try {
      // Store email for verification page
      setUserEmail(email);
      
      // Register with Supabase auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            country
          }
        }
      });
      
      if (signUpError) throw signUpError;
      
      // Insert user details into users table
      if (data.user) {
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            first_name: firstName,
            last_name: lastName,
            email,
            country
          });
          
        if (insertError) throw insertError;
        
        // Navigate to verification page with redirect info
        navigate('/signup-confirmation', { 
          state: { email, redirectPath }
        });
      }
    } catch (error: any) {
      if (error.message.includes('email') && error.message.includes('exist')) {
        setErrors({ email: 'This email is already in use' });
      } else {
        toast.error(error.message || 'Failed to create account');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerificationEmail = async (email: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      
      if (error) throw error;
      
      toast.success('Verification email resent successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend verification email');
    } finally {
      setIsLoading(false);
    }
  };
  
  return { signUp, resendVerificationEmail, isLoading, errors, userEmail };
}
