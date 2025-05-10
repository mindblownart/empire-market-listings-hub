import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { SearchableSelect } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { useSignup } from '@/hooks/useSignup';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Signup = () => {
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Password strength state
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [hasTyped, setHasTyped] = useState(false);
  
  // Hook for signup functionality
  const { signUp, isLoading, errors } = useSignup();

  // Country options with flag codes
  const countryOptions = [
    { value: "us", label: "United States", flagCode: "us" },
    { value: "gb", label: "United Kingdom", flagCode: "gb" },
    { value: "sg", label: "Singapore", flagCode: "sg" },
    { value: "au", label: "Australia", flagCode: "au" },
    { value: "ca", label: "Canada", flagCode: "ca" },
    { value: "de", label: "Germany", flagCode: "de" },
    { value: "fr", label: "France", flagCode: "fr" },
    { value: "jp", label: "Japan", flagCode: "jp" },
    { value: "in", label: "India", flagCode: "in" },
    { value: "my", label: "Malaysia", flagCode: "my" }
  ];

  // Password strength evaluation function
  const evaluatePasswordStrength = (value: string) => {
    if (!value) {
      setPasswordStrength(0);
      setPasswordMessage('');
      return;
    }

    // Set hasTyped to true once the user starts typing
    if (!hasTyped) {
      setHasTyped(true);
    }

    let strength = 0;
    let checks = 0;

    // Check length
    if (value.length >= 10) {
      strength += 33;
      checks += 1;
    }

    // Check for uppercase and lowercase
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) {
      strength += 33;
      checks += 1;
    }

    // Check for numbers and special characters
    if (/[0-9]/.test(value) && /[^a-zA-Z0-9]/.test(value)) {
      strength += 34;
      checks += 1;
    }

    setPasswordStrength(strength);

    // Set appropriate message
    if (checks === 3) {
      setPasswordMessage('Strong');
    } else if (checks === 0) {
      setPasswordMessage('Too weak');
    } else {
      setPasswordMessage('Medium');
    }
  };

  // Handle password change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    evaluatePasswordStrength(value);
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Determine password field border color
  const getPasswordBorderClass = () => {
    if (!hasTyped) return '';
    if (passwordStrength === 100) return 'border-green-500';
    if (passwordStrength === 0) return 'border-red-500';
    return 'border-yellow-500';
  };

  // Determine password strength color
  const getPasswordStrengthColor = () => {
    if (passwordStrength === 100) return 'text-green-500';
    if (passwordStrength === 0) return 'text-red-500';
    return 'text-yellow-500';
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signUp(firstName, lastName, email, password, confirmPassword, country, acceptedTerms);
  };

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
          <CardHeader>
            <CardTitle className="text-2xl">Create an account</CardTitle>
            <CardDescription>Enter your details to create your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="first-name">First name</Label>
                    <Input 
                      id="first-name" 
                      placeholder="John" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={errors.firstName ? 'border-red-500' : ''}
                    />
                    {errors.firstName && (
                      <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="last-name">Last name</Label>
                    <Input 
                      id="last-name" 
                      placeholder="Doe" 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className={errors.lastName ? 'border-red-500' : ''}
                    />
                    {errors.lastName && (
                      <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>
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
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={handlePasswordChange}
                      className={`${getPasswordBorderClass()} ${errors.password ? 'border-red-500' : ''}`}
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
                  {hasTyped && (
                    <div className="mt-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-xs font-medium ${getPasswordStrengthColor()}`}>
                          {passwordMessage}
                        </span>
                      </div>
                      <Progress value={passwordStrength} className="h-1.5" />
                    </div>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Input 
                      id="confirm-password" 
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={errors.confirmPassword ? 'border-red-500' : ''}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button 
                              type="button" 
                              onClick={toggleConfirmPasswordVisibility}
                              className="text-gray-500 hover:text-gray-700 focus:outline-none"
                              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            >
                              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{showConfirmPassword ? "Hide password" : "Show password"}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Country Dropdown */}
                <div className="grid gap-2">
                  <Label htmlFor="country">Country</Label>
                  <SearchableSelect 
                    options={countryOptions}
                    value={country} 
                    onValueChange={setCountry} 
                    placeholder="Select your country"
                    required
                  />
                  {errors.country && (
                    <p className="text-xs text-red-500 mt-1">{errors.country}</p>
                  )}
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="terms" 
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(!!checked)}
                    className={errors.terms ? 'border-red-500' : ''}
                  />
                  <div>
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I agree to the{' '}
                      <Link to="/terms" className="text-primary hover:text-primary-dark">
                        terms of service
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" className="text-primary hover:text-primary-dark">
                        privacy policy
                      </Link>
                    </label>
                    {errors.terms && (
                      <p className="text-xs text-red-500 mt-1">{errors.terms}</p>
                    )}
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-primary hover:bg-primary-light" 
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating account...' : 'Create account'}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center">
            <div className="text-sm text-gray-500 mt-2">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:text-primary-dark font-medium">
                Sign in
              </Link>
            </div>
          </CardFooter>
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

export default Signup;
