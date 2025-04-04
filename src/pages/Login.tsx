
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  
  // Extract returnTo from location state if available
  const returnTo = location.state?.returnTo || '/dashboard';
  
  // Reset loading state after component unmounts or if there was an error
  useEffect(() => {
    return () => {
      // Ensure loading state is reset when component unmounts
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
    setIsLoading(true);
    setErrorMessage(null);

    // Set a timeout to automatically reset loading state if it takes too long
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setErrorMessage("Login request timed out. Please try again.");
      }
    }, 10000); // 10 second timeout

    try {
      // Simple login with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      // Clear the timeout since we got a response
      clearTimeout(timeoutId);

      if (error) {
        throw error;
      }

      console.log("Login successful:", data);
      
      // Set a simple flag in localStorage
      localStorage.setItem('isAuthenticated', 'true');
      
      // Redirect to dashboard or requested page
      navigate(returnTo);
      
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
