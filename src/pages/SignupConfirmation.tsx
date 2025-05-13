import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useSignup } from '../hooks/useSignup';
import { Alert, AlertDescription } from '../components/ui/alert';

const SignupConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>('');
  const [redirectPath, setRedirectPath] = useState<string>('/');
  const { resendVerificationEmail, isLoading } = useSignup();
  const [showResendSuccess, setShowResendSuccess] = useState(false);

  useEffect(() => {
    // Get email from location state
    const emailFromState = location.state?.email;
    const redirectFromState = location.state?.redirectPath || '/';
    
    if (!emailFromState) {
      // If no email in state, redirect to signup
      navigate('/signup');
      return;
    }
    
    setEmail(emailFromState);
    setRedirectPath(redirectFromState);
  }, [location.state, navigate]);

  const handleResendEmail = async () => {
    await resendVerificationEmail(email);
    setShowResendSuccess(true);
    
    // Hide the success message after 5 seconds
    setTimeout(() => {
      setShowResendSuccess(false);
    }, 5000);
  };

  if (!email) {
    return null; // Will redirect to signup
  }

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
              We've sent a verification link to <span className="font-medium">{email}</span>. 
              Please check your inbox and click the link to verify your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            {showResendSuccess && (
              <Alert variant="success" className="mb-4">
                <AlertDescription>
                  Verification email sent successfully. Please check your inbox.
                </AlertDescription>
              </Alert>
            )}
            
            <p className="mb-4 text-sm text-gray-500">
              Once verified, you'll be able to sign in to your account.
            </p>
            <div className="mt-6 flex flex-col space-y-3">
              <Button 
                onClick={handleResendEmail}
                disabled={isLoading || showResendSuccess}
                variant="outline"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Resend verification email'
                )}
              </Button>
              <Button asChild variant="outline">
                <Link to={`/login${redirectPath !== '/' ? `?redirect=${encodeURIComponent(redirectPath)}` : ''}`}>Go to Sign In</Link>
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
