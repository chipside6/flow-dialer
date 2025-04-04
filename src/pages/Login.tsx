
import { useState } from 'react';
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      // Simple session storage - just record that we're logged in
      localStorage.setItem('sessionLastUpdated', Date.now().toString());
      
      // Redirect to returnTo if available, otherwise to dashboard
      navigate(returnTo);
    } catch (error: any) {
      console.error("Login error:", error);
      setErrorMessage(error.message || "Failed to login");
      toast({
        title: "Login failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
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
