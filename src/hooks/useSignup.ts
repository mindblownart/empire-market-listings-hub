
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";

export function useSignup() {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

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
    acceptedTerms: boolean
  ) => {
    // Validate form
    const isValid = validateForm(firstName, lastName, email, password, confirmPassword, country, acceptedTerms);
    if (!isValid) return;
    
    setIsLoading(true);
    
    try {
      // 1. Register with Supabase auth
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
      
      if (data.user) {
        // 2. Insert user details into users table
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
        
        toast.success("Account created successfully!");
        
        // Check if email confirmation is required
        if (data.session) {
          // User is signed in, redirect to dashboard
          navigate('/');
        } else {
          // Email confirmation required, show message
          navigate('/signup-confirmation');
        }
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
  
  return { signUp, isLoading, errors };
}
