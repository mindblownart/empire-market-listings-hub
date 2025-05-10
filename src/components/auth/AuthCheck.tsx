
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

interface AuthCheckProps {
  children: React.ReactNode;
  redirectPath?: string;
}

const AuthCheck: React.FC<AuthCheckProps> = ({ children, redirectPath = '/login' }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        // User is not logged in, redirect to login page with return path
        navigate(redirectPath, { state: { redirect: window.location.pathname } });
      } else {
        setIsAuthenticated(true);
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate, redirectPath]);
  
  // If still checking authentication status, show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }
  
  return isAuthenticated ? <>{children}</> : null;
};

export default AuthCheck;
