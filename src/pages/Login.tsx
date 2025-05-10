
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/lib/supabase';
import { toast } from "sonner";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get redirect path from location state or query params
  const redirectPath = location.state?.redirect || 
    new URLSearchParams(location.search).get('redirect') || '/';
  
  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // User is already logged in, redirect
        navigate(redirectPath);
      }
    };
    
    checkSession();
  }, [navigate, redirectPath]);
  
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.session) {
        toast.success("Login successful");
        // Redirect to the specified path after successful login
        navigate(redirectPath);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in");
      setErrors({
        form: error.message === "Invalid login credentials" 
          ? "Invalid email or password" 
          : error.message || "Failed to sign in"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Logo placement at top left */}
      <div className="p-6">
        <Link to="/" className="text-2xl font-bold text-primary">
          EmpireMarket
        </Link>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link to="/forgot-password" className="text-sm text-primary hover:text-primary-dark">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={errors.password ? 'border-red-500' : ''}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button 
                              type="button" 
                              onClick={togglePasswordVisibility}
                              className="text-gray-500 hover:text-gray-700 focus:outline-none"
                              aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{showPassword ? "Hide password" : "Show password"}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                  )}
                </div>
                {errors.form && (
                  <div className="bg-red-50 p-3 rounded-md border border-red-200">
                    <p className="text-sm text-red-600">{errors.form}</p>
                  </div>
                )}
                <Button 
                  className="w-full bg-primary hover:bg-primary-light" 
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center">
            {/* New to EmpireMarket section with Stripe-style background */}
            <div className="w-full bg-[#f8f9fc] p-4 rounded-md border border-gray-100 mt-2">
              <p className="text-center text-sm text-gray-600">
                New to EmpireMarket?{" "}
                <Link to={`/signup${redirectPath !== '/' ? `?redirect=${encodeURIComponent(redirectPath)}` : ''}`} className="text-primary font-medium hover:underline">
                  Create account
                </Link>
              </p>
            </div>
          </CardFooter>
        </Card>
        
        {/* Updated security notice with lock icon and centered text */}
        <div className="w-full max-w-md mt-8 flex justify-center">
          <div className="flex items-center text-center">
            <Lock size={16} className="text-gray-400 flex-shrink-0 mr-2" />
            <p className="text-xs text-gray-500 leading-relaxed">
              Only install browser extensions from companies you trust. Malicious browser extensions can compromise your security by reading your passwords.
            </p>
          </div>
        </div>
      </div>
      
      {/* Updated footer with left-aligned elements in Stripe style */}
      <div className="p-6 border-t border-gray-100">
        <div className="flex justify-start gap-6 items-center">
          <Link to="/" className="text-sm text-gray-500 hover:text-primary transition-colors">
            © EmpireMarket
          </Link>
          <Link to="/privacy" className="text-sm text-gray-500 hover:text-primary transition-colors">
            Privacy & terms
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
