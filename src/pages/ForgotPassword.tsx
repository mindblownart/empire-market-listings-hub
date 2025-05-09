
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Logo placement at top left */}
      <div className="p-6">
        <Link to="/" className="text-2xl font-bold text-primary">
          EmpireMarket
        </Link>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-4">
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
                  Continue
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center">
            <Link 
              to="/login" 
              className="text-sm text-primary mt-2 flex items-center hover:text-primary-dark transition-colors"
            >
              Return to sign in
            </Link>
            
            {/* New to EmpireMarket section integrated within the Card */}
            <div className="w-full bg-[#f8f9fc] p-4 rounded-md border border-gray-100 mt-6">
              <p className="text-center text-sm text-gray-600">
                New to EmpireMarket?{" "}
                <Link to="/signup" className="text-primary font-medium hover:underline">
                  Create account
                </Link>
              </p>
            </div>
          </CardFooter>
        </Card>
        
        {/* Updated security information text with lock icon */}
        <div className="w-full max-w-md mt-8 flex justify-center">
          <div className="flex items-center text-center">
            <Lock size={16} className="text-gray-400 flex-shrink-0 mr-2" />
            <p className="text-xs text-gray-500 leading-relaxed">
              Don't click on links if an email looks suspicious. Fraudsters sometimes send emails with phishing links while pretending to be EmpireMarket. To avoid phishing attacks, bookmark this page and only use that link when signing in.
            </p>
          </div>
        </div>
      </div>
      
      {/* Updated footer branding at bottom left with Stripe-style layout */}
      <div className="p-6 border-t border-gray-100">
        <div className="flex justify-start gap-6 items-center">
          <span className="text-sm text-gray-500">© EmpireMarket</span>
          <Link to="/privacy" className="text-sm text-gray-500 hover:text-primary transition-colors">
            Privacy & terms
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
