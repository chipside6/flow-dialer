
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
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
  
  // Clear error when user changes inputs
  useEffect(() => {
    if (errorMessage) {
      setErrorMessage(null);
    }
  }, [email, password, errorMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        // Format error messages to be more user-friendly
        let message = error.message || "Failed to login";
        
        if (message.includes("credentials") || message.includes("Invalid") || 
            message.includes("password") || message.includes("user")) {
          message = "Invalid email or password. Please check your credentials and try again.";
        } else if (message.includes("network") || message.includes("connect")) {
          message = "Unable to connect to the server. Please check your internet connection.";
        }
        
        setErrorMessage(message);
        setIsLoading(false);
        return;
      }
      
      // Success will be handled by the auth state effect
      
    } catch (error: any) {
      console.error("Login error:", error);
      setErrorMessage("An unexpected error occurred. Please try again later.");
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
