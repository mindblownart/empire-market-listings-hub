import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Check } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [hasTyped, setHasTyped] = useState(false);
  const [country, setCountry] = useState('');

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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Create an account</CardTitle>
            <CardDescription>Enter your details to create your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="first-name">First name</Label>
                    <Input id="first-name" placeholder="John" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="last-name">Last name</Label>
                    <Input id="last-name" placeholder="Doe" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="name@example.com" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={handlePasswordChange}
                      className={getPasswordBorderClass()}
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
                </div>

                {/* Country Dropdown */}
                <div className="grid gap-2">
                  <Label htmlFor="country">Country</Label>
                  <Select value={country} onValueChange={setCountry} required>
                    <SelectTrigger id="country" className="h-10 text-base md:text-sm">
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us">
                        <div className="flex items-center justify-between w-full">
                          <span>🇺🇸 United States</span>
                          {country === "us" && <Check className="h-4 w-4 ml-2" />}
                        </div>
                      </SelectItem>
                      <SelectItem value="uk">
                        <div className="flex items-center justify-between w-full">
                          <span>🇬🇧 United Kingdom</span>
                          {country === "uk" && <Check className="h-4 w-4 ml-2" />}
                        </div>
                      </SelectItem>
                      <SelectItem value="sg">
                        <div className="flex items-center justify-between w-full">
                          <span>🇸🇬 Singapore</span>
                          {country === "sg" && <Check className="h-4 w-4 ml-2" />}
                        </div>
                      </SelectItem>
                      <SelectItem value="au">
                        <div className="flex items-center justify-between w-full">
                          <span>🇦🇺 Australia</span>
                          {country === "au" && <Check className="h-4 w-4 ml-2" />}
                        </div>
                      </SelectItem>
                      <SelectItem value="ca">
                        <div className="flex items-center justify-between w-full">
                          <span>🇨🇦 Canada</span>
                          {country === "ca" && <Check className="h-4 w-4 ml-2" />}
                        </div>
                      </SelectItem>
                      <SelectItem value="de">
                        <div className="flex items-center justify-between w-full">
                          <span>🇩🇪 Germany</span>
                          {country === "de" && <Check className="h-4 w-4 ml-2" />}
                        </div>
                      </SelectItem>
                      <SelectItem value="fr">
                        <div className="flex items-center justify-between w-full">
                          <span>🇫🇷 France</span>
                          {country === "fr" && <Check className="h-4 w-4 ml-2" />}
                        </div>
                      </SelectItem>
                      <SelectItem value="jp">
                        <div className="flex items-center justify-between w-full">
                          <span>🇯🇵 Japan</span>
                          {country === "jp" && <Check className="h-4 w-4 ml-2" />}
                        </div>
                      </SelectItem>
                      <SelectItem value="in">
                        <div className="flex items-center justify-between w-full">
                          <span>🇮🇳 India</span>
                          {country === "in" && <Check className="h-4 w-4 ml-2" />}
                        </div>
                      </SelectItem>
                      <SelectItem value="my">
                        <div className="flex items-center justify-between w-full">
                          <span>🇲🇾 Malaysia</span>
                          {country === "my" && <Check className="h-4 w-4 ml-2" />}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" />
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
                </div>
                <Button className="w-full bg-primary hover:bg-primary-light">Create account</Button>
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
      
      <Footer />
    </div>
  );
};

export default Signup;
