
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

const SignupConfirmation = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Logo placement at top left */}
      <div className="p-6">
        <Link to="/" className="text-2xl font-bold text-primary">
          EmpireMarket
        </Link>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription>
              We've sent you a verification link. Please check your email to verify your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4 text-sm text-gray-500">
              Once verified, you'll be able to sign in to your account.
            </p>
            <div className="mt-6 flex flex-col space-y-3">
              <Button asChild variant="outline">
                <Link to="/login">Go to Sign In</Link>
              </Button>
              <Button asChild variant="link">
                <Link to="/">Return to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
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

export default SignupConfirmation;
