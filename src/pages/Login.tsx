import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Checkbox } from '@/components/ui/checkbox';
import { Link } from 'react-router-dom';

import { AuthContainer } from '@/components/auth/AuthContainer';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthAlert } from '@/components/auth/AuthAlert';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { AuthButton } from '@/components/auth/AuthButton';
import { AuthFooter } from '@/components/auth/AuthFooter';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isAdmin, initialized } = useAuth();
  
  // Get the intended destination from location state, or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';
  const isAdminRedirect = from === '/admin';

  // Redirect authenticated users to appropriate pages
  useEffect(() => {
    if (isAuthenticated && initialized) {
      if (isAdminRedirect && !isAdmin) {
        // If trying to reach admin but not an admin
        navigate('/unauthorized', { 
          state: { from: { pathname: '/admin' } },
          replace: true 
        });
      } else {
        // Normal authenticated redirect
        console.log("User is already authenticated, redirecting to:", from);
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, navigate, from, isAdmin, isAdminRedirect, initialized]);

  // handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      console.log("Attempting to sign in with:", email);
      
      // Use Supabase directly for authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error("Login error:", error);
        throw error;
      }

      console.log("Login successful, user:", data.user);
      
      toast({
        title: "Login successful",
        description: "You've been successfully logged in",
      });

      // For admin redirects, we'll let the useEffect handle it based on isAdmin status
      // For regular redirects, navigate directly
      if (!isAdminRedirect) {
        navigate(from, { replace: true });
      }
      // Otherwise the useEffect will handle redirecting when auth state updates
      
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
      
      <AuthAlert 
        type={isAdminRedirect ? 'admin-redirect' : 'error'} 
        message={errorMessage || undefined}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-12 px-3 bg-transparent border-0 border-b-2 border-gray-300 focus:border-primary focus:ring-0 text-gray-700 text-base placeholder:text-gray-500"
            placeholder="Enter your email"
          />
          
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="terms" className="data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
          <div className="text-sm text-gray-600">
            I acknowledge and agree to the{' '}
            <Link to="/terms" className="text-primary hover:underline">
              Terms of Use
            </Link>
            , <Link to="/disclosure" className="text-primary hover:underline">
              911 Disclosures
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </div>
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
