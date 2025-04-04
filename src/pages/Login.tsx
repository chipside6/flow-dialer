
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/auth/useAuth';
import { useAuthOperations } from '@/contexts/auth/hooks/useAuthOperations';

import { AuthContainer } from '@/components/auth/AuthContainer';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthAlert } from '@/components/auth/AuthAlert';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { AuthButton } from '@/components/auth/AuthButton';
import { AuthFooter } from '@/components/auth/AuthFooter';
import { Input } from '@/components/ui/input';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const { signIn } = useAuthOperations();
  
  // Extract returnTo from location state if available
  const returnTo = location.state?.returnTo || '/dashboard';
  
  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate(returnTo, { replace: true });
    }
  }, [isAuthenticated, navigate, returnTo]);
  
  // Reset loading state after component unmounts
  useEffect(() => {
    return () => {
      setIsLoading(false);
    };
  }, []);
  
  // Clear error when user changes inputs
  useEffect(() => {
    if (errorMessage) {
      setErrorMessage(null);
    }
  }, [email, password, errorMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return; // Prevent multiple submissions
    
    setIsLoading(true);
    setErrorMessage(null);

    // Hard timeout to prevent UI from being stuck
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setErrorMessage("Login request timed out. Please try again.");
      }
    }, 10000); // 10 second timeout

    try {
      // Call the signIn function
      const { error } = await signIn(email, password);

      // Clear the timeout since we got a response
      clearTimeout(timeoutId);

      if (error) {
        throw error;
      }
      
      // If we get here, the login was successful
      // (redirection will be handled by the auth state effect)
      
    } catch (error: any) {
      console.error("Login error:", error);
      setErrorMessage(error.message || "Failed to login");
      
      // Show appropriate error message based on error type
      if (error.message?.includes('timeout') || error.message?.includes('network')) {
        toast({
          title: "Connection issue",
          description: "Please check your internet connection and try again",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login failed",
          description: error.message || "Invalid credentials or server error",
          variant: "destructive",
        });
      }
    } finally {
      // Always clear the timeout and reset loading state
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };
  
  return (
    <AuthContainer>
      <AuthHeader title="Welcome back" emoji="👋" />
      
      {errorMessage && (
        <AuthAlert 
          type="error" 
          message={errorMessage}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6 px-1">
        <div className="space-y-4">
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12"
            placeholder="Enter your email"
            disabled={isLoading}
          />
          
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <AuthButton 
          isLoading={isLoading} 
          buttonText="Log In"
        />
      </form>

      <AuthFooter type="login" />
    </AuthContainer>
  );
};

export default Login;
