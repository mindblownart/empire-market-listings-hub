
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate API call to check if email exists
    // In a real app, this would be an actual API request
    setTimeout(() => {
      // For demo purposes, we'll consider any email with "test" to be invalid
      if (email.includes('test')) {
        setStatus('error');
        toast.error("Email address not found.");
      } else {
        setStatus('success');
        toast.success("Check your email for the password reset link.");
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Forgot Your Password?</CardTitle>
            <CardDescription>
              Enter your email and we'll send you a link to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                {status === 'success' && (
                  <Alert className="bg-green-50 border-green-200 text-green-800">
                    <AlertDescription>
                      Check your email for the password reset link.
                    </AlertDescription>
                  </Alert>
                )}
                
                {status === 'error' && (
                  <Alert className="bg-red-50 border-red-200 text-red-800">
                    <AlertDescription>
                      Email address not found.
                    </AlertDescription>
                  </Alert>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary-light"
                >
                  Send Reset Link
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center">
            <Link 
              to="/login" 
              className="text-sm text-gray-500 mt-2 flex items-center hover:text-primary transition-colors"
            >
              <ArrowLeft size={16} className="mr-1" /> Return to Login
            </Link>
          </CardFooter>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default ForgotPassword;
